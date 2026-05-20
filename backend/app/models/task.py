import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.app.db.base import Base
import enum

class Priority(enum.IntEnum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4
    CRITICAL = 5

class PreferredWindow(str, enum.Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    ANY = "any"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    # time in minutes
    estimated_duration = Column(Integer, nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=False)
    priority = Column(Integer, nullable=False, default=2) #1-5
    preferred_window = Column(String, default=False)
    splittable = Column(Boolean, default=False)
    completed = Column(Boolean, default=False)

    user = relationship("User", back_populates="tasks")
    