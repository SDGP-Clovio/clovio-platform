import json
from abc import ABC, abstractmethod
from typing import List, Optional

from tenacity import Retrying, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings, PROVIDER_DEFAULTS
from app.schemas.project import TeamMember, MilestonePlanResponse, Task

# ──────────────────────────────────────────────────────────────────────────────
# LLM PROVIDER ABSTRACTION
# Both providers expose the same chat.completions.create() interface.
# Each class wraps its own SDK and handles its own retryable exceptions so the
# rest of the service code stays completely provider-agnostic.
# ──────────────────────────────────────────────────────────────────────────────

class LLMProvider(ABC):
    """Common interface all LLM providers must implement."""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def complete(self, messages: list, model: str, max_tokens: int, temperature: float) -> str:
        """Call the LLM and return the response content. Retries on transient failures."""
        pass


class GroqProvider(LLMProvider):
    def __init__(self, api_key: str):
        from groq import Groq, APIError, APIConnectionError, RateLimitError
        self._client = Groq(api_key=api_key)
        self._retryable = (APIError, APIConnectionError, RateLimitError)

    @property
    def name(self) -> str:
        return "GROQ"

    def complete(self, messages: list, model: str, max_tokens: int, temperature: float) -> str:
        for attempt in Retrying(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=30),
            retry=retry_if_exception_type(self._retryable),
            reraise=True,
        ):
            with attempt:
                completion = self._client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                if not completion.choices:
                    raise RuntimeError("AI returned no choices: possible API error or empty response")
                return completion.choices[0].message.content


class DeepSeekProvider(LLMProvider):
    def __init__(self, api_key: str, base_url: str):
        from openai import OpenAI, APIError, APIConnectionError, RateLimitError
        self._client = OpenAI(api_key=api_key, base_url=base_url)
        self._retryable = (APIError, APIConnectionError, RateLimitError)

    @property
    def name(self) -> str:
        return "DEEPSEEK"

    def complete(self, messages: list, model: str, max_tokens: int, temperature: float) -> str:
        for attempt in Retrying(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=30),
            retry=retry_if_exception_type(self._retryable),
            reraise=True,
        ):
            with attempt:
                completion = self._client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                if not completion.choices:
                    raise RuntimeError("AI returned no choices: possible API error or empty response")
                return completion.choices[0].message.content


# ──────────────────────────────────────────────────────────────────────────────
# PROVIDER INITIALISATION
# Primary is set by AI_PROVIDER (config validates its key is present).
# Fallback is the other provider — activated only if its API key is present.
# Adding a second key in .env is all that is needed to enable fallback.
# ──────────────────────────────────────────────────────────────────────────────

def _build_provider(name: str) -> Optional[LLMProvider]:
    """Return an LLMProvider instance for `name`, or None if its key is absent or the SDK import fails."""
    try:
        if name == "groq" and settings.GROQ_API_KEY:
            return GroqProvider(settings.GROQ_API_KEY)
        if name == "deepseek" and settings.DEEPSEEK_API_KEY:
            ds = PROVIDER_DEFAULTS["deepseek"]
            return DeepSeekProvider(settings.DEEPSEEK_API_KEY, ds["base_url"])
    except ImportError as e:
        print(f"[AI Service] Warning: could not initialise {name} provider — {e}")
    return None


_primary_name: str = settings.AI_PROVIDER
_fallback_name: str = "deepseek" if _primary_name == "groq" else "groq"

_primary: LLMProvider = _build_provider(_primary_name)           # always present (config validates this)
_fallback: Optional[LLMProvider] = _build_provider(_fallback_name)  # optional

print(f"[AI Service] Primary:  {_primary.name}  |  Model: {settings.AI_MODEL}")
if _fallback:
    print(f"[AI Service] Fallback: {_fallback.name}  |  Model: {PROVIDER_DEFAULTS[_fallback_name]['model']}")
else:
    print(f"[AI Service] Fallback: none  (set {_fallback_name.upper()}_API_KEY to enable)")


# ──────────────────────────────────────────────────────────────────────────────
# CORE CALL — primary → fallback on total failure
# ──────────────────────────────────────────────────────────────────────────────

def _call_llm(messages: list) -> str:
    """
    Call the primary LLM provider with retry. If all retries are exhausted,
    fall back to the secondary provider (if configured). Raises RuntimeError
    when both providers fail or no fallback is available.
    """
    try:
        return _primary.complete(
            messages=messages,
            model=settings.AI_MODEL,
            max_tokens=settings.MAX_TOKENS,
            temperature=settings.AI_TEMPERATURE,
        )
    except Exception as primary_err:
        if _fallback is None:
            raise
        print(f"[AI Service] {_primary.name} failed ({primary_err}). Switching to {_fallback.name}...")
        fallback_model = PROVIDER_DEFAULTS[_fallback_name]["model"]
        return _fallback.complete(
            messages=messages,
            model=fallback_model,
            max_tokens=settings.MAX_TOKENS,
            temperature=settings.AI_TEMPERATURE,
        )


# ──────────────────────────────────────────────────────────────────────────────
# HELPER: Strip markdown code fences from AI responses
# ──────────────────────────────────────────────────────────────────────────────

def _clean_json_response(raw: str) -> str:
    """
    Removes markdown code fences (```json ... ``` or ``` ... ```) that some
    LLMs wrap around their JSON output. Returns the cleaned string.
    """
    if "```json" in raw:
        return raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        return raw.split("```")[1].split("```")[0].strip()
    return raw.strip()


# ──────────────────────────────────────────────────────────────────────────────
# AI GENERATION FUNCTIONS
# ──────────────────────────────────────────────────────────────────────────────

def generate_milestones_only(description: str, team_members: List[TeamMember]) -> MilestonePlanResponse:
    """
    Calls AI to generate only milestones with effort points.
    Returns a dict with project_name, milestones list, and optional risk warning.
    """
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
        raw_content = _call_llm(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Project Description: {description}"}
            ]
        )

        raw_content = _clean_json_response(raw_content)
        data = json.loads(raw_content)
        if "project_name" not in data or "milestones" not in data:
            raise ValueError("Missing required fields in AI response")
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
) -> List[Task]:
    """
    Calls AI to generate tasks for a specific milestone, considering current workload.
    Returns a list of Task objects.
    """
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
    - complexity: integer 1–10 STRICTLY (NEVER below 1 or above 10). The sum of all task complexities should approximately equal the milestone's effort estimate. If you need more total effort, create more tasks — do NOT increase individual complexity beyond 10.
    - required_skills: list of skill keywords (e.g., ["Python", "Database"])
    - assigned_to: name of the team member best suited based on skills and current workload. If the required skills are missing from the entire team, set this to null and set is_skill_gap to true.
    - assignment_reason: short justification for the assignment, or null if is_skill_gap is true.
    - is_skill_gap: boolean – true if the required skills are not present in the team, otherwise false.
    3. Fairness and Workload Balancing:
    - Aim to distribute new tasks so that cumulative complexity becomes balanced over time.
    - Avoid overloading members with many pending tasks – give fewer tasks to those already heavily loaded.
    - If someone is significantly behind in cumulative complexity, you may give them slightly more work if they have low pending tasks.
    4. Output a JSON array of tasks with this exact structure:
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

    try:
        raw_content = _call_llm(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Generate tasks for milestone: {milestone_title}"}
            ]
        )
        raw_content = _clean_json_response(raw_content)
        tasks_data = json.loads(raw_content)

        # Clamp complexity to 1–10 before Pydantic validation.
        # LLMs occasionally ignore the prompt constraint and output values > 10.
        for t in tasks_data:
            if 'complexity' in t:
                t['complexity'] = max(1, min(10, int(t['complexity'])))

        return [Task(**t) for t in tasks_data]
    except Exception as e:
        raise RuntimeError(f"Task generation failed: {str(e)}")
