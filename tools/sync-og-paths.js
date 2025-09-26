#!/usr/bin/env node

/**
 * OG 圖片路徑自動化同步系統
 * 用途: 統一管理 MDX 內容與 OG 圖片的路徑結構同步
 * 特色: 自動目錄建立、路徑檢查、批量同步、增量更新
 * 使用: 
 *   node scripts/sync-og-paths.js           # 增量同步檢查
 *   node scripts/sync-og-paths.js --full    # 完整同步重建
 *   node scripts/sync-og-paths.js --dry-run # 預覽模式（僅顯示變更）
 */

import { readdir, mkdir, stat, access, readFile } from 'fs/promises';
import { join, dirname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 命令行參數處理
const args = process.argv.slice(2);
const isFullSync = args.includes('--full');
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose') || args.includes('-v');

// 配置項目
const CONFIG = {
  contentDir: join(rootDir, 'src/content'),
  ogDir: join(rootDir, 'public/images/og'),
  series: ['ai', 'crypto', 'startup', 'build'],
  supportedExtensions: ['.mdx'],
  ogExtension: '.png'
};

/**
 * 同步狀態追蹤器
 */
class SyncTracker {
  constructor() {
    this.stats = {
      scanned: 0,
      synced: 0,
      created: 0,
      skipped: 0,
      errors: 0
    };
    this.operations = [];
  }

  addOperation(type, source, target, status = 'pending') {
    this.operations.push({
      type,
      source,
      target,
      status,
      timestamp: new Date()
    });
  }

  updateStatus(index, status, error = null) {
    if (this.operations[index]) {
      this.operations[index].status = status;
      if (error) this.operations[index].error = error;
    }
  }

  incrementStat(stat) {
    if (this.stats.hasOwnProperty(stat)) {
      this.stats[stat]++;
    }
  }

  getReport() {
    return {
      stats: this.stats,
      operations: this.operations.filter(op => op.status !== 'skipped' || isVerbose)
    };
  }
}

/**
 * 路徑工具類
 */
class PathUtils {
  /**
   * 從 MDX 檔案路徑生成對應的 OG 圖片路徑
   */
  static mdxToOgPath(mdxPath) {
    // 取得相對於 content 目錄的路徑
    const relativePath = relative(CONFIG.contentDir, mdxPath);
    
    // 分解路徑組件
    const pathParts = relativePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    // 處理檔名：complete-guide.mdx -> complete-guide.png
    let ogFileName;
    if (fileName === 'complete-guide.mdx') {
      ogFileName = 'complete-guide.png';
    } else {
      ogFileName = fileName.replace(/\.mdx$/, CONFIG.ogExtension);
    }
    
    // 重建路徑：保持目錄結構一致
    const ogPathParts = [...pathParts.slice(0, -1), ogFileName];
    return join(CONFIG.ogDir, ...ogPathParts);
  }

  /**
   * 檢查路徑是否為支援的內容檔案
   */
  static isSupportedContentFile(filePath) {
    return CONFIG.supportedExtensions.some(ext => filePath.endsWith(ext));
  }

  /**
   * 確保目錄存在
   */
  static async ensureDirectory(dirPath) {
    try {
      await access(dirPath);
      return true;
    } catch {
      if (!isDryRun) {
        await mkdir(dirPath, { recursive: true });
      }
      return false;
    }
  }
}

/**
 * 檔案掃描器
 */
class FileScanner {
  /**
   * 掃描內容目錄，建立 MDX 檔案清單
   */
  static async scanContentFiles() {
    const contentFiles = [];

    async function scanDirectory(dir) {
      try {
        const items = await readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = join(dir, item.name);
          
          if (item.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (PathUtils.isSupportedContentFile(item.name)) {
            contentFiles.push(fullPath);
          }
        }
      } catch (error) {
        if (isVerbose) {
          console.warn(`⚠️  無法掃描目錄 ${dir}: ${error.message}`);
        }
      }
    }

    for (const series of CONFIG.series) {
      const seriesDir = join(CONFIG.contentDir, series);
      await scanDirectory(seriesDir);
    }

    return contentFiles;
  }

  /**
   * 掃描現有的 OG 圖片檔案
   */
  static async scanOgFiles() {
    const ogFiles = [];

    async function scanDirectory(dir) {
      try {
        const items = await readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = join(dir, item.name);
          
          if (item.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (item.name.endsWith(CONFIG.ogExtension)) {
            ogFiles.push(fullPath);
          }
        }
      } catch (error) {
        // OG 目錄可能不存在，這是正常的
      }
    }

    await scanDirectory(CONFIG.ogDir);
    return ogFiles;
  }
}

/**
 * 同步執行器
 */
class SyncExecutor {
  constructor(tracker) {
    this.tracker = tracker;
  }

  /**
   * 檢查單個 MDX 檔案是否需要同步
   */
  async checkFileSync(mdxPath) {
    this.tracker.incrementStat('scanned');
    
    try {
      // 讀取 MDX frontmatter
      const content = await readFile(mdxPath, 'utf-8');
      const { data } = matter(content);
      
      if (!data.title) {
        if (isVerbose) {
          console.warn(`⚠️  跳過無標題檔案: ${relative(rootDir, mdxPath)}`);
        }
        this.tracker.incrementStat('skipped');
        return null;
      }

      // 計算目標 OG 路徑
      const ogPath = PathUtils.mdxToOgPath(mdxPath);
      const ogDir = dirname(ogPath);

      // 檢查是否需要同步
      const needsSync = await this.needsSync(mdxPath, ogPath);
      
      if (!needsSync && !isFullSync) {
        this.tracker.incrementStat('skipped');
        return null;
      }

      return {
        mdxPath,
        ogPath,
        ogDir,
        title: data.title,
        needsSync
      };

    } catch (error) {
      this.tracker.incrementStat('errors');
      console.error(`❌ 處理檔案失敗 ${relative(rootDir, mdxPath)}: ${error.message}`);
      return null;
    }
  }

  /**
   * 判斷是否需要同步
   */
  async needsSync(mdxPath, ogPath) {
    if (isFullSync) return true;

    try {
      await access(ogPath);
      
      // 檢查檔案修改時間
      const mdxStat = await stat(mdxPath);
      const ogStat = await stat(ogPath);
      
      return mdxStat.mtime > ogStat.mtime;
    } catch {
      // OG 檔案不存在，需要同步
      return true;
    }
  }

  /**
   * 執行目錄結構同步
   */
  async syncDirectoryStructure(syncItems) {
    const dirsToCreate = new Set();
    
    // 收集需要建立的目錄
    for (const item of syncItems) {
      if (item) {
        dirsToCreate.add(item.ogDir);
      }
    }

    // 建立目錄
    for (const dir of dirsToCreate) {
      const existed = await PathUtils.ensureDirectory(dir);
      
      if (!existed) {
        this.tracker.incrementStat('created');
        
        if (isDryRun) {
          console.log(`📁 [預覽] 將建立目錄: ${relative(rootDir, dir)}`);
        } else {
          console.log(`📁 建立目錄: ${relative(rootDir, dir)}`);
        }
      }
    }
  }

  /**
   * 生成同步報告
   */
  generateSyncReport(syncItems) {
    const validItems = syncItems.filter(Boolean);
    
    if (validItems.length === 0) {
      console.log('✅ 所有檔案已是最新狀態，無需同步');
      return;
    }

    console.log(`\n📊 同步項目清單 (${validItems.length} 個):`);
    
    validItems.forEach((item, index) => {
      const status = item.needsSync ? '🔄 需要同步' : '✅ 已同步';
      const mdxRel = relative(rootDir, item.mdxPath);
      const ogRel = relative(rootDir, item.ogPath);
      
      console.log(`  ${index + 1}. ${status}`);
      console.log(`     來源: ${mdxRel}`);
      console.log(`     目標: ${ogRel}`);
      if (isVerbose) {
        console.log(`     標題: ${item.title}`);
      }
    });

    if (isDryRun) {
      console.log('\n💡 這是預覽模式，實際未執行任何變更');
      console.log('💡 移除 --dry-run 參數以執行實際同步');
    }
  }
}

/**
 * 主執行函數
 */
async function main() {
  const mode = isFullSync ? '完整重建' : '增量同步';
  const modeFlag = isDryRun ? ' (預覽模式)' : '';
  
  console.log(`🔄 開始 OG 圖片路徑同步 - ${mode}${modeFlag}...`);
  console.log(`📁 內容目錄: ${relative(rootDir, CONFIG.contentDir)}`);
  console.log(`📁 OG 目錄: ${relative(rootDir, CONFIG.ogDir)}`);
  console.log('');

  const tracker = new SyncTracker();
  const executor = new SyncExecutor(tracker);

  try {
    // 1. 掃描所有 MDX 檔案
    console.log('🔍 掃描內容檔案...');
    const contentFiles = await FileScanner.scanContentFiles();
    console.log(`📄 發現 ${contentFiles.length} 個內容檔案`);

    if (contentFiles.length === 0) {
      console.log('⚠️  未發現任何內容檔案，結束同步');
      return;
    }

    // 2. 檢查每個檔案的同步狀態
    console.log('\n🔍 分析同步需求...');
    const syncPromises = contentFiles.map(file => executor.checkFileSync(file));
    const syncItems = await Promise.all(syncPromises);

    // 3. 執行目錄結構同步
    console.log('📁 同步目錄結構...');
    await executor.syncDirectoryStructure(syncItems);

    // 4. 生成同步報告
    executor.generateSyncReport(syncItems);

    // 5. 顯示統計資訊
    const { stats } = tracker.getReport();
    console.log('\n📊 同步統計:');
    console.log(`  🔍 掃描檔案: ${stats.scanned}`);
    console.log(`  📁 建立目錄: ${stats.created}`);
    console.log(`  ⏭️  跳過檔案: ${stats.skipped}`);
    console.log(`  ❌ 錯誤數量: ${stats.errors}`);

    // 6. 提供後續建議
    const needsOgGeneration = syncItems.filter(Boolean).some(item => item.needsSync);
    
    if (needsOgGeneration && !isDryRun) {
      console.log('\n💡 建議執行後續操作:');
      console.log('   npm run og:generate     # 生成缺失的 OG 圖片');
      console.log('   npm run og:clean        # 清理多餘檔案');
    }

    console.log('\n🎉 同步完成！');

  } catch (error) {
    console.error(`❌ 同步過程發生錯誤: ${error.message}`);
    if (isVerbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// 執行主函數
main().catch(error => {
  console.error(`💥 未處理的錯誤: ${error.message}`);
  process.exit(1);
});