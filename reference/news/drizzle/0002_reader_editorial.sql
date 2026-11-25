CREATE TABLE reader_submissions (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('tip','correction')),
 article_id TEXT, location TEXT, message TEXT NOT NULL, contact TEXT, image_type TEXT,
 created_at TEXT NOT NULL, reviewed_at TEXT
);
--> statement-breakpoint
CREATE INDEX reader_submissions_review ON reader_submissions(reviewed_at,created_at DESC);
--> statement-breakpoint
CREATE TABLE article_notes (
 id TEXT PRIMARY KEY, article_id TEXT NOT NULL, note TEXT NOT NULL, source TEXT,
 created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX article_notes_story ON article_notes(article_id,created_at DESC);
