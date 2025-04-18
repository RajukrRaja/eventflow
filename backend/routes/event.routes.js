const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const eventController = require('../controllers/event.controller');

// Organizer only
router.post('/', auth, eventController.createEvent);
router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

// Public
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

module.exports = router;
