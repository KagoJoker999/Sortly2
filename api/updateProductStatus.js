import { edgeConfigClient } from './edgeConfig';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只支持 POST 请求' });
    }

    try {
        const { selectedProducts, highlightedProducts } = req.body;

        // 使用 Edge Config 存储状态
        await edgeConfigClient.set('productStatus', {
            selectedProducts,
            highlightedProducts,
            lastUpdated: new Date().toISOString()
        });

        return res.status(200).json({ 
            success: true, 
            message: '状态更新成功',
            data: {
                selectedProducts,
                highlightedProducts
            }
        });
    } catch (error) {
        console.error('更新产品状态时出错:', error);
        return res.status(500).json({ 
            error: '服务器错误',
            message: error.message 
        });
    }
} 