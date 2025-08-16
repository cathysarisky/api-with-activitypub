const GhostApiClient = require('./ghostApi');

async function main() {
    try {
        console.log('🚀 Starting Ghost Admin API client...');
        
        // Initialize the API client
        const ghostApi = new GhostApiClient();
        
        console.log('📡 Step 1: Getting identities from Ghost Admin API...');
        
        // Make a request to the identities endpoint
        const identities = await ghostApi.getIdentities();
        
        console.log('✅ Successfully retrieved identities:');
        console.log(JSON.stringify(identities, null, 2));
        
        // Extract the Bearer token from the identities response
        if (identities.identities && identities.identities.length > 0) {
            const bearerToken = identities.identities[0].token;
            console.log(`🔑 Extracted Bearer token: ${bearerToken.substring(0, 50)}...`);
            
            console.log('📡 Step 2: Getting all your posts...');
            
            // Get all posts
            const allPosts = await ghostApi.getActivityPubPosts(bearerToken);
            
            console.log('✅ Successfully retrieved all posts:');
            console.log(`📊 Total posts: ${Array.isArray(allPosts) ? allPosts.length : (allPosts.posts ? allPosts.posts.length : 'unknown')}`);
            
            console.log('📡 Step 3: Getting your notes with engagement data...');
            
            // Get your notes with the specific data you want
            const myNotes = await ghostApi.getMyNotes(bearerToken);
            
            console.log('✅ Successfully retrieved your notes:');
            console.log(`📝 Total notes authored by you: ${myNotes.length}`);
            
            if (myNotes.length > 0) {
                console.log('\n📋 Your Notes with Engagement Data:');
                console.log('=' .repeat(60));
                
                myNotes.forEach((note, index) => {
                    console.log(`\n--- Note ${index + 1} ---`);
                    console.log(`📅 Published: ${new Date(note.publishedAt).toLocaleDateString()}`);
                    console.log(`👤 Author: ${note.author.name} (${note.author.handle})`);
                    
                    // Content (keep HTML, limit length for display)
                    console.log(`💬 Content: ${note.content.substring(0, 200)}${note.content.length > 200 ? '...' : ''}`);
                    
                    // Engagement metrics
                    console.log(`❤️  Likes: ${note.likeCount}`);
                    console.log(`🔁 Reposts: ${note.repostCount}`);
                    console.log(`💭 Replies: ${note.replyCount}`);
                    
                    // Images
                    if (note.images.length > 0) {
                        console.log(`🖼️  Images (${note.images.length}):`);
                        note.images.forEach((image, imgIndex) => {
                            console.log(`   ${imgIndex + 1}. ${image.name}: ${image.url}`);
                        });
                    } else {
                        console.log(`🖼️  Images: None`);
                    }
                    
                    console.log(`🔗 URL: ${note.url}`);
                });
                
                // Summary stats
                console.log('\n📊 Summary Statistics:');
                console.log('=' .repeat(30));
                const totalLikes = myNotes.reduce((sum, note) => sum + note.likeCount, 0);
                const totalReposts = myNotes.reduce((sum, note) => sum + note.repostCount, 0);
                const totalReplies = myNotes.reduce((sum, note) => sum + note.replyCount, 0);
                const totalImages = myNotes.reduce((sum, note) => sum + note.images.length, 0);
                
                console.log(`Total Likes: ${totalLikes}`);
                console.log(`Total Reposts: ${totalReposts}`);
                console.log(`Total Replies: ${totalReplies}`);
                console.log(`Total Images: ${totalImages}`);
                console.log(`Average Likes per Note: ${(totalLikes / myNotes.length).toFixed(1)}`);
                
            } else {
                console.log('📝 No notes authored by you found');
            }
            
            // Optional: Example of getting replies for a specific note
            // console.log('\n📡 Step 4: Getting replies for a specific note...');
            // const noteUrl = 'https://www.spectralwebservices.com/.ghost/activitypub/note/b139ff20-370b-4603-95f5-09e49c10cc8c';
            // const replies = await ghostApi.getActivityPubReplies(noteUrl, bearerToken);
            // console.log('✅ Successfully retrieved ActivityPub replies:');
            // console.log(JSON.stringify(replies, null, 2));
            
        } else {
            console.log('❌ No identities found in the response');
        }
        
        // Example of using other endpoints
        // const posts = await ghostApi.get('posts/');
        // const pages = await ghostApi.get('pages/');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        }
        
        process.exit(1);
    }
}

// Run the main function if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = { main };
