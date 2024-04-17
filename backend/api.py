from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from main import main
import shutil

app = FastAPI()

@app.post("/api/upload_function")
def upload(audio: UploadFile = File(None)):
    try: 
        file_path = f"uploaded_{audio.filename}.wav" 
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        result = main(file_path)
        return result

    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)


app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")

