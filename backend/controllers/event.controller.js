const { Event, AuditLog, Registration, User } = require('../models');
const logger = require('../utils/logger');

console.log('[DEBUG] Controller models:', {
  Event: !!Event,
  AuditLog: !!AuditLog,
  Registration: !!Registration,
  User: !!User,
});

/**
 * Create a new event
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const organizerId = req.user?.id;

    console.log('[DEBUG] createEvent input:', { title, description, date, location, organizerId });

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required and must be a non-empty string' });
    }
    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: 'Date is required and must be a valid ISO date' });
    }
    if (!location || typeof location !== 'string' || location.trim() === '') {
      return res.status(400).json({ message: 'Location is required and must be a non-empty string' });
    }
    if (!Number.isInteger(organizerId) || organizerId <= 0) {
      return res.status(400).json({ message: 'Invalid organizer ID (must be a positive integer)' });
    }

    const organizer = await User.findByPk(organizerId);
    if (!organizer) {
      return res.status(400).json({ message: 'Organizer does not exist' });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      date: new Date(date),
      location: location.trim(),
      organizerId,
    });

    await AuditLog.create({
      action: 'CREATE_EVENT',
      userId: organizerId,
      details: `Created event: ${title} by ${req.user.email || 'unknown'}`,
    });

    logger.info(`Event created: ${title} by user ${req.user.email || 'unknown'}`);
    res.status(201).json(event);
  } catch (error) {
    console.error('[DEBUG] createEvent error:', error);
    logger.error(`Error creating event: ${error.message}`);
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map((err) => ({ field: err.path, message: err.message }));
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all events for the authenticated organizer
 */
const getEvents = async (req, res) => {
  try {
    if (!Event) {
      throw new Error('Event model is undefined');
    }

    const events = await Event.findAll({
      where: { organizerId: req.user.id },
      include: [
        {
          model: Registration,
          as: 'Registrations',
          attributes: ['confirmed', 'feedbackScore'],
        },
      ],
    });

    const eventsWithScore = events.map((event) => {
      const registrations = event.Registrations || [];
      const confirmedCount = registrations.filter((r) => r.confirmed).length;
      const totalFeedback = registrations.reduce((sum, r) => sum + (r.feedbackScore || 0), 0);
      const engagementScore = registrations.length
        ? Math.min((confirmedCount / registrations.length) * 3 + totalFeedback * 2, 5)
        : 0;

      return {
        ...event.toJSON(),
        engagement_score: Number(engagementScore.toFixed(2)),
      };
    });

    logger.info(`Fetched events for user ${req.user.email}`);
    res.json({ events: eventsWithScore });
  } catch (error) {
    logger.error(`Error fetching events: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };