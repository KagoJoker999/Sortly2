# Edge Config 数据同步成功经验

## 成功的同步方法

### 1. 数据读取
```javascript
// 直接使用 Edge Config API 读取数据
const response = await fetch('https://edge-config.vercel.com/ecfg_5r0fmmunrzorhzrucrexlogkes3c/item/productStatus', {
    headers: {
        'Authorization': 'Bearer d09e1aca-a9c1-420d-ad0a-20289785e140'
    }
});

const data = await response.json();
```

### 2. 数据写入
```javascript
// 使用 Vercel API 写入数据
const response = await fetch('https://api.vercel.com/v1/edge-config/ecfg_5r0fmmunrzorhzrucrexlogkes3c/items', {
    method: 'PATCH',
    headers: {
        'Authorization': 'Bearer oSxjtU6MGItqLYBj1iev2Rlp',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        items: [
            {
                operation: 'upsert',
                key: 'productStatus',
                value: {
                    selectedProducts: [...],
                    highlightedProducts: [...],
                    lastUpdate: new Date().toISOString()
                }
            }
        ]
    })
});
```

## 关键配置

### 1. 环境变量
- `EDGE_CONFIG`: `ecfg_5r0fmmunrzorhzrucrexlogkes3c`
- `EDGE_CONFIG_TOKEN`: `d09e1aca-a9c1-420d-ad0a-20289785e140`
- `VERCEL_API_TOKEN`: `oSxjtU6MGItqLYBj1iev2Rlp`

### 2. API 端点
- 读取数据：`https://edge-config.vercel.com/[EDGE_CONFIG_ID]/item/[KEY]`
- 写入数据：`https://api.vercel.com/v1/edge-config/[EDGE_CONFIG_ID]/items`

## 成功经验总结

1. 直接使用 API：
   - 读取时使用 Edge Config API
   - 写入时使用 Vercel API
   - 避免使用中间层 API

2. 认证方式：
   - 读取时使用 `EDGE_CONFIG_TOKEN`
   - 写入时使用 `VERCEL_API_TOKEN`
   - 直接在请求头中使用 token

3. 数据格式：
   - 保持一致的数据结构
   - 包含 `selectedProducts` 和 `highlightedProducts` 数组
   - 记录 `lastUpdate` 时间戳

4. 错误处理：
   - 检查响应状态
   - 处理 JSON 解析错误
   - 验证数据格式

## 注意事项

1. 不要在前端暴露 token
2. 保持数据结构的一致性
3. 及时处理错误情况
4. 验证数据更新是否成功 