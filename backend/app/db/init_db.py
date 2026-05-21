from app.db.database import engine
from app.db.base import Base
from app.models.user import User
from app.models.task import Task
from app.models.calendar_event import CalendarEvent
from app.models.schedule import Schedule

def init_db():
    Base.metadata.create_all(bind=engine)
