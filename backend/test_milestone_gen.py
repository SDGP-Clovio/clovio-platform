from app.services.ai_service import generate_milestones_only
from app.schemas.project import TeamMember, Skill

# Helper to print results nicely
import json

def test_milestone_gen(description, members):
    print(f"\n--- Testing: {description} ---")
    try:
        result = generate_milestones_only(description, members)
        print(result.model_dump_json(indent=2))
    except Exception as e:
        print(f"ERROR: {e}")

# Define a few sample team members (reuse for all tests)
members = members_smartcity = [
    TeamMember(name="Alice", skills=[
        Skill(name="Embedded Systems", level=4),
        Skill(name="C++", level=4),
        Skill(name="LoRaWAN", level=3),
        Skill(name="IoT protocols", level=4)
    ]),
    TeamMember(name="Bob", skills=[
        Skill(name="Hardware Engineering", level=4),
        Skill(name="Sensors", level=4),
        Skill(name="Circuit Design", level=3),
        Skill(name="Testing", level=3)
    ]),
    TeamMember(name="Charlie", skills=[
        Skill(name="Backend Dev", level=4),
        Skill(name="Python", level=4),
        Skill(name="Django", level=4),
        Skill(name="PostgreSQL", level=4),
        Skill(name="AWS", level=3)
    ]),
    TeamMember(name="Diana", skills=[
        Skill(name="DevOps", level=4),
        Skill(name="AWS", level=4),
        Skill(name="Kubernetes", level=3),
        Skill(name="CI/CD", level=4),
        Skill(name="Monitoring", level=3)
    ]),
    TeamMember(name="Eve", skills=[
        Skill(name="Frontend Dev", level=4),
        Skill(name="React", level=4),
        Skill(name="D3.js", level=3),
        Skill(name="Map libraries", level=3),
        Skill(name="UI/UX", level=3)
    ]),
    TeamMember(name="Frank", skills=[
        Skill(name="Mobile Dev", level=4),
        Skill(name="React Native", level=4),
        Skill(name="iOS/Android", level=3),
        Skill(name="Offline sync", level=3)
    ]),
    TeamMember(name="Grace", skills=[
        Skill(name="Data Science", level=4),
        Skill(name="Python", level=4),
        Skill(name="ML", level=4),
        Skill(name="Time‑series analysis", level=3),
        Skill(name="Forecasting", level=3)
    ]),
    TeamMember(name="Henry", skills=[
        Skill(name="Security", level=4),
        Skill(name="Cryptography", level=3),
        Skill(name="Compliance", level=4),
        Skill(name="Pen testing", level=3)
    ]),
    TeamMember(name="Ivy", skills=[
        Skill(name="Project Management", level=4),
        Skill(name="Agile", level=4),
        Skill(name="Risk management", level=4),
        Skill(name="Stakeholder comms", level=4)
    ]),
    TeamMember(name="Jack", skills=[
        Skill(name="Integration Specialist", level=4),
        Skill(name="Legacy systems", level=3),
        Skill(name="API design", level=4),
        Skill(name="ETL", level=3)
    ]),
    TeamMember(name="Kevin", skills=[
        Skill(name="QA", level=4),
        Skill(name="Automated testing", level=4),
        Skill(name="Performance testing", level=3),
        Skill(name="Load testing", level=3)
    ]),
    TeamMember(name="Laura", skills=[
        Skill(name="Documentation/Training", level=4),
        Skill(name="Technical writing", level=4),
        Skill(name="User manuals", level=4),
        Skill(name="Workshops", level=3)
    ])
]



# Test case 1: Simple software project
test_milestone_gen(
    "Build a simple calculator app with a basic UI and arithmetic operations",
    members
)

"""# Test case 2: Cooking project
test_milestone_gen(
    "Cook a three‑course Italian dinner for 6 people: appetizer, main course, dessert",
    members
)"""


"""
# Test case 4: Community event
test_milestone_gen(
    Project Name: SmartCity Infrastructure Monitoring Platform

    Overview:
    Develop an end‑to‑end IoT platform for a mid‑sized city to monitor environmental conditions (air quality, noise levels, traffic flow) and infrastructure health (bridge vibrations, water pressure, waste bin levels). The system will consist of:

    Hardware sensors deployed across the city (approx. 500 units initially), each with cellular/LoRaWAN connectivity.

    A cloud backend that ingests telemetry, stores time‑series data, processes real‑time alerts, and exposes APIs.

    A web dashboard for city officials to view maps, charts, and receive alerts.

    A mobile app for field workers to report issues and view sensor status.

    Public data APIs for third‑party developers and citizen apps.

    Integration with existing city systems (traffic lights, emergency services) via legacy APIs.

    Compliance with data privacy regulations (GDPR, local laws) and security standards (ISO 27001).

    Predictive analytics using machine learning to forecast air pollution spikes or traffic congestion.

    Automated alerting via SMS/email/push to relevant personnel.

    Scalability to support up to 10,000 sensors within two years.

    Timeline: 18 months, with phased rollout.
    members
)
"""