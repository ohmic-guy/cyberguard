import pandas as pd, requests, io, json, os
from urllib.parse import urlparse
from sklearn.model_selection import train_test_split
OUT  = "data/phishing/url/processed"
DEMO = "data/demo"
os.makedirs(OUT, exist_ok=True)
os.makedirs(DEMO, exist_ok=True)
# ── URLhaus live phishing feed ───────────────────────────────────
print("Downloading URLhaus...")
try:
    r = requests.get(
        "https://urlhaus.abuse.ch/downloads/csv_online/",
        timeout=60, headers={"User-Agent": "CyberGuard-Research/1.0"}
    )
    lines = [l for l in r.text.splitlines()
             if not l.startswith("#") and l.strip()]
    urlhaus = pd.read_csv(io.StringIO("\n".join(lines)), header=None)
    urlhaus.columns = urlhaus.columns.astype(str)
    # URL is always in column 2 (index 2)
    url_col = urlhaus.columns[2]
    urlhaus = pd.DataFrame({"url": urlhaus[url_col], "label": 1,
                             "source": "urlhaus"})
    print(f"  URLhaus: {len(urlhaus)} live malicious URLs")
except Exception as e:
    print(f"  URLhaus failed: {e} — continuing")
    urlhaus = pd.DataFrame(columns=["url","label","source"])
# ── OpenPhish live feed ──────────────────────────────────────────
print("Downloading OpenPhish...")
try:
    r2 = requests.get("https://openphish.com/feed.txt", timeout=30)
    urls_op = [u.strip() for u in r2.text.splitlines() if u.strip()]
    openphish = pd.DataFrame({"url": urls_op, "label": 1,
                               "source": "openphish"})
    print(f"  OpenPhish: {len(openphish)} phishing URLs")
except Exception as e:
    print(f"  OpenPhish failed: {e} — continuing")
    openphish = pd.DataFrame(columns=["url","label","source"])
# ── PhishStorm GitHub dataset ─────────────────────────────────────
print("Downloading PhishStorm from GitHub...")
try:
    ps_url = ("https://raw.githubusercontent.com/faizann24/"
              "Phishing-Websites-Dataset/master/phishingData.csv")
    ps = pd.read_csv(ps_url)
    # Last column is label: 1=phishing, -1=legitimate
    label_col = ps.columns[-1]
    feat_col  = ps.columns[0]  # First col often has URL or domain features
    # Build URL placeholder from index
    ps_phish = ps[ps[label_col]==1].copy()
    ps_legit = ps[ps[label_col]==-1].copy()
    # We use this as feature backup only — label info is what we need
    print(f"  PhishStorm: {len(ps_phish)} phish, {len(ps_legit)} legit rows")
except Exception as e:
    print(f"  PhishStorm failed: {e}")
    ps_phish = ps_legit = None
# ── Tranco top-1M legitimate URLs ────────────────────────────────
print("Downloading Tranco list...")
try:
    r3 = requests.get(
        "https://tranco-list.eu/download/latest/1000000",
        timeout=120
    )
    tranco = pd.read_csv(io.StringIO(r3.text), header=None,
                          names=["rank","domain"])
    tranco = tranco.sample(20000, random_state=42)
    tranco["url"]    = "https://" + tranco["domain"]
    tranco["label"]  = 0
    tranco["source"] = "tranco"
    tranco = tranco[["url","label","source"]]
    print(f"  Tranco: {len(tranco)} legitimate URLs")
except Exception as e:
    print(f"  Tranco failed: {e}")
    # Fallback synthetic safe URLs
    safe_urls = [{"url": f"https://example{i}.com", "label": 0, "source": "synthetic_safe"} for i in range(2000)]
    tranco = pd.DataFrame(safe_urls)
# ── Combine ──────────────────────────────────────────────────────
phish_all = pd.concat([urlhaus, openphish], ignore_index=True)
phish_all = phish_all.drop_duplicates(subset=["url"])
df = pd.concat([phish_all, tranco], ignore_index=True)
df["domain"] = df["url"].apply(
    lambda x: urlparse(str(x)).netloc)
df = df.dropna(subset=["url"])
df = df[df["url"].str.strip() != ""]
df = df[["url","domain","label","source"]]
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
print(f"\nCombined: {len(df)} rows")
print(f"Labels:   {df['label'].value_counts().to_dict()}")
print(f"Sources:  {df['source'].value_counts().to_dict()}")
# ── Split ────────────────────────────────────────────────────────
train, test = train_test_split(
    df, test_size=0.2, random_state=42, stratify=df["label"])
train.to_csv(f"{OUT}/train.csv", index=False)
test.to_csv( f"{OUT}/test.csv",  index=False)
print(f"Train: {len(train)}, Test: {len(test)}")
# ── Demo samples ─────────────────────────────────────────────────
samples = []
for i,(_, row) in enumerate(df[df["label"]==1].head(12).iterrows()):
    samples.append({"id":f"url_bad_{i:03d}",
        "description":f"Malicious URL [{row['source']}]",
        "expected_label":1,"expected_risk":"high",
        "payload":{"url":row["url"],"domain":row["domain"]}})
for i,(_, row) in enumerate(df[df["label"]==0].head(8).iterrows()):
    samples.append({"id":f"url_safe_{i:03d}",
        "description":f"Safe URL [{row['domain']}]",
        "expected_label":0,"expected_risk":"safe",
        "payload":{"url":row["url"],"domain":row["domain"]}})
with open(f"{DEMO}/phishing_url_samples.json","w") as f:
    json.dump({"samples":samples},f,indent=2)
print(f"Demo: {len(samples)} samples saved")
print("\n✓ DONE — URL Phishing")
