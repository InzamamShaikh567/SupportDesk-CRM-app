const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute(
      'SELECT id, email, password, first_name, last_name, role, team_id, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get team name if user has a team
    let teamName = null;
    if (user.team_id) {
      const [teams] = await pool.execute('SELECT name FROM teams WHERE id = ?', [user.team_id]);
      if (teams.length > 0) {
        teamName = teams[0].name;
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, team_id: user.team_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        teamId: user.team_id,
        teamName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In a real app, you'd send an email with reset link
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, forgotPassword };