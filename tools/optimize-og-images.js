#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置優化選項
const OPTIMIZATION_CONFIG = {
  webp: {
    quality: 75,
    effort: 6
  },
  png: {
    quality: 75,
    compressionLevel: 9,
    adaptiveFiltering: true,
    palette: true
  }
};

async function optimizeImage(inputPath, outputPath, format = 'webp') {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Processing: ${path.basename(inputPath)}`);
    console.log(`  Original: ${metadata.format}, ${metadata.width}x${metadata.height}`);

    let processor = image;

    if (format === 'webp') {
      processor = processor.webp(OPTIMIZATION_CONFIG.webp);
    } else if (format === 'png') {
      processor = processor.png(OPTIMIZATION_CONFIG.png);
    }

    await processor.toFile(outputPath);

    // 檢查檔案大小比較
    const originalStats = fs.statSync(inputPath);
    const optimizedStats = fs.statSync(outputPath);
    const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);

    console.log(`  Original size: ${(originalStats.size / 1024).toFixed(1)}KB`);
    console.log(`  Optimized size: ${(optimizedStats.size / 1024).toFixed(1)}KB`);
    console.log(`  Savings: ${savings}%\n`);

    return {
      originalSize: originalStats.size,
      optimizedSize: optimizedStats.size,
      savings: parseFloat(savings)
    };
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return null;
  }
}

async function findOGImages(directory) {
  const images = [];

  function walkDir(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (stat.isFile() && /\.(png|jpg|jpeg)$/i.test(item)) {
        images.push(fullPath);
      }
    }
  }

  walkDir(directory);
  return images;
}

async function main() {
  const ogDir = 'public/images/og';
  const backupDir = 'public/images/og-backup';

  console.log('🖼️  OG 圖片優化開始...\n');

  // 創建備份目錄
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('✅ 創建備份目錄\n');
  }

  // 尋找所有 OG 圖片
  const images = await findOGImages(ogDir);
  console.log(`📁 找到 ${images.length} 張圖片\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let successCount = 0;

  for (const imagePath of images) {
    const relativePath = path.relative(ogDir, imagePath);
    const backupPath = path.join(backupDir, relativePath);
    const backupDirPath = path.dirname(backupPath);

    // 確保備份目錄存在
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    // 備份原檔案
    fs.copyFileSync(imagePath, backupPath);

    // 優化為 WebP 格式
    const webpPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const result = await optimizeImage(imagePath, webpPath, 'webp');

    if (result) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
      successCount++;

      // 刪除原始 PNG 檔案，保留 WebP
      fs.unlinkSync(imagePath);
    }
  }

  const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);

  console.log('🎉 優化完成！');
  console.log('================');
  console.log(`📊 處理成功: ${successCount}/${images.length} 張圖片`);
  console.log(`💾 原始總大小: ${(totalOriginalSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`🗜️  優化後大小: ${(totalOptimizedSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`📉 總節省空間: ${((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(1)}MB (${totalSavings}%)`);
  console.log(`🔄 格式轉換: PNG → WebP`);
  console.log(`📁 備份位置: ${backupDir}`);
}

// 執行主函數
main().catch(console.error);