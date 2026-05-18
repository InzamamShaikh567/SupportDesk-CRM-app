const pool = require('../../config/db');

const getAllTeams = async (req, res) => {
  try {
    const [teams] = await pool.execute('SELECT id, name, created_at FROM teams ORDER BY name');

    const teamsWithTL = await Promise.all(teams.map(async (team) => {
      const [tls] = await pool.execute(
        'SELECT first_name, last_name FROM users WHERE team_id = ? AND role = "TL" LIMIT 1',
        [team.id]
      );
      return {
        id: team.id,
        name: team.name,
        tlName: tls.length > 0 ? `${tls[0].first_name} ${tls[0].last_name}` : null,
        createdAt: team.created_at
      };
    }));

    res.json(teamsWithTL);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const [teams] = await pool.execute('SELECT id, name, created_at FROM teams WHERE id = ?', [id]);

    if (teams.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const [tls] = await pool.execute(
      'SELECT first_name, last_name FROM users WHERE team_id = ? AND role = "TL" LIMIT 1',
      [id]
    );

    res.json({
      id: teams[0].id,
      name: teams[0].name,
      tlName: tls.length > 0 ? `${tls[0].first_name} ${tls[0].last_name}` : null,
      createdAt: teams[0].created_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createTeam = async (req, res) => {
  try {
    const { name, tlId } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO teams (name, tl_id) VALUES (?, ?)',
      [name, tlId || null]
    );

    // If TL is assigned, update user's team_id
    if (tlId) {
      await pool.execute('UPDATE users SET team_id = ? WHERE id = ?', [result.insertId, tlId]);
    }

    res.status(201).json({ message: 'Team created successfully', teamId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tlId } = req.body;

    await pool.execute('UPDATE teams SET name = ?, tl_id = ? WHERE id = ?', [name, tlId, id]);

    // Update user's team_id
    if (tlId) {
      await pool.execute('UPDATE users SET team_id = ? WHERE id = ?', [id, tlId]);
    }

    res.json({ message: 'Team updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove team from users first
    await pool.execute('UPDATE users SET team_id = NULL WHERE team_id = ?', [id]);
    await pool.execute('DELETE FROM teams WHERE id = ?', [id]);

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
};