#!/usr/bin/env node

/**
 * 菜单导航功能测试脚本
 * 
 * 测试菜单点击和路由跳转功能
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')

console.log('🧪 开始测试菜单导航功能...\n')

async function testMenuNavigation() {
  try {
    // 测试1: 检查App.vue中的handleMenuSelect函数
    console.log('🔍 测试1: 检查菜单点击处理函数')
    const appPath = path.join(__dirname, '../src/App.vue')
    const appExists = await fs.pathExists(appPath)
    
    if (appExists) {
      const appContent = await fs.readFile(appPath, 'utf8')
      
      // 检查关键配置
      const checks = [
        { name: 'handleMenuSelect函数', pattern: /handleMenuSelect/, found: appContent.includes('handleMenuSelect') },
        { name: 'routeMap对象', pattern: /routeMap/, found: appContent.includes('routeMap') },
        { name: 'about路由映射', pattern: /'about': '\/about'/, found: appContent.includes("'about': '/about'") },
        { name: 'router.push调用', pattern: /router\.push/, found: appContent.includes('router.push') }
      ]
      
      checks.forEach(check => {
        console.log(`    ${check.found ? '✅' : '❌'} ${check.name}`)
      })
      
      // 检查是否缺少about路由映射
      if (!appContent.includes("'about': '/about'")) {
        console.log('    ⚠️  缺少about路由映射，这是导致点击无反应的原因')
      }
      
    } else {
      console.log('  ❌ App.vue 文件不存在')
    }
    
    console.log('')
    
    // 测试2: 检查路由配置
    console.log('🔍 测试2: 检查路由配置')
    const routerPath = path.join(__dirname, '../src/router/index.js')
    const routerExists = await fs.pathExists(routerPath)
    
    if (routerExists) {
      const routerContent = await fs.readFile(routerPath, 'utf8')
      
      const routeChecks = [
        { name: 'about路由定义', pattern: /path: '\/about'/, found: routerContent.includes("path: '/about'") },
        { name: 'About组件导入', pattern: /import.*About\.vue/, found: routerContent.includes('About.vue') },
        { name: '页面标题设置', pattern: /title: '关于 - IWMS'/, found: routerContent.includes("title: '关于 - IWMS'") }
      ]
      
      routeChecks.forEach(check => {
        console.log(`    ${check.found ? '✅' : '❌'} ${check.name}`)
      })
    } else {
      console.log('  ❌ 路由配置文件不存在')
    }
    
    console.log('')
    
    // 测试3: 检查菜单配置
    console.log('🔍 测试3: 检查菜单配置')
    if (appExists) {
      const appContent = await fs.readFile(appPath, 'utf8')
      
      const menuChecks = [
        { name: '关于菜单项', pattern: /index="about"/, found: appContent.includes('index="about"') },
        { name: 'InfoFilled图标', pattern: /InfoFilled/, found: appContent.includes('InfoFilled') },
        { name: '菜单点击事件', pattern: /@select="handleMenuSelect"/, found: appContent.includes('@select="handleMenuSelect"') }
      ]
      
      menuChecks.forEach(check => {
        console.log(`    ${check.found ? '✅' : '❌'} ${check.name}`)
      })
    }
    
    console.log('')
    
    // 测试4: 检查About组件
    console.log('🔍 测试4: 检查About组件')
    const aboutPath = path.join(__dirname, '../src/views/About.vue')
    const aboutExists = await fs.pathExists(aboutPath)
    
    if (aboutExists) {
      console.log('  ✅ About.vue 组件文件存在')
      
      const aboutContent = await fs.readFile(aboutPath, 'utf8')
      
      const componentChecks = [
        { name: '组件名称', pattern: /name: 'About'/, found: aboutContent.includes("name: 'About'") },
        { name: 'setup函数', pattern: /setup\(\)/, found: aboutContent.includes('setup()') },
        { name: '版本信息显示', pattern: /{{ version }}/, found: aboutContent.includes('{{ version }}') }
      ]
      
      componentChecks.forEach(check => {
        console.log(`    ${check.found ? '✅' : '❌'} ${check.name}`)
      })
    } else {
      console.log('  ❌ About.vue 组件文件不存在')
    }
    
    console.log('')
    
    // 问题诊断
    console.log('🔍 问题诊断:')
    
    if (appExists) {
      const appContent = await fs.readFile(appPath, 'utf8')
      
      if (!appContent.includes("'about': '/about'")) {
        console.log('  ❌ 问题确认: handleMenuSelect函数中缺少about路由映射')
        console.log('  💡 解决方案: 在routeMap对象中添加 "about": "/about"')
      } else {
        console.log('  ✅ 路由映射配置正确')
      }
      
      if (!appContent.includes('@select="handleMenuSelect"')) {
        console.log('  ❌ 问题确认: 菜单缺少点击事件处理')
        console.log('  💡 解决方案: 在el-menu组件上添加 @select="handleMenuSelect"')
      } else {
        console.log('  ✅ 菜单点击事件配置正确')
      }
    }
    
    console.log('')
    
    // 总结
    console.log('📊 测试总结:')
    console.log('  菜单导航功能测试完成，如果发现问题，请按照上述诊断结果进行修复。')
    
    console.log('\n🎉 菜单导航功能测试完成！')
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message)
    console.error('错误堆栈:', error.stack)
  }
}

// 运行测试
testMenuNavigation()
