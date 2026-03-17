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
            const milestoneData: Milestone[] = await generateMilestones(projectDescription, teamMembers);
            console.log("Response from /projects/breakdown:", milestoneData);
            //Generate tasks for each milestone
            const milestonesWithTasks = await Promise.all(
                milestoneData.map(async (m) => {
                    const tasks: Task[] = await generateTasks(m.id, {
                        milestone_title: m.title,
                        effort: m.effort,
                        team_members: teamMembers,
                        workload_summary: "default", // can adapt
                        full_milestone_list: milestoneData,
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
