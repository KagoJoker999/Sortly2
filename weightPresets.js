const weightPresets = {
    exposureConversion: {
        name: "曝光成交率优先",
        weights: {
            efficiency: 15,
            exposure: 35,
            conversion: 35,
            transaction: 15
        }
    },
    transactionCount: {
        name: "成交件数优先",
        weights: {
            efficiency: 15,
            exposure: 15,
            conversion: 20,
            transaction: 50
        }
    },
    efficiency: {
        name: "讲解效率优先",
        weights: {
            efficiency: 50,
            exposure: 20,
            conversion: 15,
            transaction: 15
        }
    },
    custom: {
        name: "自定义",
        weights: {
            efficiency: 25,
            exposure: 25,
            conversion: 25,
            transaction: 25
        }
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = weightPresets;
} 
