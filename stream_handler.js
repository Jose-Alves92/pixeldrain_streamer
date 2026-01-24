const PixeldrainClient = require('./pixeldrain_client');

class StreamHandler {
    constructor() {
        this.pixeldrain = new PixeldrainClient();
        this.cache = new Map();
        this.cacheTTL = parseInt(process.env.ADDON_CACHE_MAX_AGE) || 3600;
    }

    async getStreams(type, id) {
        const cacheKey = `${type}:${id}`;
        
        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL * 1000) {
            return cached.streams;
        }

        let streams = [];

        try {
            streams = await this.pixeldrain.searchContent(type, id);
            if (streams.length > 0) {
                this.cache.set(cacheKey, { streams, timestamp: Date.now() });
                return streams;
            }
        } catch (error) {
            console.warn('Pixeldrain search failed:', error.message);
        }
        

        // Cache empty result to prevent frequent retries
        this.cache.set(cacheKey, { streams: [], timestamp: Date.now() });
        return [];
    }
}

const handler = new StreamHandler();

module.exports = {
    handleStreams: (type, id) => handler.getStreams(type, id)
};