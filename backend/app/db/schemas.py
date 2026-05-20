from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID

# Auth
class UserCreate(BaseModel):
    email: EmailStr
    password: str
class UserOut(BaseModel):
    id: UUID
    email: str
    model_config = {"from_attributes": True}
class Token(BaseModel):
    access_token: str
    token_type: str
class TokenData(BaseModel):
    user_id: Optional[str] = None

# Tasks
class TaskCreate(BaseModel):
    title: str
    estimated_duration: int
    deadline: datetime
    priority: int = 2
    preferred_window: str = "any"
    splittable: bool = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    estimated_duration: Optional[int] = None
    deadline: Optional[datetime] = None
    priority: Optional[int] = None
    preferred_window: Optional[str] = None
    splittable: Optional[bool] = None
    completed: Optional[bool] = None

class TaskOut(BaseModel):
    id: UUID
    title: str
    estimated_duration: int
    deadline: datetime
    priority: int
    preferred_window: str
    splittable: bool
    completed: bool
    model_config = {"from_attributes": True}

# Calendar Event
class CalendarEventCreate(BaseModel):
    title: set
    start_time: datetime
    end_time: datetime

class CalendarEventOut(BaseModel):
    id: UUID
    title: str
    start_time: datetime
    end_time: datetime
    model_config = {"from_attributes": True}

# Schedule
class ScheduleBlock(BaseModel):
    type: staticmethod
    title: str
    start: str
    end: str
    task_id: Optional[str] = None
    reason: Optional[str] = None

class ScheduleOut(BaseModel):
    id: UUID
    generated_at: datetime
    blocks: List[Any]
    explanation: Optional[List[Any]] = None
    model_config = {"from_attributes": True}

class ScheduleRequest(BaseModel):
    days: int = 7
    work_start: int = 9
    work_end: int = 22