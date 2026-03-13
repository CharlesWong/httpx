import Database from 'better-sqlite3';
import path from 'path';

const WORKSPACE = '/Users/cw/.openclaw/workspace';
const DB_PATH = path.join(WORKSPACE, 'data/zsxq.db');

const db = new Database(DB_PATH);

const URL_RE = /https?:\/\/[^\s<>"'）)]+/g;

function normalizeUrl(raw) {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());
    u.hash = '';
    if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) {
      u.port = '';
    }
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return raw.trim();
  }
}

function collectTextUrls(text) {
  if (!text) return [];
  return [...new Set((text.match(URL_RE) || []).map(s => s.trim()))];
}

const insertLink = db.prepare(`
  INSERT OR IGNORE INTO topic_links (
    topic_id, source_type, source_field, url, normalized_url, title, anchor_text, discovered_at
  ) VALUES (
    @topic_id, @source_type, @source_field, @url, @normalized_url, @title, @anchor_text, @discovered_at
  )
`);

const selectTopics = db.prepare(`
  SELECT topic_id, text_content, article_title, article_url, raw_json
  FROM topics
`).all();

let inserted = 0;
const now = new Date().toISOString();

const tx = db.transaction((rows) => {
  for (const row of rows) {
    const found = [];

    if (row.article_url) {
      found.push({
        topic_id: row.topic_id,
        source_type: 'topic',
        source_field: 'article_url',
        url: row.article_url,
        normalized_url: normalizeUrl(row.article_url),
        title: row.article_title || null,
        anchor_text: row.article_title || null,
        discovered_at: now,
      });
    }

    for (const url of collectTextUrls(row.text_content)) {
      found.push({
        topic_id: row.topic_id,
        source_type: 'topic',
        source_field: 'text_content',
        url,
        normalized_url: normalizeUrl(url),
        title: null,
        anchor_text: null,
        discovered_at: now,
      });
    }

    try {
      const raw = row.raw_json ? JSON.parse(row.raw_json) : null;
      const article = raw?.talk?.article;
      if (article?.article_url) {
        found.push({
          topic_id: row.topic_id,
          source_type: 'raw_json',
          source_field: 'talk.article.article_url',
          url: article.article_url,
          normalized_url: normalizeUrl(article.article_url),
          title: article.title || null,
          anchor_text: article.title || null,
          discovered_at: now,
        });
      }
    } catch {}

    for (const item of found) {
      const info = insertLink.run(item);
      if (info.changes > 0) inserted += 1;
    }
  }
});

tx(selectTopics);

const total = db.prepare('SELECT count(*) AS n FROM topic_links').get().n;
console.log(`✅ Link extraction complete. Inserted this run: ${inserted}. Total links: ${total}`);
