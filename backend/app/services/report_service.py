from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

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
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36,
            title=f"Clovio Supervisor Report - {project.name}",
        )
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph("Clovio Supervisor Report", styles["Title"]))
        story.append(Spacer(1, 12))

        story.append(Paragraph(f"<b>Project Title:</b> {project.name}", styles["BodyText"]))
        story.append(Paragraph(f"<b>Status:</b> {project.status}", styles["BodyText"]))
        story.append(Paragraph(f"<b>Completion:</b> {project.completion_percent:.1f}%", styles["BodyText"]))
        story.append(Paragraph(f"<b>Fairness Score:</b> {fairness.fairness_score:.1f} / 100", styles["BodyText"]))
        story.append(Spacer(1, 14))

        story.append(Paragraph("Contribution Table", styles["Heading2"]))
        story.append(Spacer(1, 8))

        table_data = [
            ["Student", "Contribution %", "Tasks Completed", "Updates", "Activity Score"],
        ]
        for item in contributions.contributions:
            table_data.append(
                [
                    item.name,
                    f"{item.contribution_percent:.1f}%",
                    str(item.tasks_completed),
                    str(item.updates_count),
                    f"{item.activity_score:.1f}",
                ]
            )

        if len(table_data) == 1:
            table_data.append(["No contribution data", "-", "-", "-", "-"])

        contributions_table = Table(
            table_data,
            colWidths=[150, 90, 90, 70, 90],
            repeatRows=1,
        )
        contributions_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#B179DF")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    ("TOPPADDING", (0, 1), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
                ]
            )
        )
        story.append(contributions_table)

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
