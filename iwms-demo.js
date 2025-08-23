#!/usr/bin/env node

/**
 * IWMS 智能文件管理解决方案测试脚本
 * 用于演示和测试核心功能
 */

const fs = require('fs-extra');
const path = require('path');

// 测试数据
const testMapping = [
  ['A-0008', '112'],
  ['B-0010', '223'],
  ['C-0015', '456']
];

// 图片压缩测试
const compressionTest = {
  maxDimension: 1920,
  testImages: [
    { name: 'A-0008 (1).jpg', originalSize: '4000x3000', compressedSize: '1920x1440' },
    { name: 'A-0008 (2).jpg', originalSize: '3000x4000', compressedSize: '1440x1920' },
    { name: 'A-0008.jpg', originalSize: '2000x1500', compressedSize: '1920x1440' },
    { name: 'B-0010.png', originalSize: '1000x800', compressedSize: '1000x800' }
  ]
};

// 测试文件名解析函数
function parseFileName(fileName) {
  // 匹配带编号的文件名: filename (1).ext
  const numberedPattern = /^(.+?)\s*\((\d+)\)(\.[^.]+)$/
  const match = fileName.match(numberedPattern)
  
  if (match) {
    return {
      base: match[1].trim(),
      sequence: match[2],
      extension: match[3]
    }
  }
  
  // 匹配不带编号的文件名: filename.ext
  const simplePattern = /^(.+?)(\.[^.]+)$/
  const simpleMatch = fileName.match(simplePattern)
  
  if (simpleMatch) {
    return {
      base: simpleMatch[1].trim(),
      sequence: null,
      extension: simpleMatch[2]
    }
  }
  
  // 无扩展名的情况
  return {
    base: fileName,
    sequence: null,
    extension: ''
  }
}

// 测试文件名
const testFiles = [
  'A-0008 (1).jpg',
  'A-0008 (2).jpg',
  'A-0008.jpg',
  'B-0010.png',
  'C-0015 (1).pdf',
  'C-0015 (2).pdf',
  'D-0020.txt',  // 未在映射表中
  'E-0025.doc'   // 未在映射表中
];

// 图片文件扩展名
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg', '.ico'];

// 过滤图片文件
const imageFiles = testFiles.filter(fileName => {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return imageExtensions.includes(ext);
});

const nonImageFiles = testFiles.filter(fileName => {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return !imageExtensions.includes(ext);
});

console.log('=== 文件重命名工具测试 ===\n');

console.log('1. 映射表:');
testMapping.forEach(([oldName, newName]) => {
  console.log(`   ${oldName} → ${newName}`);
});

console.log('\n2. 文件名解析测试:');
testFiles.forEach(fileName => {
  const parsed = parseFileName(fileName);
  console.log(`   ${fileName}`);
  console.log(`     主名: "${parsed.base}"`);
  console.log(`     编号: ${parsed.sequence || '无'}`);
  console.log(`     扩展名: ${parsed.extension || '无'}`);
  console.log('');
});

console.log('3. 重命名结果预览:');
const mappingMap = new Map(testMapping);

testFiles.forEach(fileName => {
  const parsed = parseFileName(fileName);
  
  if (mappingMap.has(parsed.base)) {
    const newBase = mappingMap.get(parsed.base);
    let newFileName = newBase;
    
    if (parsed.sequence) {
      newFileName += ` (${parsed.sequence})`;
    }
    
    if (parsed.extension) {
      newFileName += parsed.extension;
    }
    
    console.log(`   ${fileName} → ${newFileName} ✓`);
  } else {
    console.log(`   ${fileName} → 保持不变 (未命中映射) ⚠`);
  }
});

console.log('\n4. 图片文件过滤:');
console.log(`   图片文件 (${imageFiles.length}个):`);
imageFiles.forEach(file => console.log(`     ${file}`));
console.log(`   非图片文件 (${nonImageFiles.length}个):`);
nonImageFiles.forEach(file => console.log(`     ${file}`));

console.log('\n5. 统计信息:');
const matchedCount = testFiles.filter(fileName => {
  const parsed = parseFileName(fileName);
  return mappingMap.has(parsed.base);
}).length;

const skippedCount = testFiles.length - matchedCount;

console.log(`   总文件数: ${testFiles.length}`);
console.log(`   命中文件: ${matchedCount}`);
console.log(`   跳过文件: ${skippedCount}`);
console.log(`   命中率: ${((matchedCount / testFiles.length) * 100).toFixed(1)}%`);

// 仅图片文件的统计
const matchedImageCount = imageFiles.filter(fileName => {
  const parsed = parseFileName(fileName);
  return mappingMap.has(parsed.base);
}).length;

console.log(`\n   仅图片文件统计:`);
console.log(`   图片文件总数: ${imageFiles.length}`);
console.log(`   命中图片文件: ${matchedImageCount}`);
console.log(`   图片文件命中率: ${((matchedImageCount / imageFiles.length) * 100).toFixed(1)}%`);

console.log('\n6. 图片压缩功能演示:');
console.log(`   压缩设置: 最长边 ${compressionTest.maxDimension} 像素`);
console.log('   压缩效果预览:');
compressionTest.testImages.forEach(img => {
  if (img.originalSize === img.compressedSize) {
    console.log(`     ${img.name}: ${img.originalSize} → 无需压缩 (已小于限制) ✓`);
  } else {
    console.log(`     ${img.name}: ${img.originalSize} → ${img.compressedSize} ✓`);
  }
});

console.log('\n=== 测试完成 ===');
console.log('\n要启动完整应用，请运行:');
console.log('  npm run electron:dev');
console.log('或');
console.log('  ./start.sh');
