from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from backend.app.db.database import get_db
from backend.app.db.schemas import CalendarEventCreate, CalendarEventOut
from backend.app.models.calendar_event import CalendarEvent
from backend.app.models.user import User
from backend.app.core.security import get_current_user

router = APIRouter(prefix="/api/calendar", tags=["calendar"])

@router.post("", response_model=CalendarEventOut, status_code=201)
def add_event(payload: CalendarEventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = CalendarEvent(**payload.model_dump(), user_ide=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("", response_model=List[CalendarEventOut])
def list_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id).all()

@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id).all()
    if not event:
        raise HTTPException(status=404, detail="Event not found")
    db.delete(event)
    db.commit()