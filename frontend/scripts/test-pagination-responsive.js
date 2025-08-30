#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 生成分页组件响应式测试页面...');

// 测试页面内容
const testPageContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>分页组件响应式测试</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .test-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .test-header {
            background: #409eff;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .test-header h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .test-header p {
            opacity: 0.9;
            font-size: 14px;
        }
        
        .test-content {
            padding: 30px;
        }
        
        .screen-size-info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 30px;
            text-align: center;
            font-family: monospace;
            font-size: 14px;
        }
        
        .pagination-container {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px 0;
            flex-wrap: wrap;
            gap: 10px;
            background: #fafafa;
            border-radius: 6px;
            margin: 20px 0;
            overflow: hidden;
            max-width: 100%;
            box-sizing: border-box;
            position: relative;
        }
        
        /* 模拟 Element Plus 分页组件样式 */
        .el-pagination {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            color: #606266;
        }
        
        .el-pagination__total {
            margin-right: 10px;
        }
        
        .el-pagination__sizes {
            margin-right: 10px;
        }
        
        .el-pagination__sizes .el-select {
            width: 110px;
        }
        
        .el-pagination__prev,
        .el-pagination__next {
            min-width: 32px;
            height: 32px;
            line-height: 32px;
            text-align: center;
            background: white;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .el-pagination__prev:hover,
        .el-pagination__next:hover {
            color: #409eff;
            border-color: #409eff;
        }
        
        .el-pager {
            display: flex;
            list-style: none;
            gap: 5px;
        }
        
        .el-pager li {
            min-width: 32px;
            height: 32px;
            line-height: 32px;
            text-align: center;
            background: white;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .el-pager li:hover {
            color: #409eff;
            border-color: #409eff;
        }
        
        .el-pager li.is-active {
            background: #409eff;
            color: white;
            border-color: #409eff;
        }
        
        .el-pagination__jump {
            margin-left: 10px;
        }
        
        .el-pagination__jump .el-input {
            width: 50px;
            margin: 0 5px;
        }
        
        .el-input__inner {
            width: 100%;
            height: 32px;
            line-height: 32px;
            padding: 0 8px;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            text-align: center;
        }
        
        .el-select .el-input__inner {
            text-align: left;
        }
        
        /* 响应式分页样式 */
        @media (max-width: 768px) {
            .pagination-container {
                justify-content: center;
                padding: 15px 10px;
                margin: 20px 10px;
            }
            
            .pagination-container .el-pagination {
                font-size: 12px;
                width: 100%;
                justify-content: center;
            }
            
            .pagination-container .el-pagination .el-pagination__sizes {
                margin-right: 10px;
            }
            
            .pagination-container .el-pagination .el-pagination__total {
                font-size: 12px;
            }
        }
        
        @media (max-width: 640px) {
            .pagination-container {
                padding: 15px 8px;
                margin: 20px 8px;
            }
            
            .pagination-container .el-pagination {
                font-size: 11px;
            }
            
            .pagination-container .el-pagination .el-pagination__sizes {
                margin-right: 8px;
            }
            
            .pagination-container .el-pagination .el-pagination__total {
                font-size: 11px;
            }
        }
        
        @media (max-width: 480px) {
            .pagination-container {
                flex-direction: column;
                align-items: center;
                gap: 15px;
                padding: 20px 10px;
                margin: 20px 10px;
                width: calc(100% - 20px);
                box-sizing: border-box;
            }
            
            .pagination-container .el-pagination {
                flex-direction: column;
                align-items: center;
                gap: 15px;
                width: 100%;
                font-size: 12px;
                max-width: 100%;
                overflow: hidden;
            }
            
            /* 第一行：总数和每页条数选择器 */
            .pagination-container .el-pagination .el-pagination__total,
            .pagination-container .el-pagination .el-pagination__sizes {
                margin: 0;
                text-align: center;
                width: 100%;
                max-width: 100%;
            }
            
            /* 第二行：分页导航按钮 */
            .pagination-container .el-pagination .el-pagination__prev,
            .pagination-container .el-pagination .el-pagination__next,
            .pagination-container .el-pagination .el-pager {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                max-width: 100%;
                flex-wrap: wrap;
            }
            
            .pagination-container .el-pagination .el-pager {
                gap: 8px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .pagination-container .el-pagination .el-pager li {
                min-width: 32px;
                height: 32px;
                line-height: 32px;
                font-size: 12px;
                margin: 2px;
            }
            
            /* 第三行：跳转输入框 */
            .pagination-container .el-pagination .el-pagination__jump {
                margin: 0;
                text-align: center;
                width: 100%;
                max-width: 100%;
            }
            
            .pagination-container .el-pagination .el-pagination__jump .el-input {
                width: 80px;
                max-width: 100%;
            }
            
            /* 确保每行之间有足够的间距 */
            .pagination-container .el-pagination > * {
                margin-bottom: 10px;
                width: 100%;
                max-width: 100%;
            }
            
            .pagination-container .el-pagination > *:last-child {
                margin-bottom: 0;
            }
            
            /* 确保选择器不会超出容器 */
            .pagination-container .el-pagination .el-pagination__sizes .el-select {
                width: 100%;
                max-width: 120px;
            }
            
            /* 确保总数显示不会换行 */
            .pagination-container .el-pagination .el-pagination__total {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
        
        /* 极窄屏幕优化 */
        @media (max-width: 360px) {
            .pagination-container {
                padding: 15px 5px;
                margin: 15px 5px;
                width: calc(100% - 10px);
                gap: 10px;
            }
            
            .pagination-container .el-pagination {
                gap: 10px;
                font-size: 11px;
            }
            
            .pagination-container .el-pagination .el-pager li {
                min-width: 28px;
                height: 28px;
                line-height: 28px;
                font-size: 11px;
                margin: 1px;
            }
            
            .pagination-container .el-pagination .el-pagination__jump .el-input {
                width: 60px;
            }
            
            .pagination-container .el-pagination .el-pagination__sizes .el-select {
                max-width: 100px;
            }
        }
        
        .test-notes {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 20px;
            margin-top: 30px;
        }
        
        .test-notes h3 {
            color: #856404;
            margin-bottom: 15px;
        }
        
        .test-notes ul {
            color: #856404;
            padding-left: 20px;
        }
        
        .test-notes li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="test-container">
        <div class="test-header">
            <h1>分页组件响应式测试</h1>
            <p>测试分页组件在不同屏幕尺寸下的显示效果</p>
        </div>
        
        <div class="test-content">
            <div class="screen-size-info">
                当前屏幕宽度: <span id="screen-width">-</span>px | 
                当前屏幕高度: <span id="screen-height">-</span>px |
                设备像素比: <span id="device-pixel-ratio">-</span>
            </div>
            
            <h2>分页组件测试</h2>
            <p>请调整浏览器窗口大小，观察分页组件的响应式变化：</p>
            
            <div class="pagination-container">
                <div class="el-pagination">
                    <span class="el-pagination__total">共 388 条</span>
                    <div class="el-pagination__sizes">
                        <div class="el-select">
                            <div class="el-input">
                                <input class="el-input__inner" value="50条/页" readonly>
                            </div>
                        </div>
                    </div>
                    <button class="el-pagination__prev">‹</button>
                    <ul class="el-pager">
                        <li class="is-active">1</li>
                        <li>2</li>
                        <li>3</li>
                        <li>4</li>
                        <li>5</li>
                        <li>6</li>
                        <li>...</li>
                        <li>48</li>
                    </ul>
                    <button class="el-pagination__next">›</button>
                    <span class="el-pagination__jump">
                        前往 <div class="el-input">
                            <input class="el-input__inner" placeholder="页">
                        </div> 页
                    </span>
                </div>
            </div>
            
            <div class="test-notes">
                <h3>测试说明</h3>
                <ul>
                    <li><strong>≥ 768px</strong>: 完整布局，所有组件在一行显示</li>
                    <li><strong>640px - 767px</strong>: 简化布局，移除跳转功能</li>
                    <li><strong>480px - 639px</strong>: 进一步简化，调整字体大小</li>
                    <li><strong>360px - 479px</strong>: 三行布局，确保完整显示</li>
                    <li><strong>&lt; 360px</strong>: 极窄屏幕优化，最小化尺寸</li>
                </ul>
            </div>
        </div>
    </div>
    
    <script>
        // 更新屏幕尺寸信息
        function updateScreenInfo() {
            document.getElementById('screen-width').textContent = window.innerWidth;
            document.getElementById('screen-height').textContent = window.innerHeight;
            document.getElementById('device-pixel-ratio').textContent = window.devicePixelRatio || 1;
        }
        
        // 页面加载时更新
        updateScreenInfo();
        
        // 窗口大小改变时更新
        window.addEventListener('resize', updateScreenInfo);
        
        // 添加分页按钮交互效果
        document.querySelectorAll('.el-pager li').forEach(li => {
            li.addEventListener('click', function() {
                document.querySelectorAll('.el-pager li').forEach(item => item.classList.remove('is-active'));
                this.classList.add('is-active');
            });
        });
        
        // 添加分页按钮交互效果
        document.querySelectorAll('.el-pagination__prev, .el-pagination__next').forEach(btn => {
            btn.addEventListener('click', function() {
                const activeLi = document.querySelector('.el-pager li.is-active');
                const currentPage = parseInt(activeLi.textContent);
                
                if (this.classList.contains('el-pagination__prev') && currentPage > 1) {
                    document.querySelectorAll('.el-pager li').forEach(item => item.classList.remove('is-active'));
                    document.querySelector(\`.el-pager li:nth-child(\${currentPage - 1})\`).classList.add('is-active');
                } else if (this.classList.contains('el-pagination__next') && currentPage < 48) {
                    document.querySelectorAll('.el-pager li').forEach(item => item.classList.remove('is-active'));
                    document.querySelector(\`.el-pager li:nth-child(\${currentPage + 1})\`).classList.add('is-active');
                }
            });
        });
    </script>
</body>
</html>`;

// 确保目录存在
const testDir = path.join(__dirname, '../test-screenshots');
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}

// 写入测试页面
const testPagePath = path.join(testDir, 'pagination-responsive-test.html');
fs.writeFileSync(testPagePath, testPageContent, 'utf8');

console.log('✅ 分页组件响应式测试页面已生成:');
console.log(`   📁 文件路径: ${testPagePath}`);
console.log('');
console.log('🌐 使用方法:');
console.log('   1. 在浏览器中打开测试页面');
console.log('   2. 调整浏览器窗口大小');
console.log('   3. 观察分页组件的响应式变化');
console.log('');
console.log('📱 测试断点:');
console.log('   - ≥ 768px: 完整布局');
console.log('   - 640px - 767px: 简化布局');
console.log('   - 480px - 639px: 进一步简化');
console.log('   - 360px - 479px: 三行布局');
console.log('   - < 360px: 极窄屏幕优化');
