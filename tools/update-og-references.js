#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 需要更新的檔案模式
const filePatterns = [
  'src/content/**/*.mdx',
  'src/pages/**/*.astro',
  'src/pages/**/*.ts'
];

async function findFiles(pattern) {
  const files = [];

  function walkDir(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (stat.isFile() && (item.endsWith('.mdx') || item.endsWith('.astro') || item.endsWith('.ts'))) {
        files.push(fullPath);
      }
    }
  }

  walkDir('src');
  return files;
}

function updateFileContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // 替換 OG 圖片路徑：/images/og/xxx.png -> /images/og/xxx.webp
  const updatedContent = content.replace(
    /\/images\/og\/([^"'\s]+)\.png/g,
    '/images/og/$1.webp'
  );

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ 更新: ${filePath}`);
    return true;
  }

  return false;
}

async function main() {
  console.log('🔄 開始更新 OG 圖片引用...\n');

  const files = await findFiles();
  let updatedCount = 0;

  console.log(`📁 找到 ${files.length} 個檔案\n`);

  for (const filePath of files) {
    if (updateFileContent(filePath)) {
      updatedCount++;
    }
  }

  console.log(`\n🎉 更新完成！`);
  console.log(`📊 已更新 ${updatedCount} 個檔案`);
  console.log(`🔄 PNG → WebP 引用替換完成`);
}

main().catch(console.error);