const { Event, AuditLog, Registration, User } = require('../models');
const logger = require('../utils/logger');

// Debugging: Log imported models
console.log('[DEBUG] Controller models:', {
  Event: !!Event,
  AuditLog: !!AuditLog,
  Registration: !!Registration,
  User: !!User,
});

/**
 * Create a new event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const organizerId = req.user?.id;

    // Log input for debugging
    console.log('[DEBUG] createEvent input:', { title, description, date, location, organizerId });

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required and must be a non-empty string' });
    }
    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: 'Date is required and must be a valid ISO date (e.g., 2025-05-01T10:00:00Z)' });
    }
    if (!location || typeof location !== 'string' || location.trim() === '') {
      return res.status(400).json({ message: 'Location is required and must be a non-empty string' });
    }
    if (!organizerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(organizerId)) {
      return res.status(400).json({ message: 'Invalid organizer ID (must be a valid UUID)' });
    }

    // Verify organizer exists
    const organizer = await User.findByPk(organizerId);
    if (!organizer) {
      return res.status(400).json({ message: 'Organizer does not exist' });
    }

    // Create event
    const event = await Event.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      date: new Date(date),
      location: location.trim(),
      organizerId,
    });

    // Log audit
    await AuditLog.create({
      action: 'CREATE_EVENT',
      userEmail: req.user.email || 'unknown',
      organizerId,
      details: `Created event: ${title}`,
    });

    logger.info(`Event created: ${title} by user ${req.user.email || 'unknown'}`);
    res.status(201).json(event);
  } catch (error) {
    // Log detailed error
    console.error('[DEBUG] createEvent error:', error);
    logger.error(`Error creating event: ${error.message}`);
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all events for the authenticated organizer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
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

    // Calculate engagement score based on registrations
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

/**
 * Get a single event by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventById = async (req, res) => {
  try {
    if (!Event) {
      throw new Error('Event model is undefined');
    }

    const event = await Event.findOne({
      where: { id: req.params.id, organizerId: req.user.id },
      include: [
        {
          model: Registration,
          as: 'Registrations',
          attributes: ['confirmed', 'feedbackScore'],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = event.Registrations || [];
    const confirmedCount = registrations.filter((r) => r.confirmed).length;
    const totalFeedback = registrations.reduce((sum, r) => sum + (r.feedbackScore || 0), 0);
    const engagementScore = registrations.length
      ? Math.min((confirmedCount / registrations.length) * 3 + totalFeedback * 2, 5)
      : 0;

    logger.info(`Fetched event ${event.title} for user ${req.user.email}`);
    res.json({ ...event.toJSON(), engagement_score: Number(engagementScore.toFixed(2)) });
  } catch (error) {
    logger.error(`Error fetching event: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update an event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    if (!Event) {
      throw new Error('Event model is undefined');
    }

    const event = await Event.findOne({
      where: { id: req.params.id, organizerId: req.user.id },
    });

    if (!event) {
      return res.status(400).json({ message: 'Event not found' });
    }

    await event.update({ title, description, date, location });

    await AuditLog.create({
      action: 'UPDATE_EVENT',
      userEmail: req.user.email,
      organizerId: req.user.id,
      details: `Updated event: ${title}`,
    });

    logger.info(`Event updated: ${title} by user ${req.user.email}`);
    res.json(event);
  } catch (error) {
    logger.error(`Error updating event: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete an event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEvent = async (req, res) => {
  try {
    if (!Event) {
      throw new Error('Event model is undefined');
    }

    const event = await Event.findOne({
      where: { id: req.params.id, organizerId: req.user.id },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventTitle = event.title;
    await event.destroy();

    await AuditLog.create({
      action: 'DELETE_EVENT',
      userEmail: req.user.email,
      organizerId: req.user.id,
      details: `Deleted event: ${eventTitle}`,
    });

    logger.info(`Event deleted: ${eventTitle} by user ${req.user.email}`);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    logger.error(`Error deleting event: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};