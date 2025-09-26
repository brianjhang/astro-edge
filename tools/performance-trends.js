#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 趨勢分析配置
const TRENDS_CONFIG = {
  historyFile: 'performance-reports/performance-history.json',
  analysisTypes: ['performance', 'fcp', 'lcp', 'tbt', 'cls'],
  trendThreshold: 0.1  // 趨勢變化閾值 (10%)
};

// 讀取歷史數據
function loadHistory() {
  try {
    if (!fs.existsSync(TRENDS_CONFIG.historyFile)) {
      console.log('❌ 找不到效能歷史記錄檔案');
      return null;
    }

    const history = JSON.parse(fs.readFileSync(TRENDS_CONFIG.historyFile, 'utf8'));

    if (history.length < 2) {
      console.log('⚠️  歷史記錄不足，需要至少 2 筆記錄才能分析趨勢');
      return null;
    }

    return history;
  } catch (error) {
    console.error('❌ 讀取歷史記錄失敗:', error.message);
    return null;
  }
}

// 計算平均值
function calculateAverage(values) {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// 計算變化趨勢
function calculateTrend(values) {
  if (values.length < 2) return 0;

  const recent = values.slice(-5);  // 最近 5 次
  const older = values.slice(-10, -5);  // 之前 5 次

  if (older.length === 0) return 0;

  const recentAvg = calculateAverage(recent);
  const olderAvg = calculateAverage(older);

  return ((recentAvg - olderAvg) / olderAvg) * 100;
}

// 分析單一指標
function analyzeMetric(history, metric) {
  const values = history.map(record => record[metric]);
  const latest = values[values.length - 1];
  const average = calculateAverage(values);
  const trend = calculateTrend(values);

  // 判斷趨勢方向
  let trendDirection = '➡️ ';
  let trendText = '穩定';

  if (Math.abs(trend) > TRENDS_CONFIG.trendThreshold) {
    if (trend > 0) {
      // Performance 分數上升是好事，其他指標上升是壞事
      if (metric === 'performance') {
        trendDirection = '📈 ';
        trendText = '改善';
      } else {
        trendDirection = '📉 ';
        trendText = '惡化';
      }
    } else {
      if (metric === 'performance') {
        trendDirection = '📉 ';
        trendText = '惡化';
      } else {
        trendDirection = '📈 ';
        trendText = '改善';
      }
    }
  }

  return {
    metric,
    latest,
    average,
    trend,
    trendDirection,
    trendText,
    values
  };
}

// 生成趨勢報告
function generateTrendsReport(history) {
  console.log('\n📈 效能趨勢分析報告');
  console.log('='.repeat(60));
  console.log(`📊 分析期間: ${new Date(history[0].timestamp).toLocaleDateString('zh-TW')} - ${new Date(history[history.length - 1].timestamp).toLocaleDateString('zh-TW')}`);
  console.log(`📝 記錄筆數: ${history.length} 筆`);
  console.log();

  // 分析各項指標
  const analyses = {};

  TRENDS_CONFIG.analysisTypes.forEach(metric => {
    analyses[metric] = analyzeMetric(history, metric);
  });

  // 顯示分析結果
  console.log('📊 指標分析:');
  console.log();

  // Performance Score
  const perfAnalysis = analyses.performance;
  console.log(`🎯 Performance Score:`);
  console.log(`   當前值: ${perfAnalysis.latest}/100`);
  console.log(`   平均值: ${perfAnalysis.average.toFixed(1)}/100`);
  console.log(`   趨勢: ${perfAnalysis.trendDirection}${perfAnalysis.trendText} (${perfAnalysis.trend > 0 ? '+' : ''}${perfAnalysis.trend.toFixed(1)}%)`);
  console.log();

  // Core Web Vitals
  console.log('⚡ Core Web Vitals:');

  const fcpAnalysis = analyses.fcp;
  console.log(`   FCP: ${fcpAnalysis.latest.toFixed(1)}s (平均: ${fcpAnalysis.average.toFixed(1)}s) ${fcpAnalysis.trendDirection}${fcpAnalysis.trendText}`);

  const lcpAnalysis = analyses.lcp;
  console.log(`   LCP: ${lcpAnalysis.latest.toFixed(1)}s (平均: ${lcpAnalysis.average.toFixed(1)}s) ${lcpAnalysis.trendDirection}${lcpAnalysis.trendText}`);

  const tbtAnalysis = analyses.tbt;
  console.log(`   TBT: ${tbtAnalysis.latest.toFixed(0)}ms (平均: ${tbtAnalysis.average.toFixed(0)}ms) ${tbtAnalysis.trendDirection}${tbtAnalysis.trendText}`);

  const clsAnalysis = analyses.cls;
  console.log(`   CLS: ${clsAnalysis.latest.toFixed(3)} (平均: ${clsAnalysis.average.toFixed(3)}) ${clsAnalysis.trendDirection}${clsAnalysis.trendText}`);
  console.log();

  // 總體健康狀況
  console.log('🏥 整體健康狀況:');

  const healthScore = perfAnalysis.latest;
  let healthStatus = '';
  let healthEmoji = '';

  if (healthScore >= 90) {
    healthEmoji = '🟢';
    healthStatus = '優秀';
  } else if (healthScore >= 70) {
    healthEmoji = '🟡';
    healthStatus = '良好';
  } else {
    healthEmoji = '🔴';
    healthStatus = '需要改善';
  }

  console.log(`   ${healthEmoji} 網站效能: ${healthStatus}`);

  // 趨勢建議
  console.log();
  console.log('💡 趨勢建議:');

  let hasNegativeTrends = false;

  Object.values(analyses).forEach(analysis => {
    if (analysis.metric === 'performance') {
      if (analysis.trend < -TRENDS_CONFIG.trendThreshold) {
        console.log(`   ⚠️  ${analysis.metric.toUpperCase()} 分數呈下降趨勢，建議檢查近期變更`);
        hasNegativeTrends = true;
      }
    } else {
      if (analysis.trend > TRENDS_CONFIG.trendThreshold) {
        console.log(`   ⚠️  ${analysis.metric.toUpperCase()} 指標呈惡化趨勢，建議優化 ${getOptimizationTip(analysis.metric)}`);
        hasNegativeTrends = true;
      }
    }
  });

  if (!hasNegativeTrends) {
    console.log('   ✅ 所有指標趨勢穩定或改善，繼續保持！');
  }

  console.log('='.repeat(60));

  return analyses;
}

// 獲取優化建議
function getOptimizationTip(metric) {
  const tips = {
    fcp: '首次內容繪製 (檢查關鍵資源載入)',
    lcp: '最大內容繪製 (優化圖片和字體)',
    tbt: '總阻塞時間 (減少 JavaScript 執行時間)',
    cls: '累積版面位移 (確保元素尺寸穩定)'
  };

  return tips[metric] || '該指標';
}

// 生成簡易圖表
function generateSimpleChart(values, label) {
  console.log(`\n📈 ${label} 趨勢圖 (最近 10 次):`);

  const recentValues = values.slice(-10);
  const min = Math.min(...recentValues);
  const max = Math.max(...recentValues);
  const range = max - min;

  recentValues.forEach((value, index) => {
    const normalized = range === 0 ? 0.5 : (value - min) / range;
    const barLength = Math.round(normalized * 20);
    const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);

    console.log(`   ${(index + 1).toString().padStart(2)}: ${bar} ${value.toFixed(label === 'Performance Score' ? 0 : 1)}${label === 'Performance Score' ? '' : (label.includes('Score') ? '' : (label.includes('ms') ? 'ms' : 's'))}`);
  });
}

// 主執行函數
async function main() {
  console.log('📊 開始效能趨勢分析...');

  // 讀取歷史數據
  const history = loadHistory();
  if (!history) {
    process.exit(1);
  }

  // 生成趨勢報告
  const analyses = generateTrendsReport(history);

  // 顯示圖表 (如果有足夠數據)
  if (history.length >= 3) {
    generateSimpleChart(analyses.performance.values, 'Performance Score');
    generateSimpleChart(analyses.lcp.values, 'LCP (秒)');
  }

  console.log('\n✅ 趨勢分析完成！');
}

// 處理命令行參數
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📈 效能趨勢分析工具

用法：
  npm run performance:trends         # 分析效能趨勢
  node scripts/performance-trends.js --help  # 顯示幫助

功能：
  - 分析歷史效能數據趨勢
  - 識別效能改善或惡化趨勢
  - 提供優化建議
  - 生成簡易趨勢圖表

分析指標：
  - Performance Score (效能分數)
  - FCP (首次內容繪製)
  - LCP (最大內容繪製)
  - TBT (總阻塞時間)
  - CLS (累積版面位移)
  `);
  process.exit(0);
}

// 執行主程序
main().catch(error => {
  console.error('❌ 趨勢分析執行失敗:', error);
  process.exit(1);
});