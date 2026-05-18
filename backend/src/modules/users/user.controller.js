const bcrypt = require('bcryptjs');
const pool = require('../../config/db');

const getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = 'SELECT id, email, first_name, last_name, role, team_id, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (status === 'active') {
      query += ' AND is_active = TRUE';
    } else if (status === 'inactive') {
      query += ' AND is_active = FALSE';
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.execute(query, params);

    // Get team names
    const [teams] = await pool.execute('SELECT id, name FROM teams');
    const teamMap = {};
    teams.forEach(t => teamMap[t.id] = t.name);

    const usersWithTeams = users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      teamId: u.team_id,
      teamName: u.team_id ? teamMap[u.team_id] : null,
      isActive: u.is_active,
      createdAt: u.created_at
    }));

    res.json(usersWithTeams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeamLeads = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.team_id, u.is_active, u.created_at, t.name as team_name
       FROM users u
       LEFT JOIN teams t ON u.team_id = t.id
       WHERE u.role = 'TL'
       ORDER BY u.created_at DESC`
    );

    res.json(users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      teamId: u.team_id,
      teamName: u.team_name,
      isActive: u.is_active,
      createdAt: u.created_at
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAgents = async (req, res) => {
  try {
    let query = `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.team_id, u.is_active, u.created_at, t.name as team_name
                 FROM users u
                 LEFT JOIN teams t ON u.team_id = t.id
                 WHERE u.role = 'AGENT'`;

    const [users] = await pool.execute(query);

    res.json(users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      teamId: u.team_id,
      teamName: u.team_name,
      isActive: u.is_active,
      createdAt: u.created_at
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, teamId } = req.body;

    // Check if email exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (email, password, first_name, last_name, role, team_id) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, role, teamId || null]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, teamId, isActive } = req.body;

    let query = 'UPDATE users SET ';
    const params = [];

    if (firstName) {
      query += 'first_name = ?, ';
      params.push(firstName);
    }
    if (lastName) {
      query += 'last_name = ?, ';
      params.push(lastName);
    }
    if (role) {
      query += 'role = ?, ';
      params.push(role);
    }
    if (teamId !== undefined) {
      query += 'team_id = ?, ';
      params.push(teamId);
    }
    if (isActive !== undefined) {
      query += 'is_active = ?, ';
      params.push(isActive);
    }

    query = query.slice(0, -2) + ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.team_id, u.is_active, u.created_at, t.name as team_name
       FROM users u
       LEFT JOIN teams t ON u.team_id = t.id
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const u = users[0];
    res.json({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      teamId: u.team_id,
      teamName: u.team_name,
      isActive: u.is_active,
      createdAt: u.created_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone } = req.body;

    if (req.user.id !== parseInt(id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let query = 'UPDATE users SET ';
    const params = [];

    if (firstName) {
      query += 'first_name = ?, ';
      params.push(firstName);
    }
    if (lastName) {
      query += 'last_name = ?, ';
      params.push(lastName);
    }
    if (phone !== undefined) {
      query += 'phone = ?, ';
      params.push(phone);
    }

    if (params.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    query = query.slice(0, -2) + ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Only allow user to change own password or admin to change any password
    if (req.user.id !== parseInt(id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to change this password' });
    }

    // If not admin, verify current password
    if (req.user.role !== 'ADMIN') {
      const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const validPassword = await bcrypt.compare(currentPassword, users[0].password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getTeamLeads,
  getAgents,
  getUserById,
  createUser,
  updateUser,
  updateProfile,
  deactivateUser,
  changePassword
};