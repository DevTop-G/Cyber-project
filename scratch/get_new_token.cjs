/**
 * Run: node scratch/get_new_token.cjs
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

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n🔐 Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('📋 Paste the authorization code (or the full redirect URL) here: ', async (input) => {
  rl.close();
  try {
    let code = input.trim();
    // If user pasted the whole URL, extract the code parameter
    if (code.includes('code=')) {
      const url = new URL(code);
      code = url.searchParams.get('code');
    }

    if (!code) {
      console.error('\n❌ No authorization code found in input.');
      process.exit(1);
    }

    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ SUCCESS! Replace GMAIL_REFRESH_TOKEN in your .env with:\n');
    console.log(`GMAIL_REFRESH_TOKEN="${tokens.refresh_token}"`);
    if (!tokens.refresh_token) {
      console.warn('\n⚠️  No refresh token returned. Go to:');
      console.warn('   https://myaccount.google.com/permissions');
      console.warn('   Revoke "AegisAI" access, then run this script again.');
    }
  } catch (err) {
    console.error('\n❌ Error exchanging code:', err.message);
  }
});
