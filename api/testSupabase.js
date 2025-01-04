export default async function handler(req, res) {
    console.log('========== 开始处理获取产品状态请求 ==========');
    
    if (req.method !== 'GET') {
        console.log('错误: 不支持的请求方法');
        return res.status(405).json({ success: false, message: '只支持 GET 请求' });
    }

    try {
        console.log('开始从 Edge Config 获取数据...');
        const response = await fetch('https://edge-config.vercel.com/ecfg_5r0fmmunrzorhzrucrexlogkes3c/item/productStatus', {
            headers: {
                'Authorization': 'Bearer d09e1aca-a9c1-420d-ad0a-20289785e140'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Edge Config 返回错误:', errorData);
            throw new Error(errorData.error?.message || '获取数据失败');
        }

        const data = await response.json();
        console.log('获取到的数据:', JSON.stringify(data, null, 2));

        // 确保返回的数据格式正确
        const formattedData = {
            selectedProducts: data.selectedProducts || [],
            highlightedProducts: data.highlightedProducts || [],
            lastUpdate: data.lastUpdate || new Date().toISOString()
        };

        // 设置 CORS 头，允许所有来源访问
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        return res.status(200).json({
            success: true,
            message: '获取数据成功',
            ...formattedData,
            status: {
                isConnected: true
            }
        });
    } catch (error) {
        console.error('========== 处理请求时出错 ==========');
        console.error('错误类型:', error.constructor.name);
        console.error('错误信息:', error.message);
        console.error('错误堆栈:', error.stack);

        // 设置 CORS 头，允许所有来源访问
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        return res.status(500).json({
            success: false,
            message: error.message || '获取数据失败',
            selectedProducts: [],
            highlightedProducts: [],
            status: {
                isConnected: false
            }
        });
    }
} 