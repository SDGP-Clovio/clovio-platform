from __future__ import annotations

from dataclasses import dataclass

from app.schemas.supervisor import (
    SupervisorContributionsResponse,
    SupervisorFairnessResponse,
    SupervisorProjectDetailResponse,
)


@dataclass
class SupervisorReportService:
    def build_project_report_pdf(
        self,
        project: SupervisorProjectDetailResponse,
        contributions: SupervisorContributionsResponse,
        fairness: SupervisorFairnessResponse,
    ) -> bytes:
        # Placeholder implementation for STEP 2.
        # STEP 5 will replace this with real PDF generation (e.g., reportlab/weasyprint)
        # while preserving this service interface.
        lines = [
            "Clovio Supervisor Report",
            f"Project: {project.name}",
            f"Status: {project.status}",
            f"Completion: {project.completion_percent}%",
            f"Fairness Score: {fairness.fairness_score}",
            "Contributions:",
        ]

        for item in contributions.contributions:
            lines.append(
                f"- {item.name}: {item.contribution_percent}% | "
                f"tasks={item.tasks_completed} updates={item.updates_count}"
            )

        content = "\n".join(lines)
        return content.encode("utf-8")
