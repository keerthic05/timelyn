import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    estimated_duration = Column(Integer, nullable=False)
    deadline = Column(DateTime(timezone=False), nullable=False)
    priority = Column(Integer, nullable=False, default=2)
    preferred_window = Column(String, default="any")
    splittable = Column(Boolean, default=False)
    completed = Column(Boolean, default=False)

    user = relationship("User", back_populates="tasks")
