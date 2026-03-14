#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');

// Load .env manually (no dependencies needed)
function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
  return env;
}

const env = loadEnv(envPath);
const accessToken = env.LINKEDIN_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Missing LINKEDIN_ACCESS_TOKEN in .env');
  process.exit(1);
}

// Read post text from a temp file passed as argument
const textFile = process.argv[2];
if (!textFile || !fs.existsSync(textFile)) {
  console.error('Usage: node post-to-linkedin.mjs <text-file>');
  console.error('The text file should contain the LinkedIn post text.');
  process.exit(1);
}

const postText = fs.readFileSync(textFile, 'utf-8').trim();

// Step 1: Get the user's LinkedIn profile URN
async function getProfileUrn() {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to get profile: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.sub;
}

// Step 2: Create a text post
async function createPost(authorUrn, text) {
  const payload = {
    author: `urn:li:person:${authorUrn}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to post: ${res.status} ${body}`);
  }

  const postId = res.headers.get('x-restli-id');
  return postId;
}

try {
  console.log('Getting your LinkedIn profile...');
  const urn = await getProfileUrn();
  console.log(`Posting as: urn:li:person:${urn}`);
  console.log('');
  console.log('--- Post content ---');
  console.log(postText);
  console.log('--------------------');
  console.log('');
  console.log('Publishing to LinkedIn...');
  const postId = await createPost(urn, postText);
  console.log(`Published! Post ID: ${postId}`);
  if (postId) {
    // ugcPosts IDs look like urn:li:ugcPost:123456
    // The shareable URL format:
    const shareId = postId.replace('urn:li:ugcPost:', '').replace('urn:li:share:', '');
    console.log(`View at: https://www.linkedin.com/feed/update/urn:li:share:${shareId}/`);
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
