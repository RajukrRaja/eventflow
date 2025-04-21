const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller');
const auth = require('../middleware/auth.middleware');

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (organizer only)
 */
router.post('/', auth('organizer'), createEvent);

/**
 * @route   GET /api/events
 * @desc    Get all events for the organizer
 * @access  Private (organizer only)
 */
router.get('/', auth('organizer'), getEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get a single event by ID
 * @access  Private (organizer only)
 */
router.get('/:id', auth('organizer'), getEventById);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (organizer only)
 */
router.put('/:id', auth('organizer'), updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private (organizer only)
 */
router.delete('/:id', auth('organizer'), deleteEvent);

module.exports = router;