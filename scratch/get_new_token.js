/**
 * Run this script to get a new Gmail refresh token.
 * Usage: node scratch/get_new_token.js
 * Then open the URL it prints, authorize, paste the code back.
 */
const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI } = process.env;

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
  console.error('❌ Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // Force consent screen to always return a refresh token
});

console.log('\n🔐 Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('📋 Paste the authorization code from the redirect URL here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\n✅ SUCCESS! Add this to your .env file:\n');
    console.log(`GMAIL_REFRESH_TOKEN="${tokens.refresh_token}"`);
    if (!tokens.refresh_token) {
      console.warn('\n⚠️  No refresh token returned. Try revoking access at:');
      console.warn('   https://myaccount.google.com/permissions');
      console.warn('   Then run this script again.');
    }
  } catch (err) {
    console.error('\n❌ Error exchanging code:', err.message);
  }
});
