from fastapi import FastAPI

from app.presentation.api.router import api_router
from app.config.settings import (
    APP_NAME,
    APP_VERSION,
)
from app.config.logger import logger

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
)

app.include_router(
    api_router,
    prefix="/api/v1"
)


@app.on_event("startup")
async def startup():
    logger.info("===================================")
    logger.info("Phishing Detector Backend Started")
    logger.info(f"Version : {APP_VERSION}")
    logger.info("===================================")


@app.get("/")
async def root():
    return {
        "application": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
    }