import Dashboard from "./Dashboard"
import { HashRouter, Routes, Route } from "react-router-dom";
import ProjectTrackingDashboard from "./ProjectTrackingDashboard";


function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/project/:id" element={<ProjectTrackingDashboard />}/>
      </Routes>
    </HashRouter>
  )
}

export default App
