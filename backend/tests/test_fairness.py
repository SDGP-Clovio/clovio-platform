import pytest
from app.utils.fairness import gini_coefficient
from app.schemas.project import Task

def test_gini_perfect_equality():
    """If everyone has the same total complexity, Gini should be 0."""
    tasks = [
        Task(name="Task1", complexity=5, assigned_to="Alice", required_skills=[], is_skill_gap=False),
        Task(name="Task2", complexity=5, assigned_to="Bob", required_skills=[], is_skill_gap=False),
        Task(name="Task3", complexity=5, assigned_to="Charlie", required_skills=[], is_skill_gap=False),
    ]
    members = ["Alice", "Bob", "Charlie"]
    gini = gini_coefficient(tasks, members)
    assert gini == 0.0

def test_gini_perfect_inequality():
    """If one person has all the complexity, Gini should be (n-1)/n."""
    tasks = [
        Task(name="Task1", complexity=10, assigned_to="Alice", required_skills=[], is_skill_gap=False),
        # No tasks for Bob and Charlie
    ]
    members = ["Alice", "Bob", "Charlie"]
    gini = gini_coefficient(tasks, members)
    # For 3 people, (n-1)/n = 2/3 ≈ 0.6667
    assert round(gini, 3) == 0.667

def test_gini_with_skill_gaps():
    """Skill‑gap tasks (unassigned) are ignored."""
    tasks = [
        Task(name="Task1", complexity=5, assigned_to="Alice", required_skills=[], is_skill_gap=False),
        Task(name="Task2", complexity=5, assigned_to=None, required_skills=[], is_skill_gap=True),
        Task(name="Task3", complexity=5, assigned_to="Bob", required_skills=[], is_skill_gap=False),
    ]
    members = ["Alice", "Bob", "Charlie"]
    gini = gini_coefficient(tasks, members)
    # Alice and Bob have 5 each, Charlie has 0 → totals: 5,5,0
    # Sorted: [0,5,5], n=3, sum=10
    # cumulative = 1*0 + 2*5 + 3*5 = 25
    # gini = (2*25)/(3*10) - 4/3 = 50/30 - 1.3333 = 1.6667 - 1.3333 = 0.3334
    assert round(gini, 3) == 0.333

def test_gini_empty_tasks():
    """If no tasks, Gini should be 0."""
    tasks = []
    members = ["Alice", "Bob"]
    gini = gini_coefficient(tasks, members)
    assert gini == 0.0