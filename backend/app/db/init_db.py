from backend.app.db.database import engine
from backend.app.db.base import Base
# import models to register them
from backend.app.models.user import User

def init_db():
    Base.metadata.create_all(bind=engine)