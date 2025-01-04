import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
    console.log('========== 开始获取 Edge Config 版本 ==========');

    try {
        // 检查环境变量
        const configUrl = process.env.EDGE_CONFIG;
        console.log('环境变量检查:');
        console.log('- EDGE_CONFIG:', configUrl ? '已设置' : '未设置');
        
        if (!configUrl) {
            console.error('错误: 未找到 EDGE_CONFIG 环境变量');
            return res.status(500).json({
                success: false,
                message: '环境变量未配置',
                details: 'EDGE_CONFIG 未设置'
            });
        }

        // 创建 Edge Config 客户端
        console.log('正在创建 Edge Config 客户端...');
        const edgeConfig = createClient(configUrl);
        console.log('Edge Config 客户端创建成功');

        // 获取版本信息
        console.log('正在获取版本信息...');
        const digest = await edgeConfig.digest();
        console.log('获取到的版本:', digest);

        // 返回成功响应
        console.log('========== 请求处理完成 ==========');
        return res.status(200).json({
            success: true,
            message: '版本信息获取成功',
            digest: digest
        });
    } catch (error) {
        console.error('========== 获取版本时出错 ==========');
        console.error('错误类型:', error.constructor.name);
        console.error('错误信息:', error.message);
        console.error('错误堆栈:', error.stack);
        return res.status(500).json({
            success: false,
            message: '获取版本失败',
            error: error.message,
            errorType: error.constructor.name
        });
    }
} 