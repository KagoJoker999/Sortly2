export default async function handler(req, res) {
    console.log('========== 开始处理更新产品状态请求 ==========');
    console.log('请求方法:', req.method);
    
    if (req.method !== 'POST') {
        console.log('错误: 不支持的请求方法');
        return res.status(405).json({ success: false, message: '只支持 POST 请求' });
    }

    try {
        // 获取请求数据
        const { selectedProducts, highlightedProducts, productScores } = req.body;
        console.log('接收到的数据:');
        console.log('- selectedProducts:', JSON.stringify(selectedProducts));
        console.log('- highlightedProducts:', JSON.stringify(highlightedProducts));
        console.log('- productScores:', JSON.stringify(productScores));

        // 验证数据
        console.log('验证数据格式...');
        if (!Array.isArray(selectedProducts) || !Array.isArray(highlightedProducts)) {
            console.error('错误: 无效的数据格式');
            console.log('- selectedProducts 是数组:', Array.isArray(selectedProducts));
            console.log('- highlightedProducts 是数组:', Array.isArray(highlightedProducts));
            return res.status(400).json({
                success: false,
                message: '无效的数据格式'
            });
        }
        console.log('数据格式验证通过');

        // 准备要存储的数据
        const productStatus = {
            selected_products: selectedProducts,
            highlighted_products: highlightedProducts,
            product_scores: productScores || {},
            last_update: new Date().toISOString()
        };
        console.log('准备存储的数据:', JSON.stringify(productStatus, null, 2));

        // 使用 Supabase 存储数据
        console.log('开始通过 Supabase API 存储数据...');
        const response = await fetch('https://ddejqskjoctdtqeqijmn.supabase.co/rest/v1/product_status', {
            method: 'POST',
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZWpxc2tqb2N0ZHRxZXFpam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5Njc3OTYsImV4cCI6MjA1MTU0Mzc5Nn0.bJ1YJWc-k26mJDggN9qf8b0Da1vhWJXMonVAbPYtSNM',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZWpxc2tqb2N0ZHRxZXFpam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5Njc3OTYsImV4cCI6MjA1MTU0Mzc5Nn0.bJ1YJWc-k26mJDggN9qf8b0Da1vhWJXMonVAbPYtSNM',
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(productStatus)
        });

        if (!response.ok) {
            throw new Error(`Supabase API 错误: ${response.statusText}`);
        }

        // 验证存储的数据
        console.log('正在验证存储的数据...');
        const verifyResponse = await fetch('https://ddejqskjoctdtqeqijmn.supabase.co/rest/v1/product_status?select=*', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZWpxc2tqb2N0ZHRxZXFpam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5Njc3OTYsImV4cCI6MjA1MTU0Mzc5Nn0.bJ1YJWc-k26mJDggN9qf8b0Da1vhWJXMonVAbPYtSNM',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZWpxc2tqb2N0ZHRxZXFpam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5Njc3OTYsImV4cCI6MjA1MTU0Mzc5Nn0.bJ1YJWc-k26mJDggN9qf8b0Da1vhWJXMonVAbPYtSNM'
            }
        });

        if (!verifyResponse.ok) {
            throw new Error('验证数据失败');
        }

        const productStatusList = await verifyResponse.json();
        const savedData = productStatusList[productStatusList.length - 1];
        console.log('读取到的数据:', JSON.stringify(savedData, null, 2));

        // 返回成功响应
        console.log('========== 请求处理完成 ==========');
        return res.status(200).json({
            success: true,
            message: '数据已更新',
            data: savedData,
            status: {
                isConnected: true
            }
        });
    } catch (error) {
        console.error('========== 处理请求时出错 ==========');
        console.error('错误类型:', error.constructor.name);
        console.error('错误信息:', error.message);
        console.error('错误堆栈:', error.stack);
        return res.status(500).json({
            success: false,
            message: '处理请求失败',
            error: error.message,
            errorType: error.constructor.name,
            status: {
                isConnected: false
            }
        });
    }
} 