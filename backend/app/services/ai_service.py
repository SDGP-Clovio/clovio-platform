import json
from groq import Groq
from app.core.config import settings
from app.schemas.project import ProjectPlan

# Initializing the Groq client using the key from our config file
client = Groq(api_key=settings.GROQ_API_KEY)

def generate_task_breakdown(description: str, team_members: list) -> ProjectPlan:
    """
    Takes a project description and a list of team members, 
    then returns a structured project plan assigned by AI.
    """
    
    # The System Prompt is the 'rulebook' the AI must follow
    system_prompt = f"""
    You are a Senior Project Manager. Your goal is to break down a project into logical milestones and tasks.
    
    CRITICAL RULES:
    1. Scale: For simple projects, use 1 milestone. For complex ones, use 3-5.
    2. Fairness: Assign tasks to the following team members based on their skills: {team_members}
    3. Bottlenecks: If one person has a unique skill needed for 90% of the project, assign them the hardest tasks 
       and assign 'learning' tasks to others to balance the load.
    4. Reasoning: For every assignment, explain WHY that person was chosen in the 'assignment_reason' field.
    5. Output: You must return ONLY valid JSON that matches the ProjectPlan schema.
    """

    # Making the actual request to the Groq API
    completion = client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Project Description: {description}"}
        ],
        # Forces the AI to respond in JSON format
        response_format={{"type": "json_object"}}
    )

    # Extracting the text response from the AI
    raw_json = completion.choices[0].message.content
    
    # Validating the AI's JSON against our ProjectPlan class
    return ProjectPlan.model_validate_json(raw_json)