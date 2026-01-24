const axios = require('axios');

class PixeldrainClient {
    constructor() {
        this.apiKey = process.env.PIXELDRAIN_API_KEY;
        this.username = process.env.PIXELDRAIN_USERNAME;
        this.baseURL = 'https://pixeldrain.com/api';
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Basic ${Buffer.from(`${this.username}:${this.apiKey}`).toString('base64')}`,
                'User-Agent': 'Stremio-Pixeldrain-Addon/1.0'
            }
        });
    }

    async searchContent(type, imdbId) {
        
        try {
            // Get user's file list
            const response = await this.client.get('/user/files');
            const files = response.data.files || [];
            
            // Filter files by type and IMDB ID ex. tt2934286:2:3-Hello.S02E03
            const filteredFiles = files.filter(file => {
                const Imdb = file.name.split("-")[0];
                return Imdb.toLowerCase().includes(imdbId.toLowerCase());
            });

            // Convert to Stremio stream format
            return filteredFiles.map(file => ({
                name: `Pixeldrain: ${file.name.split("-")[2]}`,
                title: file.name.split("-")[1],
                url: `https://pixeldrain.com/api/file/${file.id}?download`,
                ytId: null,
                infoHash: null,
                fileIdx: null,
                behaviorHints: {
                    bingeGroup: `pixeldrain-${imdbId}`,
                    notWebReady: false
                }
            }));
        } catch (error) {
            console.error('Pixeldrain search error:', error.message);
            return [];
        }
    }

}

module.exports = PixeldrainClient;