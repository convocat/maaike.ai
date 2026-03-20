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
  console.error('Usage: node post-to-linkedin.mjs <text-file> [image-file]');
  console.error('The text file should contain the LinkedIn post text.');
  console.error('Optional: path to an image file (PNG/JPG) to attach.');
  process.exit(1);
}

const postText = fs.readFileSync(textFile, 'utf-8').trim();
const imageFile = process.argv[3] || null;
const commentText = process.argv[4] || null;

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

// Step 2a: Register an image upload with LinkedIn
async function registerImageUpload(authorUrn) {
  const payload = {
    registerUploadRequest: {
      recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
      owner: `urn:li:person:${authorUrn}`,
      serviceRelationships: [
        {
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        },
      ],
    },
  };

  const res = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to register image upload: ${res.status} ${body}`);
  }

  const data = await res.json();
  const uploadUrl = data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const asset = data.value.asset;
  return { uploadUrl, asset };
}

// Step 2b: Upload the image binary
async function uploadImage(uploadUrl, imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'image/png',
    },
    body: imageData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to upload image: ${res.status} ${body}`);
  }
}

// Step 3: Add a comment to a post
async function addComment(postUrn, authorUrn, text) {
  const payload = {
    actor: `urn:li:person:${authorUrn}`,
    message: { text },
    object: postUrn,
  };

  const res = await fetch('https://api.linkedin.com/v2/socialActions/' + encodeURIComponent(postUrn) + '/comments', {
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
    throw new Error(`Failed to add comment: ${res.status} ${body}`);
  }
}

// Step 4: Create a post (text only or with image)
async function createPost(authorUrn, text, imageAsset) {
  let shareContent;

  if (imageAsset) {
    shareContent = {
      shareCommentary: { text },
      shareMediaCategory: 'IMAGE',
      media: [
        {
          status: 'READY',
          media: imageAsset,
        },
      ],
    };
  } else {
    shareContent = {
      shareCommentary: { text },
      shareMediaCategory: 'NONE',
    };
  }

  const payload = {
    author: `urn:li:person:${authorUrn}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': shareContent,
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

  let imageAsset = null;

  if (imageFile && fs.existsSync(imageFile)) {
    console.log(`Uploading image: ${imageFile}`);
    const { uploadUrl, asset } = await registerImageUpload(urn);
    await uploadImage(uploadUrl, imageFile);
    imageAsset = asset;
    console.log('Image uploaded.');
  }

  console.log('');
  console.log('--- Post content ---');
  console.log(postText);
  if (imageAsset) console.log(`[Image attached: ${imageFile}]`);
  console.log('--------------------');
  console.log('');
  console.log('Publishing to LinkedIn...');
  const postId = await createPost(urn, postText, imageAsset);
  console.log(`Published! Post ID: ${postId}`);
  if (postId) {
    const shareId = postId.replace('urn:li:ugcPost:', '').replace('urn:li:share:', '');
    console.log(`View at: https://www.linkedin.com/feed/update/urn:li:share:${shareId}/`);

    // Add a comment with the link if provided
    if (commentText) {
      console.log('Adding comment with link...');
      await addComment(postId, urn, commentText);
      console.log('Comment added.');
    }
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
