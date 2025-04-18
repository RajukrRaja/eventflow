const Event = require('../models/event.model');

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, created_by: req.user.id });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Event creation failed', details: err });
  }
};

exports.getAllEvents = async (req, res) => {
  const events = await Event.findAll();
  res.json(events);
};

exports.getEventById = async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
};

exports.updateEvent = async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (event.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await event.update(req.body);
  res.json(event);
};

exports.deleteEvent = async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (event.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await event.destroy();
  res.json({ message: 'Event deleted' });
};
