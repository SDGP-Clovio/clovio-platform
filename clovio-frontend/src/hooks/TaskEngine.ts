import { useState } from "react";
import type { Milestone, Task } from "../types/index";
import { generateMilestones, generateTasks } from "../api/apiCalls";




export const useTaskEngine = () => {
    const [projectDescription, setProjectDescription] = useState("");
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);


    const distributeTasks = async (teamMembers: string[]) => {
        try {
            setLoading(true);

            //Generating the milestones
            const plan = await generateMilestones(projectDescription, teamMembers);
            console.log("Response from /projects/breakdown:", plan);
            
            // Map to frontend Milestone format with generated IDs
            const milestoneData: Milestone[] = plan.milestones.map((m: any, index: number) => ({
                id: (index + 1).toString(),
                title: m.title,
                effort: m.effort_points
            }));
            
            //Generate tasks for each milestone
            const milestonesWithTasks = await Promise.all(
                milestoneData.map(async (m) => {
                    const tasks: Task[] = await generateTasks(m.id, {
                        project_description: projectDescription,
                        milestone_title: m.title,
                        milestone_effort: m.effort,
                        team_members: teamMembers.map(name => ({ name, skills: [] })),
                        workload_summary: "default", // can adapt
                        all_milestones: milestoneData.map(m => ({ title: m.title, effort_points: m.effort })),
                    });
                    return { ...m, tasks };
                })
            );
            setMilestones(milestonesWithTasks)

        } catch (error) {
            console.error("Error distributing tasks:", error);
        } finally {
            setLoading(false);
        }
    };
    return {
        projectDescription,
        setProjectDescription,
        file,
        setFile,
        milestones,
        loading,
        distributeTasks,
    };



}
