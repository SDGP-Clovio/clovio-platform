import Dashboard from "./pages/Dashboard"
import { HashRouter, Routes, Route } from "react-router-dom";
import ProjectTrackingDashboard from "./pages/ProjectTrackingDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import SupervisorProjectsPage from "./pages/SupervisorProjectsPage";
import SupervisorProjectDetailsPage from "./pages/SupervisorProjectDetailsPage";


function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/project/:id" element={<ProjectTrackingDashboard />}/>
        <Route path="/supervisor" element={<SupervisorDashboard />} />
        <Route path="/supervisor/projects" element={<SupervisorProjectsPage />} />
        <Route path="/supervisor/project/:id" element={<SupervisorProjectDetailsPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
