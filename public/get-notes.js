/**
 * Ghost ActivityPub Notes Client
 * Fetches and displays user notes from the Netlify function
 */

class GhostNotesClient {
    constructor(apiEndpoint = 'https://sws-api-for-activitypub.netlify.app/.netlify/functions/get-my-notes') {
        this.apiEndpoint = apiEndpoint;
        this.loading = false;
        this.data = null;
        this.error = null;
    }

    /**
     * Fetch notes from the API endpoint
     * @returns {Promise<Object>} - The notes data
     */
    async fetchNotes() {
        this.loading = true;
        this.error = null;
        
        try {
            console.log('🚀 Fetching notes from:', this.apiEndpoint);
            
            const response = await fetch(this.apiEndpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'API returned error');
            }
            
            this.data = data;
            console.log('✅ Successfully fetched notes:', data);
            
            return data;
            
        } catch (error) {
            this.error = error.message;
            console.error('❌ Error fetching notes:', error);
            throw error;
            
        } finally {
            this.loading = false;
        }
    }

    /**
     * Render notes data to a container element
     * @param {string|HTMLElement} container - Container element or selector
     * @param {Object} options - Rendering options
     */
    renderNotes(container, options = {}) {
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!containerEl) {
            throw new Error('Container element not found');
        }

        if (this.loading) {
            containerEl.innerHTML = '<div class="loading">🔄 Loading notes...</div>';
            return;
        }

        if (this.error) {
            containerEl.innerHTML = `<div class="error">❌ Error: ${this.error}</div>`;
            return;
        }

        if (!this.data) {
            containerEl.innerHTML = '<div class="no-data">No data available. Call fetchNotes() first.</div>';
            return;
        }

        const { summary, notes } = this.data;
        
        // Build HTML
        let html = `
            <div class="ghost-notes-container">
                <div class="notes-list">

        `;

        notes.forEach((note, index) => {
            const publishedDate = new Date(note.publishedAt).toLocaleDateString();
            
            html += `
                <article class="note" data-note-id="${note.id}">
                    <div class="note-header">
                        <span class="note-date">📅 ${publishedDate}</span>
                        <a href="https://www.spectralwebservices.com" target="_blank" class="note-author">@cathy@spectralwebservices.com</a>
                    </div>
                    
                    ${note.images.length > 0 ? `
                        <div class="note-images">
                            <div class="images-grid">
                                ${note.images.map(img => `
                                    <div class="image-item">
                                        <img src="${img.url}" alt="${img.name}" loading="lazy" />
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="note-content">
                        ${note.content}
                    </div>
                    
                    <div class="note-engagement">
                        <div class="engagement-stats">
                            <span class="engagement-item">❤️ ${note.likeCount}</span>
                            <span class="engagement-item">🔁 ${note.repostCount}</span>
                            <span class="engagement-item">💭 ${note.replyCount}</span>
                        </div>
                        <div class="note-footer">
                            <a href="${note.url}" target="_blank" class="note-link">🔗 View Original</a>
                        </div>
                    </div>
                </article>
            `;
        });

        html += `
                </div>
                <div class="footer">
                    <p>Last updated: ${new Date(this.data.timestamp).toLocaleString()}</p>
                </div>
            </div>
        `;

        containerEl.innerHTML = html;
    }



    /**
     * Auto-refresh notes at specified interval
     * @param {number} intervalMs - Refresh interval in milliseconds
     */
    startAutoRefresh(intervalMs = 300000) { // Default: 5 minutes
        setInterval(async () => {
            try {
                await this.fetchNotes();
                console.log('🔄 Auto-refreshed notes');
                
                // Re-render if there's a container with the class
                const container = document.querySelector('.ghost-notes-container');
                if (container && container.parentElement) {
                    this.renderNotes(container.parentElement);
                }
            } catch (error) {
                console.warn('Auto-refresh failed:', error);
            }
        }, intervalMs);
    }
}

// Create a global instance
const ghostNotesClient = new GhostNotesClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GhostNotesClient, ghostNotesClient };
}
