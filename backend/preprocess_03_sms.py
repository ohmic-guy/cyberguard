import pandas as pd, requests, zipfile, io, os, json, random
from datasets import load_dataset
from sklearn.model_selection import train_test_split
OUT  = "data/phishing/sms/processed"
DEMO = "data/demo"
os.makedirs(OUT,exist_ok=True)
random.seed(42)
# ── UCI SMS Spam Collection ───────────────────────────────────────
print("Downloading UCI SMS Spam Collection...")
uci_records = []
try:
    r = requests.get(
        "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip",
        timeout=60)
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        for name in z.namelist():
            if not name.endswith("/"):
                with z.open(name) as f:
                    for line in f.read().decode("latin-1").splitlines():
                        parts = line.split("\t",1)
                        if len(parts)==2:
                            label = 1 if parts[0].strip().lower()=="spam" else 0
                            uci_records.append({"sms_text":parts[1].strip(),
                                                "label":label,"source":"uci_sms"})
    print(f"  UCI: {len(uci_records)} messages")
except Exception as e:
    print(f"  UCI failed: {e}")
# ── HuggingFace SMS Spam ─────────────────────────────────────────
print("Loading HuggingFace sms_spam...")
hf_records = []
try:
    ds = load_dataset("sms_spam", trust_remote_code=True)
    for split in ds.keys():
        for item in ds[split]:
            hf_records.append({"sms_text":item["sms"],"label":item["label"],
                                "source":"huggingface_sms"})
    print(f"  HuggingFace: {len(hf_records)} messages")
except Exception as e:
    print(f"  HuggingFace SMS failed: {e}")
df = pd.DataFrame(uci_records + hf_records)
df = df.dropna(subset=["sms_text"])
df = df[df["sms_text"].str.strip() != ""]
df["label"] = pd.to_numeric(df["label"],errors="coerce").fillna(0).astype(int)
df = df.sample(frac=1,random_state=42).reset_index(drop=True)
print(f"\nTotal: {len(df)}")
train,test = train_test_split(df,test_size=0.2,random_state=42,stratify=df["label"])
train.to_csv(f"{OUT}/train.csv",index=False)
test.to_csv( f"{OUT}/test.csv", index=False)
print(f"Train: {len(train)}, Test: {len(test)}")
samples = []
for i,(_, row) in enumerate(df[df["label"]==1].head(8).iterrows()):
    samples.append({"id":f"sms_fraud_{i:03d}",
        "description":f"Fraud SMS [{row['source']}]",
        "expected_label":1,"expected_risk":"high",
        "payload":{"sms_text":row["sms_text"]}})
for i,(_, row) in enumerate(df[df["label"]==0].head(7).iterrows()):
    samples.append({"id":f"sms_legit_{i:03d}","description":"Legit SMS",
        "expected_label":0,"expected_risk":"safe",
        "payload":{"sms_text":row["sms_text"]}})
with open(f"{DEMO}/phishing_sms_samples.json","w") as f:
    json.dump({"samples":samples},f,indent=2)
print(f"Demo: {len(samples)} samples")
print("\n✓ DONE — SMS Phishing")
