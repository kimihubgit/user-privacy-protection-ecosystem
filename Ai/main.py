from fastapi import FastAPI
from app.presentation.api.router import api_router
from app.config.logger import logger
from app.config.settings import (
    APP_NAME,
    VERSION,
)

app = FastAPI(
    title=APP_NAME,
    version=VERSION,
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup():

    logger.info("===================================")
    logger.info("Phishing Detector Backend Started")
    logger.info(f"Version : {VERSION}")
    logger.info("===================================")


@app.get("/")
async def root():

    return {"application": APP_NAME, "version": VERSION, "status": "running"}
