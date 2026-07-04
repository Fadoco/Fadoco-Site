/**
 * Serverless Function - YouTube Playlist Proxy
 * Roda no Vercel e protege a chave da API
 * 
 * URL: https://seu-dominio.vercel.app/api/youtube?playlistId=...&pageToken=...
 */

export default async function handler(req, res) {
    // Apenas GET é permitido
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { playlistId, pageToken = '' } = req.query;
    const API_KEY = process.env.YOUTUBE_API_KEY;

    // Validar chave de API
    if (!API_KEY) {
        console.error('❌ YOUTUBE_API_KEY não configurada no Vercel');
        return res.status(500).json({ 
            error: 'API key not configured',
            details: 'YOUTUBE_API_KEY está vazia nas variáveis de ambiente do Vercel'
        });
    }

    // Validar playlistId
    if (!playlistId) {
        return res.status(400).json({ error: 'playlistId é obrigatório' });
    }

    try {
        const params = new URLSearchParams({
            part: 'snippet',
            maxResults: 50,
            playlistId,
            key: API_KEY,
            pageToken
        });

        const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'YouTube API Error',
                status: response.status,
                message: await response.text()
            });
        }

        const data = await response.json();

        // Cache por 1 hora (3600 segundos)
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        res.status(200).json(data);

    } catch (error) {
        console.error('❌ Erro na API proxy:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
