import pandas as pd, os, json, base64, requests, zipfile, io
from pathlib import Path

OUT_REAL = "data/deepfake/audio/genuine"
OUT_FAKE = "data/deepfake/audio/spoof"
DEMO     = "data/demo"
for d in [OUT_REAL,OUT_FAKE,DEMO]: os.makedirs(d,exist_ok=True)
all_records = []

def download_hf_zip(repo, filename, label, tag, out_dir):
    print(f"Downloading {filename} from {repo}...")
    url = f"https://huggingface.co/datasets/{repo}/resolve/main/{filename}"
    try:
        r = requests.get(url, timeout=120)
        r.raise_for_status()
        count = 0
        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            for member in z.namelist():
                if member.endswith(".wav"):
                    fname = f"{tag}_{count:05d}.wav"
                    data = z.read(member)
                    with open(os.path.join(out_dir, fname), "wb") as f:
                        f.write(data)
                    all_records.append({"filepath":os.path.join(out_dir,fname),"label":label,"source":repo})
                    count += 1
                    if count >= 200: break
        print(f"  {repo}: {count} audio files extracted")
    except Exception as e:
        print(f"  {repo} failed: {e}")

download_hf_zip("34data/audiospoofing-mini-fake", "data_001.zip", 1, "spoof", OUT_FAKE)
download_hf_zip("34data/audiospoofing-mini-real", "data_001.zip", 0, "genuine", OUT_REAL)

meta = pd.DataFrame(all_records)
if len(meta) > 0:
    meta.to_csv("data/deepfake/audio/metadata.csv",index=False)
    print(f"Metadata: {len(meta)}")
    samples = []
    for lbl,risk,tag in [(1,"high","spoof"),(0,"safe","genuine")]:
        for i,(_, row) in enumerate(meta[meta["label"]==lbl].head(5).iterrows()):
            ext = Path(row["filepath"]).suffix.lstrip(".")
            with open(row["filepath"],"rb") as f:
                b64 = f"data:audio/{ext};base64,"+base64.b64encode(f.read()).decode()
            samples.append({"id":f"aud_{tag}_{i:03d}",
                "description":f"{'Spoofed' if lbl else 'Genuine'} speech [{row['source']}]",
                "expected_label":lbl,"expected_risk":risk,
                "payload":{"audio_base64":b64,"filename":os.path.basename(row["filepath"]),"sample_rate":16000}})
    with open(f"{DEMO}/deepfake_audio_samples.json","w") as f:
        json.dump({"samples":samples},f)
    print(f"Demo: {len(samples)} samples")
else:
    print("Metadata: 0")
print("\n✓ DONE — Audio Deepfake")
