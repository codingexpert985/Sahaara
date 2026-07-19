import os
import re
import uuid
import json
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI(title="Sahaara Backend Engine (Dynamic AI Matcher)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app_api_key = os.environ.get("GROQ_API_KEY", "your-groq-api-key-here")

if app_api_key == "your-groq-api-key-here" or not app_api_key:
    print("=" * 60)
    print("WARNING: GROQ_API_KEY is not set in this terminal session.")
    print("Set it BEFORE running this file, e.g.:")
    print('  $env:GROQ_API_KEY="your-real-key"')
    print("  python main.py")
    print("=" * 60)

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=app_api_key
)

# A comprehensive list of local community volunteers with varied skills
VOLUNTEER_POOL = [
    {
        "id": "hlp_01",
        "name": "Sarah Ahmed",
        "skills": ["Elderly Care", "Local Driver", "First Aid Certified", "Healthcare Support"],
        "location": "0.4 miles away",
        "availability": "Available now",
        "reliability": 98
    },
    {
        "id": "hlp_02",
        "name": "Rahul Verma",
        "skills": ["General Errands", "Logistics", "Delivery", "Vehicle Assistance"],
        "location": "1.2 miles away",
        "availability": "Available within 2 hours",
        "reliability": 92
    },
    {
        "id": "hlp_03",
        "name": "Prof. Asif Bilal",
        "skills": ["Academic Supplies", "Tutoring", "Mathematics", "Books", "Education Support"],
        "location": "0.8 miles away",
        "availability": "Available evening",
        "reliability": 95
    },
    {
        "id": "hlp_04",
        "name": "Zainab Malik",
        "skills": ["Technical Equipment", "Electronics", "Hardware Support", "Gadgets"],
        "location": "2.1 miles away",
        "availability": "Available now",
        "reliability": 89
    },
    {
        "id": "hlp_05",
        "name": "Imran Qureshi",
        "skills": ["Blood Donation", "O+ Blood Donor", "Emergency Response", "Local Driver"],
        "location": "0.6 miles away",
        "availability": "Available now",
        "reliability": 97
    }
]

# In-memory store for task statuses (resets on server restart — swap for a
# real database once you need statuses to persist across sessions/users).
TASK_STATUS_STORE = {}


def _tokenize(text):
    """Lowercase word-level tokens, used for whole-word skill/resource matching."""
    return set(re.findall(r"[a-zA-Z]+", text.lower()))


class TaskSchema(BaseModel):
    id: str
    title: str
    status: str = "Pending"

class MissionAnalysisSchema(BaseModel):
    title: str
    category: str
    urgency: str
    beneficiary: str
    resources: List[str]
    tasks: List[TaskSchema]

class MissionRequest(BaseModel):
    description: str

class TaskStatusUpdate(BaseModel):
    status: str

@app.post("/api/missions")
async def create_mission_endpoint(req: MissionRequest):
    if len(req.description) < 10:
        raise HTTPException(status_code=400, detail="Description text too short")

    if app_api_key == "your-groq-api-key-here" or not app_api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not set on the server. Set it in this terminal and restart python main.py."
        )

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are the core intelligence extraction node of Sahaara. Parse the natural language "
                        "community issue into a structured JSON object. You MUST populate the 'resources' array with "
                        "2 to 4 precise items, tools, or specific domain skills needed to solve this problem "
                        "(e.g., ['Scientific Calculator', 'Education Support'] or ['Prescriptions', 'Local Driver']). "
                        "You MUST also populate a 'tasks' array of 3 to 5 objects, each with an 'id' (short unique "
                        "string), a 'title' (a concrete, actionable step), and 'status' set to 'Pending'. "
                        "Ensure the word 'JSON' is respected in this schema compliance operation."
                    )
                },
                {"role": "user", "content": req.description}
            ],
            response_format={"type": "json_object"}
        )

        raw_json = completion.choices[0].message.content
        parsed_dict = json.loads(raw_json)

        mission_id = f"msh_{uuid.uuid4().hex[:6]}"
        ai_resources = parsed_dict.get("resources", [])

        # Ensure every task has a stable, unique id even if the model omits one
        raw_tasks = parsed_dict.get("tasks", [])
        tasks = []
        for i, t in enumerate(raw_tasks):
            tasks.append({
                "id": t.get("id") or f"{mission_id}_t{i}",
                "title": t.get("title", "Untitled step"),
                "status": t.get("status", "Pending"),
            })

        # DYNAMIC MATCHING ALGORITHM
        # Scores each volunteer by how much of the AI-extracted resource list
        # their skills actually cover (whole-word overlap), not loose substrings.
        # This way a specialist who covers everything needed clearly outranks
        # a generalist who only loosely touches one unrelated resource tag.
        matched_helpers = []
        for volunteer in VOLUNTEER_POOL:
            matched_resources = set()
            matched_skills = []
            for skill in volunteer["skills"]:
                skill_tokens = _tokenize(skill)
                for res in ai_resources:
                    if skill_tokens & _tokenize(res):
                        matched_resources.add(res)
                        if skill not in matched_skills:
                            matched_skills.append(skill)

            coverage = len(matched_resources) / len(ai_resources) if ai_resources else 0
            match_score = 50 + (coverage * 40) + (volunteer["reliability"] * 0.1)
            if match_score > 99: match_score = 99

            # Formulate tailored deployment reasons based on matched skills
            reasons = []
            if matched_skills:
                reasons.append(f"Explicitly possesses certified experience in: {', '.join(matched_skills)}")
            else:
                reasons.append("Available proximity node capable of general resource transport.")
            reasons.append(f"Maintains a stellar {volunteer['reliability']}% consistency and responsiveness track record.")

            matched_helpers.append({
                "id": volunteer["id"],
                "name": volunteer["name"],
                "skills": ", ".join(volunteer["skills"]),
                "location": volunteer["location"],
                "availability": volunteer["availability"],
                "match_score": int(match_score),
                "reasons": reasons
            })

        # Sort dispatches by highest match scores
        matched_helpers.sort(key=lambda x: x["match_score"], reverse=True)

        mission_data = {
            "id": mission_id,
            "title": parsed_dict.get("title", "Community Action Support Needed"),
            "description": req.description,
            "category": parsed_dict.get("category", "General Assistance"),
            "urgency": parsed_dict.get("urgency", "Medium"),
            "beneficiary": parsed_dict.get("beneficiary", "Community Member"),
            "resources": ai_resources,
            "tasks": tasks,
            "matches": matched_helpers  # Embed matching candidates directly into the mission object
        }

        return {"mission": mission_data}

    except Exception as e:
        print("Groq Sync Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/tasks/{task_id}/status")
async def update_task_status(task_id: str, update: TaskStatusUpdate):
    TASK_STATUS_STORE[task_id] = update.status
    return {"id": task_id, "status": update.status}

@app.get("/api/analytics")
async def get_analytics_endpoint():
    return {
        "people_helped": 248,
        "active_helpers": 86,
        "tasks_completed": 412,
        "impact_rating": "96%"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)