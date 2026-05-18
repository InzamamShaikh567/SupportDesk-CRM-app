const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const {
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
} = require('./ticket.controller');

router.use(authMiddleware);

// Agent routes
router.post('/', roleMiddleware('AGENT'), createTicket);
router.get('/my', roleMiddleware('AGENT'), getMyTickets);

// TL routes
router.get('/team', roleMiddleware('TL'), getTeamTickets);
router.get('/escalated', roleMiddleware('TL'), getEscalatedTickets);
router.patch('/:id/resolve', roleMiddleware('TL'), resolveTicket);
router.patch('/:id/escalate', roleMiddleware('TL'), escalateTicket);
router.patch('/:id/reject', roleMiddleware('TL'), rejectTicket);

// Admin routes
router.get('/all', roleMiddleware('ADMIN'), getAllTickets);
router.patch('/:id/assign', roleMiddleware('ADMIN'), assignTicket);
router.patch('/:id/reopen', roleMiddleware('ADMIN'), reopenTicket);

// Shared
router.get('/:id', roleMiddleware('ADMIN', 'TL', 'AGENT'), getTicketById);

module.exports = router;