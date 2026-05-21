from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, tasks, schedule, calendar
from app.db.database import engine
from app.db.base import Base
from app.models import user, task, calendar_event, schedule as schedule_model  # noqa

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Timelyn API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(schedule.router)
app.include_router(calendar.router)

@app.get("/")
def root():
    return {"message": "Timelyn API running"}