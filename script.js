async function validatePassword() {
    const password = document.getElementById('password').value;
    
    try {
        // 这里替换为你的GitHub仓库API地址
        const response = await fetch('https://api.github.com/repos/你的用户名/你的仓库名/contents/password.txt');
        const data = await response.json();
        const correctPassword = atob(data.content).trim(); // 解码Base64内容
        
        if (password === correctPassword) {
            document.getElementById('auth-overlay').style.display = 'none';
            enableControls();
        } else {
            alert('密码错误！');
        }
    } catch (error) {
        console.error('验证失败：', error);
        alert('验证失败，请稍后重试');
    }
}

function enableControls() {
    // 启用所有按钮和输入框
    document.querySelectorAll('button, input').forEach(element => {
        element.disabled = false;
    });
}

// 页面加载时禁用所有控件
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, input').forEach(element => {
        if (element.id !== 'password') {
            element.disabled = true;
        }
    });
}); 