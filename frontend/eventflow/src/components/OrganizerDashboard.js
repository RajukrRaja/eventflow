import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { BellIcon, UserCircleIcon, CalendarIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '' });
  const [editingEvent, setEditingEvent] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState({ full_name: '', email: '', role: 'organizer' });
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileLastFetched, setProfileLastFetched] = useState(0);
  const [chart, setChart] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchEvents();
    fetchUserProfile();
    const interval = setInterval(() => {
      fetchEvents();
      if (Date.now() - profileLastFetched > 60000) fetchUserProfile();
    }, 30000);
    return () => clearInterval(interval);
  }, [navigate, profileLastFetched]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch events');
      setEvents(data);
      setFilteredEvents(data);
      updateEngagementChart(data);
      checkNotifications(data);
    } catch (err) {
      setError(err.message || 'Error fetching events');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUserProfile(data);
        setProfileLastFetched(Date.now());
      } else {
        throw new Error(data.message || 'Failed to fetch user profile');
      }
    } catch (err) {
      setError(err.message || 'Error fetching user profile');
    }
  };

  const updateEngagementChart = (eventsData) => {
    if (chart) chart.destroy();
    const ctx = document.getElementById('engagementChart').getContext('2d');
    setChart(
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: eventsData.map((event) => event.title),
          datasets: [
            {
              label: 'Engagement Score',
              data: eventsData.map((event) => event.engagementScore || 0),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: { y: { beginAtZero: true, max: 6, title: { display: true, text: 'Score' } } },
          plugins: { legend: { position: 'top' }, tooltip: { mode: 'index' } },
        },
      })
    );
  };

  const checkNotifications = (eventsData) => {
    const newNotifications = eventsData
      .filter((event) => event.engagementScore >= 4)
      .map((event) => `High engagement (${event.engagementScore}) for ${event.title}`);
    setNotifications(newNotifications);
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const method = editingEvent ? 'PUT' : 'POST';
    const url = editingEvent
      ? `http://localhost:5000/api/events/${editingEvent.id}`
      : 'http://localhost:5000/api/events';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newEvent),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save event');
      setNewEvent({ title: '', description: '', date: '', location: '' });
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = (id) => {
    setEventToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    setShowConfirm(false);
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete event');
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setEventToDelete(null);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      date: event.date,
      location: event.location || '',
    });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(userProfile),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');
      setUserProfile(data);
      setShowProfileEdit(false);
      fetchUserProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/registrations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch registrations');
      return await response.json();
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  const handleFilterDate = (e) => {
    const date = e.target.value;
    setFilterDate(date);
    if (date) {
      setFilteredEvents(events.filter((event) => event.date === date));
    } else {
      setFilteredEvents(events);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'calendar' : 'list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Top Navbar */}
      <nav className="bg-gray-900/90 shadow-lg p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Organizer Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <BellIcon className="w-6 h-6 text-gray-300 cursor-pointer hover:text-blue-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setShowProfileEdit(true)}>
              <UserCircleIcon className="w-8 h-8 text-blue-400" />
              <span>{userProfile.full_name || 'Organizer'}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Event Creation & Profile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Event Creation Form */}
          <div className="bg-gray-800/70 rounded-xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">{editingEvent ? 'Update Event' : 'Create Event'}</h2>
            <form onSubmit={handleCreateOrUpdateEvent} className="space-y-4">
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event Title"
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                name="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Description"
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Location"
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-3 rounded-lg transition-all duration-200"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>

          {/* User Profile */}
          <div className="bg-gray-800/70 rounded-xl p-6 shadow-2xl border border-gray-700">
            <div className="flex items-center mb-4">
              <UserCircleIcon className="w-12 h-12 text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">{userProfile.full_name || 'Organizer'}</h3>
                <p className="text-gray-400 text-sm">{userProfile.email || 'No email'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowProfileEdit(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right Column: Events & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications & Error */}
          {notifications.length > 0 && (
            <div className="bg-green-600/80 p-4 rounded-xl shadow-md flex items-center">
              <BellIcon className="w-6 h-6 mr-2 text-white" />
              <ul className="list-disc pl-5 text-white">
                {notifications.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
          {error && <div className="bg-red-600/80 p-4 rounded-xl shadow-md">{error}</div>}

          {/* Events Section */}
          <div className="bg-gray-800/70 rounded-xl p-6 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Events</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={filterDate}
                  onChange={handleFilterDate}
                  className="p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={toggleViewMode}
                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg flex items-center"
                >
                  {viewMode === 'list' ? <CalendarIcon className="w-5 h-5 mr-1" /> : <ListBulletIcon className="w-5 h-5 mr-1" />}
                  {viewMode === 'list' ? 'Calendar View' : 'List View'}
                </button>
              </div>
            </div>
            {isLoading && !filteredEvents.length ? (
              <div className="flex justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-400 rounded-full border-t-transparent"></div>
              </div>
            ) : viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-700/50">
                      <th className="p-3 border-b text-gray-300">Title</th>
                      <th className="p-3 border-b text-gray-300">Date</th>
                      <th className="p-3 border-b text-gray-300">Location</th>
                      <th className="p-3 border-b text-gray-300">Engagement</th>
                      <th className="p-3 border-b text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="p-3">{event.title}</td>
                        <td className="p-3">{event.date}</td>
                        <td className="p-3">{event.location || 'N/A'}</td>
                        <td className="p-3">{event.engagementScore || 0}</td>
                        <td className="p-3 flex space-x-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Calendar
                className="bg-gray-700/50 rounded-lg p-4"
                tileContent={({ date }) => {
                  const event = filteredEvents.find((e) => e.date === date.toISOString().split('T')[0]);
                  return event ? (
                    <div className="text-blue-400 text-sm">{event.title}</div>
                  ) : null;
                }}
              />
            )}
            {!isLoading && filteredEvents.length === 0 && (
              <p className="text-center text-gray-400">No events found.</p>
            )}
          </div>

          {/* Analytics Section */}
          <div className="bg-gray-800/70 rounded-xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Engagement Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <canvas id="engagementChart" className="w-full h-64"></canvas>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Key Metrics</h3>
                <p>Total Events: {events.length}</p>
                <p>
                  Avg Engagement:{' '}
                  {(events.reduce((sum, e) => sum + (e.engagementScore || 0), 0) / events.length || 0).toFixed(2)}
                </p>
                <p>
                  High Engagement Events: {events.filter((e) => e.engagementScore >= 4).length}
                </p>
              </div>
            </div>
          </div>

          {/* Registrations Section */}
          <div className="bg-gray-800/70 rounded-xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Attendee Registrations</h2>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium">{event.title}</h3>
                    <RegistrationDetails eventId={event.id} fetchRegistrations={fetchRegistrations} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No registrations to display.</p>
            )}
          </div>
        </div>
      </main>

      {/* Slide-in Profile Edit Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-gray-800 shadow-2xl transform transition-transform duration-300 ${
          showProfileEdit ? 'translate-x-0' : 'translate-x-full'
        } z-50 p-6`}
      >
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
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-3 rounded-lg"
          >
            Save Changes
          </button>
          <button
            onClick={() => setShowProfileEdit(false)}
            className="w-full bg-gray-500 hover:bg-gray-600 p-3 rounded-lg"
          >
            Cancel
          </button>
        </form>
      </div>

      {/* Slide-in Delete Confirmation Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-gray-800 shadow-2xl transform transition-transform duration-300 ${
          showConfirm ? 'translate-x-0' : 'translate-x-full'
        } z-50 p-6`}
      >
        <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
        <p>Are you sure you want to delete this event?</p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={cancelDelete}
            className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Component to handle async registrations
const RegistrationDetails = ({ eventId, fetchRegistrations }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistrations = async () => {
      setLoading(true);
      const data = await fetchRegistrations(eventId);
      setRegistrations(data);
      setLoading(false);
    };
    loadRegistrations();
  }, [eventId, fetchRegistrations]);

  return loading ? (
    <p>Loading registrations...</p>
  ) : (
    <>
      <p>Registered: {registrations.length}</p>
      <p>Confirmed: {registrations.filter((r) => r.confirmed).length}</p>
    </>
  );
};

export default OrganizerDashboard;