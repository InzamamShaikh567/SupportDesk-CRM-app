const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const {
  getAllUsers,
  getTeamLeads,
  getAgents,
  getUserById,
  createUser,
  updateUser,
  updateProfile,
  deactivateUser,
  changePassword
} = require('./user.controller');

router.use(authMiddleware);

// Public
router.post('/:id/reset-password', changePassword);

// Protected routes
router.get('/', roleMiddleware('ADMIN'), getAllUsers);
router.get('/tls', roleMiddleware('ADMIN', 'TL'), getTeamLeads);
router.get('/agents', roleMiddleware('ADMIN', 'TL'), getAgents);
router.get('/:id', authMiddleware, getUserById);
router.post('/', roleMiddleware('ADMIN'), createUser);
router.patch('/:id', authMiddleware, updateProfile);
router.patch('/:id/admin', roleMiddleware('ADMIN'), updateUser);
router.delete('/:id', roleMiddleware('ADMIN'), deactivateUser);

module.exports = router;