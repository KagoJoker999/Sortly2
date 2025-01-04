# Vercel Edge Config 最佳实践指南

## 1. 基本概念

### 1.1 Edge Config 是什么
- 全局数据存储服务
- 适用于频繁读取但不频繁更新的数据
- 在边缘节点读取，无需查询外部数据库
- P99 读取延迟在 15ms 以内

### 1.2 适用场景
- 功能开关（Feature flags）
- A/B 测试
- 关键重定向
- 恶意 IP 和 User Agent 拦截

### 1.3 性能特点
- 边缘节点读取
- 超低延迟（最快可达 0ms）
- 优化主要适用于 Edge 和 Node.js 运行时

### 1.4 端点说明
#### api.vercel.com
- 用于管理 Edge Config 的端点
- 限制：每分钟 20 次读取
- 用于创建、更新和删除操作
- 使用 Vercel API Token 认证

#### edge-config.vercel.com
- 全球分布式、高度优化的端点
- 专门用于高容量读取操作
- 无速率限制
- 使用 Edge Config 的 Read Access Token
- SDK 默认使用此端点

### 1.5 开发环境注意事项
- 本地开发环境无法获得 Vercel 的优化
- 本地响应时间会比生产环境慢 100+ 毫秒
- 建议使用模拟数据进行本地开发

### 1.6 数据更新特性
- 更新可能需要几秒钟才能全球同步
- API 端点总是返回最新版本
- 更新后应该验证数据一致性

## 2. 最佳实践

### 2.1 初始化和配置
```javascript
// ✅ 正确方式：使用环境变量
const edgeConfig = createClient(process.env.EDGE_CONFIG);

// ❌ 错误方式：硬编码
const edgeConfig = createClient('https://edge-config.vercel.com/...');
```

### 2.2 读取操作
```javascript
// ✅ 正确方式：使用 SDK 读取
const data = await edgeConfig.get('key');

// ✅ 处理不存在的数据
if (!data) {
    return defaultValue;
}

// ✅ 错误处理
try {
    const data = await edgeConfig.get('key');
} catch (error) {
    // 处理错误
}
```

### 2.3 写入操作
```javascript
// ✅ 正确方式：使用 Vercel REST API
const response = await fetch(`https://api.vercel.com/v1/edge-config/${configId}/items`, {
    method: 'PATCH',
    headers: {
        'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        items: [
            {
                operation: 'upsert',
                key: 'key',
                value: data
            }
        ]
    })
});

// ⚠️ 注意：批量操作是原子的
// 如果一个操作失败，整个请求都会失败
```

### 2.4 数据验证
```javascript
// ✅ 验证更新是否成功
const verifyUpdate = async (configId, key, expectedValue) => {
    // 使用 Edge Config endpoint 验证
    const response = await fetch(
        `https://edge-config.vercel.com/${configId}/item/${key}`,
        {
            headers: {
                'Authorization': `Bearer ${process.env.EDGE_CONFIG_TOKEN}`
            }
        }
    );
    const actualValue = await response.json();
    return JSON.stringify(actualValue) === JSON.stringify(expectedValue);
};

// ✅ 使用 digest 验证版本
const checkVersion = async (configId) => {
    const response = await fetch(
        `https://edge-config.vercel.com/${configId}/digest`,
        {
            headers: {
                'Authorization': `Bearer ${process.env.EDGE_CONFIG_TOKEN}`
            }
        }
    );
    return await response.text();
};
```

## 3. 环境变量配置

### 3.1 必需的环境变量
- \`EDGE_CONFIG\`: Edge Config 连接字符串
- \`VERCEL_API_TOKEN\`: 用于写入操作的 API Token

### 3.2 连接字符串格式
\`\`\`
https://edge-config.vercel.com/<config-id>?token=<access-token>
\`\`\`

## 4. 错误处理

### 4.1 常见错误
1. 环境变量未配置
2. 连接字符串无效
3. API Token 权限不足
4. 数据格式错误

### 4.2 错误处理最佳实践
```javascript
try {
    // 操作代码
} catch (error) {
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);
    // 返回适当的错误响应
}
```

## 5. 性能优化

### 5.1 读取优化
- 使用环境变量存储连接字符串（必须，否则无法获得优化）
- 避免频繁创建客户端实例
- 合理使用缓存
- 使用 edge-config.vercel.com 端点进行读取
- 避免使用 api.vercel.com 端点进行读取操作

### 5.2 写入优化
- 批量更新多个值
- 验证数据更新是否成功
- 适当的重试机制

## 6. 安全性考虑

### 6.1 Token 管理
- 不同环境使用不同的 token
- 定期轮换 API token
- 最小权限原则

### 6.2 数据验证
- 输入数据验证
- 输出数据验证
- 类型检查

## 7. 监控和日志

### 7.1 关键监控指标
- 读取延迟
- 错误率
- API 调用次数

### 7.2 日志最佳实践
```javascript
console.log('操作开始:', { operation: 'read', key: 'example' });
// 操作代码
console.log('操作结果:', { status: 'success', data: result });
```

## 8. 常见陷阱

1. 使用 SDK 进行写入操作
2. 硬编码连接字符串
3. 忽略错误处理
4. 未验证数据格式
5. 未处理默认值

## 9. 调试技巧

1. 使用 `digest()` 检查配置版本
2. 验证环境变量设置
3. 检查 API 响应状态
4. 监控日志输出

## 10. 版本控制和备份

1. 使用 Edge Config 备份功能
2. 记录配置变更历史
3. 环境隔离策略

## 附录：有用的代码片段

### A1. 标准化错误处理
```javascript
function handleEdgeConfigError(error) {
    console.error('Edge Config 错误:', {
        type: error.constructor.name,
        message: error.message,
        stack: error.stack
    });
    return {
        success: false,
        error: error.message,
        errorType: error.constructor.name
    };
}
```

### A2. 数据验证工具
```javascript
function validateEdgeConfigData(data, schema) {
    // 数据验证逻辑
}
```

## 11. API 操作指南

### 11.1 创建 Edge Config
```javascript
// POST https://api.vercel.com/v1/edge-config
const createConfig = async (slug, teamId = null) => {
    const url = teamId 
        ? `https://api.vercel.com/v1/edge-config?teamId=${teamId}`
        : 'https://api.vercel.com/v1/edge-config';
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slug })
    });
    return await response.json();
};
```

### 11.2 批量更新操作
```javascript
// 批量更新示例
const batchUpdate = async (configId, items) => {
    const response = await fetch(
        `https://api.vercel.com/v1/edge-config/${configId}/items`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: items.map(item => ({
                    operation: item.operation,
                    key: item.key,
                    value: item.value
                }))
            })
        }
    );
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`批量更新失败: ${error.error?.message || '未知错误'}`);
    }
    
    return await response.json();
};
```

### 11.3 元数据操作
```javascript
// 获取 Edge Config 元数据
const getMetadata = async (configId) => {
    const response = await fetch(
        `https://api.vercel.com/v1/edge-config/${configId}`,
        {
            headers: {
                'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`
            }
        }
    );
    return await response.json();
};
```

## 12. 集成指南

### 12.1 集成概述
Edge Config 支持与多个第三方服务的集成，主要用于以下场景：
- 功能开关和 A/B 测试
- 在边缘节点评估标志，无需网络调用
- 同步功能标志定义到 Edge Config

### 12.2 支持的集成
1. **LaunchDarkly**
   - 用途：动态功能开关管理
   - 特点：支持在边缘评估标志
   - 限制：需要企业版 LaunchDarkly
   - 配置：需要 Client-side ID

2. **Statsig**
   - 用途：实验和分析
   - 特点：减少客户端加载实验的性能影响
   - 适用：需要精确分析的场景

3. **Hypertune**
   - 用途：性能优化
   - 特点：动态配置管理
   - 适用：需要实时性能调优的场景

4. **Split**
   - 用途：A/B 测试
   - 特点：功能开关和实验
   - 适用：需要精细控制发布的场景

5. **DevCycle**
   - 用途：功能管理
   - 特点：开发周期控制
   - 适用：需要管理功能生命周期的场景

### 12.3 集成最佳实践
```javascript
// 1. 初始化集成（以 LaunchDarkly 为例）
import { init } from '@launchdarkly/vercel-server-sdk';
import { createClient } from '@vercel/edge-config';

const edgeConfigClient = createClient(process.env.EDGE_CONFIG);
const launchDarklyClient = init(process.env.LD_CLIENT_SIDE_ID, edgeConfigClient);

// 2. 使用中间件进行功能控制
export default async function middleware(request) {
    await launchDarklyClient.initFromServerIfNeeded();
    const context = { kind: 'user', key: 'user-key' };
    
    const featureEnabled = await launchDarklyClient.variation(
        'feature-flag-key',
        context,
        false // 默认值
    );

    if (featureEnabled) {
        // 功能启用时的逻辑
    }
}
```

### 12.4 集成注意事项
1. **性能考虑**
   - 使用边缘评估避免额外网络调用
   - 合理设置缓存策略
   - 监控集成对性能的影响

2. **安全性**
   - 妥善保管各服务的密钥
   - 使用环境变量存储敏感信息
   - 定期更新集成凭证

3. **监控和调试**
   - 记录功能开关状态变化
   - 监控实验数据
   - 设置适当的告警机制

4. **故障处理**
   - 实现合理的降级策略
   - 设置默认值
   - 准备回滚方案

### 12.5 集成测试清单
- [ ] 验证环境变量配置
- [ ] 测试功能开关生效情况
- [ ] 验证性能影响
- [ ] 检查错误处理
- [ ] 验证数据同步
- [ ] 测试降级机制 