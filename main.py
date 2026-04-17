import platform
import subprocess

import pygame
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from models.requests.AudioRequest import AudioRequest
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.mount("/static", StaticFiles(directory="templates", html=True), name="static")
app.mount("/audio", StaticFiles(directory="audio"))

pygame.mixer.init()
current_playing = None
is_playing = False


@app.get("/")
async def root():
    return FileResponse("templates/index.html")


@app.get("/api/audio-files")
async def get_audio_files():
    audio_dir = "audio"
    files = os.listdir(audio_dir)
    audio_files = [f for f in files if f.endswith(("mp3", ".wav", ".ogg", ".m4a"))]
    return {"files": audio_files}


@app.post("/api/play-audio")
async def play_audio(request: AudioRequest):
    global current_playing, is_playing

    filename = os.path.basename(request.filename)
    audio_path = os.path.join("audio", filename)

    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail=f"Audio file {filename} not found")

    try:
        # Stop current playback
        pygame.mixer.music.stop()

        # Load and play new audio
        pygame.mixer.music.load(audio_path)
        pygame.mixer.music.play()

        current_playing = filename
        is_playing = True

        return {
            "status": "playing",
            "filename": filename,
            "message": f"Now playing: {filename}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error playing: {str(e)}")

@app.post("/api/stop-audio")
async def stop_audio():
    global is_playing
    pygame.mixer.music.stop()
    is_playing = False
    return {
        "status": "stopped",
        "message": "Аудио остановлено"
    }
