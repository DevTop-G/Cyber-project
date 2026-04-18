import { google } from 'googleapis';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env
dotenv.config();

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
  console.error('❌ Error: GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET not found in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force consent to ensure we get a refresh token
});

console.log('🛡️ AegisAI OAuth Token Generator');
console.log('-------------------------------');
console.log('1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. After authorizing, you will be redirected to a URL like:');
console.log(`${GMAIL_REDIRECT_URI}?code=4/P7q7WVKu....`);
console.log('\n3. Copy the "code" part from the URL and paste it here:');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nEnter the code: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Success! Here are your tokens:\n');
    console.log('----------------------------------------------------');
    console.log('GMAIL_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('----------------------------------------------------');
    
    if (!tokens.refresh_token) {
      console.warn('\n⚠️  WARNING: No refresh token returned. This usually happens if you didn\'t "un-authorize" the app first or didn\'t see the consent screen.');
      console.warn('Try removing the app from https://myaccount.google.com/permissions and run this again.');
    } else {
      console.log('\nCopy the GMAIL_REFRESH_TOKEN value and update your .env file.');
    }
  } catch (error) {
    console.error('\n❌ Error retrieving access token:', error.message);
    if (error.response && error.response.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
  rl.close();
});
