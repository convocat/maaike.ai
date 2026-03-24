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

// Fetch member URN from userinfo (requires openid + profile scopes)
async function getMemberUrn() {
  if (env.LINKEDIN_MEMBER_URN) return env.LINKEDIN_MEMBER_URN;
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to get member URN: ${res.status} ${body}`);
  }
  const data = await res.json();
  return `urn:li:person:${data.sub}`;
}

// Read post text from a temp file passed as argument
const textFile = process.argv[2];
if (!textFile || !fs.existsSync(textFile)) {
  console.error('Usage: node post-to-linkedin.mjs <text-file> [image-file] [comment-text]');
  console.error('The text file should contain the LinkedIn post text.');
  console.error('Optional: path to an image file (PNG/JPG) to attach.');
  process.exit(1);
}

const postText = fs.readFileSync(textFile, 'utf-8').trim();
const imageFile = process.argv[3] || null;
const commentText = process.argv[4] || null;

const HEADERS = {
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'X-Restli-Protocol-Version': '2.0.0',
};

// Step 1: Register image upload (v2 API)
async function initializeImageUpload(memberUrn) {
  const payload = {
    registerUploadRequest: {
      recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
      owner: memberUrn,
      serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
    },
  };

  const res = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to register image upload: ${res.status} ${body}`);
  }

  const data = await res.json();
  const uploadUrl = data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const imageUrn = data.value.asset;
  return { uploadUrl, imageUrn };
}

// Step 2: Upload image binary
async function uploadImageBinary(uploadUrl, imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
    },
    body: imageData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to upload image: ${res.status} ${body}`);
  }
}

// Step 3: Create post (v2 ugcPosts API)
async function createPost(memberUrn, text, imageUrn) {
  let shareContent;
  if (imageUrn) {
    shareContent = { shareCommentary: { text }, shareMediaCategory: 'IMAGE', media: [{ status: 'READY', media: imageUrn }] };
  } else {
    shareContent = { shareCommentary: { text }, shareMediaCategory: 'NONE' };
  }

  const payload = {
    author: memberUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: { 'com.linkedin.ugc.ShareContent': shareContent },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create post: ${res.status} ${body}`);
  }

  const postData = await res.json();
  const postUrn = postData.id;
  return postUrn;
}

// Step 4: Add a comment (new REST API)
async function addComment(memberUrn, postUrn, text) {
  const payload = {
    actor: memberUrn,
    message: { text },
    object: postUrn,
  };

  const res = await fetch(
    `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postUrn)}/comments`,
    {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to add comment: ${res.status} ${body}`);
  }
}

try {
  const memberUrn = await getMemberUrn();
  console.log(`Posting as: ${memberUrn}`);

  let imageUrn = null;

  if (imageFile && fs.existsSync(imageFile)) {
    console.log(`Uploading image: ${imageFile}`);
    const { uploadUrl, imageUrn: urn } = await initializeImageUpload(memberUrn);
    await uploadImageBinary(uploadUrl, imageFile);
    imageUrn = urn;
    console.log(`Image uploaded: ${imageUrn}`);
  }

  console.log('');
  console.log('--- Post content ---');
  console.log(postText);
  if (imageUrn) console.log(`[Image: ${imageFile}]`);
  if (commentText) console.log(`[Comment: ${commentText}]`);
  console.log('--------------------');
  console.log('');
  console.log('Publishing to LinkedIn...');

  const postUrn = await createPost(memberUrn, postText, imageUrn);
  console.log(`Published! Post URN: ${postUrn}`);

  if (postUrn) {
    const shareId = postUrn.replace('urn:li:share:', '').replace('urn:li:ugcPost:', '');
    console.log(`View at: https://www.linkedin.com/feed/update/${postUrn}/`);

    if (commentText) {
      console.log('Adding comment with link...');
      await addComment(memberUrn, postUrn, commentText);
      console.log('Comment added.');
    }
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
