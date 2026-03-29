"""
app/services/fairness.py
─────────────────────────
[ADDED] Gini coefficient calculation for workload fairness.

This module contains the fairness score logic described in the project docs.
It measures how evenly task complexity is distributed across team members.

The Gini coefficient is a number between 0 and 1:
  - 0.0 = perfectly equal (everyone has the same workload)
  - 1.0 = completely unequal (one person does everything)

Formula (for sorted workloads y_1 <= y_2 <= ... <= y_n):
  G = (2 * Σ(i * y_i)) / (n * Σ(y_i)) - (n + 1) / n

Usage:
  from app.services.fairness import calculate_gini_coefficient
  score = calculate_gini_coefficient([10, 20, 30])  # → 0.222
"""

from typing import List


def calculate_gini_coefficient(workloads: List[int]) -> float:
    """
    Computes the Gini coefficient for a list of workload values.
    
    Args:
        workloads: A list of integers where each value is the total
                   complexity points assigned to a team member.
                   Example: [10, 20, 30] for a 3-person team.
    
    Returns:
        A float between 0.0 (perfect equality) and 1.0 (total inequality).
    
    Edge cases handled:
        - Empty list → returns 0.0 (no team = no inequality)
        - Single member → returns 0.0 (can't be unequal with one person)
        - All zeros → returns 0.0 (no work assigned = no inequality)
    """
    n = len(workloads)

    # Edge case: 0 or 1 members — no inequality possible
    if n <= 1:
        return 0.0

    # Sort workloads ascending (required by the Gini formula)
    sorted_workloads = sorted(workloads)

    # Edge case: total workload is zero (no tasks assigned yet)
    total = sum(sorted_workloads)
    if total == 0:
        return 0.0

    # Gini formula:
    # Numerator = 2 * Σ(i * y_i)  where i is 1-indexed
    # G = Numerator / (n * total) - (n + 1) / n
    numerator = 2 * sum((i + 1) * y for i, y in enumerate(sorted_workloads))
    gini = numerator / (n * total) - (n + 1) / n

    # Clamp to [0, 1] to handle floating-point rounding
    return max(0.0, min(1.0, round(gini, 4)))
