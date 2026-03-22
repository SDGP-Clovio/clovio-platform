import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MainDashboard from './pages/MainDashboard';
import ProjectDashboard from './pages/ProjectDashboard';
import SupervisorDashboard from "./pages/SupervisorDashboard";
import SupervisorProjectsPage from "./pages/SupervisorProjectsPage";
import SupervisorProjectDetailsPage from "./pages/SupervisorProjectDetailsPage";

// Components
import ProjectWizard from './components/Projects/ProjectWizard';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Auth & Main */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/new-project" element={<ProjectWizard />} />

          {/* Project */}
          <Route path="/project/:id" element={<ProjectDashboard />} />
          <Route path="/tracking/:id" element={<Navigate to="/dashboard" replace />} />

          {/* Supervisor */}
          <Route path="/supervisor" element={<SupervisorDashboard />} />
          <Route path="/supervisor/projects" element={<SupervisorProjectsPage />} />
          <Route path="/supervisor/project/:id" element={<SupervisorProjectDetailsPage />} />

          <Route path="/test" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;