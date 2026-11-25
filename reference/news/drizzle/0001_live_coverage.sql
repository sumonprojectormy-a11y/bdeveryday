CREATE TABLE live_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT
);
--> statement-breakpoint
CREATE TABLE live_updates (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES live_events(id),
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  author TEXT NOT NULL,
  posted_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX live_updates_event_time ON live_updates(event_id, posted_at DESC);
