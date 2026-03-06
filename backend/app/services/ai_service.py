import json
from typing import List
from groq import Groq
from groq import APIError, APIConnectionError, RateLimitError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.core.config import settings
from app.schemas.project import ProjectPlan, TeamMember, MilestonePlanResponse, Task

# Initializing the Groq client using the key from the config file
client = Groq(api_key=settings.GROQ_API_KEY)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    retry=retry_if_exception_type((APIError, APIConnectionError, RateLimitError)),
    reraise=True,
)
def _call_groq_with_retry(messages: list, model: str, max_tokens: int = None, **kwargs) -> str:
    """
    Calls the Groq API. Retried up to 3 times on network failures
    (rate limits, timeouts) with exponential backoff (2 s -> 4 s -> 8 s, max 30 s).
    """
    extra_args = {}
    if max_tokens is not None:
        extra_args["max_tokens"] = max_tokens
    extra_args.update(kwargs) # Include any additional arguments passed like temperature etc.     

    completion = client.chat.completions.create( # API call to AI to get a completion based on the provided messages and model
        model=model, # The AI model to use for generating the response 
        messages=messages, # A list of messages that includes the system prompt and user input, which guides the AI's response
        **extra_args # Any additional parameters for the API call, such as max_tokens or temperature, are passed here
    )
    if not completion.choices:
        raise RuntimeError("AI returned no choices: possible API error or empty response")
    return completion.choices[0].message.content

def generate_milestones_only(description: str, team_members: List[TeamMember]) -> MilestonePlanResponse:
    """
    Calls AI to generate only milestones with effort points.
    Returns a MilestonePlanResponse object containing project name, milestones, and optional warnings/timeline.
    """
    # Format team members for the prompt (same as before)
    members_info = "\n".join(
        f"{member.name}: " + (", ".join(str(skill) for skill in member.skills) if member.skills else "no skills listed")
        for member in team_members
    )

    prompt = f"""
    You are a Senior Project Manager. Given a project description and a team, your task is to break the project into a logical set of milestones.

    Team Members and their skills (format: "Skill (Level, 1/4)"):
    {members_info}

    Project Description: {description}

    CRITICAL RULES:
    1. Identify the major phases of work as milestones. The number of milestones should be appropriate to the project's complexity – a simple project might have just one milestone, while a complex one could have several. Each milestone should represent a significant, deliverable phase.
    2. For each milestone, provide:
    - title: a short, descriptive name.
    - effort_points: a positive integer estimating the total effort for that milestone. There is NO upper limit – use whatever number feels right (e.g., a tiny milestone might be 3, a large one might be >80). Think of it as the approximate sum of task complexity scores (each task complexity is 1–10) you would expect this milestone to contain.
    3. If you see any potential risks (e.g., missing skills, vague description, unrealistic timeline), include an `overall_risk_warning` string. Otherwise set it to null.
    4. Provide a suggested total timeline for the entire project:
    - suggested_timeline_weeks: an integer estimating the number of weeks the project might take, based on effort points and team skills. If uncertain, you may omit it (set to null).
    5. Output a JSON object with this exact structure:
    {{
    "project_name": "string",
    "milestones": [
        {{
        "title": "string",
        "effort_points": integer
        }}
    ],
    "overall_risk_warning": "string or null",
    "suggested_timeline_weeks": integer or null
    }}
    Do not include any other text.
    """

    try:
        raw_content = _call_groq_with_retry(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Project Description: {description}"}
            ],
            model=settings.AI_MODEL,
            max_tokens=settings.MAX_TOKENS,
            temperature=settings.AI_TEMPERATURE
        )

        # Clean markdown fences (same as before)
        if "```json" in raw_content:
            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_content:
            raw_content = raw_content.split("```")[1].split("```")[0].strip()

        # Parse JSON
        data = json.loads(raw_content)
        # Basic validation
        if "project_name" not in data or "milestones" not in data:
            raise ValueError("Missing required fields in AI response")
        # Optional: validate each milestone has title and effort_points
        for m in data["milestones"]:
            if "title" not in m or "effort_points" not in m:
                raise ValueError("Milestone missing title or effort_points")
        return MilestonePlanResponse.model_validate(data)
    except Exception as e:
        raise RuntimeError(f"Milestone generation failed: {str(e)}")

def generate_tasks_for_milestone(
    project_description: str,
    milestone_title: str,
    milestone_effort: int,
    team_members: List[TeamMember],
    workload_summary: str,
    all_milestones: List[dict] = None
) -> List[Task]: # Returns a list of Task objects with assignments and justifications.
    """
    Calls AI to generate tasks for a specific milestone, considering current workload.
    Returns a list of Task objects.
    """
    # Format team members
    members_info = "\n".join(
        f"{member.name}: " + (", ".join(str(skill) for skill in member.skills) if member.skills else "no skills listed")
        for member in team_members
    )

    if all_milestones:
        milestones_lines = [f"- {m['title']} ({m['effort_points']} points)" for m in all_milestones]
        milestones_context = "\n".join(milestones_lines)
    else:
        milestones_context = "Not provided." 

    prompt = f"""
    You are a Senior Project Manager. Your goal is to break down a specific milestone into concrete, assignable tasks.

    Project Context:
    - Original Project Description: {project_description}
    - Current Milestone: {milestone_title}
    - Milestone Effort Estimate: {milestone_effort} points (total effort for this milestone)

    Overall Project Milestones (for context):
    {milestones_context}    
    
    Team Members and their skills (format: "Skill (Level, 1/4)"):
    {members_info}

    Current Workload (based on previous milestones):
    {workload_summary}

    CRITICAL RULES:
    1. Generate an appropriate number of tasks for this milestone, considering its effort estimate and the team size. The tasks should collectively represent the work needed to complete the milestone.
    2. For each task, provide:
    - name: short title
    - description: brief explanation (optional but recommended)
    - complexity: integer 1–10 (effort points). The sum of all task complexities should approximately equal the milestone's effort estimate.
    - required_skills: list of skill keywords (e.g., ["Python", "Database"])
    - assigned_to: name of the team member best suited based on skills and current workload. If the required skills are missing from the entire team, set this to null and set is_skill_gap to true.
    - assignment_reason: short justification for the assignment, or null if is_skill_gap is true.
    - is_skill_gap: boolean – true if the required skills are not present in the team, otherwise false.
    3. Fairness and Workload Balancing:
    - Aim to distribute new tasks so that cumulative complexity becomes balanced over time.
    - Avoid overloading members with many pending tasks – give fewer tasks to those already heavily loaded.
    - If someone is significantly behind in cumulative complexity, you may give them slightly more work if they have low pending tasks.
    4. Task scope: All tasks must be strictly limited to the current milestone. Do not generate tasks that belong to other milestones. Focus exclusively on the work required to complete this specific milestone.
    5. Output a JSON array of tasks with this exact structure:
    [
    {{
        "name": "string",
        "description": "string",
        "complexity": integer,
        "required_skills": ["string"],
        "assigned_to": "string or null",
        "assignment_reason": "string or null",
        "is_skill_gap": boolean
    }}
    ]
    Do not include any other text.
    """ 

    # Call AI (use _call_groq_with_retry)
    raw_content = _call_groq_with_retry(
        messages=[
            {"role": "system", "content": prompt}
        ],
        model=settings.AI_MODEL,
        max_tokens=settings.MAX_TOKENS
    )

    try:
        # Clean JSON (same as before)
        if "```json" in raw_content:
            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_content:
            raw_content = raw_content.split("```")[1].split("```")[0].strip()
        # Parse JSON into list of dicts
        tasks_data = json.loads(raw_content)
        # Convert each dict to a Task object
        return [Task(**t) for t in tasks_data]
    except Exception as e:
        raise RuntimeError(f"Task generation for milestone '{milestone_title}' failed: {str(e)}")


# generate_task_breakdown: kept for reference
# This function has been replaced by a two-step approach:
# 1. generate_milestones_only() - generates milestones with effort points
# 2. generate_tasks_for_milestone() - generates tasks per milestone with workload balancing
# The old single-call approach lacked workload awareness, per-milestone effort estimation,
# and dynamic task distribution. It is kept here for reference only and should not be used.

# def generate_task_breakdown(description: str, team_members: List[TeamMember]) -> ProjectPlan:
#     """
#     Takes a project description and a list of team members, 
#     then returns a structured project plan assigned by AI.
#     """
#
#     members_info = "\n".join(
#         f"{member.name}: " + (", ".join(str(skill) for skill in member.skills) if member.skills else "no skills listed")
#         for member in team_members
#     )
#
#     # The System Prompt that the AI must follow
#     system_prompt = f"""
#     You are a Senior Project Manager. Your goal is to break down a project into logical milestones and tasks.
#     
#     CRITICAL RULES:
#     1. Scale: Determine the number of milestones based on the project's complexity. Ensure the breakdown is detailed enough for guidance but not so granular that it overwhelms the team.
#     2. Fairness: Assign tasks to the following team members based on their skills and proficiency levels
#        (format: "Skill (Level, N/4)"): {members_info}
#     3. Bottlenecks: If one person has a unique skill needed for 90% of the project, assign them the hardest tasks 
#        and assign 'learning' tasks to others to balance the load.
#     4. Reasoning: For every assignment, explain WHY that person was chosen in the 'assignment_reason' field.
#     5. Output: You must return ONLY valid JSON that matches the ProjectPlan schema.
#
#     You must respond with a JSON object that exactly matches this schema:
#     JSON STRUCTURE:
#     {{
#     "project_name": string,
#     "milestones": [
#         {{
#         "title": string,
#         "tasks": [
#             {{
#             "name": string,
#             "description": string,
#             "complexity": integer (1-10),
#             "required_skills": [string],
#             "assigned_to": string,
#             "assignment_reason": string,
#             "is_skill_gap": boolean
#             }}
#         ]
#         }}
#     ],
#     "overall_risk_warning": string | null
#     }}
#     """
#
#     try:
#         raw_content = _call_groq_with_retry(
#             messages=[
#                 {"role": "system", "content": system_prompt},
#                 {"role": "user", "content": f"Project Description: {description}"}
#             ],
#             model=settings.AI_MODEL,
#             max_tokens=settings.MAX_TOKENS   
#         )            
#
#         raw_json = raw_content
#         # The AI might wrap the JSON in markdown code blocks, so we need to extract it. 
#         if "```json" in raw_content:
#             raw_json = raw_content.split("```json")[1].split("```")[0].strip()
#         elif "```" in raw_content:
#             raw_json = raw_content.split("```")[1].split("```")[0].strip()
#
#         return ProjectPlan.model_validate_json(raw_json)
#
#     except Exception as e:
#         raise RuntimeError(f"AI generation failed: {str(e)}")
