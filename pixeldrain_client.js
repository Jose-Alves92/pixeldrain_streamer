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
            const response = await this.client.get('/user/files');
            const files = response.data.files || [];
            
            let filteredFiles;

            if (type === 'movie') {
                // For movies, imdbId is 'tt1234567'
                filteredFiles = files.filter(file => {
                    const fileImdb = file.name.split('.')[0];
                    return fileImdb.toLowerCase() === imdbId.toLowerCase();
                });
            } else if (type === 'series') {
                // For series, imdbId is 'tt1234567:s:e'
                const [id, season, episode] = imdbId.split(':');

                filteredFiles = files.filter(file => {
                    const parts = file.name.split('.');
                    if (parts.length < 3) return false;

                    const fileImdb = parts[0];
                    const fileSeason = parts[1];
                    const fileEpisode = parts[2];

                    return fileImdb.toLowerCase() === id.toLowerCase() &&
                           fileSeason === season &&
                           fileEpisode === episode;
                });
            }

            return (filteredFiles || []).map(file => {
                let title = file.name;
                const parts = file.name.split('.');
                const baseImdb = type === 'series' ? imdbId.split(':')[0] : imdbId;

                if (type === 'series' && parts.length >= 4) {
                    title = parts.slice(3).join('.');
                } else if (type === 'movie' && parts.length >= 2) {
                    title = parts.slice(1).join('.');
                }

                return {
                    name: `Pixeldrain`,
                    title: title,
                    url: `https://pixeldrain.com/api/file/${file.id}?download`,
                    behaviorHints: {
                        bingeGroup: `pixeldrain-${baseImdb}`
                    }
                };
            });
        } catch (error) {
            console.error('Pixeldrain search error:', error.message);
            return [];
        }
    }

}

module.exports = PixeldrainClient;