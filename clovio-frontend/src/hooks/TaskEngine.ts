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


            const milestoneData: Milestone[] = plan.milestones.map((m: any, index: number) => ({
                id: (index + 1).toString(),
                title: m.title,
                effort: m.effort_points,
                suggestedTimeline: m.suggested_timeline || "TBD",
                tasks: []
            }));

            //Generate tasks for each milestone
            const milestonesWithTasks = await Promise.all(
                milestoneData.map(async (m) => {
                    const rawTasks = await generateTasks(m.id, {
                        project_description: projectDescription,
                        milestone_title: m.title,
                        milestone_effort: m.effort,
                        team_members: teamMembers.map(name => ({
                            name,
                            skills: [
                                {
                                    name: "general",
                                    level: 1
                                }
                            ]
                        })),
                        workload_summary: "Distributed based on effort",
                        all_milestones: plan.milestones
                    });
                    const tasks: Task[] = rawTasks.map((t: any, index: number) => ({
                        id: `${m.id}-${index}`, // 🔥 guaranteed unique
                        title: t.name,
                        assignee: t.assigned_to,
                        status: t.status || "todo",
                        skill_gap: t.is_skill_gap
                    }));

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
