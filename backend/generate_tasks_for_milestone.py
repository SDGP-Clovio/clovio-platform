import json
from app.services.ai_service import generate_tasks_for_milestone
from app.schemas.project import TeamMember, Skill

def test_task_gen(project_desc, milestone_title, milestone_effort, team_members, workload_summary, all_milestones=None):
    print(f"\n--- Testing task generation for milestone: {milestone_title} ---")
    try:
        tasks = generate_tasks_for_milestone(
            project_description=project_desc,
            milestone_title=milestone_title,
            milestone_effort=milestone_effort,
            team_members=team_members,
            workload_summary=workload_summary,
            all_milestones=all_milestones
        )
        # Convert each Task object to a dict for pretty printing
        tasks_dicts = [task.model_dump() for task in tasks]
        print(json.dumps(tasks_dicts, indent=2))
    except Exception as e:
        print(f"ERROR: {e}")

# Reuse the same team members from your milestone tests
members = [
    TeamMember(name="Alice", skills=[
        Skill(name="Python", level=4),
        Skill(name="Django", level=3)
    ]),
    TeamMember(name="Bob", skills=[
        Skill(name="React Native", level=3),
        Skill(name="UI/UX", level=2)
    ]),
    TeamMember(name="Charlie", skills=[
        Skill(name="Research", level=4),
        Skill(name="Writing", level=3)
    ]),
]

# Test case 1: First milestone with no prior workload
test_task_gen(
    project_desc="Build a simple calculator app with a basic UI and arithmetic operations",
    milestone_title="Frontend Development",
    milestone_effort=20,
    team_members=members,
    workload_summary="Alice: completed 0 points, pending 0 points; Bob: completed 0 points, pending 0 points; Charlie: completed 0 points, pending 0 points."
)
"""
# Test case 2: A later milestone with existing workload
test_task_gen(
    project_desc="Develop a cross‑platform mobile app called 'FitSocial' that tracks workouts, has social features, and integrates with wearables.",
    milestone_title="Backend API Development",
    milestone_effort=35,
    team_members=members,
    workload_summary="Alice: completed 12 points, pending 5 points; Bob: completed 8 points, pending 0 points; Charlie: completed 0 points, pending 10 points."
)

# Test case 3: A milestone that might require skills not present (to trigger is_skill_gap)
test_task_gen(
    project_desc="Create a marketing website and launch campaign for the FitSocial app.",
    milestone_title="Marketing Website & Launch",
    milestone_effort=15,
    team_members=members,
    workload_summary="Alice: completed 0 points, pending 0 points; Bob: completed 0 points, pending 0 points; Charlie: completed 0 points, pending 0 points."
)"""