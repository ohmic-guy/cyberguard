import pandas as pd, os, json
from sklearn.datasets import fetch_kddcup99
from sklearn.model_selection import train_test_split
RAW  = "data/logs/api/raw"
OUT  = "data/logs/api/processed"
DEMO = "data/demo"
for d in [RAW,OUT,DEMO]: os.makedirs(d,exist_ok=True)

print("Fetching KDDCup99 Network dataset from sklearn...")
try:
    kdd = fetch_kddcup99(subset='SA', percent10=True, as_frame=True)
    df = kdd.frame
    # Rename columns to string
    df.columns = df.columns.astype(str)
    # The label column is 'labels'
    df["attack_type"] = df["labels"].astype(str).str.decode("utf-8").str.replace(".", "")
    df["label"] = df["attack_type"].apply(lambda x: 0 if x == "normal" else 1)
    df = df.drop(columns=["labels"], errors="ignore")
    # Decode byte strings in categorical columns
    for col in ["protocol_type", "service", "flag"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.replace("b'", "").str.replace("'", "")
    print(f"  Loaded {len(df)} real network flows")
except Exception as e:
    print(f"  Failed to load KDDCup99: {e}")
    df = pd.DataFrame()

df = df.fillna(0)
print(f"\nCombined: {len(df)}")
if len(df) > 0:
    n = min(25000, min((df["label"]==0).sum(), (df["label"]==1).sum()))
    balanced = pd.concat([
        df[df["label"]==0].sample(n,random_state=42),
        df[df["label"]==1].sample(n,random_state=42)
    ]).sample(frac=1,random_state=42).reset_index(drop=True)
    train,test = train_test_split(balanced,test_size=0.2,random_state=42,
                                  stratify=balanced["label"])
    train.to_csv(f"{OUT}/train.csv",index=False)
    test.to_csv( f"{OUT}/test.csv", index=False)
    print(f"Train: {len(train)}, Test: {len(test)}")
    
    feat_cols = [c for c in balanced.columns if c not in ["label","attack_type"]]
    samples = []
    for lbl,risk,tag in [(1,"high","attack"),(0,"safe","normal")]:
        for i,(_, row) in enumerate(balanced[balanced["label"]==lbl].head(8 if lbl else 7).iterrows()):
            feats = {}
            for c in feat_cols:
                v = row[c]
                try: feats[c]=float(v)
                except: feats[c]=str(v)
            atk = str(row.get("attack_type","unknown"))
            samples.append({"id":f"net_{tag}_{i:03d}",
                "description":f"Network traffic — {atk}",
                "expected_label":lbl,"expected_risk":risk,
                "payload":{"features":feats}})
    with open(f"{DEMO}/api_abuse_samples.json","w") as f:
        json.dump({"samples":samples},f,indent=2,default=str)
    print(f"Demo: {len(samples)} samples")
print("\n✓ DONE — Network / API Abuse")
