const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} = require('./team.controller');

router.use(authMiddleware);

router.get('/', roleMiddleware('ADMIN', 'TL'), getAllTeams);
router.get('/:id', roleMiddleware('ADMIN'), getTeamById);
router.post('/', roleMiddleware('ADMIN'), createTeam);
router.patch('/:id', roleMiddleware('ADMIN'), updateTeam);
router.delete('/:id', roleMiddleware('ADMIN'), deleteTeam);

module.exports = router;