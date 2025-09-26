#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 效能監控配置
const MONITOR_CONFIG = {
  url: 'https://brianjhang.com',
  thresholds: {
    performance: 90,  // Performance 分數最低標準
    fcp: 1.5,        // FCP 最大允許時間 (秒)
    lcp: 2.5,        // LCP 最大允許時間 (秒)
    tbt: 300,        // TBT 最大允許時間 (毫秒)
    cls: 0.1         // CLS 最大允許值
  },
  reportDir: 'performance-reports'
};

// 建立報告目錄
function ensureReportDir() {
  if (!fs.existsSync(MONITOR_CONFIG.reportDir)) {
    fs.mkdirSync(MONITOR_CONFIG.reportDir, { recursive: true });
    console.log(`✅ 建立報告目錄: ${MONITOR_CONFIG.reportDir}`);
  }
}

// 執行 Lighthouse 測試
async function runLighthouseTest() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(MONITOR_CONFIG.reportDir, `lighthouse-${timestamp}.json`);

  console.log('🔍 執行 Lighthouse 效能測試...');

  try {
    const command = `npx lighthouse ${MONITOR_CONFIG.url} ` +
      `--preset=desktop ` +
      `--only-categories=performance ` +
      `--chrome-flags="--headless --no-sandbox" ` +
      `--output=json ` +
      `--output-path=${reportPath}`;

    execSync(command, { stdio: 'pipe' });

    console.log(`📊 測試完成，報告已儲存: ${reportPath}`);
    return reportPath;
  } catch (error) {
    console.error('❌ Lighthouse 測試失敗:', error.message);
    return null;
  }
}

// 解析測試結果
function parseResults(reportPath) {
  try {
    const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const audits = data.audits;

    return {
      timestamp: new Date().toISOString(),
      performance: Math.round(data.categories.performance.score * 100),
      metrics: {
        fcp: parseFloat(audits['first-contentful-paint'].numericValue / 1000),
        lcp: parseFloat(audits['largest-contentful-paint'].numericValue / 1000),
        tbt: parseFloat(audits['total-blocking-time'].numericValue),
        cls: parseFloat(audits['cumulative-layout-shift'].numericValue),
        speedIndex: parseFloat(audits['speed-index'].numericValue / 1000),
        tti: parseFloat(audits['interactive'].numericValue / 1000)
      },
      displayValues: {
        fcp: audits['first-contentful-paint'].displayValue,
        lcp: audits['largest-contentful-paint'].displayValue,
        tbt: audits['total-blocking-time'].displayValue,
        cls: audits['cumulative-layout-shift'].displayValue,
        speedIndex: audits['speed-index'].displayValue,
        tti: audits['interactive'].displayValue
      }
    };
  } catch (error) {
    console.error('❌ 解析測試結果失敗:', error.message);
    return null;
  }
}

// 檢查效能閾值
function checkThresholds(results) {
  const issues = [];
  const { thresholds } = MONITOR_CONFIG;
  const { performance, metrics } = results;

  if (performance < thresholds.performance) {
    issues.push(`Performance 分數過低: ${performance} < ${thresholds.performance}`);
  }

  if (metrics.fcp > thresholds.fcp) {
    issues.push(`FCP 過慢: ${metrics.fcp.toFixed(1)}s > ${thresholds.fcp}s`);
  }

  if (metrics.lcp > thresholds.lcp) {
    issues.push(`LCP 過慢: ${metrics.lcp.toFixed(1)}s > ${thresholds.lcp}s`);
  }

  if (metrics.tbt > thresholds.tbt) {
    issues.push(`TBT 過高: ${metrics.tbt}ms > ${thresholds.tbt}ms`);
  }

  if (metrics.cls > thresholds.cls) {
    issues.push(`CLS 過高: ${metrics.cls} > ${thresholds.cls}`);
  }

  return issues;
}

// 生成監控報告
function generateReport(results, issues) {
  const { performance, metrics, displayValues, timestamp } = results;

  console.log('\n📈 效能監控報告');
  console.log('='.repeat(50));
  console.log(`⏰ 測試時間: ${new Date(timestamp).toLocaleString('zh-TW')}`);
  console.log(`🌐 測試網址: ${MONITOR_CONFIG.url}`);
  console.log();

  // 總體分數
  const scoreEmoji = performance >= 90 ? '🟢' : performance >= 50 ? '🟡' : '🔴';
  console.log(`${scoreEmoji} Performance Score: ${performance}/100`);
  console.log();

  // 核心指標
  console.log('📊 Core Web Vitals:');
  console.log(`   FCP: ${displayValues.fcp}`);
  console.log(`   LCP: ${displayValues.lcp}`);
  console.log(`   TBT: ${displayValues.tbt}`);
  console.log(`   CLS: ${displayValues.cls}`);
  console.log();

  // 其他指標
  console.log('⚡ 其他指標:');
  console.log(`   Speed Index: ${displayValues.speedIndex}`);
  console.log(`   TTI: ${displayValues.tti}`);
  console.log();

  // 問題報告
  if (issues.length > 0) {
    console.log('⚠️  發現問題:');
    issues.forEach(issue => console.log(`   ❌ ${issue}`));
  } else {
    console.log('✅ 所有指標都符合標準！');
  }

  console.log('='.repeat(50));

  return issues.length === 0;
}

// 儲存歷史數據
function saveHistory(results) {
  const historyFile = path.join(MONITOR_CONFIG.reportDir, 'performance-history.json');
  let history = [];

  // 讀取現有歷史
  if (fs.existsSync(historyFile)) {
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch (error) {
      console.warn('⚠️  讀取歷史記錄失敗，將建立新記錄');
    }
  }

  // 添加新記錄
  history.push({
    timestamp: results.timestamp,
    performance: results.performance,
    ...results.metrics
  });

  // 只保留最近 30 次記錄
  if (history.length > 30) {
    history = history.slice(-30);
  }

  // 儲存更新的歷史
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  console.log(`💾 已更新效能歷史記錄 (${history.length} 筆)`);
}

// 主執行函數
async function main() {
  console.log('🚀 開始效能監控檢查...\n');

  // 建立報告目錄
  ensureReportDir();

  // 執行測試
  const reportPath = await runLighthouseTest();
  if (!reportPath) {
    process.exit(1);
  }

  // 解析結果
  const results = parseResults(reportPath);
  if (!results) {
    process.exit(1);
  }

  // 檢查閾值
  const issues = checkThresholds(results);

  // 生成報告
  const allGood = generateReport(results, issues);

  // 儲存歷史
  saveHistory(results);

  // 根據結果決定退出碼
  if (!allGood) {
    console.log('\n⚠️  效能監控發現問題，請檢查並優化');
    process.exit(1);
  } else {
    console.log('\n🎉 效能監控通過，網站表現優秀！');
    process.exit(0);
  }
}

// 處理命令行參數
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📊 效能監控工具

用法：
  npm run performance:monitor        # 執行效能監控
  node scripts/performance-monitor.js --help  # 顯示幫助

功能：
  - 自動執行 Lighthouse 效能測試
  - 檢查效能指標是否符合標準
  - 生成詳細的效能報告
  - 儲存歷史數據供追蹤趨勢

閾值設定：
  - Performance Score: ≥ ${MONITOR_CONFIG.thresholds.performance}
  - FCP: ≤ ${MONITOR_CONFIG.thresholds.fcp}s
  - LCP: ≤ ${MONITOR_CONFIG.thresholds.lcp}s
  - TBT: ≤ ${MONITOR_CONFIG.thresholds.tbt}ms
  - CLS: ≤ ${MONITOR_CONFIG.thresholds.cls}
  `);
  process.exit(0);
}

// 執行主程序
main().catch(error => {
  console.error('❌ 效能監控執行失敗:', error);
  process.exit(1);
});