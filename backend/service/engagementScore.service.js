const { Registration, EngagementScore } = require('../models');

const calculateEngagementScore = async (eventId) => {
  // Count registrations
  const regCount = await Registration.count({ where: { event_id: eventId } });

  // Count confirmed attendees
  const confirmedCount = await Registration.count({
    where: { event_id: eventId, attendance_status: 'confirmed' },
  });

  // Calculate scores
  const registrationScore = regCount < 10 ? 0 : regCount <= 50 ? 1 : 2;
  const attendanceRate = regCount === 0 ? 0 : confirmedCount / regCount;
  const attendanceScore = attendanceRate < 0.5 ? 0 : attendanceRate <= 0.75 ? 1 : 2;
  const responsivenessScore = 1; // Mocked
  const feedbackScore = 1; // Mocked
  const totalScore = registrationScore + attendanceScore + responsivenessScore + feedbackScore;

  // Update or create score
  await EngagementScore.upsert({
    event_id: eventId,
    registration_score: registrationScore,
    attendance_score: attendanceScore,
    responsiveness_score: responsivenessScore,
    feedback_score: feedbackScore,
    total_score: totalScore,
    calculated_at: new Date(),
  });

  return totalScore;
};

module.exports = { calculateEngagementScore };