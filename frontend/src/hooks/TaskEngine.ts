import { useState } from "react";
import type { Milestone, Task } from "../types/types";
import { generateMilestones, generateTasks } from "../api/apiCalls";

const normalizeTaskStatus = (status?: string): Task["status"] => {
    if (!status) return "todo";

    const normalized = status.toLowerCase();
    if (normalized === "in_progress" || normalized === "in-progress") {
        return "in-progress";
    }
    if (normalized === "done") {
        return "done";
    }
    return "todo";
};




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
                description: m.description || "Auto-generated milestone",
                effort: m.effort_points,
                dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000), // Weekly intervals
                tasks: []
            }));

            //Generate tasks for each milestone sequentially to avoid rate limits
            const milestonesWithTasks: Milestone[] = [];
            for (const m of milestoneData) {
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
                    id: `${m.id}-${index}`,
                    projectId: "temp", // Will be set by the calling component
                    milestoneId: m.id,
                    milestoneTitle: m.title,
                    milestoneDescription: m.description,
                    milestoneDueDate: m.dueDate,
                    title: t.name,
                    description: t.description || "Auto-generated task",
                    status: normalizeTaskStatus(t.status),
                    priority: "medium" as "low" | "medium" | "high",
                    assignedTo: t.assigned_to ? [t.assigned_to] : [],
                    createdBy: "system",
                    aiAssignmentReason: t.assignment_reason || "AI-generated assignment",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    skill_gap: t.is_skill_gap || false,
                    assignee: t.assigned_to
                }));

                milestonesWithTasks.push({ ...m, tasks });
            }
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
