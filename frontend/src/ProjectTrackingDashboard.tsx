import TopBar from "./components/TopBarProject";
import {PROJECTS } from "./types/mockData";


export default function ProjectTrackingDashboard(){

    return(
        <div>
            <div className="flex h-screen bg-gray-100"> 
            <TopBar 
            project = {PROJECTS}
            />
            </div>
        </div>
    )
}