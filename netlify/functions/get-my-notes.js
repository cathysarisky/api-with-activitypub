const GhostApiClient = require('../../ghostApi');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        console.log('🚀 Starting Ghost Admin API client...');
        
        // Initialize the API client
        const ghostApi = new GhostApiClient();
        
        console.log('📡 Step 1: Getting identities from Ghost Admin API...');
        
        // Make a request to the identities endpoint
        const identities = await ghostApi.getIdentities();
        
        if (!identities.identities || identities.identities.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'No identities found',
                    message: 'Could not retrieve bearer token from Ghost Admin API'
                })
            };
        }

        // Extract the Bearer token from the identities response
        const bearerToken = identities.identities[0].token;
        console.log(`🔑 Extracted Bearer token: ${bearerToken.substring(0, 50)}...`);
        
        console.log('📡 Step 2: Getting all your posts...');
        
        // Get all posts for context (paginated, so this may be multiple requests)
        const allPosts = await ghostApi.getActivityPubPosts(bearerToken);
        const totalPosts = allPosts.length;
        
        console.log('📡 Step 3: Getting your notes with engagement data...');
        
        // Get your notes with the specific data you want
        const myNotes = await ghostApi.getMyNotes(bearerToken);
        
        console.log(`✅ Successfully retrieved ${myNotes.length} notes`);

        // Calculate summary statistics
        const totalLikes = myNotes.reduce((sum, note) => sum + note.likeCount, 0);
        const totalReposts = myNotes.reduce((sum, note) => sum + note.repostCount, 0);
        const totalReplies = myNotes.reduce((sum, note) => sum + note.replyCount, 0);
        const totalImages = myNotes.reduce((sum, note) => sum + note.images.length, 0);

        // Prepare the response
        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            summary: {
                totalPosts: totalPosts,
                totalNotes: myNotes.length,
                totalLikes: totalLikes,
                totalReposts: totalReposts,
                totalReplies: totalReplies,
                totalImages: totalImages,
                averageLikesPerNote: myNotes.length > 0 ? +(totalLikes / myNotes.length).toFixed(1) : 0
            },
            notes: myNotes
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response, null, 2)
        };
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: error.message,
                details: error.response?.data || null
            }, null, 2)
        };
    }
};
