const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { Event, User } = require('../models');

// Middleware to authenticate JWT and check role
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create an event (organizer only)
router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Only organizers can create events' });
  }

  const { title, description, date, location } = req.body;

  try {
    // Check if Event model is defined
    if (!Event) {
      console.error('[ERROR] Event model is undefined');
      return res.status(500).json({ error: 'Internal server error: Event model not initialized' });
    }

    // Validate input
    if (!title || !date || !location) {
      return res.status(400).json({ error: 'Title, date, and location are required' });
    }

    if (!validator.isLength(title, { min: 1, max: 255 })) {
      return res.status(400).json({ error: 'Title must be between 1 and 255 characters' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (!validator.isLength(location, { min: 1, max: 255 })) {
      return res.status(400).json({ error: 'Location must be between 1 and 255 characters' });
    }

    // Verify organizer exists
    const organizer = await User.findByPk(req.user.id);
    if (!organizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      date: parsedDate,
      location,
      organizerId: req.user.id,
    });

    return res.status(201).json({
      message: 'Event created successfully',
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        organizerId: event.organizerId,
      },
    });
  } catch (error) {
    console.error('Event creation error:', error.message, error.stack);
    return res.status(500).json({ error: `Failed to create event: ${error.message}` });
  }
});

// Get all events for the authenticated organizer
router.get('/', authenticate, async (req, res) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Only organizers can view events' });
  }

  try {
    // Check if Event model is defined
    if (!Event) {
      console.error('[ERROR] Event model is undefined');
      return res.status(500).json({ error: 'Internal server error: Event model not initialized' });
    }

    const events = await Event.findAll({
      where: { organizerId: req.user.id },
    });

    // Format response to match frontend expectations
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      organizerId: event.organizerId,
      engagement_score: 0, // Placeholder; requires Registration model for calculation
    }));

    return res.json({ events: formattedEvents });
  } catch (error) {
    console.error('Event fetch error:', error.message, error.stack);
    return res.status(500).json({ error: `Failed to fetch events: ${error.message}` });
  }
});

module.exports = router;