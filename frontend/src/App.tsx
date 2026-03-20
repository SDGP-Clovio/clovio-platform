import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MainDashboard from './pages/MainDashboard';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectWizard from './components/Projects/ProjectWizard';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/new-project" element={<ProjectWizard />} />
          <Route path="/project/:id" element={<ProjectDashboard />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;