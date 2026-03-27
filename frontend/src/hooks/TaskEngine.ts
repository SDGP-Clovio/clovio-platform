import { useState } from "react";
import type { Milestone, SkillLevel, Task } from "../types/types";
import { generateMilestones, generateTasks, type AiTeamMemberInput } from "../api/apiCalls";

type TeamMemberInput = {
    id: number;
    name: string;
    skills?: Array<{
        name: string;
        level: SkillLevel;
    }>;
};

const skillLevelToNumber = (level: SkillLevel): number => {
    if (level === "expert") return 4;
    if (level === "advanced") return 3;
    if (level === "intermediate") return 2;
    return 1;
};

const normalizeSkills = (skills?: TeamMemberInput["skills"]): Array<{ name: string; level: number }> => {
    if (!skills || skills.length === 0) {
        return [{ name: "general", level: 1 }];
    }

    const cleaned = skills
        .map((skill) => ({
            name: skill.name.trim(),
            level: skillLevelToNumber(skill.level),
        }))
        .filter((skill) => skill.name.length > 0);

    return cleaned.length > 0 ? cleaned : [{ name: "general", level: 1 }];
};

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

const parsePositiveAssigneeId = (value: unknown): number | undefined => {
    const parsed = typeof value === "number"
        ? value
        : typeof value === "string" && value.trim() !== ""
            ? Number(value)
            : NaN;

    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const resolveAssigneeId = (value: unknown, teamMembers: TeamMemberInput[]): number | undefined => {
    const numericId = parsePositiveAssigneeId(value);
    if (numericId !== undefined) {
        return numericId;
    }

    if (typeof value !== "string") {
        return undefined;
    }

    const normalizedName = value.trim().toLowerCase();
    if (!normalizedName) {
        return undefined;
    }

    const member = teamMembers.find((teamMember) => teamMember.name.trim().toLowerCase() === normalizedName);
    return member && member.id > 0 ? member.id : undefined;
};

const resolveAssigneeName = (value: unknown, teamMembers: TeamMemberInput[]): string | undefined => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) {
            return undefined;
        }

        const member = teamMembers.find((teamMember) => teamMember.name.trim().toLowerCase() === trimmed.toLowerCase());
        return member?.name ?? trimmed;
    }

    const assigneeId = parsePositiveAssigneeId(value);
    if (assigneeId === undefined) {
        return undefined;
    }

    return teamMembers.find((teamMember) => teamMember.id === assigneeId)?.name;
};

const buildMilestoneSummary = (milestones: Milestone[]) => {
    return milestones.map((milestone) => ({
        title: milestone.title,
        effort_points: Math.max(1, Math.round(milestone.effort ?? 1)),
    }));
};

const buildWorkloadSummary = (milestones: Milestone[], teamMembers: TeamMemberInput[]): string => {
    const workloadByMember = new Map<number, number>();
    teamMembers.forEach((member) => {
        if (member.id > 0) {
            workloadByMember.set(member.id, 0);
        }
    });

    milestones.forEach((milestone) => {
        milestone.tasks?.forEach((task) => {
            const assigneeId = task.assignedTo?.[0] ?? task.assignee;
            if (!assigneeId || !workloadByMember.has(assigneeId)) {
                return;
            }

            const current = workloadByMember.get(assigneeId) ?? 0;
            workloadByMember.set(assigneeId, current + Math.max(1, Math.round(task.estimatedHours ?? 1)));
        });
    });

    const lines = teamMembers
        .map((member) => {
            if (member.id <= 0) {
                return null;
            }
            return `${member.name}: ${workloadByMember.get(member.id) ?? 0} points assigned`;
        })
        .filter((line): line is string => Boolean(line));

    return lines.length > 0 ? lines.join("\n") : "No prior assignments yet.";
};

const mapRawTasks = (rawTasks: any[], milestone: Milestone, teamMembers: TeamMemberInput[]): Task[] => {
    return rawTasks.map((t: any, index: number) => ({
        id: milestone.id * 100 + index + 1,
        projectId: 0,
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
        milestoneDescription: milestone.description,
        milestoneDueDate: milestone.dueDate,
        title: t.name,
        description: t.description || "Auto-generated task",
        status: normalizeTaskStatus(t.status),
        priority: "medium" as "low" | "medium" | "high",
        assignedTo: (() => {
            const assigneeId = resolveAssigneeId(t.assigned_to, teamMembers);
            return assigneeId !== undefined ? [assigneeId] : [];
        })(),
        createdBy: 0,
        aiAssignmentReason: typeof t.assignment_reason === "string" && t.assignment_reason.trim() !== ""
            ? t.assignment_reason.trim()
            : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        skill_gap: t.is_skill_gap || false,
        assignee: resolveAssigneeId(t.assigned_to, teamMembers),
        assigneeName: resolveAssigneeName(t.assigned_to, teamMembers),
        estimatedHours: typeof t.complexity === "number" ? t.complexity : undefined,
    }));
};




export const useTaskEngine = () => {
    const [projectDescription, setProjectDescription] = useState("");
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);


    const generateTasksForMilestone = async (
        milestonesToUpdate: Milestone[],
        milestoneId: number,
        teamMembers: TeamMemberInput[],
    ): Promise<Milestone[]> => {
        const milestoneIndex = milestonesToUpdate.findIndex((milestone) => milestone.id === milestoneId);
        if (milestoneIndex < 0) {
            return milestonesToUpdate;
        }

        const targetMilestone = milestonesToUpdate[milestoneIndex];
        const rawTasks = await generateTasks(targetMilestone.id, {
            project_description: projectDescription,
            milestone_title: targetMilestone.title,
            milestone_effort: targetMilestone.effort,
            team_members: teamMembers.map((teamMember) => ({
                name: teamMember.name,
                skills: normalizeSkills(teamMember.skills),
            })),
            workload_summary: buildWorkloadSummary(milestonesToUpdate, teamMembers),
            all_milestones: buildMilestoneSummary(milestonesToUpdate),
        });

        const mappedTasks = mapRawTasks(rawTasks, targetMilestone, teamMembers);

        return milestonesToUpdate.map((milestone, index) => (
            index === milestoneIndex ? { ...milestone, tasks: mappedTasks } : milestone
        ));
    };


    const distributeTasks = async (teamMembers: TeamMemberInput[]): Promise<Milestone[]> => {
        try {
            setLoading(true);

            const aiTeamMembers: AiTeamMemberInput[] = teamMembers.map((teamMember) => ({
                name: teamMember.name,
                skills: normalizeSkills(teamMember.skills),
            }));

            //Generating the milestones
            const plan = await generateMilestones(projectDescription, aiTeamMembers);
            console.log("Response from /projects/breakdown:", plan);


            const milestoneData: Milestone[] = plan.milestones.map((m: any, index: number) => ({
                id: index + 1,
                title: m.title,
                description: m.description || "Auto-generated milestone",
                effort: m.effort_points,
                dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000), // Weekly intervals
                tasks: []
            }));

            if (milestoneData.length === 0) {
                setMilestones([]);
                return [];
            }

            // Initial run only generates tasks for the first milestone.
            const withFirstMilestoneTasks = await generateTasksForMilestone(milestoneData, milestoneData[0].id, teamMembers);
            setMilestones(withFirstMilestoneTasks);
            return withFirstMilestoneTasks;

        } catch (error) {
            console.error("Error distributing tasks:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const distributeTasksForMilestone = async (
        milestoneId: number,
        teamMembers: TeamMemberInput[],
    ): Promise<Milestone[]> => {
        try {
            setLoading(true);
            const updatedMilestones = await generateTasksForMilestone(milestones, milestoneId, teamMembers);
            setMilestones(updatedMilestones);
            return updatedMilestones;
        } catch (error) {
            console.error("Error generating milestone tasks:", error);
            return milestones;
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
        distributeTasksForMilestone,
    };



}
