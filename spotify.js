// spotify-auth.js
import express from 'express'
import axios from 'axios'
import querystring from 'querystring'
import "dotenv/config";

const app = express();
const port = 3000;

const client_id = process.env.SPOTIFY_ID
const client_secret = process.env.SPOTIFY_SECRET
const redirect_uri = 'http://localhost:3000/callback';
const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state', // optional but recommended for richer context
    'user-top-read',
    'user-read-recently-played'
  ].join(' ');

app.get('/login', (req, res) => {
  const authUrl = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id,
    scope: scopes,
    redirect_uri,
  });
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  const tokenRes = await axios.post('https://accounts.spotify.com/api/token',
    querystring.stringify({
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    }),
    {
      headers: {
        Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const { refresh_token, access_token } = tokenRes.data;
  console.log('REFRESH TOKEN:', refresh_token);
  console.log('ACCESS TOKEN:', access_token);
  res.send('Success! Check your terminal for tokens.');
});

app.listen(port, () => {
  console.log(`Visit http://localhost:${port}/login to authenticate`);
});
