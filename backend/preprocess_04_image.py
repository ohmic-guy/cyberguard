import pandas as pd, os, json, base64, io
from datasets import load_dataset
from PIL import Image
OUT_REAL = "data/deepfake/image/real"
OUT_FAKE = "data/deepfake/image/fake"
DEMO     = "data/demo"
SIZE     = (224, 224)
MAX      = 5000
for d in [OUT_REAL,OUT_FAKE,DEMO]: os.makedirs(d,exist_ok=True)
def save_split(ds_split, real_dst, fake_dst, tag, max_each):
    records = []
    real_count = fake_count = 0
    for i, item in enumerate(ds_split):
        img   = item.get("image") or item.get("img") or item.get("pixel_values")
        label = item.get("label",0)
        if img is None: continue
        if not isinstance(img, Image.Image):
            img = Image.fromarray(img)
        img = img.convert("RGB").resize(SIZE, Image.LANCZOS)
        if label == 0:  # REAL
            if real_count >= max_each: continue
            fname = f"{tag}_real_{real_count:05d}.jpg"
            img.save(os.path.join(real_dst, fname), "JPEG", quality=95)
            records.append({"filepath":os.path.join(real_dst,fname),"label":0,"source":tag})
            real_count += 1
        else:           # FAKE
            if fake_count >= max_each: continue
            fname = f"{tag}_fake_{fake_count:05d}.jpg"
            img.save(os.path.join(fake_dst, fname), "JPEG", quality=95)
            records.append({"filepath":os.path.join(fake_dst,fname),"label":1,"source":tag})
            fake_count += 1
        if real_count>=max_each and fake_count>=max_each: break
        if (i+1)%1000==0:
            print(f"  {tag}: {real_count} real, {fake_count} fake processed")
    return records
all_records = []
print("Loading CIFAKE from HuggingFace...")
try:
    ds = load_dataset("dragonintelligence/CIFAKE-image-dataset", split="train")
    recs = save_split(ds, OUT_REAL, OUT_FAKE, "cifake", MAX)
    all_records += recs
    print(f"  CIFAKE: {len(recs)} images saved")
except Exception as e:
    print(f"  CIFAKE failed: {e}")

meta = pd.DataFrame(all_records)
if len(meta):
    meta.to_csv("data/deepfake/image/metadata.csv",index=False)
    print(f"Metadata: {len(meta)}")
    samples = []
    for lbl,risk,tag in [(1,"high","fake"),(0,"safe","real")]:
        for i,(_, row) in enumerate(meta[meta["label"]==lbl].head(5).iterrows()):
            with open(row["filepath"],"rb") as f:
                b64 = "data:image/jpeg;base64,"+base64.b64encode(f.read()).decode()
            samples.append({"id":f"img_{tag}_{i:03d}",
                "description":f"{'AI-generated' if lbl else 'Real'} image [{row['source']}]",
                "expected_label":lbl,"expected_risk":risk,
                "payload":{"image_base64":b64,"filename":os.path.basename(row["filepath"])}})
    with open(f"{DEMO}/deepfake_image_samples.json","w") as f:
        json.dump({"samples":samples},f)
    print(f"Demo: {len(samples)} samples")
print("\n✓ DONE — Deepfake Images")
