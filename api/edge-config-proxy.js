import { createEdgeConfigClient } from '@vercel/edge-config';

const edgeConfigId = 'ecfg_mai3l1prmiie8g0zuogaovo7zz73';
const edgeConfig = createEdgeConfigClient(process.env.EDGE_CONFIG);

module.exports = async (req, res) => {
    try {
        // 设置 CORS 头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // 处理 OPTIONS 请求
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        if (req.method === 'GET') {
            // 获取数据
            const data = await edgeConfig.get('liveData');
            res.status(200).json(data || {});
        } else if (req.method === 'POST') {
            // 更新数据
            const data = req.body;
            await edgeConfig.set('liveData', data);
            res.status(200).json({ success: true });
        } else {
            res.status(405).json({ error: '不支持的请求方法' });
        }
    } catch (error) {
        console.error('Edge Config 操作失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
}; 