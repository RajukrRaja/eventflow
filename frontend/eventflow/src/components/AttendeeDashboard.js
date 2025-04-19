import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AttendeeDashboard = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get('http://localhost:5000/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data);
      } catch (err) {
        setError(err.response?.data.message || 'Failed to fetch events');
      }
    };
    fetchEvents();
  }, [navigate]);

  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(events.map(event =>
        event.id === eventId ? { ...event, registered: true } : event
      ));
    } catch (err) {
      setError(err.response?.data.message || 'Failed to register');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/events/${eventId}/unregister`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(events.map(event =>
        event.id === eventId ? { ...event, registered: false } : event
      ));
    } catch (err) {
      setError(err.response?.data.message || 'Failed to unregister');
    }
  };

  const handleConfirmAttendance = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/events/${eventId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(events.map(event =>
        event.id === eventId ? { ...event, confirmed: true } : event
      ));
    } catch (err) {
      setError(err.response?.data.message || 'Failed to confirm attendance');
    }
  };

  const handleFeedback = async (eventId, rating) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/feedback', { eventId, rating }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setError('Feedback submitted');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Attendee Dashboard</h2>
      {error && <p className={error.includes('submitted') ? 'text-green-500 mb-4' : 'text-red-500 mb-4'}>{error}</p>}
      <h3 className="text-lg font-semibold mb-2">Available Events</h3>
      <div className="grid gap-4">
        {events.length === 0 ? (
          <p className="text-gray-600">No events available</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-semibold">{event.title}</h4>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-gray-500">Date: {event.date}</p>
              <p className="text-gray-500">Engagement Score: {event.engagementScore}/6</p>
              <p className="text-gray-500">Organizer: {event.User.full_name}</p>
              <div className="mt-2">
                {!event.registered ? (
                  <button
                    onClick={() => handleRegister(event.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                  >
                    Register
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleUnregister(event.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
                    >
                      Unregister
                    </button>
                    {!event.confirmed && (
                      <button
                        onClick={() => handleConfirmAttendance(event.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
                      >
                        Confirm Attendance
                      </button>
                    )}
                    <div className="mt-2">
                      <label className="block text-gray-700">Feedback (1-5):</label>
                      <select
                        onChange={(e) => handleFeedback(event.id, parseInt(e.target.value))}
                        className="p-2 border rounded"
                      >
                        <option value="">Select rating</option>
                        {[1, 2, 3, 4, 5].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendeeDashboard;