import pandas as pd, os, json
CHECKS = [
    ("data/phishing/url/processed/train.csv",    1000, ["url","domain","label","source"]),
    ("data/phishing/url/processed/test.csv",      200, ["url","domain","label","source"]),
    ("data/phishing/email/processed/train.csv",   200, ["raw_text","label","source"]),
    ("data/phishing/email/processed/test.csv",     40, ["raw_text","label","source"]),
    ("data/phishing/sms/processed/train.csv",    1000, ["sms_text","label","source"]),
    ("data/phishing/sms/processed/test.csv",      200, ["sms_text","label","source"]),
    ("data/deepfake/image/metadata.csv",          100, ["filepath","label","source"]),
    ("data/deepfake/audio/metadata.csv",           50, ["filepath","label","source"]),
    ("data/logs/auth/processed/logon.csv",        500, ["timestamp","user","device","activity","label"]),
    ("data/logs/api/processed/train.csv",        1000, ["label"]),
]
DEMO_CHECKS = [
    ("data/demo/phishing_url_samples.json",    15),
    ("data/demo/phishing_email_samples.json",  12),
    ("data/demo/phishing_sms_samples.json",    12),
    ("data/demo/deepfake_image_samples.json",   8),
    ("data/demo/deepfake_audio_samples.json",   8),
    ("data/demo/log_anomaly_samples.json",     15),
    ("data/demo/api_abuse_samples.json",       12),
]
passed = failed = 0
print("="*55)
print("CSV CHECKS")
print("="*55)
for path,min_rows,cols in CHECKS:
    if not os.path.exists(path):
        print(f"FAIL  {path}  — file not found")
        failed+=1; continue
    df = pd.read_csv(path)
    issues = []
    if len(df)<min_rows: issues.append(f"only {len(df)} rows")
    missing = [c for c in cols if c not in df.columns]
    if missing: issues.append(f"missing cols: {missing}")
    if df.isnull().sum().sum()>0: issues.append("has NaN")
    if issues:
        print(f"FAIL  {path}"); [print(f"      → {x}") for x in issues]
        failed+=1
    else:
        dist = {k:int(v) for k,v in df["label"].value_counts().items()} if "label" in df.columns else {}
        print(f"PASS  {path}  ({len(df)} rows {dist})")
        passed+=1
print()
print("="*55)
print("DEMO SAMPLE CHECKS")
print("="*55)
for path,min_n in DEMO_CHECKS:
    if not os.path.exists(path):
        print(f"FAIL  {path}  — not found"); failed+=1; continue
    try:
        n = len(json.load(open(path)).get("samples",[]))
        if n<min_n: print(f"FAIL  {path}  ({n} samples)"); failed+=1
        else: print(f"PASS  {path}  ({n} samples)"); passed+=1
    except Exception as e:
        print(f"FAIL  {path}  — bad JSON: {e}"); failed+=1
print()
print("="*55)
print(f"PASSED: {passed}  FAILED: {failed}")
print("ALL PASSED ✓" if not failed else "FIX FAILED ITEMS BEFORE HANDOFF")
print("="*55)
