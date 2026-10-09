import asyncio, requests, pandas as pd, io
from datetime import datetime, timedelta

class ThreatIntelFeed:

    def __init__(self):
        self._urlhaus_cache  = set()
        self._openphish_cache = set()
        self._last_updated   = None
        self._ttl_minutes    = 5

    async def refresh(self):
        """Refresh feeds every 5 minutes."""
        now = datetime.utcnow()
        if (self._last_updated and
                now - self._last_updated < timedelta(minutes=self._ttl_minutes)):
            return

        try:
            # URLhaus
            r = requests.get(
                "https://urlhaus.abuse.ch/downloads/csv_online/",
                timeout=10)
            lines = [l for l in r.text.splitlines()
                     if not l.startswith("#") and l.strip()]
            df    = pd.read_csv(io.StringIO("\n".join(lines)), header=None)
            self._urlhaus_cache = set(df.iloc[:, 2].dropna().tolist())

            # OpenPhish
            r2 = requests.get("https://openphish.com/feed.txt", timeout=10)
            self._openphish_cache = set(
                u.strip() for u in r2.text.splitlines() if u.strip())

            self._last_updated = now
        except Exception:
            pass   # Keep stale cache rather than failing

    def is_known_malicious(self, url: str) -> bool:
        return url in self._urlhaus_cache or url in self._openphish_cache

# Singleton
feed = ThreatIntelFeed()
