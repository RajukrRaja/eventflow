import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const AttendeeDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState({ full_name: '', email: '', phone: '' });
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [chart, setChart] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (!token) {
      navigate('/login');
      return;
    }
    fetchEvents();
    fetchUserProfile();
    const interval = setInterval(fetchEvents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = res.data;
      setEvents(data);
      updateEngagementChart(data);
      checkNotifications(data);
    } catch (err) {
      setError(err.response?.data.message || 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserProfile(res.data);
    } catch (err) {
      console.error('Fetch Profile Error:', err);
    }
  };

  const updateEngagementChart = (eventsData) => {
    if (chart) chart.destroy();
    const ctx = document.getElementById('engagementChart').getContext('2d');
    setChart(new Chart(ctx, {
      type: 'line',
      data: {
        labels: eventsData.map(event => event.title),
        datasets: [{
          label: 'Engagement Score',
          data: eventsData.map(event => event.engagementScore || 0),
          fill: false,
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.1
        }]
      },
      options: {
        scales: { y: { beginAtZero: true, max: 6, title: { display: true, text: 'Score' } } },
        plugins: { legend: { position: 'top' } }
      }
    }));
  };

  const checkNotifications = (eventsData) => {
    const newNotifications = eventsData
      .filter(event => event.registered && !event.confirmed)
      .map(event => `Confirm attendance for ${event.title}`);
    setNotifications(newNotifications);
  };

  const handleRegister = async (eventId) => {
    try {
      await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
      await axios.post(`http://localhost:5000/api/events/${eventId}/unregister`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
      await axios.post(`http://localhost:5000/api/events/${eventId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
      await axios.post('http://localhost:5000/api/feedback', { eventId, rating }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setError('Feedback submitted');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to submit feedback');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/user/profile', userProfile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowProfileEdit(false);
      setError('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to update profile');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gray-900/80 backdrop-blur-sm transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} p-4 z-50 shadow-lg`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white mb-6 flex items-center">
          <BellIcon className="w-6 h-6 mr-2" />
          {sidebarOpen && <span>Toggle</span>}
        </button>
        <nav className="space-y-2">
          <a href="#events" className="block text-blue-400 hover:text-blue-300 py-2 font-medium">Events</a>
          <a href="#analytics" className="block text-blue-400 hover:text-blue-300 py-2 font-medium">Analytics</a>
          <a href="#profile" onClick={() => setShowProfileEdit(true)} className="block text-blue-400 hover:text-blue-300 py-2 font-medium">Profile</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ml-${sidebarOpen ? '64' : '16'} p-6 transition-all duration-300 overflow-auto`}>
        {/* Hero Section */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6 shadow-xl border border-gray-700">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">Attendee Dashboard</h1>
          <p className="text-gray-300">Explore events, register, and provide feedback effortlessly.</p>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-yellow-600/80 p-4 mb-6 rounded-lg shadow-md flex items-center">
            <BellIcon className="w-6 h-6 mr-2 text-white" />
            <ul className="list-disc pl-5 text-white">
              {notifications.map((note, index) => <li key={index}>{note}</li>)}
            </ul>
          </div>
        )}

        {/* Error */}
        {error && <div className={error.includes('success') || error.includes('submitted') ? 'bg-green-600/80' : 'bg-red-600/80'} p-4 mb-6 rounded-lg shadow-md>{error}</div>}

        {/* Loading */}
        {isLoading && !events.length && (
          <div className="flex justify-center"><div className="animate-spin h-16 w-16 border-4 border-blue-400 rounded-full border-t-transparent"></div></div>
        )}

        {/* Profile Card */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6 shadow-xl border border-gray-700">
          <div className="flex items-center mb-4">
            <UserCircleIcon className="w-16 h-16 text-blue-400 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">{userProfile.full_name || 'Attendee'}</h2>
              <p className="text-gray-400">{userProfile.email || 'No email'}</p>
              <p className="text-gray-400">Phone: {userProfile.phone || 'Not provided'}</p>
            </div>
          </div>
          <button onClick={() => setShowProfileEdit(true)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Edit Profile</button>
        </div>

        {/* Events Section */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Available Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <p className="text-gray-400">No events available</p>
            ) : (
              events.map(event => (
                <div key={event.id} className="bg-white/10 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-lg font-semibold text-blue-300">{event.title}</h4>
                  <p className="text-gray-400">{event.description || 'No description'}</p>
                  <p className="text-gray-500">Date: {event.date}</p>
                  <p className="text-gray-500">Engagement Score: {event.engagementScore}/6</p>
                  <p className="text-gray-500">Organizer: {event.User?.full_name || 'Unknown'}</p>
                  <div className="mt-4 space-y-2">
                    {!event.registered ? (
                      <button
                        onClick={() => handleRegister(event.id)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Register
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleUnregister(event.id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Unregister
                        </button>
                        {!event.confirmed && (
                          <button
                            onClick={() => handleConfirmAttendance(event.id)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors mt-2"
                          >
                            Confirm Attendance
                          </button>
                        )}
                        <div className="mt-2">
                          <label className="block text-gray-300">Feedback (1-5):</label>
                          <select
                            onChange={(e) => handleFeedback(event.id, parseInt(e.target.value))}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Analytics Section */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Engagement Trends</h2>
          <canvas id="engagementChart" className="w-full h-64"></canvas>
        </div>

        {/* Profile Edit Modal */}
        {showProfileEdit && (
          <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-96">
              <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <input
                  type="text"
                  value={userProfile.full_name}
                  onChange={(e) => setUserProfile({ ...userProfile, full_name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  placeholder="Email"
                  className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-3 rounded-lg transition-all duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowProfileEdit(false)}
                  className="w-full mt-2 bg-gray-500 hover:bg-gray-600 p-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeDashboard;