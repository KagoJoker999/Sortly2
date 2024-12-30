import { createEdgeConfigClient } from '@vercel/edge-config';

const edgeConfigId = 'ecfg_mai3l1prmiie8g0zuogaovo7zz73';

export default async function handler(req, res) {
    try {
        const edgeConfig = createEdgeConfigClient(process.env.EDGE_CONFIG);

        if (req.method === 'GET') {
            const data = await edgeConfig.get('live-data');
            res.status(200).json(data || {
                selectedProducts: [],
                productScores: {},
                highlightedProducts: []
            });
        } else if (req.method === 'POST') {
            await edgeConfig.set('live-data', req.body);
            res.status(200).json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Edge Config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 