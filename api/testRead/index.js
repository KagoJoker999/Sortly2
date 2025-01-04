import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
    try {
        const config = createClient(process.env.EDGE_CONFIG);
        const value = await config.get('greeting');
        
        return res.status(200).json({
            success: true,
            data: value
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
} 