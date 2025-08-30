#!/usr/bin/env node

/**
 * 简单分页响应式测试脚本
 * 用于快速验证分页组件在不同屏幕尺寸下的显示效果
 */

const fs = require('fs');
const path = require('path');

function generateTestHTML() {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>分页组件响应式测试</title>
    <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .test-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .screen-size-info {
            background: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 14px;
            color: #666;
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
            }
            
            .pagination-container .el-pagination {
                flex-direction: column;
                align-items: center;
                gap: 15px;
                width: 100%;
                font-size: 12px;
            }
            
            /* 第一行：总数和每页条数选择器 */
            .pagination-container .el-pagination .el-pagination__total,
            .pagination-container .el-pagination .el-pagination__sizes {
                margin: 0;
                text-align: center;
            }
            
            /* 第二行：分页导航按钮 */
            .pagination-container .el-pagination .el-pagination__prev,
            .pagination-container .el-pagination .el-pagination__next,
            .pagination-container .el-pagination .el-pager {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .pagination-container .el-pagination .el-pager {
                gap: 8px;
            }
            
            .pagination-container .el-pagination .el-pager li {
                min-width: 32px;
                height: 32px;
                line-height: 32px;
                font-size: 12px;
            }
            
            /* 第三行：跳转输入框 */
            .pagination-container .el-pagination .el-pagination__jump {
                margin: 0;
                text-align: center;
            }
            
            .pagination-container .el-pagination .el-pagination__jump .el-input {
                width: 80px;
            }
            
            /* 确保每行之间有足够的间距 */
            .pagination-container .el-pagination > * {
                margin-bottom: 10px;
            }
            
            .pagination-container .el-pagination > *:last-child {
                margin-bottom: 0;
            }
        }
        
        .test-info {
            background: #e1f5fe;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        
        .test-info h3 {
            margin: 0 0 10px 0;
            color: #0277bd;
        }
        
        .test-info ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .test-info li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="test-container">
        <div class="test-info">
            <h3>分页组件响应式测试</h3>
            <ul>
                <li>调整浏览器窗口大小来测试不同屏幕尺寸下的显示效果</li>
                <li>检查分页组件是否超出容器边界</li>
                <li>验证分页按钮的布局和大小是否合适</li>
                <li>确认文字大小和间距是否清晰可读</li>
            </ul>
        </div>
        
        <div class="screen-size-info">
            当前屏幕宽度: <span id="screen-width"></span>px
        </div>
        
        <div class="pagination-container">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="2388"
                :layout="paginationLayout"
                :small="isSmallScreen"
                :background="true"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </div>

    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/element-plus/dist/index.full.js"></script>
    
    <script>
        const { createApp, ref, computed, onMounted } = Vue;
        
        createApp({
            setup() {
                const currentPage = ref(1);
                const pageSize = ref(50);
                
                // 响应式分页布局
                const paginationLayout = computed(() => {
                    const width = window.innerWidth;
                    if (width < 480) {
                        // 窄屏幕：将左中右组件分成三行显示
                        return 'total, sizes, prev, pager, next, jumper';
                    } else if (width < 640) {
                        return 'total, sizes, prev, pager, next';
                    } else if (width < 768) {
                        return 'total, sizes, prev, pager, next';
                    } else {
                        return 'total, sizes, prev, pager, next, jumper';
                    }
                });
                
                const isSmallScreen = computed(() => {
                    return window.innerWidth < 480;
                });
                
                const handleSizeChange = (size) => {
                    pageSize.value = size;
                    currentPage.value = 1;
                };
                
                const handleCurrentChange = (page) => {
                    currentPage.value = page;
                };
                
                const updateScreenWidth = () => {
                    document.getElementById('screen-width').textContent = window.innerWidth;
                };
                
                onMounted(() => {
                    updateScreenWidth();
                    window.addEventListener('resize', updateScreenWidth);
                });
                
                return {
                    currentPage,
                    pageSize,
                    paginationLayout,
                    isSmallScreen,
                    handleSizeChange,
                    handleCurrentChange
                };
            }
        }).use(ElementPlus).mount('.test-container');
    </script>
</body>
</html>`;

  const outputPath = path.join(__dirname, '../test-screenshots/pagination-test.html');
  fs.writeFileSync(outputPath, html);
  console.log(`✅ 测试页面已生成: ${outputPath}`);
  console.log('🌐 请在浏览器中打开此文件来测试分页组件的响应式效果');
}

// 如果直接运行此脚本
if (require.main === module) {
  generateTestHTML();
}

module.exports = { generateTestHTML };
