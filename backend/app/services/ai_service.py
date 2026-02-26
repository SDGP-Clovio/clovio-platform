from typing import List
from groq import Groq
from app.core.config import settings
from app.schemas.project import ProjectPlan, TeamMember

# Initializing the Groq client using the key from the config file
client = Groq(api_key=settings.GROQ_API_KEY)

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
        completion = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Project Description: {description}"}
            ],
            #max_tokens=settings.MAX_TOKENS,
            #response_format={"type": "json_object"},
        )

        if not completion.choices:
            raise RuntimeError("AI returned no choices – possible API error or empty response")

        raw_json = completion.choices[0].message.content
        if "```json" in raw_json:
            raw_json = raw_json.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_json:
            raw_json = raw_json.split("```")[1].split("```")[0].strip()

        return ProjectPlan.model_validate_json(raw_json)

    except Exception as e:
        raise RuntimeError(f"AI generation failed: {str(e)}")
