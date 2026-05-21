# create FastAPI entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import auth, tasks, schedule, calendar
from backend.app.db.database import engine
from backend.app.db.base import Base

# import all models so SQLAlchemy registers them before create_all
from backend.app.models import user, task, calendar_event, schedule as schedule_model 

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Timelyn API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # React dev server
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