import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/login'
import AttendeeDashboard from './components/AttendeeDashboard';
import OrganizerDashboard from './components/OrganizerDashboard';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<div className="p-6 text-center"><h1 className="text-4xl font-bold text-blue-400">Welcome to EventFlow</h1></div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/attendee-dashboard" element={<AttendeeDashboard />} />
        <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
   
      </Routes>
    </Router>
  );
}

export default App;