const axios = require('axios');
const { generateGhostToken, GHOST_ADMIN_API_URL } = require('./utils');

class GhostApiClient {
    constructor() {
        this.baseURL = GHOST_ADMIN_API_URL;
        if (!this.baseURL) {
            throw new Error('GHOST_ADMIN_API_URL environment variable is required');
        }
    }

    /**
     * Make an authenticated request to the Ghost Admin API
     * @param {string} endpoint - The API endpoint (relative to base URL)
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {object} data - Request body data (for POST/PUT requests)
     * @returns {Promise} - Axios response promise
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
        try {
            const token = generateGhostToken();
            const url = `${this.baseURL}/ghost/api/admin/${endpoint}`;
            
            const config = {
                method,
                url,
                headers: {
                    'Authorization': `Ghost ${token}`,
                    'Content-Type': 'application/json',
                    'Accept-Version': 'v5.0'
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error('Ghost API Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get identities from the Ghost Admin API
     * @returns {Promise} - API response data
     */
    async getIdentities() {
        return this.makeRequest('identities/');
    }

    /**
     * Generic GET request
     * @param {string} endpoint - The API endpoint
     * @returns {Promise} - API response data
     */
    async get(endpoint) {
        return this.makeRequest(endpoint, 'GET');
    }

    /**
     * Generic POST request
     * @param {string} endpoint - The API endpoint
     * @param {object} data - Request body data
     * @returns {Promise} - API response data
     */
    async post(endpoint, data) {
        return this.makeRequest(endpoint, 'POST', data);
    }

    /**
     * Generic PUT request
     * @param {string} endpoint - The API endpoint
     * @param {object} data - Request body data
     * @returns {Promise} - API response data
     */
    async put(endpoint, data) {
        return this.makeRequest(endpoint, 'PUT', data);
    }

    /**
     * Generic DELETE request
     * @param {string} endpoint - The API endpoint
     * @returns {Promise} - API response data
     */
    async delete(endpoint) {
        return this.makeRequest(endpoint, 'DELETE');
    }

    /**
     * Make a request to the ActivityPub API using a Bearer token
     * @param {string} url - The full ActivityPub API URL
     * @param {string} bearerToken - The Bearer token for authentication
     * @param {string} method - HTTP method (default: GET)
     * @param {object} data - Request body data (for POST/PUT requests)
     * @returns {Promise} - Axios response promise
     */
    async makeActivityPubRequest(url, bearerToken, method = 'GET', data = null) {
        try {
            const config = {
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/activity+json'
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error('ActivityPub API Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get replies from ActivityPub endpoint using Bearer token
     * @param {string} noteUrl - The note URL to get replies for
     * @param {string} bearerToken - The Bearer token for authentication
     * @returns {Promise} - API response data
     */
    async getActivityPubReplies(noteUrl, bearerToken) {
        // URL encode the note URL for the API endpoint
        const encodedNoteUrl = encodeURIComponent(noteUrl);
        const activityPubUrl = `https://www.spectralwebservices.com/.ghost/activitypub/v1/replies/${encodedNoteUrl}`;
        
        return this.makeActivityPubRequest(activityPubUrl, bearerToken);
    }

    /**
     * Get user's posts from ActivityPub endpoint using Bearer token
     * @param {string} bearerToken - The Bearer token for authentication
     * @returns {Promise} - API response data
     */
    async getActivityPubPosts(bearerToken) {
        const activityPubUrl = 'https://www.spectralwebservices.com/.ghost/activitypub/v1/posts/me';
        
        return this.makeActivityPubRequest(activityPubUrl, bearerToken);
    }

    /**
     * Get user's notes (posts with type: 0) from ActivityPub endpoint
     * @param {string} bearerToken - The Bearer token for authentication
     * @returns {Promise} - Array of notes (posts with type: 0)
     */
    async getActivityPubNotes(bearerToken) {
        const posts = await this.getActivityPubPosts(bearerToken);
        
        // Filter for notes (type: 0)
        if (posts && Array.isArray(posts)) {
            return posts.filter(post => post.type === 0);
        } else if (posts && posts.posts && Array.isArray(posts.posts)) {
            // Handle case where posts are nested in a 'posts' property
            return posts.posts.filter(post => post.type === 0);
        } else {
            console.warn('Unexpected posts response format:', posts);
            return [];
        }
    }

    /**
     * Get user's own notes (authored by them) with specific data extracted
     * @param {string} bearerToken - The Bearer token for authentication
     * @param {string} userHandle - The user's handle (e.g., "@cathy@spectralwebservices.com")
     * @returns {Promise} - Array of user's notes with extracted data
     */
    async getMyNotes(bearerToken, userHandle = "@cathy@spectralwebservices.com") {
        const posts = await this.getActivityPubPosts(bearerToken);
        
        let allPosts = [];
        if (posts && Array.isArray(posts)) {
            allPosts = posts;
        } else if (posts && posts.posts && Array.isArray(posts.posts)) {
            allPosts = posts.posts;
        } else {
            console.warn('Unexpected posts response format:', posts);
            return [];
        }

        // Filter for notes (type: 0) authored by the user
        const myNotes = allPosts.filter(post => 
            post.type === 0 && 
            post.authoredByMe === true && 
            post.author && 
            post.author.handle === userHandle
        );

        // Extract the specific data you want
        return myNotes.map(note => ({
            id: note.id,
            content: note.content,
            likeCount: note.likeCount,
            repostCount: note.repostCount,
            replyCount: note.replyCount,
            publishedAt: note.publishedAt,
            url: note.url,
            // Extract image URLs from attachments
            images: note.attachments ? note.attachments
                .filter(attachment => attachment.type === 'Image')
                .map(attachment => ({
                    url: attachment.url,
                    name: attachment.name || 'Untitled'
                })) : [],
            // Include author info for verification
            author: {
                handle: note.author.handle,
                name: note.author.name
            }
        }));
    }
}

module.exports = GhostApiClient;
