const Registration = require('../models/registration.model');

exports.register = async (req, res) => {
  try {
    await Registration.create({
      UserId: req.user.id,
      EventId: req.params.id,
      status: 'registered',
    });
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err });
  }
};

exports.unregister = async (req, res) => {
  try {
    await Registration.destroy({
      where: { UserId: req.user.id, EventId: req.params.id },
    });
    res.json({ message: 'Unregistered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Unregistration failed', details: err });
  }
};
