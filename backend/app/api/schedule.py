from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.schemas import ScheduleOut, ScheduleRequest
from app.models.schedule import Schedule
from app.models.task import Task
from app.models.calendar_event import CalendarEvent
from app.models.user import User
from app.core.security import get_current_user
from app.services.scheduler import generate_schedule

router = APIRouter(prefix="/api/schedule", tags=["schedule"])

@router.post("/generate", response_model=ScheduleOut, status_code=201)
def generate(params: ScheduleRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks  = db.query(Task).filter(Task.user_id == current_user.id, Task.completed == False).all()
    events = db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id).all()
    result = generate_schedule(tasks, events, days=params.days, work_start=params.work_start, work_end=params.work_end)
    schedule = Schedule(user_id=current_user.id, blocks=result["blocks"], explanation=result["explanation"])
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule

@router.get("/latest", response_model=ScheduleOut)
def get_latest(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = db.query(Schedule).filter(Schedule.user_id == current_user.id).order_by(Schedule.generated_at.desc()).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="No schedule generated yet")
    return schedule

@router.get("", response_model=List[ScheduleOut])
def list_schedules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Schedule).filter(Schedule.user_id == current_user.id).order_by(Schedule.generated_at.desc()).limit(10).all()