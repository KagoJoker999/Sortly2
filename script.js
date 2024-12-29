// 密码验证相关代码
async function verifyPassword() {
    try {
        // 检查是否有有效的登录状态
        const loginStatus = checkLoginStatus();
        if (loginStatus) {
            return true;
        }

        // 如果没有有效的登录状态，则验证密码
        const response = await fetch('password.txt?' + new Date().getTime());
        if (!response.ok) {
            throw new Error('无法获取密码文件');
        }
        const correctPassword = await response.text();
        return correctPassword.trim();
    } catch (error) {
        console.error('获取密码文件失败:', error);
        showToast('系统错误，请刷新页面重试', 'error');
        return null;
    }
}

// 检查登录状态
function checkLoginStatus() {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return false;

    const currentTime = new Date().getTime();
    const timeDiff = currentTime - parseInt(loginTime);
    const hoursLimit = 48;
    
    // 检查是否在48小时内
    if (timeDiff < hoursLimit * 60 * 60 * 1000) {
        return true;
    } else {
        // 清除过期的登录状态
        localStorage.removeItem('loginTime');
        return false;
    }
}

// 保存登录状态
function saveLoginStatus() {
    const currentTime = new Date().getTime();
    localStorage.setItem('loginTime', currentTime.toString());
}

// 处理密码验证
async function handlePasswordVerification() {
    const passwordInput = document.getElementById('password-input');
    const submitButton = document.getElementById('submit-password');
    const container = document.querySelector('.container');
    const passwordModal = document.getElementById('password-modal');
    const pageMask = document.getElementById('page-mask');

    // 确保所有元素都存在
    if (!passwordInput || !submitButton || !container || !passwordModal || !pageMask) {
        console.error('找不到必要的页面元素');
        return;
    }

    // 检查是否有有效的登录状态
    if (checkLoginStatus()) {
        passwordModal.style.display = 'none';
        pageMask.style.display = 'none';
        container.style.display = 'flex';
        return;
    }

    // 回车键提交
    passwordInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });

    submitButton.addEventListener('click', async () => {
        const correctPassword = await verifyPassword();
        if (!correctPassword) {
            return;
        }

        const inputPassword = passwordInput.value.trim();
        if (inputPassword === correctPassword) {
            // 密码正确，保存登录状态
            saveLoginStatus();
            
            // 显示界面
            passwordModal.style.display = 'none';
            pageMask.style.display = 'none';
            container.style.display = 'flex';
            showToast('验证成功', 'success');
        } else {
            // 密码错误
            showToast('密码错误，请重试', 'error');
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
}

// 文件处理相关变量
let selectedFile = null;
let processedData = null;

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    handlePasswordVerification();
    initializeFileUpload();
    initializeConvertButton();
    initializeWeightInputs();
    initializeExpectedSales();
    document.querySelectorAll('input[name="showCount"]').forEach(radio => {
        radio.addEventListener('change', updateTables);
    });
});

// 初始化文件上传功能
function initializeFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const convertButton = document.getElementById('convertFormat');
    const uploadText = document.querySelector('.upload-text p');
    const defaultText = '拖拽文件到此处或';

    // 初始状态下禁用按钮
    convertButton.disabled = true;

    // 拖拽事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
        uploadText.textContent = defaultText;
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    // 文件选择事件
    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    // 点击选择文件按钮时重置文本
    document.querySelector('.upload-text button').addEventListener('click', () => {
        uploadText.textContent = defaultText;
    });
}

// 处理选择的文件
function handleFile(file) {
    if (!file) return;
    
    selectedFile = file;
    
    // 更新上传区域的文本
    const uploadText = document.querySelector('.upload-text p');
    uploadText.textContent = '已上传成功';
    
    // 更新按钮状态和文本
    const convertButton = document.getElementById('convertFormat');
    convertButton.disabled = false;
    convertButton.textContent = '开始分析排名';
    
    showToast('文件上传成功', 'success');

    // 自动聚焦到平均在线人数输入框
    const averageOnlineInput = document.getElementById('average-online');
    averageOnlineInput.focus();
}

// 处理CSV文件
async function processCSVFile(file) {
    try {
        showToast('正在读取CSV文件...');
        const data = await readCSV(file);
        displayRawData(data);
        showToast('CSV文件读取成功');
    } catch (error) {
        console.error('读取CSV文件时出错:', error);
        showToast('读取CSV文件时出错：' + error.message, 'error');
    }
}

// 添加显示Excel转换指导的函数
function showExcelConversionGuide(fileName) {
    showToast(`请将Excel文件转换为CSV格式后再上传`, 'error');
}

// 添加显示提示的函数
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    
    // 重置动画
    toast.style.animation = 'none';
    toast.offsetHeight; // 触发重排
    toast.style.animation = null;
    
    // 设置消息和样式
    toast.textContent = message;
    toast.style.display = 'block';
    
    // 清除所有状态类
    toast.classList.remove('error', 'success');
    
    // 添加对应状态类
    if (type === 'error') {
        toast.classList.add('error');
    } else if (type === 'success') {
        toast.classList.add('success');
    }
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// 修改格式转换按钮初始化
function initializeConvertButton() {
    document.getElementById('convertFormat').addEventListener('click', async () => {
        if (!selectedFile) {
            showToast('请先选择文件！', 'error');
            return;
        }

        const averageOnline = document.getElementById('average-online').value;
        const transactionRatio = document.getElementById('transaction-ratio').value;
        
        if (!averageOnline || averageOnline <= 0) {
            showToast('请先填写有效的平均在线人数！', 'error');
            return;
        }

        if (!transactionRatio || transactionRatio <= 0) {
            showToast('请先填写有效的成交比例要求！', 'error');
            return;
        }

        const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
        try {
            showToast('正在读取文件并分析数据...');
            let data;
            if (fileExt === '.xlsx' || fileExt === '.xls') {
                data = await readExcel(selectedFile);
            } else {
                showToast('不支持的文件格式，请上传Excel文件！', 'error');
                return;
            }
            
            // 显示原始数据
            displayRawData(data);
            
            // 自动进行分析
            calculateAndDisplayScores();
            
            showToast('数据分析完成', 'success');
        } catch (error) {
            console.error('处理文件时出错:', error);
            showToast('处理文件时出错：' + error.message, 'error');
        }
    });
}

// 修改初始化分析按钮
function initializeAnalysisButton() {
    document.getElementById('startAnalysis').addEventListener('click', async () => {
        const averageOnline = document.getElementById('average-online').value;
        const transactionRatio = document.getElementById('transaction-ratio').value;
        
        if (!averageOnline || averageOnline <= 0) {
            showToast('请先填写有效的平均在线人数！', 'error');
            return;
        }

        if (!transactionRatio || transactionRatio <= 0) {
            showToast('请先填写有效的成交比例要求！', 'error');
            return;
        }

        if (!processedData) {
            showToast('请先读取或转换文件！', 'error');
            return;
        }

        try {
            showToast('正在计算得分...');
            calculateAndDisplayScores();
            showToast('得分计算完成', 'success');
        } catch (error) {
            console.error('处理文件时出错:', error);
            showToast('处理文件时出错：' + error.message, 'error');
        }
    });
}

// 修改处理文件函数
async function processFile(file, averageOnline) {
    try {
        const rawData = await readFileData(file);
        processedData = rawData;
        displayRawData(rawData);
    } catch (error) {
        console.error('处理文件出错:', error);
        alert('处理文件时出错：' + error.message);
    }
}

// 修改计算得分函数
function calculateAndDisplayScores() {
    if (!processedData) {
        showToast('请先读取或转换文件！', 'error');
        return;
    }
    
    const averageOnline = document.getElementById('average-online').value;
    if (!averageOnline || averageOnline <= 0) {
        showToast('请先填写有效的平均在线人数！', 'error');
        return;
    }
    
    try {
        // 提取所需数据
        const extractedData = extractRequiredData(processedData);
        if (!extractedData || extractedData.length === 0) {
            showToast('数据提取失败！', 'error');
            return;
        }
        
        // 计算得分
        const scoredData = calculateEfficiencyScores(extractedData);
        if (!scoredData) {
            showToast('计算得分失败，请检查权重设置！', 'error');
            return;
        }
        
        // 更新处理后的数据
        processedData = scoredData;
        
        // 更新排名表格显示
        updateTables();
        
        showToast('得分计算完成', 'success');
    } catch (error) {
        console.error('计算得分时出错:', error);
        showToast('计算得分时出错：' + error.message, 'error');
    }
}

// 添加显示基础数据的函数
function displayRawData(data) {
    const container = document.getElementById('rawDataContainer');
    container.innerHTML = ''; // 清空现有内容
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'raw-data-table';
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>商品ID</th>
        <th>商品名称</th>
        <th>讲解次数</th>
        <th>成交件数</th>
        <th>曝光点击率</th>
        <th>点击成交率</th>
        <th>讲解效率分</th>
        <th>曝光点击分</th>
        <th>点击成交分</th>
        <th>成交件数分</th>
        <th>基础总分</th>
        <th>加权总分</th>
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 计算得分
    const adjustedOnline = getAdjustedOnlineCount();
    const transactionRatio = parseFloat(document.getElementById('transaction-ratio').value) || 10;
    const explanationRatio = parseFloat(document.getElementById('explanation-ratio').value) / 100 || 0.1;
    const weights = getWeights();
    if (!weights) return;

    const scoredData = data.map(row => {
        // 基础数据转换
        const explanationCount = parseFloat(row['讲解次数']) || 0.9;
        const transactionCount = parseFloat(row['成交件数']) || 0;
        
        // 处理点击率
        let clickRate = 0;
        if (row['曝光点击率']) {
            const rateStr = row['曝光点击率'].toString().replace('%', '');
            clickRate = parseFloat(rateStr);
        }
        
        // 处理转化率
        let conversionRate = 0;
        if (row['点击成交率']) {
            const convStr = row['点击成交率'].toString().replace('%', '');
            conversionRate = parseFloat(convStr);
        }
        
        // 计算各项得分（基础分）
        let efficiencyScore = (transactionCount / explanationCount) / (adjustedOnline * explanationRatio) * 100;
        efficiencyScore = Math.min(Math.max(0, efficiencyScore), 100);
        
        let exposureScore = clickRate * 5;
        exposureScore = Math.min(exposureScore, 100);
        
        let conversionScore = conversionRate * 10;
        conversionScore = Math.min(conversionScore, 100);
        
        let transactionScore = (transactionCount / adjustedOnline * 100) / transactionRatio * 100;
        transactionScore = Math.min(transactionScore, 100);
        
        // 计算加权得分
        const weightedEfficiencyScore = efficiencyScore * weights.efficiencyWeight;
        const weightedExposureScore = exposureScore * weights.exposureWeight;
        const weightedConversionScore = conversionScore * weights.conversionWeight;
        const weightedTransactionScore = transactionScore * weights.transactionWeight;
        
        // 计算总分
        const totalScore = 
            weightedTransactionScore +
            weightedExposureScore +
            weightedEfficiencyScore +
            weightedConversionScore;
        
        return {
            ...row,
            efficiencyScore: weightedEfficiencyScore,
            exposureScore: weightedExposureScore,
            conversionScore: weightedConversionScore,
            transactionScore: weightedTransactionScore,
            totalScore
        };
    });
    
    // 创建表体
    const tbody = document.createElement('tbody');
    scoredData.forEach(row => {
        const tr = document.createElement('tr');
        const productName = row['商品名称'] || '';
        const truncatedName = productName.length > 10 ? productName.substring(0, 10) + '...' : productName;
        
        // 计算基础分
        const explanationCount = parseFloat(row['讲解次数']) || 0.9;
        const transactionCount = parseFloat(row['成交件数']) || 0;
        const explanationRatio = parseFloat(document.getElementById('explanation-ratio').value) / 100 || 0.1;
        
        // 讲解效率基础分
        let efficiencyScore = (transactionCount / explanationCount) / (adjustedOnline * explanationRatio) * 100;
        efficiencyScore = Math.max(0, Math.min(efficiencyScore, 100));
        
        // 曝光点击基础分
        let clickRate = 0;
        if (row['曝光点击率']) {
            const rateStr = row['曝光点击率'].toString().replace('%', '');
            clickRate = parseFloat(rateStr);
        }
        let exposureScore = clickRate * 5;
        exposureScore = Math.min(exposureScore, 100);
        
        // 点击成交基础分
        let conversionRate = 0;
        if (row['点击成交率']) {
            const convStr = row['点击成交率'].toString().replace('%', '');
            conversionRate = parseFloat(convStr);
        }
        let conversionScore = conversionRate * 10;
        conversionScore = Math.min(conversionScore, 100);
        
        // 成交件数基础分
        let transactionScore = (transactionCount / adjustedOnline * 100) / transactionRatio * 100;
        transactionScore = Math.min(transactionScore, 100);
        
        // 计算加权总分
        const totalScore = 
            transactionScore * weights.transactionWeight +
            exposureScore * weights.exposureWeight +
            efficiencyScore * weights.efficiencyWeight +
            conversionScore * weights.conversionWeight;
        
        tr.innerHTML = `
            <td>${row['商品ID'] || ''}</td>
            <td title="${productName}">${truncatedName}</td>
            <td>${row['讲解次数'] || '0'}</td>
            <td>${row['成交件数'] || '0'}</td>
            <td>${row['曝光点击率'] || '0%'}</td>
            <td>${row['点击成交率'] || '0%'}</td>
            <td class="calculated-score">${efficiencyScore.toFixed(2)}分</td>
            <td class="calculated-score">${exposureScore.toFixed(2)}分</td>
            <td class="calculated-score">${conversionScore.toFixed(2)}分</td>
            <td class="calculated-score">${transactionScore.toFixed(2)}分</td>
            <td class="base-total-score">${(efficiencyScore + exposureScore + conversionScore + transactionScore).toFixed(2)}分</td>
            <td class="total-score">${totalScore.toFixed(2)}分</td>
        `;
        tbody.appendChild(tr);
        
        // 保存完整的数据供排名使用
        return {
            ...row,
            name: productName,
            id: row['商品ID'],
            efficiencyBaseScore: efficiencyScore,
            exposureBaseScore: exposureScore,
            conversionBaseScore: conversionScore,
            transactionBaseScore: transactionScore,
            efficiencyScore: efficiencyScore * weights.efficiencyWeight,
            exposureScore: exposureScore * weights.exposureWeight,
            conversionScore: conversionScore * weights.conversionWeight,
            transactionScore: transactionScore * weights.transactionWeight,
            rankingScore: totalScore
        };
    });
    table.appendChild(tbody);
    
    // 添加到容器
    container.appendChild(table);
    container.style.display = 'block';
    
    // 保存计算后的数据
    processedData = scoredData;
    
    // 更新四个排名表格
    updateTables();
}

// 更新进度条
function updateProgress(percentage, text) {
    const progressElement = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-text');
    
    progressElement.style.width = `${percentage}%`;
    progressText.textContent = text;
}

// 读取文件数据
async function readFileData(file) {
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (fileExt === '.csv') {
        return readCSV(file);
    } else {
        return readExcel(file);
    }
}

// 读取CSV文件
async function readCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const data = parseCSV(csvText);
                resolve(data);
            } catch (error) {
                reject(new Error('CSV文件格式错误'));
            }
        };
        reader.onerror = () => reject(new Error('文件读取错误'));
        reader.readAsText(file);
    });
}

// 解析CSV文本
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('实际的CSV表头:', headers);
    
    // 新列名映射关系
    const columnMap = {
        '商品名称': ['商品名称', '产品名称'],
        '商品ID': ['商品ID', '产品ID'],
        '讲解次数': ['讲解次数'],
        '成交件数': ['成交件数'],
        '曝光点击率': ['商品曝光-点击率（人数）', '商品曝光-点击率', '曝光点击率'],
        '点击成交率': ['商品点击-成交转化率（人数）', '商品点击-成交转化率', '点击成交率']
    };
    
    // 打每个要查找的列名
    console.log('要查找的列名:');
    for (const [key, aliases] of Object.entries(columnMap)) {
        console.log(`${key}: ${JSON.stringify(aliases)}`);
    }
    
    // 创建列名索引映射
    const columnIndexMap = {};
    for (const [key, aliases] of Object.entries(columnMap)) {
        // 对每个表头进行详细的匹配检查
        headers.forEach((header, idx) => {
            console.log(`比较表头 "${header}" 与别名 ${JSON.stringify(aliases)}`);
        });
        
        const index = headers.findIndex(h => aliases.includes(h));
        if (index !== -1) {
            columnIndexMap[key] = index;
            console.log(`✓ 找到列 "${key}" 在索引 ${index}, 对应表头: "${headers[index]}"`);
        } else {
            console.warn(`未找到列 "${key}", 尝试过的别名: ${JSON.stringify(aliases)}`);
        }
    }
    
    // 打印最终的映射结果
    console.log('最终的映射结果:', columnIndexMap);
    
    const data = [];
    // 处理所有行数据
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        console.log(`第${i}行原数据:`, values);
        
        const row = {};
        for (const [key, index] of Object.entries(columnIndexMap)) {
            if (index !== undefined) {
                row[key] = values[index];
                console.log(`第${i}行 ${key}: ${values[index]}`);
            }
        }
        
        if (row['商品名称'] && row['商品ID']) {
            data.push(row);
        }
    }
    
    console.log('解析后的数据总数:', data.length);
    return data;
}

// 添Excel读取功能
async function readExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                // 处理数据格式
                const headers = jsonData[0];
                console.log('Excel表头:', headers);

                // 列名映射关系
                const columnMap = {
                    '商品名称': ['商品名称', '产品名称'],
                    '商品ID': ['商品ID', '产品ID'],
                    '讲解次数': ['讲解次数'],
                    '成交件数': ['成交件数'],
                    '曝光点击率': ['商品曝光-点击率（人数）', '商品曝光-点击率', '曝光点击率'],
                    '点击成交率': ['商品点击-成交转化率（人数）', '商品点击-成交转化率', '点击成交率']
                };

                // 创建列名索引映射
                const columnIndexMap = {};
                for (const [key, aliases] of Object.entries(columnMap)) {
                    const index = headers.findIndex(h => aliases.includes(h));
                    if (index !== -1) {
                        columnIndexMap[key] = index;
                        console.log(`✓ 找到列 "${key}" 在索引 ${index}, 对应表头: "${headers[index]}"`);
                    } else {
                        console.warn(`未找到列 "${key}", 尝试过的别名: ${JSON.stringify(aliases)}`);
                    }
                }

                // 处理数据行
                const rows = jsonData.slice(1).map(row => {
                    const obj = {};
                    for (const [key, index] of Object.entries(columnIndexMap)) {
                        if (index !== undefined) {
                            obj[key] = row[index];
                        }
                    }
                    return obj;
                });

                console.log('处理后的数据示例:', rows.slice(0, 2));
                resolve(rows);
            } catch (error) {
                console.error('Excel处理错误:', error);
                reject(new Error('Excel文件格式错误'));
            }
        };
        reader.onerror = () => reject(new Error('文件读取错误'));
        reader.readAsArrayBuffer(file);
    });
}

// 换数据为CSV格式
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header] || '';
            // 处理包含逗号的值
            return value.toString().includes(',') ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

// 下载CSV文件
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 处理点击率的函数
function processClickRate(value) {
    if (!value) return 0;
    let rateStr = value.toString().replace(/[^0-9.]/g, '');
    console.log('处理点击率:', value, '→', rateStr);
    return parseFloat(rateStr) || 0;
}

// 提取所需数据
function extractRequiredData(data) {
    return data.map((row, index) => {
        try {
            console.log(`处理第${index + 1}行数据:`, row);
            
            const explanationCount = parseFloat(row['讲解次数']) || 0;
            const transactionCount = parseFloat(row['成交件数']) || 0;
            
            // 处理点击率
            const clickRate = processClickRate(row['曝光点击率']);
            console.log(`点击率处理: 原始值=${row['曝光点击率']}, 处理后=${clickRate}`);
            
            // 处理转化率
            const conversionRate = processClickRate(row['点击成交率']);
            console.log(`转化率处理: 原始值=${row['点击成交率']}, 处理后=${conversionRate}`);

            const result = {
                name: row['商品名称'],
                id: row['商品ID'],
                explanationCount,
                transactionCount,
                exposureClickRate: clickRate,
                clickTransactionRate: conversionRate
            };
            
            console.log(`提取的数据:`, result);
            return result;
        } catch (error) {
            console.error('处理行数据时出错:', error, row);
            return null;
        }
    }).filter(item => item !== null);
}

// 获取权重值
function getWeights() {
    const efficiencyWeight = parseFloat(document.getElementById('efficiency-weight').value) / 100;
    const exposureWeight = parseFloat(document.getElementById('exposure-weight').value) / 100;
    const conversionWeight = parseFloat(document.getElementById('conversion-weight').value) / 100;
    const transactionWeight = parseFloat(document.getElementById('transaction-weight').value) / 100;

    // 验证权重总和是否为1
    const totalWeight = efficiencyWeight + exposureWeight + conversionWeight + transactionWeight;
    if (Math.abs(totalWeight - 1) > 0.01) {
        showToast('权重之和必须为100%', 'error');
        return null;
    }

    return {
        efficiencyWeight,
        exposureWeight,
        conversionWeight,
        transactionWeight
    };
}

// 获取调整后的在线人数
function getAdjustedOnlineCount() {
    const rawCount = parseFloat(document.getElementById('average-online').value) || 0;
    return Math.max(0, rawCount - CONFIG.ONLINE_ADJUSTMENT);
}

// 修改计算期望成交单量的函数
function calculateExpectedSales() {
    const adjustedOnline = getAdjustedOnlineCount();
    const explanationRatio = parseFloat(document.getElementById('explanation-ratio').value) || 0;
    const expectedSales = Math.round(adjustedOnline * explanationRatio / 100);
    document.getElementById('expected-sales').textContent = expectedSales;
}

// 修改计算效率分数的函数
function calculateEfficiencyScores(data) {
    const adjustedOnline = getAdjustedOnlineCount();
    const transactionRatio = parseFloat(document.getElementById('transaction-ratio').value) || 10;
    console.log('调整后的平均在线人数:', adjustedOnline);
    console.log('成交比例要求:', transactionRatio);
    
    const weights = getWeights();
    if (!weights) return null;
    
    return data.map((item, index) => {
        try {
            console.log(`计算第${index + 1}行得分:`, item);
            
            // 1. 讲解效率分（基础分）
            const explanationCount = parseFloat(item.explanationCount) || 0.9;
            const transactionCount = parseFloat(item.transactionCount) || 0;
            const explanationRatio = parseFloat(document.getElementById('explanation-ratio').value) / 100 || 0.1;
            
            // 使用调整后的在线人数计算讲解效率基础分
            let efficiencyBaseScore = (transactionCount / explanationCount) / (adjustedOnline * explanationRatio) * 100;
            efficiencyBaseScore = Math.max(0, Math.min(efficiencyBaseScore, 100));
            
            const efficiencyScore = efficiencyBaseScore * weights.efficiencyWeight;
            console.log(`讲解效率分计算: min(max(0, (${transactionCount} / ${explanationCount}) / (${adjustedOnline} * ${explanationRatio}) * 100), 100) * ${weights.efficiencyWeight} = ${efficiencyScore}`);

            // 2. 曝光点击分（基础分）
            let exposureBaseScore = item.exposureClickRate * 5;
            exposureBaseScore = Math.min(exposureBaseScore, 100);
            const exposureScore = exposureBaseScore * weights.exposureWeight;

            // 3. 点击成交分（基础分）
            let conversionBaseScore = item.clickTransactionRate * 10;
            conversionBaseScore = Math.min(conversionBaseScore, 100);
            const conversionScore = conversionBaseScore * weights.conversionWeight;

            // 4. 成交件数分（基础分）- 使用调整后的在线人数
            let transactionBaseScore = (transactionCount / adjustedOnline * 100) / transactionRatio * 100;
            transactionBaseScore = Math.min(transactionBaseScore, 100);
            const transactionScore = transactionBaseScore * weights.transactionWeight;

            // 计算总分
            const rankingScore = efficiencyScore + exposureScore + conversionScore + transactionScore;

            return {
                name: item.name,
                id: item.id,
                efficiencyBaseScore: parseFloat(efficiencyBaseScore.toFixed(2)),
                exposureBaseScore: parseFloat(exposureBaseScore.toFixed(2)),
                conversionBaseScore: parseFloat(conversionBaseScore.toFixed(2)),
                transactionBaseScore: parseFloat(transactionBaseScore.toFixed(2)),
                efficiencyScore: parseFloat(efficiencyScore.toFixed(2)),
                exposureScore: parseFloat(exposureScore.toFixed(2)),
                conversionScore: parseFloat(conversionScore.toFixed(2)),
                transactionScore: parseFloat(transactionScore.toFixed(2)),
                rankingScore: parseFloat(rankingScore.toFixed(2))
            };
        } catch (error) {
            console.error('计算分数时出错:', error);
            return null;
        }
    }).filter(item => item !== null);
}

// 添加权重输入验证
function initializeWeightInputs() {
    const weightInputs = [
        'efficiency-weight',
        'exposure-weight',
        'conversion-weight',
        'transaction-weight'
    ];

    weightInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            const value = parseFloat(e.target.value);
            if (value < 0) e.target.value = 0;
            if (value > 100) e.target.value = 100;
            
            // 计算总和
            const total = weightInputs.reduce((sum, inputId) => {
                return sum + parseFloat(document.getElementById(inputId).value);
            }, 0);
            
            if (total !== 100) {
                showToast('所有权重之和必须为100%', 'error');
            }
        });
    });
}

function updateTables() {
    if (!processedData || processedData.length === 0) {
        console.log('没有可显示的数据，processedData:', processedData);
        return;
    }

    const showCount = parseInt(document.querySelector('input[name="showCount"]:checked').value);
    console.log('要显示的数据条数:', showCount);
    
    try {
        // 按总分排序
        const sortedData = sortByTotal(processedData);
        console.log('排序后的数据:', sortedData);
        
        // 更新综合排名表格
        updateTable('comprehensive-table', sortedData, showCount);
    } catch (error) {
        console.error('更新表格时出错:', error);
        showToast('更新表格时出错：' + error.message, 'error');
    }
}

function updateTable(tableId, data, limit) {
    const tbody = document.getElementById(tableId);
    if (!tbody) {
        console.error(`找不到表格：${tableId}`);
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!data || !Array.isArray(data)) {
        console.error('无效的数据');
        return;
    }

    data.slice(0, limit).forEach((item, index) => {
        const row = document.createElement('tr');
        const name = item.name || '';
        const truncatedName = name.length > 10 ? name.substring(0, 10) + '...' : name;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td title="${name}">${truncatedName}</td>
            <td>${item.id || ''}</td>
            <td class="calculated-score" title="基础分：${item.efficiencyBaseScore}分">${item.efficiencyScore.toFixed(1)}分</td>
            <td class="calculated-score" title="基础分：${item.exposureBaseScore}分">${item.exposureScore.toFixed(1)}分</td>
            <td class="calculated-score" title="基础分：${item.conversionBaseScore}分">${item.conversionScore.toFixed(1)}分</td>
            <td class="calculated-score" title="基础分：${item.transactionBaseScore}分">${item.transactionScore.toFixed(1)}分</td>
            <td class="total-score">${item.rankingScore.toFixed(1)}分</td>
        `;
        tbody.appendChild(row);
    });
}

// 排序函数
function sortByTotal(data) {
    // 先过滤掉不需要的产品，再按总分排序
    return [...data]
        .filter(item => !item.name.includes('泡菜国手工发夹发饰发'))
        .sort((a, b) => b.rankingScore - a.rankingScore);
}

function sortByEfficiency(data) {
    return [...data]
        .filter(item => !item.name.includes('泡菜国手工发夹发饰发'))
        .sort((a, b) => b.efficiencyScore - a.efficiencyScore);
}

function sortByExposure(data) {
    return [...data]
        .filter(item => !item.name.includes('泡菜国手工发夹发饰发'))
        .sort((a, b) => b.exposureScore - a.exposureScore);
}

function sortByTransaction(data) {
    return [...data]
        .filter(item => !item.name.includes('泡菜国手工发夹发饰发'))
        .sort((a, b) => b.transactionScore - a.transactionScore);
}

// 初始化期望成交单量计算
function initializeExpectedSales() {
    // 监听平均在线人数变化
    document.getElementById('average-online').addEventListener('input', calculateExpectedSales);
    // 监听讲解期望成交比例变化
    document.getElementById('explanation-ratio').addEventListener('input', calculateExpectedSales);
    // 初始计算一次
    calculateExpectedSales();
}

// 权重预设功能
document.addEventListener('DOMContentLoaded', function() {
    const presetSelect = document.getElementById('weight-preset');
    const editPresetBtn = document.getElementById('edit-preset');
    
    // 从本地存储加载预设
    function loadSavedPresets() {
        const savedPresets = localStorage.getItem('weightPresets');
        if (savedPresets) {
            try {
                const parsedPresets = JSON.parse(savedPresets);
                // 更新全局预设对象
                Object.assign(weightPresets, parsedPresets);
            } catch (error) {
                console.error('加载预设失败:', error);
            }
        }
    }
    
    // 加载预设
    function loadPreset(presetKey) {
        const preset = weightPresets[presetKey];
        if (!preset) return;
        
        document.getElementById('efficiency-weight').value = preset.weights.efficiency;
        document.getElementById('exposure-weight').value = preset.weights.exposure;
        document.getElementById('conversion-weight').value = preset.weights.conversion;
        document.getElementById('transaction-weight').value = preset.weights.transaction;
    }
    
    // 保存预设
    function savePreset(presetKey, weights) {
        weightPresets[presetKey].weights = weights;
        // 保存到本地存储
        localStorage.setItem('weightPresets', JSON.stringify(weightPresets));
    }
    
    // 创建编辑预设对话框
    function createPresetEditModal(presetKey) {
        const modal = document.createElement('div');
        modal.className = 'preset-edit-modal';
        const preset = weightPresets[presetKey];
        
        modal.innerHTML = `
            <div class="preset-edit-content">
                <h2>编辑${preset.name}预设</h2>
                <div class="weight-group">
                    <label>讲解效率分权重：</label>
                    <div class="weight-input-group">
                        <input type="number" class="form-input" id="edit-efficiency" value="${preset.weights.efficiency}" min="0" max="100">
                        <span class="weight-unit">%</span>
                    </div>
                </div>
                <div class="weight-group">
                    <label>曝光点击分权重：</label>
                    <div class="weight-input-group">
                        <input type="number" class="form-input" id="edit-exposure" value="${preset.weights.exposure}" min="0" max="100">
                        <span class="weight-unit">%</span>
                    </div>
                </div>
                <div class="weight-group">
                    <label>点击成交分权重：</label>
                    <div class="weight-input-group">
                        <input type="number" class="form-input" id="edit-conversion" value="${preset.weights.conversion}" min="0" max="100">
                        <span class="weight-unit">%</span>
                    </div>
                </div>
                <div class="weight-group">
                    <label>成交件数分权重：</label>
                    <div class="weight-input-group">
                        <input type="number" class="form-input" id="edit-transaction" value="${preset.weights.transaction}" min="0" max="100">
                        <span class="weight-unit">%</span>
                    </div>
                </div>
                <div class="preset-edit-buttons">
                    <button class="action-button" id="cancel-edit">取消</button>
                    <button class="action-button" id="save-preset">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const mask = document.getElementById('page-mask');
        mask.style.display = 'block';
        
        // 绑定事件
        document.getElementById('cancel-edit').onclick = () => {
            modal.remove();
            mask.style.display = 'none';
        };
        
        document.getElementById('save-preset').onclick = () => {
            const newWeights = {
                efficiency: parseInt(document.getElementById('edit-efficiency').value),
                exposure: parseInt(document.getElementById('edit-exposure').value),
                conversion: parseInt(document.getElementById('edit-conversion').value),
                transaction: parseInt(document.getElementById('edit-transaction').value)
            };
            
            // 验证权重总和是否为100
            const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
            if (sum !== 100) {
                showToast('权重总和必须为100%', 'error');
                return;
            }
            
            savePreset(presetKey, newWeights);
            loadPreset(presetKey);
            modal.remove();
            mask.style.display = 'none';
            showToast('预设保存成功', 'success');
        };
    }
    
    // 绑定预设选择事件
    presetSelect.addEventListener('change', function() {
        loadPreset(this.value);
    });
    
    // 绑定编辑按钮事件
    editPresetBtn.addEventListener('click', function() {
        const currentPreset = presetSelect.value;
        createPresetEditModal(currentPreset);
    });
    
    // 初始化时加载保存的预设
    loadSavedPresets();
    // 初始加载默认预设
    loadPreset(presetSelect.value);
});

// 初始化表格
updateTables(); 