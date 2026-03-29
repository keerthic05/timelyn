# create FastAPI entry point
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Timelyn API running"}