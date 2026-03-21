import difflib

# 1. The Master List: The official skills your platform supports
MASTER_SKILLS = [
    "Python", "JavaScript", "React", "Node.js", "PostgreSQL",
    "Java", "HTML", "CSS", "Docker", "FastAPI", "SQLAlchemy"
]

# 2. The Alias Map: Catching common abbreviations or spellings
SKILL_ALIASES = {
    "reactjs": "React",
    "react.js": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "postgres": "PostgreSQL",
    "sql": "PostgreSQL", 
    "js": "JavaScript",
    "py": "Python",
    "ts": "TypeScript"
}

def normalize_skill(user_input: str) -> str | None:
    """
    Takes messy user input, cleans it, and attempts to match it
    to a master skill category.
    """
    if not user_input:
        return None
        
    # Step A: Clean the input (lowercase, strip extra spaces)
    clean_input = user_input.strip().lower()

    if not clean_input:
        return None

    # Step B: Check the alias dictionary first (Fastest for known variations)
    if clean_input in SKILL_ALIASES:
        return SKILL_ALIASES[clean_input]

    # Step C: Fuzzy matching for typos using Python's built-in difflib
    # We lowercase the master skills temporarily just for the comparison
    master_lower = {skill.lower(): skill for skill in MASTER_SKILLS}

    # Find the closest match with a cutoff score (0.8 means 80% similar)
    matches = difflib.get_close_matches(clean_input, master_lower.keys(), n=1, cutoff=0.8)

    if matches:
        matched_key = matches[0]
        return master_lower[matched_key] # Return the properly capitalized master skill

    # Step D: If no match is found, return None 
    return None

# --- Quick Test Block ---
if __name__ == "__main__":
    print(f"Testing '   ReaCt.js  ' -> {normalize_skill('   ReaCt.js  ')}")  # Alias match
    print(f"Testing 'pythn'         -> {normalize_skill('pythn')}")          # Fuzzy typo match
    print(f"Testing 'node'          -> {normalize_skill('node')}")           # Alias match
    print(f"Testing 'cooking'       -> {normalize_skill('cooking')}")        # No match