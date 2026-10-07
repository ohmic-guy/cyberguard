# CyberGuard
AI-Powered Cyber Threat, Phishing & Digital Impersonation Detection and Response System

**BPUT Hackathon · Problem Statement 9**

## Stack
- AgentScope 1.0.21 · Python 3.11 · FastAPI · Next.js 14 · MongoDB · Redis Streams · JWT

## Quick Start
```bash
cp backend/.env.example backend/.env
docker compose up -d
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
```

For NVIDIA GPU support, uncomment `torch>=2.0.0` in `backend/requirements.txt` before installing the requirements.

## Team
| Role | Developer |
|------|-----------|
| Architect + Orchestration | Ommkar Ankit Rout |
| Phishing ML | [ Dev 1 ] |
| Deepfake ML | [ Dev 2 ] |
| Log Analysis ML | [ Dev 3 ] |
| FastAPI + Ingestion | Sitesh & Kunal |
| Frontend Dashboard | Kunal Meher |

## Docs
- Master documentation: `docs/CyberGuard_Master_Documentation.docx`
- Dataset guide: `docs/CyberGuard_Dataset_Assignment_Guide.docx`
