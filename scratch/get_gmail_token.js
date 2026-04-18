import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
} = process.env;

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REDIRECT_URI) {
  console.error('❌ Error: Missing GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, or GMAIL_REDIRECT_URI in .env file');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force to get refresh token
});

console.log('---------------------------------------------------------');
console.log('🛡️ AegisAI GMAIL TOKEN GENERATOR');
console.log('---------------------------------------------------------');
console.log('1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n---------------------------------------------------------');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('2. Paste the code from the redirect URL here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Successfully authorized!');
    console.log('---------------------------------------------------------');
    console.log('Copy this REFRESH TOKEN into your .env file:');
    console.log('\nGMAIL_REFRESH_TOKEN="' + tokens.refresh_token + '"');
    console.log('---------------------------------------------------------');
    console.log('Then restart your start.ps1 script.');
  } catch (err) {
    console.error('❌ Error retrieving access token:', err.message);
  }
  rl.close();
});
