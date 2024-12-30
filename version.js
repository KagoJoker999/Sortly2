const APP_VERSION = 'v1.0.4';

// 在页面加载时自动设置版本号
document.addEventListener('DOMContentLoaded', () => {
    const versionTags = document.getElementsByClassName('version-tag');
    for (let tag of versionTags) {
        tag.textContent = APP_VERSION;
    }
}); 