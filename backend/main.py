import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import CommandRequest, RobotStatus
from services.vision import decode_image, analyze_image
from services.llm import generate_response

app = FastAPI(title="Vision-Language Robotic Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

robot_status = RobotStatus()


@app.get("/")
def root():
    return {"message": "Vision-Language Robotic Assistant API", "status": "running"}


@app.get("/api/status")
def get_status():
    return robot_status.model_dump()


@app.post("/api/command")
async def process_command(request: CommandRequest):
    image_analysis = None
    if request.image_base64:
        image = decode_image(request.image_base64)
        image_analysis = analyze_image(image)

    response = generate_response(request.text, image_analysis)

    return {
        "response": response,
        "image_analysis": image_analysis,
        "robot_status": robot_status.model_dump()
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "command":
                image_analysis = None
                if message.get("image"):
                    image = decode_image(message["image"])
                    image_analysis = analyze_image(image)

                response = generate_response(message.get("text", ""), image_analysis)

                await websocket.send_json({
                    "type": "response",
                    "text": response,
                    "image_analysis": image_analysis,
                    "robot_status": robot_status.model_dump()
                })

            elif message.get("type") == "robot_update":
                if "position" in message:
                    robot_status.position = message["position"]
                if "state" in message:
                    robot_status.state = message["state"]

                await websocket.send_json({
                    "type": "status_update",
                    "robot_status": robot_status.model_dump()
                })

    except WebSocketDisconnect:
        print("Client disconnected")
