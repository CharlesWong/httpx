import Database from 'better-sqlite3';
import path from 'path';

const WORKSPACE = '/Users/cw/.openclaw/workspace';
const DB_PATH = path.join(WORKSPACE, 'data/zsxq.db');

const db = new Database(DB_PATH);

// Enrichment tables for comments / links / linked docs / crawl coverage
// Keep schema additive and idempotent.
db.exec(`
CREATE TABLE IF NOT EXISTS topic_comments (
  comment_id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  parent_comment_id TEXT,
  create_time TEXT,
  author TEXT,
  author_id TEXT,
  text_content TEXT,
  likes_count INTEGER,
  images_json TEXT,
  raw_json TEXT,
  scraped_at TEXT,
  FOREIGN KEY(topic_id) REFERENCES topics(topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_comments_topic_id ON topic_comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_comments_create_time ON topic_comments(create_time);

CREATE TABLE IF NOT EXISTS topic_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_field TEXT NOT NULL,
  url TEXT NOT NULL,
  normalized_url TEXT,
  title TEXT,
  anchor_text TEXT,
  discovered_at TEXT,
  UNIQUE(topic_id, source_type, source_field, url),
  FOREIGN KEY(topic_id) REFERENCES topics(topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_links_topic_id ON topic_links(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_links_normalized_url ON topic_links(normalized_url);

CREATE TABLE IF NOT EXISTS linked_documents (
  normalized_url TEXT PRIMARY KEY,
  final_url TEXT,
  content_type TEXT,
  title TEXT,
  markdown_content TEXT,
  text_content TEXT,
  http_status INTEGER,
  fetch_status TEXT,
  fetch_error TEXT,
  fetched_at TEXT
);

CREATE TABLE IF NOT EXISTS crawl_scopes (
  scope_key TEXT PRIMARY KEY,
  scope_type TEXT NOT NULL,
  scope_label TEXT,
  scope_value TEXT,
  last_crawled_at TEXT,
  last_status TEXT,
  last_seen_new_topics INTEGER DEFAULT 0,
  notes TEXT
);
`);

console.log('✅ Enrichment schema ready: topic_comments / topic_links / linked_documents / crawl_scopes');
