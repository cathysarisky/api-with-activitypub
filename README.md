# Ghost Admin API & ActivityPub Integration

A Netlify function that integrates with Ghost Admin API and ActivityPub to retrieve user notes with engagement data.

## Features

- 🔐 Ghost Admin API authentication using JWT
- 📡 ActivityPub integration with Bearer token
- 📝 Filter for user's own notes (type: 0)
- 📊 Engagement metrics (likes, reposts, replies)
- 🖼️ Image attachment extraction
- 🌐 JSON API response
- ⚡ Serverless deployment on Netlify

## Setup

### 1. Environment Variables

Create a `.env` file with your Ghost Admin API credentials:

```env
GHOST_ADMIN_API_URL=https://admindash.spectralwebservices.com/ghost/api/admin/
GHOST_ADMIN_API_KEY=your_ghost_api_key_id:your_ghost_api_key_secret
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Local Development

```bash
# Run the original Node.js version
npm start

# Or run with Netlify Dev for function testing
npm run netlify-dev
```

### 4. Deploy to Netlify

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard:
   - `GHOST_ADMIN_API_URL`
   - `GHOST_ADMIN_API_KEY`
3. Deploy!

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
├── index.js                    # Original Node.js demo
├── package.json
├── netlify.toml               # Netlify configuration
└── README.md
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

## Development

The project includes both the original Node.js script (`index.js`) for testing and the Netlify function for production deployment.

- **Local testing:** `npm start`
- **Netlify function testing:** `npm run netlify-dev`
- **Production:** Deploy to Netlify

## Error Handling

The function includes comprehensive error handling and returns appropriate HTTP status codes:

- `200`: Success
- `404`: No identities found
- `500`: Server error (with error details)

All responses include CORS headers for cross-origin requests.
