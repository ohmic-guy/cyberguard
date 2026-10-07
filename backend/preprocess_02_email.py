import pandas as pd, requests, tarfile, io, os, re, json, email
from email import policy
from email.parser import BytesParser
# pyrefly: ignore [missing-import]
from bs4 import BeautifulSoup
from datasets import load_dataset
from sklearn.model_selection import train_test_split
OUT  = "data/phishing/email/processed"
DEMO = "data/demo"
os.makedirs(OUT, exist_ok=True)
def parse_raw_email(raw_bytes):
    """Extract body, sender, subject from raw bytes."""
    try:
        msg = BytesParser(policy=policy.default).parsebytes(raw_bytes)
        sender  = str(msg.get("From",""))
        subject = str(msg.get("Subject",""))
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                ct = part.get_content_type()
                try: chunk = part.get_content() or ""
                except: chunk = ""
                if ct == "text/plain":
                    body += chunk
                elif ct == "text/html":
                    body += BeautifulSoup(chunk,"html.parser").get_text(" ")
        else:
            try: raw_body = msg.get_content() or ""
            except: raw_body = ""
            if msg.get_content_type() == "text/html":
                body = BeautifulSoup(raw_body,"html.parser").get_text(" ")
            else:
                body = raw_body
        body = re.sub(r"\s+", " ", body).strip()[:2000]
        m = re.search(r"@([\w.-]+)", sender)
        sender_domain = m.group(1).lower() if m else ""
        return body, sender, subject, sender_domain
    except:
        return "", "", "", ""
# ── SpamAssassin Public Corpus ───────────────────────────────────
SA_FILES = {
    "spam": "https://spamassassin.apache.org/old/publiccorpus/20030228_spam.tar.bz2",
    "ham":  "https://spamassassin.apache.org/old/publiccorpus/20030228_easy_ham.tar.bz2",
    "spam2":"https://spamassassin.apache.org/old/publiccorpus/20030228_spam_2.tar.bz2",
    "ham2": "https://spamassassin.apache.org/old/publiccorpus/20030228_hard_ham.tar.bz2",
}
sa_records = []
for split, url in SA_FILES.items():
    label = 1 if "spam" in split else 0
    print(f"Downloading SpamAssassin {split}...")
    try:
        r = requests.get(url, timeout=120)
        with tarfile.open(fileobj=io.BytesIO(r.content), mode="r:bz2") as tar:
            for member in tar.getmembers():
                if member.isfile() and not member.name.endswith(("cmds","log")):
                    try:
                        raw = tar.extractfile(member).read()
                        body, sender, subject, domain = parse_raw_email(raw)
                        if body:
                            sa_records.append({
                                "raw_text":body,"sender":sender,
                                "subject":subject,"sender_domain":domain,
                                "label":label,"source":"spamassassin"})
                    except: pass
        print(f"  {split}: done")
    except Exception as e:
        print(f"  {split} download failed: {e}")
sa_df = pd.DataFrame(sa_records)
print(f"SpamAssassin: {len(sa_df)}")
# ── HuggingFace phishing-dataset (2024) ──────────────────────────
print("Loading HuggingFace phishing dataset...")
try:
    ds = load_dataset("ealvaradob/phishing-dataset", "emails",
                      trust_remote_code=True)
    hf_df = pd.DataFrame(ds["train"])
    hf_df = hf_df.rename(columns={"text":"raw_text"})
    hf_df["sender"]        = ""
    hf_df["subject"]       = hf_df["raw_text"].apply(
        lambda x: str(x).split("\n")[0][:100])
    hf_df["sender_domain"] = ""
    hf_df["source"]        = "huggingface_2024"
    print(f"  HuggingFace: {len(hf_df)} emails")
except Exception as e:
    print(f"  HuggingFace failed: {e}")
    hf_df = pd.DataFrame(columns=["raw_text","label","sender","subject","sender_domain","source"])
# ── Nazario Phishing Corpus from GitHub ──────────────────────────
print("Downloading Nazario phishing corpus from GitHub...")
naz_records = []
try:
    # phishing_pot: collection of phishing emails
    raw_url = ("https://raw.githubusercontent.com/rf-peixoto/"
               "phishing_pot/main/email_sample.csv")
    naz = pd.read_csv(raw_url)
    text_col = next((c for c in naz.columns if "text" in c.lower() or "body" in c.lower() or "content" in c.lower()), naz.columns[0])
    naz_records = [{"raw_text":str(row[text_col])[:2000],"sender":"","subject":"",
                    "sender_domain":"","label":1,"source":"nazario"}
                   for _,row in naz.iterrows() if str(row[text_col]).strip()]
    print(f"  Nazario: {len(naz_records)} phishing emails")
except Exception as e:
    print(f"  Nazario failed: {e}")
# ── Combine ──────────────────────────────────────────────────────
all_dfs = [df for df in [sa_df, hf_df] if len(df)>0]
if naz_records:
    all_dfs.append(pd.DataFrame(naz_records))
df = pd.concat(all_dfs, ignore_index=True)
df = df.rename(columns={"label":"label"} )
df["label"] = pd.to_numeric(df["label"],errors="coerce").fillna(0).astype(int)
df = df.dropna(subset=["raw_text"])
df = df[df["raw_text"].str.strip() != ""]
df = df.fillna("unknown")
df.loc[df["raw_text"] == "", "raw_text"] = "empty"
df.loc[df["sender"] == "", "sender"] = "unknown"
df.loc[df["subject"] == "", "subject"] = "none"
df.loc[df["sender_domain"] == "", "sender_domain"] = "unknown"
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
print(f"\nTotal: {len(df)}")
train, test = train_test_split(df, test_size=0.2, random_state=42,
                               stratify=df["label"])
train.to_csv(f"{OUT}/train.csv",index=False)
test.to_csv( f"{OUT}/test.csv", index=False)
print(f"Train: {len(train)}, Test: {len(test)}")
samples = []
for i,(_, row) in enumerate(df[df["label"]==1].head(8).iterrows()):
    samples.append({"id":f"em_phish_{i:03d}","description":f"Phishing email [{row['source']}]",
        "expected_label":1,"expected_risk":"high",
        "payload":{"raw_text":row["raw_text"][:500],"sender":row["sender"],
                   "subject":row["subject"],"sender_domain":row["sender_domain"]}})
for i,(_, row) in enumerate(df[df["label"]==0].head(7).iterrows()):
    samples.append({"id":f"em_legit_{i:03d}","description":"Legitimate email",
        "expected_label":0,"expected_risk":"safe",
        "payload":{"raw_text":row["raw_text"][:500],"sender":row["sender"],
                   "subject":row["subject"],"sender_domain":row["sender_domain"]}})
with open(f"{DEMO}/phishing_email_samples.json","w") as f:
    json.dump({"samples":samples},f,indent=2)
print(f"Demo: {len(samples)} samples")
print("\n✓ DONE — Email Phishing")
