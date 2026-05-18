const pool = require('../../config/db');

const generateTicketNumber = async () => {
  const [result] = await pool.execute('SELECT MAX(id) as maxId FROM tickets');
  const nextId = (result[0]?.maxId || 0) + 1;
  return `TKT-${String(nextId).padStart(4, '0')}`;
};

const getLeastLoadedTL = async (excludeTlId = null) => {
  let query = `
    SELECT u.id, COUNT(t.id) as workload
    FROM users u
    LEFT JOIN tickets t ON t.assigned_tl_id = u.id AND t.status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED')
    WHERE u.role = 'TL' AND u.is_active = TRUE
  `;
  
  const params = [];
  if (excludeTlId) {
    query += ' AND u.id != ?';
    params.push(excludeTlId);
  }
  
  query += ' GROUP BY u.id ORDER BY workload ASC, RAND() LIMIT 1';
  
  const [tls] = await pool.execute(query, params);
  
  if (tls.length === 0) {
    return null;
  }
  
  return tls[0].id;
};

const autoAssignTicket = async (ticketId, excludeTlId = null) => {
  const tlId = await getLeastLoadedTL(excludeTlId);
  if (tlId) {
    await pool.execute('UPDATE tickets SET assigned_tl_id = ? WHERE id = ?', [tlId, ticketId]);
  }
};

const createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority, customerEmail } = req.body;
    const ticketNumber = await generateTicketNumber();

    const [result] = await pool.execute(
      `INSERT INTO tickets (ticket_number, subject, description, category, priority, status, customer_email, created_by)
       VALUES (?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
      [ticketNumber, subject, description, category, priority, customerEmail, req.user.id]
    );

    await autoAssignTicket(result.insertId);

    await pool.execute(
      `INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by)
       VALUES (?, NULL, 'OPEN', ?)`,
      [result.insertId, req.user.id]
    );

    res.status(201).json({ message: 'Ticket created successfully', ticketId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const [tickets] = await pool.execute(
      `SELECT t.*, u.first_name as creator_first_name, u.last_name as creator_last_name,
              tl.first_name as tl_first_name, tl.last_name as tl_last_name
       FROM tickets t
       JOIN users u ON t.created_by = u.id
       LEFT JOIN users tl ON t.assigned_tl_id = tl.id
       WHERE t.created_by = ?
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeamTickets = async (req, res) => {
  try {
    const [tickets] = await pool.execute(
      `SELECT t.*, u.first_name as creator_first_name, u.last_name as creator_last_name
       FROM tickets t
       JOIN users u ON t.created_by = u.id
       WHERE t.assigned_tl_id = ?
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEscalatedTickets = async (req, res) => {
  try {
    const [tickets] = await pool.execute(
      `SELECT t.*, u.first_name as creator_first_name, u.last_name as creator_last_name
       FROM tickets t
       JOIN users u ON t.created_by = u.id
       WHERE t.assigned_tl_id = ? AND t.status = 'ESCALATED'
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = `SELECT t.*, u.first_name as creator_first_name, u.last_name as creator_last_name,
                tl.first_name as tl_first_name, tl.last_name as tl_last_name
                FROM tickets t
                JOIN users u ON t.created_by = u.id
                LEFT JOIN users tl ON t.assigned_tl_id = tl.id
                WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY t.created_at DESC';

    const [tickets] = await pool.execute(query, params);

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await pool.execute(
      `SELECT t.*, u.first_name as creator_first_name, u.last_name as creator_last_name,
       tl.first_name as tl_first_name, tl.last_name as tl_last_name
       FROM tickets t
       JOIN users u ON t.created_by = u.id
       LEFT JOIN users tl ON t.assigned_tl_id = tl.id
       WHERE t.id = ?`,
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const [history] = await pool.execute(
      `SELECT h.*, u.first_name, u.last_name
       FROM ticket_status_history h
       JOIN users u ON h.changed_by = u.id
       WHERE h.ticket_id = ?
       ORDER BY h.changed_at ASC`,
      [id]
    );

    res.json({ ...tickets[0], statusHistory: history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resolveTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await pool.execute('SELECT status FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = tickets[0].status;
    await pool.execute('UPDATE tickets SET status = ? WHERE id = ?', ['RESOLVED', id]);

    await pool.execute(
      'INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
      [id, oldStatus, 'RESOLVED', req.user.id]
    );

    res.json({ message: 'Ticket resolved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const escalateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetTlId } = req.body;

    const [tickets] = await pool.execute('SELECT status, assigned_tl_id FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = tickets[0].status;
    const currentTlId = tickets[0].assigned_tl_id;

    let newTlId = targetTlId;
    if (!newTlId) {
      newTlId = await getLeastLoadedTL(currentTlId);
    }

    await pool.execute(
      'UPDATE tickets SET status = ?, assigned_tl_id = ? WHERE id = ?',
      ['ESCALATED', newTlId, id]
    );

    await pool.execute(
      'INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
      [id, oldStatus, 'ESCALATED', req.user.id]
    );

    res.json({ message: 'Ticket escalated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await pool.execute('SELECT status FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = tickets[0].status;
    await pool.execute('UPDATE tickets SET status = ? WHERE id = ?', ['REJECTED', id]);

    await pool.execute(
      'INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
      [id, oldStatus, 'REJECTED', req.user.id]
    );

    res.json({ message: 'Ticket rejected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const reopenTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await pool.execute('SELECT status FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = tickets[0].status;
    await pool.execute('UPDATE tickets SET status = ? WHERE id = ?', ['OPEN', id]);

    await pool.execute(
      'INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
      [id, oldStatus, 'OPEN', req.user.id]
    );

    res.json({ message: 'Ticket reopened successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { tlId } = req.body;

    const [tickets] = await pool.execute('SELECT status FROM tickets WHERE id = ?', [id]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = tickets[0].status;
    const newStatus = ['OPEN', 'ESCALATED'].includes(oldStatus) ? 'ASSIGNED' : oldStatus;

    await pool.execute('UPDATE tickets SET status = ?, assigned_tl_id = ? WHERE id = ?', [newStatus, tlId, id]);

    await pool.execute(
      'INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
      [id, oldStatus, newStatus, req.user.id]
    );

    res.json({ message: 'Ticket assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTeamTickets,
  getEscalatedTickets,
  getAllTickets,
  getTicketById,
  resolveTicket,
  escalateTicket,
  rejectTicket,
  reopenTicket,
  assignTicket
};