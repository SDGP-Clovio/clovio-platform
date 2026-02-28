from typing import List
from groq import Groq
from groq import APIError, APIConnectionError, RateLimitError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.core.config import settings
from app.schemas.project import ProjectPlan, TeamMember

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
