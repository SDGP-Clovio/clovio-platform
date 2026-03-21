import Dashboard from "../pages/Dashboard"
import { HashRouter, Routes, Route } from "react-router-dom";
import ProjectTrackingDashboard from "../pages/ProjectTrackingDashboard";


export default function AppRoutes() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/project/:id" element={<ProjectTrackingDashboard />}/>
      </Routes>
    </HashRouter>
  )
}
 //DELETE