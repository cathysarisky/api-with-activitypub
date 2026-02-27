const GhostApiClient = require('../../ghostApi');

const POSTHOG_URL = process.env.POSTHOG_URL;
const POSTHOG_TOKEN = process.env.POSTHOG_TOKEN;

exports.handler = async (event, context) => {
    if (!POSTHOG_URL || !POSTHOG_TOKEN) {
        console.error('POSTHOG_URL and POSTHOG_TOKEN environment variables are required');
        return { statusCode: 500, body: 'Missing PostHog configuration' };
    }

    try {
        const ghostApi = new GhostApiClient();
        const identities = await ghostApi.getIdentities();

        if (!identities.identities || identities.identities.length === 0) {
            console.error('No identities from Ghost Admin API');
            return { statusCode: 502, body: 'Could not retrieve bearer token' };
        }

        const bearerToken = identities.identities[0].token;
        const posts = await ghostApi.getMyPosts(bearerToken);

        const now = new Date().toISOString();
        const captureUrl = POSTHOG_URL;

        for (const post of posts) {
            const payload = {
                api_key: POSTHOG_TOKEN,
                event: 'social_stats_snapshot',
                distinct_id: 'social_sync_bot',
                properties: {
                    $process_person_profile: false,
                    $current_url: post.url,
                    social_like_count: post.likeCount,
                    repost_count: post.repostCount,
                    source: 'social_sync_bot'
                },
                timestamp: now
            };

            const response = await fetch(captureUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.warn(`PostHog capture failed for ${post.url}: ${response.status}`);
            }
        }

        console.log(`Sent ${posts.length} social_stats_snapshot events to PostHog`);
        return { statusCode: 200, body: JSON.stringify({ sent: posts.length }) };
    } catch (err) {
        console.error('social-stats-to-posthog error:', err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
