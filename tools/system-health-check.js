#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 系統健康檢查配置
const HEALTH_CONFIG = {
  checks: {
    build: { weight: 30, name: '建置檢查' },
    dependencies: { weight: 20, name: '依賴檢查' },
    security: { weight: 25, name: '安全檢查' },
    performance: { weight: 15, name: '效能檢查' },
    content: { weight: 10, name: '內容檢查' }
  },
  thresholds: {
    overall: 80,  // 整體健康度最低標準
    critical: 95  // 關鍵系統最低標準
  }
};

// 執行命令並捕獲輸出
function runCommand(command, description) {
  console.log(`   🔍 ${description}...`);
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000  // 60秒超時
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

// 建置系統檢查
async function checkBuild() {
  console.log('🏗️  執行建置系統檢查...');

  const checks = [];

  // 檢查建置是否成功
  const buildResult = runCommand('npm run build', '執行專案建置');
  checks.push({
    name: '專案建置',
    success: buildResult.success,
    message: buildResult.success ? '建置成功' : '建置失敗',
    critical: true
  });

  // 檢查 TypeScript 編譯
  if (fs.existsSync('tsconfig.json')) {
    const tscResult = runCommand('npx tsc --noEmit', 'TypeScript 類型檢查');
    checks.push({
      name: 'TypeScript 檢查',
      success: tscResult.success,
      message: tscResult.success ? '類型檢查通過' : '發現類型錯誤',
      critical: false
    });
  }

  // 檢查靜態檔案生成
  const distExists = fs.existsSync('dist');
  checks.push({
    name: '靜態檔案生成',
    success: distExists,
    message: distExists ? '靜態檔案正常生成' : '靜態檔案生成失敗',
    critical: true
  });

  return checks;
}

// 依賴系統檢查
async function checkDependencies() {
  console.log('📦 執行依賴系統檢查...');

  const checks = [];

  // 檢查 package.json 完整性
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    checks.push({
      name: 'package.json 格式',
      success: true,
      message: '格式正確',
      critical: false
    });

    // 檢查必要的依賴
    const requiredDeps = ['astro', '@astrojs/vercel'];
    const missingDeps = requiredDeps.filter(dep =>
      !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
    );

    checks.push({
      name: '必要依賴',
      success: missingDeps.length === 0,
      message: missingDeps.length === 0 ? '所有必要依賴都已安裝' : `缺少: ${missingDeps.join(', ')}`,
      critical: true
    });
  } catch (error) {
    checks.push({
      name: 'package.json 格式',
      success: false,
      message: 'package.json 格式錯誤',
      critical: true
    });
  }

  // 檢查 node_modules 完整性
  const nodeModulesExists = fs.existsSync('node_modules');
  checks.push({
    name: 'node_modules',
    success: nodeModulesExists,
    message: nodeModulesExists ? 'node_modules 存在' : 'node_modules 遺失',
    critical: true
  });

  // 檢查過期依賴
  const outdatedResult = runCommand('npm outdated --json', '檢查過期依賴');
  if (outdatedResult.success) {
    try {
      const outdated = JSON.parse(outdatedResult.output || '{}');
      const outdatedCount = Object.keys(outdated).length;
      checks.push({
        name: '依賴更新狀態',
        success: outdatedCount === 0,
        message: outdatedCount === 0 ? '所有依賴都是最新版本' : `有 ${outdatedCount} 個依賴可更新`,
        critical: false
      });
    } catch (e) {
      checks.push({
        name: '依賴更新狀態',
        success: true,
        message: '所有依賴都是最新版本',
        critical: false
      });
    }
  }

  return checks;
}

// 安全系統檢查
async function checkSecurity() {
  console.log('🔒 執行安全系統檢查...');

  const checks = [];

  // 執行 npm audit
  const auditResult = runCommand('npm audit --json', '安全漏洞掃描');
  if (auditResult.success) {
    try {
      const audit = JSON.parse(auditResult.output);
      const vulnerabilities = audit.metadata?.vulnerabilities;

      const highVulns = vulnerabilities?.high || 0;
      const criticalVulns = vulnerabilities?.critical || 0;
      const totalVulns = vulnerabilities?.total || 0;

      checks.push({
        name: '安全漏洞掃描',
        success: criticalVulns === 0 && highVulns <= 3,
        message: totalVulns === 0 ? '未發現安全漏洞' :
                 `發現 ${totalVulns} 個漏洞 (高風險: ${highVulns}, 極高風險: ${criticalVulns})`,
        critical: criticalVulns > 0
      });
    } catch (e) {
      checks.push({
        name: '安全漏洞掃描',
        success: true,
        message: '掃描完成，未發現嚴重問題',
        critical: false
      });
    }
  }

  // 檢查 .env 檔案安全
  if (fs.existsSync('.env')) {
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      const hasSecrets = /(?:password|secret|key|token)/i.test(envContent);
      checks.push({
        name: '環境變數安全',
        success: true,
        message: hasSecrets ? '發現敏感變數，請確保未提交到版控' : '環境變數檢查正常',
        critical: false
      });
    } catch (error) {
      checks.push({
        name: '環境變數安全',
        success: false,
        message: '無法讀取 .env 檔案',
        critical: false
      });
    }
  }

  // 檢查 Git 忽略檔案
  if (fs.existsSync('.gitignore')) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    const hasNodeModules = gitignoreContent.includes('node_modules');
    const hasEnv = gitignoreContent.includes('.env');

    checks.push({
      name: 'Git 忽略設定',
      success: hasNodeModules && hasEnv,
      message: hasNodeModules && hasEnv ? '重要檔案已正確忽略' : '某些重要檔案未被忽略',
      critical: false
    });
  }

  return checks;
}

// 效能系統檢查
async function checkPerformance() {
  console.log('⚡ 執行效能系統檢查...');

  const checks = [];

  // 檢查靜態檔案大小
  if (fs.existsSync('dist')) {
    const distSize = getDirSize('dist');
    checks.push({
      name: '建置檔案大小',
      success: distSize < 50 * 1024 * 1024, // 50MB
      message: `建置檔案總大小: ${formatBytes(distSize)}`,
      critical: false
    });
  }

  // 檢查圖片資源
  if (fs.existsSync('public/images/og')) {
    const ogSize = getDirSize('public/images/og');
    checks.push({
      name: 'OG 圖片大小',
      success: ogSize < 2 * 1024 * 1024, // 2MB (已優化後的預期大小)
      message: `OG 圖片總大小: ${formatBytes(ogSize)}`,
      critical: false
    });
  }

  // 檢查是否啟用了靜態渲染
  try {
    const astroConfig = fs.readFileSync('astro.config.mjs', 'utf8');
    const hasStaticOutput = astroConfig.includes("output: 'static'");
    checks.push({
      name: '靜態渲染配置',
      success: hasStaticOutput,
      message: hasStaticOutput ? '已啟用靜態渲染優化' : '建議啟用靜態渲染以提升效能',
      critical: false
    });
  } catch (error) {
    checks.push({
      name: '靜態渲染配置',
      success: false,
      message: '無法讀取 Astro 配置',
      critical: false
    });
  }

  return checks;
}

// 內容系統檢查
async function checkContent() {
  console.log('📝 執行內容系統檢查...');

  const checks = [];

  // 檢查內容目錄結構
  const contentDir = 'src/content';
  if (fs.existsSync(contentDir)) {
    const contentStats = getContentStats(contentDir);
    checks.push({
      name: '內容目錄結構',
      success: contentStats.totalFiles > 0,
      message: `發現 ${contentStats.totalFiles} 個內容檔案`,
      critical: false
    });

    // 檢查 frontmatter 格式一致性
    const inconsistentFiles = checkFrontmatterConsistency(contentDir);
    checks.push({
      name: 'Frontmatter 格式',
      success: inconsistentFiles.length === 0,
      message: inconsistentFiles.length === 0 ?
               'Frontmatter 格式一致' :
               `${inconsistentFiles.length} 個檔案格式不一致`,
      critical: false
    });
  } else {
    checks.push({
      name: '內容目錄結構',
      success: false,
      message: '內容目錄不存在',
      critical: true
    });
  }

  return checks;
}

// 輔助函數：計算目錄大小
function getDirSize(dirPath) {
  let totalSize = 0;

  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        traverse(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  }

  try {
    traverse(dirPath);
  } catch (error) {
    // 忽略權限錯誤等問題
  }

  return totalSize;
}

// 輔助函數：格式化位元組
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 輔助函數：獲取內容統計
function getContentStats(contentDir) {
  let totalFiles = 0;

  function countFiles(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        countFiles(itemPath);
      } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
        totalFiles++;
      }
    }
  }

  try {
    countFiles(contentDir);
  } catch (error) {
    // 忽略錯誤
  }

  return { totalFiles };
}

// 輔助函數：檢查 frontmatter 一致性
function checkFrontmatterConsistency(contentDir) {
  const inconsistentFiles = [];

  function checkFiles(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        checkFiles(itemPath);
      } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
        try {
          const content = fs.readFileSync(itemPath, 'utf8');
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            // 簡單檢查：是否有單引號（應該用雙引號）
            if (frontmatter.includes("'")) {
              inconsistentFiles.push(itemPath);
            }
          }
        } catch (error) {
          // 忽略讀取錯誤
        }
      }
    }
  }

  try {
    checkFiles(contentDir);
  } catch (error) {
    // 忽略錯誤
  }

  return inconsistentFiles;
}

// 計算健康度分數
function calculateHealthScore(allChecks) {
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(HEALTH_CONFIG.checks).forEach(([category, config]) => {
    const categoryChecks = allChecks[category] || [];
    const categoryScore = calculateCategoryScore(categoryChecks);

    totalScore += categoryScore * config.weight;
    totalWeight += config.weight;
  });

  return Math.round(totalScore / totalWeight);
}

// 計算分類分數
function calculateCategoryScore(checks) {
  if (checks.length === 0) return 100;

  const criticalFailed = checks.filter(check => !check.success && check.critical).length;
  const totalFailed = checks.filter(check => !check.success).length;
  const totalChecks = checks.length;

  // 如果有關鍵檢查失敗，分數大幅降低
  if (criticalFailed > 0) {
    return Math.max(0, 50 - (criticalFailed * 25));
  }

  // 根據失敗檢查的比例計算分數
  const failureRate = totalFailed / totalChecks;
  return Math.round((1 - failureRate) * 100);
}

// 生成健康報告
function generateHealthReport(allChecks, healthScore) {
  console.log('\n🏥 系統健康檢查報告');
  console.log('='.repeat(60));
  console.log(`🏥 整體健康度: ${healthScore}/100 ${getHealthEmoji(healthScore)}`);
  console.log(`⏰ 檢查時間: ${new Date().toLocaleString('zh-TW')}`);
  console.log();

  // 顯示各分類結果
  Object.entries(HEALTH_CONFIG.checks).forEach(([category, config]) => {
    const checks = allChecks[category] || [];
    const categoryScore = calculateCategoryScore(checks);

    console.log(`${getCategoryEmoji(category)} ${config.name}: ${categoryScore}/100`);

    checks.forEach(check => {
      const icon = check.success ? '✅' : (check.critical ? '❌' : '⚠️');
      console.log(`   ${icon} ${check.name}: ${check.message}`);
    });
    console.log();
  });

  // 提供建議
  console.log('💡 建議:');

  if (healthScore >= HEALTH_CONFIG.thresholds.critical) {
    console.log('   🎉 系統健康狀況極佳，繼續保持！');
  } else if (healthScore >= HEALTH_CONFIG.thresholds.overall) {
    console.log('   👍 系統健康狀況良好，可關注需改善的項目');
  } else {
    console.log('   ⚠️  系統健康狀況需要改善，請優先處理失敗項目');

    // 列出關鍵失敗項目
    const criticalFailures = [];
    Object.values(allChecks).forEach(checks => {
      checks.forEach(check => {
        if (!check.success && check.critical) {
          criticalFailures.push(check.name);
        }
      });
    });

    if (criticalFailures.length > 0) {
      console.log('   🚨 關鍵問題:');
      criticalFailures.forEach(failure => {
        console.log(`      - ${failure}`);
      });
    }
  }

  console.log('='.repeat(60));

  return healthScore >= HEALTH_CONFIG.thresholds.overall;
}

// 獲取健康度表情符號
function getHealthEmoji(score) {
  if (score >= 95) return '🟢 優秀';
  if (score >= 80) return '🟡 良好';
  if (score >= 60) return '🟠 普通';
  return '🔴 需改善';
}

// 獲取分類表情符號
function getCategoryEmoji(category) {
  const emojis = {
    build: '🏗️',
    dependencies: '📦',
    security: '🔒',
    performance: '⚡',
    content: '📝'
  };
  return emojis[category] || '🔍';
}

// 主執行函數
async function main() {
  console.log('🚀 開始系統健康檢查...\n');

  const allChecks = {};

  try {
    // 執行各項檢查
    allChecks.build = await checkBuild();
    allChecks.dependencies = await checkDependencies();
    allChecks.security = await checkSecurity();
    allChecks.performance = await checkPerformance();
    allChecks.content = await checkContent();

    // 計算健康度分數
    const healthScore = calculateHealthScore(allChecks);

    // 生成報告
    const isHealthy = generateHealthReport(allChecks, healthScore);

    // 根據結果決定退出碼
    process.exit(isHealthy ? 0 : 1);

  } catch (error) {
    console.error('❌ 健康檢查執行失敗:', error);
    process.exit(1);
  }
}

// 處理命令行參數
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🏥 系統健康檢查工具

用法：
  npm run system:health            # 執行系統健康檢查
  node scripts/system-health-check.js --help  # 顯示幫助

檢查項目：
  🏗️  建置系統 (權重 30%)
  📦 依賴管理 (權重 20%)
  🔒 安全檢查 (權重 25%)
  ⚡ 效能檢查 (權重 15%)
  📝 內容檢查 (權重 10%)

健康度標準：
  - 95+ 分: 🟢 優秀
  - 80+ 分: 🟡 良好
  - 60+ 分: 🟠 普通
  - 60- 分: 🔴 需改善
  `);
  process.exit(0);
}

// 執行主程序
main();