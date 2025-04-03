import asyncio
import websockets
import json
import random

async def handler(websocket, path):
    print("✅ Client connected")
    try:
        while True:
            data = {
                "x_accel": random.uniform(-1, 1),
                "y_accel": random.uniform(-1, 1),
                "z_accel": random.uniform(-1, 1),
                "left_rpm": random.randint(2000, 3000),
                "right_rpm": random.randint(2000, 3000),
                "temperature": random.uniform(20, 30),
                "potent": random.uniform(0, 5),
                "steer_angle": random.uniform(-90, 90),
            }
            await websocket.send(json.dumps(data))
            print("Sent:", data)
            await asyncio.sleep(1)
    except websockets.exceptions.ConnectionClosed:
        print("❌ Client disconnected")

start_server = websockets.serve(handler, "0.0.0.0", 8080)

asyncio.get_event_loop().run_until_complete(start_server)
print("🟢 WebSocket server running at ws://10.0.0.82:8080")
asyncio.get_event_loop().run_forever()
