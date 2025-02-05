// 配置参数
const CONFIG = {
    // 在线人数调整值
    ONLINE_ADJUSTMENT: 0  // 从填写的平均在线人数中减去的值
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 
