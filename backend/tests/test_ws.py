import asyncio
import json
import websockets

# Replace this with your token from /api/v1/auth/login
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc4OTkxMzA0MX0.kebBk6epUichsYtK2wdMcZ4JTQBCysimeUvBxOQsvtQ"
WS_URL = f"ws://localhost:8000/ws/threats?token={JWT_TOKEN}"

async def listen_threats():
    print(f"Connecting to: {WS_URL} ...")
    try:
        async with websockets.connect(WS_URL) as ws:
            print("Connected to WebSocket successfully!")

            # 1. Test Section 14 Ping / Pong contract
            print("Sending: {'type': 'ping'}")
            await ws.send(json.dumps({"type": "ping"}))
            response = await ws.recv()
            print(f"Received from server: {response}")

            # 2. Wait for live broadcast events from Redis stream
            print("\nListening for real-time broadcasts on cyberguard:threat.complete...")
            print("Press Ctrl+C to stop.\n")
            while True:
                message = await ws.recv()
                print(">>> Live Threat Broadcast Received:")
                print(message)
                print("-" * 50)

    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed with error: {e}")
    except Exception as exc:
        print(f"An unexpected error occurred: {exc}")

if __name__ == "__main__":
    asyncio.run(listen_threats())