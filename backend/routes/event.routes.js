const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const requireOrganizer = require('../middleware/requireOrganizer');
const eventController = require('../controllers/event.controller');

router.post('/', authMiddleware, requireOrganizer, eventController.createEvent);
router.put('/:id', authMiddleware, requireOrganizer, eventController.updateEvent);
router.delete('/:id', authMiddleware, requireOrganizer, eventController.deleteEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

module.exports = router;
