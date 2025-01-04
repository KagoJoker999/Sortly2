import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
    console.log('========== 开始获取产品状态 ==========');
    console.log('请求方法:', req.method);

    try {
        // 检查环境变量
        const configId = process.env.EDGE_CONFIG;
        console.log('环境变量检查:');
        console.log('- EDGE_CONFIG:', configId ? '已设置' : '未设置');
        
        if (!configId) {
            console.error('错误: 未找到 EDGE_CONFIG 环境变量');
            return res.status(500).json({
                success: false,
                message: '环境变量未配置',
                details: 'EDGE_CONFIG 未设置'
            });
        }

        // 创建 Edge Config 客户端
        console.log('正在创建 Edge Config 客户端...');
        const edgeConfig = createClient(configId);
        console.log('Edge Config 客户端创建成功');

        // 获取数据
        console.log('正在从 Edge Config 获取数据...');
        const data = await edgeConfig.get('productStatus');
        
        // 如果数据不存在，返回默认值
        if (!data) {
            console.log('未找到数据，返回默认值');
            return res.status(200).json({
                success: true,
                message: '数据获取成功（使用默认值）',
                data: {
                    selectedProducts: [],
                    highlightedProducts: [],
                    lastUpdate: null
                }
            });
        }

        console.log('获取到的数据:', JSON.stringify(data, null, 2));

        // 返回成功响应
        console.log('========== 请求处理完成 ==========');
        return res.status(200).json({
            success: true,
            message: '数据获取成功',
            data: data
        });
    } catch (error) {
        console.error('========== 获取数据时出错 ==========');
        console.error('错误类型:', error.constructor.name);
        console.error('错误信息:', error.message);
        console.error('错误堆栈:', error.stack);
        return res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message,
            errorType: error.constructor.name
        });
    }
} 