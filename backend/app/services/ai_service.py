import json
from typing import List
from groq import Groq
from groq import APIError, APIConnectionError, RateLimitError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.core.config import settings
from app.schemas.project import ProjectPlan, TeamMember, MilestonePlanResponse

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
    Returns a dict with project_name, milestones list, and optional risk warning.
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
            max_tokens=settings.MAX_TOKENS
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

def generate_task_breakdown(description: str, team_members: List[TeamMember]) -> ProjectPlan:
    """
    Takes a project description and a list of team members, 
    then returns a structured project plan assigned by AI.
    """

    members_info = "\n".join(
        f"{member.name}: " + (", ".join(str(skill) for skill in member.skills) if member.skills else "no skills listed")
        for member in team_members
    )

    # The System Prompt that the AI must follow
    system_prompt = f"""
    You are a Senior Project Manager. Your goal is to break down a project into logical milestones and tasks.
    
    CRITICAL RULES:
    1. Scale: Determine the number of milestones based on the project's complexity. Ensure the breakdown is detailed enough for guidance but not so granular that it overwhelms the team.
    2. Fairness: Assign tasks to the following team members based on their skills and proficiency levels
       (format: "Skill (Level, N/4)"): {members_info}
    3. Bottlenecks: If one person has a unique skill needed for 90% of the project, assign them the hardest tasks 
       and assign 'learning' tasks to others to balance the load.
    4. Reasoning: For every assignment, explain WHY that person was chosen in the 'assignment_reason' field.
    5. Output: You must return ONLY valid JSON that matches the ProjectPlan schema.

    You must respond with a JSON object that exactly matches this schema:
    JSON STRUCTURE:
    {{
    "project_name": string,
    "milestones": [
        {{
        "title": string,
        "tasks": [
            {{
            "name": string,
            "description": string,
            "complexity": integer (1-10),
            "required_skills": [string],
            "assigned_to": string,
            "assignment_reason": string,
            "is_skill_gap": boolean
            }}
        ]
        }}
    ],
    "overall_risk_warning": string | null
    }}
    """

    try:
        raw_content = _call_groq_with_retry(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Project Description: {description}"}
            ],
            model=settings.AI_MODEL,
            max_tokens=settings.MAX_TOKENS   
        )            

        raw_json = raw_content
        # The AI might wrap the JSON in markdown code blocks, so we need to extract it. 
        if "```json" in raw_content:
            raw_json = raw_content.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_content:
            raw_json = raw_content.split("```")[1].split("```")[0].strip()

        return ProjectPlan.model_validate_json(raw_json)

    except Exception as e:
        raise RuntimeError(f"AI generation failed: {str(e)}")
