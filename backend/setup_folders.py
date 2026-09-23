# backend/setup_folders.py
import os

folders = [
    "data/phishing/url/raw",       "data/phishing/url/processed",
    "data/phishing/email/raw",     "data/phishing/email/processed",
    "data/phishing/sms/raw",       "data/phishing/sms/processed",
    "data/deepfake/image/real",    "data/deepfake/image/fake",
    "data/deepfake/video/real",    "data/deepfake/video/fake",
    "data/deepfake/audio/genuine", "data/deepfake/audio/spoof",
    "data/deepfake/raw",
    "data/logs/auth/raw",          "data/logs/auth/processed",
    "data/logs/system/raw",        "data/logs/system/processed",
    "data/logs/api/raw",           "data/logs/api/processed",
    "data/demo",
]

for f in folders:
    os.makedirs(f, exist_ok=True)
    print(f"OK  {f}")

print("\nAll folders ready.")