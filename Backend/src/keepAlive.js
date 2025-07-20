// keepAlive.js
// This script pings your Render backend every 5 minutes to prevent cold starts.

const https = require('https');

const URL = 'https://chat-webapplication-yf2z.onrender.com';

function ping() {
  https.get(URL, (res) => {
    console.log(`[KeepAlive] Pinged ${URL} - Status: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`[KeepAlive] Error: ${e.message}`);
  });
}

// Ping every 5 minutes
setInterval(ping, 5 * 60 * 1000);

// Initial ping
ping();
