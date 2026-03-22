# Clovio – AI-Powered Academic Collaboration Platform

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Made with FastAPI](https://img.shields.io/badge/FastAPI-0.129.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org)

**Clovio** is an intelligent collaboration platform that transforms academic group projects by ensuring **fairness, efficiency, and accountability**. Using AI, it automatically breaks down project descriptions into milestones and tasks, assigns work based on team members' skills, and provides real‑time fairness scores and progress tracking.

- [✨ Features](#-features)
- [⚙️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📖 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- **AI-Powered Milestone Generation** – Turn a project description into a structured plan with effort points and a suggested timeline.
- **Intelligent Task Distribution** – Tasks are assigned to the best‑matched team members based on skills and current workload.
- **Skill‑Gap Detection** – Flags tasks that require skills not present in the team.
- **Fairness Score (Gini Coefficient)** – Quantifies how evenly the workload is distributed.
- **Progress Tracking** – Tracks overall project completion using milestone effort points and task statuses.
- **JWT Authentication** – Secure user registration and login.
- **Real‑Time Collaboration** – (Optional) Socket.IO integration for live updates.

---

## ⚙️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| **Backend** | FastAPI (Python), SQLAlchemy, Alembic, PostgreSQL |
| **Frontend**| React (TypeScript), Tailwind CSS, React Router, Axios |
| **AI**      | Groq (Llama 3.3) / DeepSeek (OpenRouter) – with fallback |
| **Auth**    | JWT (python-jose), bcrypt |
| **DevOps**  | Railway / Render (backend), Vercel (frontend), GitHub Actions (CI/CD) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Docker)

### Clone the repository
```bash
git clone https://github.com/SDGP-Clovio/clovio-platform.git
cd clovio-platform

