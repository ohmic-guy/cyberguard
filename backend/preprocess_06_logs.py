import pandas as pd, os, json, zipfile, io, re, requests
from pathlib import Path
from datasets import load_dataset
OUT_AUTH = "data/logs/auth/processed"
OUT_SYS  = "data/logs/system/processed"
DEMO     = "data/demo"
for d in [OUT_AUTH,OUT_SYS,DEMO]: os.makedirs(d,exist_ok=True)
all_records = []

print("Loading HDFS log anomaly dataset from HuggingFace...")
try:
    ds = load_dataset("ridwanakm/hdfs-log-anomaly-dataset-lite", split="train")
    df_hf = ds.to_pandas()
    for i, row in df_hf.head(5000).iterrows():
        ts = f"2023-06-{(i%28)+1:02d}T{8+(i%10):02d}:{i%60:02d}:00Z"
        all_records.append({
            "timestamp": ts,
            "user": "system",
            "device": row["BlockId"],
            "activity": str(row["text"])[:100],
            "label": int(row["label"]),
            "source": "hdfs_hf"
        })
    print(f"  Loaded {len(all_records)} logs")
except Exception as e:
    print(f"  HF Logs failed: {e}")

LOGHUB_FILES = [
    ("HDFS",
     "https://raw.githubusercontent.com/logpai/loghub/master/HDFS/HDFS_2k.log",
     0),
]
print("Downloading loghub HDFS sample...")
loghub_records = []
for name,url,base_label in LOGHUB_FILES:
    try:
        r = requests.get(url,timeout=60)
        lines = r.text.splitlines()
        for i,line in enumerate(lines[:2000]):
            is_anomaly = 1 if any(kw in line.upper() for kw in
                ["ERROR","WARN","EXCEPTION","FAILED","FATAL"]) else 0
            ts_match = re.search(r"(\d{6}\s+\d{6}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})",line)
            ts = ts_match.group(0) if ts_match else "2023-06-01T10:00:00Z"
            loghub_records.append({"timestamp":ts,"user":"system",
                "device":name,"activity":line[:100],
                "label":is_anomaly,"source":f"loghub_{name}"})
        print(f"  {name}: {len(loghub_records)} log lines")
    except Exception as e:
        print(f"  {name}: {e}")

combined = all_records + loghub_records
df = pd.DataFrame(combined)
df = df.fillna("")
df.to_csv(f"{OUT_AUTH}/logon.csv",index=False)
print(f"\nAuth log: {len(df)}")
df["hour"] = pd.to_datetime(df["timestamp"],errors="coerce", utc=True).dt.floor("h")
samples = []
for (user,hour),grp in df.groupby(["user","hour"]):
    lbl = int(grp["label"].max())
    samples.append({"id":f"log_{user}_{str(hour)[:10]}",
        "description":f"{'Anomaly' if lbl else 'Normal'} log window — {user}",
        "expected_label":lbl,"expected_risk":"high" if lbl else "safe",
        "payload":{"user":user,"window_minutes":60,
                   "logs":grp[["timestamp","user","device","activity"]].to_dict("records")}})
    if len(samples)>=40: break
attacks = [s for s in samples if s["expected_label"]==1][:10]
normals = [s for s in samples if s["expected_label"]==0][:10]
with open(f"{DEMO}/log_anomaly_samples.json","w") as f:
    json.dump({"samples":attacks+normals},f,indent=2,default=str)
print(f"Demo: {len(attacks+normals)} samples")
print("\n✓ DONE — Log Anomaly")
