CREATE TABLE newsroom_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL, summary TEXT NOT NULL, body TEXT NOT NULL,
  category TEXT NOT NULL, author TEXT NOT NULL, editor_email TEXT NOT NULL,
  district TEXT, country TEXT, image_type TEXT,
  breaking INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('draft','review','published')),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, publish_at TEXT
);
--> statement-breakpoint
CREATE INDEX newsroom_public ON newsroom_articles(status, publish_at DESC);
--> statement-breakpoint
CREATE TABLE newsroom_staff (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('reporter','editor'))
);
