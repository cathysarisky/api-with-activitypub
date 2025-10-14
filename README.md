# Ghost Admin API & ActivityPub Integration

A Netlify function that integrates with Ghost Admin API and ActivityPub to retrieve user notes with engagement data.

Cathy Sarisky / https://www.spectralwebservices.com

## WIP
- Some hard-coded values are present in get-my-notes.js - plan to update before deploying :)
- Although it looks like replies are available, I haven't yet attempted to allow browsing them.
- Displayed likes/reposts/etc are non-interactive.  Because of the delocalized nature of the fediverse,
it's not obvious what we should do when a user clicks to like a note, since that action needs to go to their home server, not our activitypub instance.  An approach like tootpick might be worth considering here.

## Security note:
- get-my-notes needs to be deployed to a server you control.  It /cannot/ run on the browser,
because it requires access to your site's admin API key.  

## Features

- 🔐 Ghost Admin API authentication using JWT
- 📡 ActivityPub integration with Bearer token
- 📊 Engagement metrics (likes, reposts, replies)
- 🖼️ Image attachment extraction
- 🌐 JSON API response
- ⚡ Serverless deployment on Netlify

## Setup on Netlify

Set environment variables in Netlify dashboard:
   - `GHOST_ADMIN_API_URL`
   - `GHOST_ADMIN_API_KEY`
Be sure to redeploy after changing these values

## API Endpoints

### GET `/.netlify/functions/get-my-notes`

Returns your Ghost ActivityPub notes with engagement data.

**Response Format:**

```json
{
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "summary": {
    "totalPosts": 25,
    "totalNotes": 15,
    "totalLikes": 42,
    "totalReposts": 8,
    "totalReplies": 12,
    "totalImages": 5,
    "averageLikesPerNote": 2.8
  },
  "notes": [
    {
      "id": "https://www.spectralwebservices.com/.ghost/activitypub/note/...",
      "content": "<p>Your note content with HTML...</p>",
      "likeCount": 4,
      "repostCount": 1,
      "replyCount": 2,
      "publishedAt": "2025-01-15T14:29:44.707Z",
      "url": "https://www.spectralwebservices.com/.ghost/activitypub/note/...",
      "images": [
        {
          "url": "https://storage.googleapis.com/...",
          "name": "image.png"
        }
      ],
      "author": {
        "handle": "@cathy@spectralwebservices.com",
        "name": "Spectral Web Services"
      }
    }
  ]
}
```

## File Structure

```
├── netlify/
│   └── functions/
│       └── get-my-notes.js     # Main Netlify function
├── ghostApi.js                 # Ghost API client class
├── utils.js                    # JWT token generation utilities
├── index.js                    # Original Node.js demo - not needed for production
├── netlify.toml                # Netlify configuration
├── public
    └── get-notes.js            # Client-side javascript to get and render notes (update for your site)
    └── styles.css              # Optional styles for the notes
    └── index.html              # Standalone page of notes, alternative to integrating with your Ghost site.

```

## Usage Examples

### Fetch with JavaScript

```javascript
fetch('https://your-site.netlify.app/.netlify/functions/get-my-notes')
  .then(response => response.json())
  .then(data => {
    console.log(`Found ${data.summary.totalNotes} notes`);
    console.log(`Total engagement: ${data.summary.totalLikes} likes`);
    
    data.notes.forEach(note => {
      console.log(`Note: ${note.content.substring(0, 100)}...`);
      console.log(`Engagement: ${note.likeCount} likes, ${note.replyCount} replies`);
    });
  });
```

### Curl

```bash
curl https://your-site.netlify.app/.netlify/functions/get-my-notes
```

## Development & Demos

- Node.js script (`index.js`) for testing/local demonstration of the activitypub endpoints. 
- public/index.html is a standalone page (requiring a netlify deployment or local `netlify dev`) front-end demo.

