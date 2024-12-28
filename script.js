document.addEventListener('DOMContentLoaded', () => {
    // 监听显示数量选择的变化
    document.querySelectorAll('input[name="showCount"]').forEach(radio => {
        radio.addEventListener('change', updateTables);
    });
});

// 示例数据 - 实际项目中应该从后端获取
const mockData = [
    {
        name: "产品A",
        id: "P001",
        efficiencyScore: 95,
        exposureScore: 88,
        conversionScore: 92,
        transactionScore: 90,
        totalScore: 91.25
    },
    // ... 可以添加更多示例数据
];

function updateTables() {
    const showCount = parseInt(document.querySelector('input[name="showCount"]:checked').value);
    
    // 更新四个表格
    updateTable('comprehensive-table', sortByTotal(mockData), showCount);
    updateTable('efficiency-table', sortByEfficiency(mockData), showCount);
    updateTable('exposure-table', sortByExposure(mockData), showCount);
    updateTable('transaction-table', sortByTransaction(mockData), showCount);
}

function updateTable(tableId, data, limit) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = '';
    
    data.slice(0, limit).forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.id}</td>
            <td>${item.efficiencyScore}</td>
            <td>${item.exposureScore}</td>
            <td>${item.conversionScore}</td>
            <td>${item.transactionScore}</td>
            <td>${item.totalScore}</td>
        `;
        tbody.appendChild(row);
    });
}

// 排序函数
function sortByTotal(data) {
    return [...data].sort((a, b) => b.totalScore - a.totalScore);
}

function sortByEfficiency(data) {
    return [...data].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
}

function sortByExposure(data) {
    return [...data].sort((a, b) => b.exposureScore - a.exposureScore);
}

function sortByTransaction(data) {
    return [...data].sort((a, b) => b.transactionScore - a.transactionScore);
}

// 初始化表格
updateTables(); 