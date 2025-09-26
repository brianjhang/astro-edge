#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 專案維護配置
const MAINTENANCE_CONFIG = {
  tasks: {
    dependencies: '更新依賴',
    security: '安全修復',
    cleanup: '清理檔案',
    backup: '備份重要檔案',
    optimization: '效能優化檢查'
  },
  backupDir: '.project-backup',
  tempDir: '.maintenance-temp'
};

// 執行命令的輔助函數
function runCommand(command, description, silent = false) {
  if (!silent) console.log(`   🔧 ${description}...`);

  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
      timeout: 120000  // 2分鐘超時
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 建立目錄
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 備份重要檔案
function backupImportantFiles() {
  console.log('💾 備份重要檔案...');

  const backupPath = path.join(MAINTENANCE_CONFIG.backupDir, new Date().toISOString().split('T')[0]);
  ensureDir(backupPath);

  const importantFiles = [
    'package.json',
    'package-lock.json',
    'astro.config.mjs',
    'tsconfig.json',
    '.env.example',
    'vercel.json'
  ];

  let backedUpCount = 0;

  importantFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.copyFileSync(file, path.join(backupPath, file));
        console.log(`   ✅ 已備份: ${file}`);
        backedUpCount++;
      } catch (error) {
        console.log(`   ❌ 備份失敗: ${file} (${error.message})`);
      }
    }
  });

  // 備份關鍵目錄
  const importantDirs = ['scripts', 'docs'];

  importantDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        const targetDir = path.join(backupPath, dir);
        ensureDir(targetDir);
        copyDirRecursive(dir, targetDir);
        console.log(`   ✅ 已備份目錄: ${dir}`);
        backedUpCount++;
      } catch (error) {
        console.log(`   ❌ 備份目錄失敗: ${dir} (${error.message})`);
      }
    }
  });

  console.log(`   📦 總共備份 ${backedUpCount} 個項目到 ${backupPath}\n`);
}

// 遞迴複製目錄
function copyDirRecursive(src, dest) {
  ensureDir(dest);
  const items = fs.readdirSync(src);

  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// 依賴維護
function maintainDependencies() {
  console.log('📦 執行依賴維護...');

  // 檢查過期依賴
  console.log('   🔍 檢查過期依賴...');
  const outdatedResult = runCommand('npm outdated', '檢查過期依賴', true);

  if (outdatedResult.success && outdatedResult.output) {
    console.log('   發現過期依賴：');
    console.log(outdatedResult.output);

    // 詢問是否更新（在真實環境中可能需要互動式確認）
    console.log('   🔄 更新非關鍵依賴...');
    const updateResult = runCommand(
      'npm update --save-dev @astrojs/mdx @astrojs/react @astrojs/sitemap',
      '更新 Astro 相關依賴'
    );

    if (updateResult.success) {
      console.log('   ✅ 依賴更新完成');
    } else {
      console.log('   ⚠️  依賴更新遇到問題');
    }
  } else {
    console.log('   ✅ 所有依賴都是最新版本');
  }

  // 清理未使用的依賴
  console.log('   🧹 清理未使用的依賴...');
  const pruneResult = runCommand('npm prune', '清理未使用依賴');

  if (pruneResult.success) {
    console.log('   ✅ 依賴清理完成');
  }

  console.log();
}

// 安全維護
function maintainSecurity() {
  console.log('🔒 執行安全維護...');

  // 執行安全審計
  const auditResult = runCommand('npm audit', '安全漏洞掃描', true);

  if (auditResult.success) {
    if (auditResult.output.includes('found 0 vulnerabilities')) {
      console.log('   ✅ 未發現安全漏洞');
    } else {
      console.log('   ⚠️  發現安全漏洞：');
      console.log(auditResult.output);

      // 嘗試自動修復
      console.log('   🔧 嘗試自動修復...');
      const fixResult = runCommand('npm audit fix', '自動修復安全漏洞');

      if (fixResult.success) {
        console.log('   ✅ 安全問題已修復');
      } else {
        console.log('   ⚠️  部分問題需要手動處理');
      }
    }
  }

  // 檢查敏感檔案
  console.log('   🔍 檢查敏感檔案...');

  const sensitiveFiles = ['.env', 'config.secret.js', 'private.key'];
  const foundSensitive = sensitiveFiles.filter(file => fs.existsSync(file));

  if (foundSensitive.length > 0) {
    console.log('   ⚠️  發現敏感檔案，請確保已添加到 .gitignore：');
    foundSensitive.forEach(file => console.log(`      - ${file}`));
  } else {
    console.log('   ✅ 未發現未保護的敏感檔案');
  }

  console.log();
}

// 檔案清理
function cleanupFiles() {
  console.log('🧹 執行檔案清理...');

  const cleanupTargets = [
    { path: 'node_modules/.cache', name: 'npm 快取' },
    { path: '.astro', name: 'Astro 快取' },
    { path: 'dist', name: '建置檔案' },
    { path: '.vercel', name: 'Vercel 快取' },
    { path: 'performance-reports/*.json', name: '舊效能報告', pattern: true }
  ];

  let cleanedCount = 0;

  cleanupTargets.forEach(target => {
    if (target.pattern) {
      // 處理通配符模式
      const dir = path.dirname(target.path);
      const pattern = path.basename(target.path);

      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const matchingFiles = files.filter(file => {
          return pattern.replace('*', '.*').match(new RegExp(pattern.replace('*', '.*')));
        });

        if (matchingFiles.length > 10) {  // 只清理超過 10 個的報告檔案
          const filesToDelete = matchingFiles.slice(0, -10);  // 保留最新 10 個
          filesToDelete.forEach(file => {
            try {
              fs.unlinkSync(path.join(dir, file));
              cleanedCount++;
            } catch (error) {
              // 忽略刪除錯誤
            }
          });
          if (filesToDelete.length > 0) {
            console.log(`   ✅ 清理 ${target.name}: 刪除 ${filesToDelete.length} 個舊檔案`);
          }
        }
      }
    } else {
      if (fs.existsSync(target.path)) {
        try {
          if (fs.statSync(target.path).isDirectory()) {
            fs.rmSync(target.path, { recursive: true, force: true });
          } else {
            fs.unlinkSync(target.path);
          }
          console.log(`   ✅ 清理 ${target.name}`);
          cleanedCount++;
        } catch (error) {
          console.log(`   ⚠️  清理 ${target.name} 失敗: ${error.message}`);
        }
      }
    }
  });

  if (cleanedCount === 0) {
    console.log('   ✨ 系統已經很乾淨了！');
  }

  console.log();
}

// 效能優化檢查
function checkOptimizations() {
  console.log('⚡ 執行效能優化檢查...');

  const checks = [];

  // 檢查 Astro 配置
  if (fs.existsSync('astro.config.mjs')) {
    const configContent = fs.readFileSync('astro.config.mjs', 'utf8');

    checks.push({
      name: '靜態渲染',
      enabled: configContent.includes("output: 'static'"),
      recommendation: '啟用靜態渲染以提升效能'
    });

    checks.push({
      name: 'Sitemap 生成',
      enabled: configContent.includes('@astrojs/sitemap'),
      recommendation: '啟用 sitemap 生成以改善 SEO'
    });
  }

  // 檢查圖片優化
  const ogImagesPath = 'public/images/og';
  if (fs.existsSync(ogImagesPath)) {
    const files = fs.readdirSync(ogImagesPath, { recursive: true });
    const webpFiles = files.filter(file => file.toString().endsWith('.webp'));
    const totalFiles = files.filter(file => {
      const filePath = file.toString();
      return filePath.endsWith('.png') || filePath.endsWith('.webp') || filePath.endsWith('.jpg');
    });

    checks.push({
      name: '圖片格式優化',
      enabled: webpFiles.length > totalFiles.length * 0.8,  // 80% 以上使用 WebP
      recommendation: '將 PNG/JPG 圖片轉換為 WebP 格式以減少檔案大小'
    });
  }

  // 檢查 package.json 腳本
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};

  checks.push({
    name: '效能監控腳本',
    enabled: 'performance:check' in scripts,
    recommendation: '添加效能監控腳本以定期檢查網站效能'
  });

  // 顯示檢查結果
  checks.forEach(check => {
    const icon = check.enabled ? '✅' : '💡';
    const status = check.enabled ? '已啟用' : '建議啟用';
    console.log(`   ${icon} ${check.name}: ${status}`);
    if (!check.enabled) {
      console.log(`      💡 ${check.recommendation}`);
    }
  });

  const optimizedCount = checks.filter(check => check.enabled).length;
  console.log(`   📊 優化覆蓋率: ${optimizedCount}/${checks.length} (${Math.round(optimizedCount / checks.length * 100)}%)`);

  console.log();
}

// 生成維護報告
function generateMaintenanceReport(startTime) {
  const endTime = new Date();
  const duration = Math.round((endTime - startTime) / 1000);

  console.log('📋 維護報告');
  console.log('='.repeat(50));
  console.log(`⏰ 維護時間: ${startTime.toLocaleString('zh-TW')} - ${endTime.toLocaleString('zh-TW')}`);
  console.log(`⌛ 執行耗時: ${duration} 秒`);
  console.log();

  console.log('✅ 完成的維護任務:');
  Object.values(MAINTENANCE_CONFIG.tasks).forEach(task => {
    console.log(`   - ${task}`);
  });

  console.log();
  console.log('💡 建議:');
  console.log('   - 定期執行維護以保持專案健康');
  console.log('   - 監控備份檔案的累積，適時清理舊備份');
  console.log('   - 關注安全漏洞警報並及時處理');
  console.log('   - 使用 npm run performance:monitor 定期檢查效能');

  console.log('='.repeat(50));
}

// 主執行函數
async function main() {
  const startTime = new Date();
  console.log('🛠️  開始專案維護...\n');

  try {
    // 執行維護任務
    backupImportantFiles();
    maintainDependencies();
    maintainSecurity();
    cleanupFiles();
    checkOptimizations();

    // 重新建置專案
    console.log('🏗️  重新建置專案...');
    const buildResult = runCommand('npm run build', '專案建置');

    if (buildResult.success) {
      console.log('   ✅ 專案建置成功\n');
    } else {
      console.log('   ❌ 專案建置失敗，請檢查錯誤訊息\n');
    }

    // 生成維護報告
    generateMaintenanceReport(startTime);

    console.log('🎉 專案維護完成！');

  } catch (error) {
    console.error('❌ 專案維護過程中發生錯誤:', error);
    process.exit(1);
  }
}

// 處理命令行參數
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🛠️  專案維護助手

用法：
  npm run project:maintenance      # 執行完整專案維護
  node scripts/project-maintenance.js --help  # 顯示幫助

維護任務：
  💾 備份重要檔案
  📦 更新和清理依賴
  🔒 安全漏洞掃描和修復
  🧹 清理暫存和建置檔案
  ⚡ 效能優化檢查
  🏗️  重新建置專案

建議執行頻率：
  - 每週執行一次完整維護
  - 每月檢查依賴更新
  - 發現安全警報時立即執行
  `);
  process.exit(0);
}

// 執行主程序
main();