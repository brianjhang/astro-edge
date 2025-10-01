/**
 * 生成翻譯映射表腳本
 * 掃描 src/content 目錄，建立文章的翻譯狀態映射
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = 'src/content';
const OUTPUT_FILE = 'src/data/translationMap.ts';

/**
 * 從 slug 推斷語言
 */
function getLanguageFromSlug(slug) {
  const languageCodes = ['en', 'zh-cn', 'ja-jp', 'ko-kr'];
  const slugParts = slug.split('/');
  return languageCodes.includes(slugParts[0]) ? slugParts[0] : 'zh-TW';
}

/**
 * 獲取基礎 slug（移除語言和系列前綴，以及語言後綴）
 */
function getBaseSlug(slug, series) {
  let baseSlug = slug;

  // 移除語言前綴
  if (baseSlug.startsWith('en/')) {
    baseSlug = baseSlug.replace('en/', '');
  }

  // 移除系列前綴
  const seriesPrefix = `${series}/`;
  if (baseSlug.startsWith(seriesPrefix)) {
    baseSlug = baseSlug.replace(seriesPrefix, '');
  }

  // 移除語言後綴 (例如: -en, -zh-tw)
  baseSlug = baseSlug.replace(/-en$/, '');
  baseSlug = baseSlug.replace(/-zh-tw$/, '');
  baseSlug = baseSlug.replace(/-zh-cn$/, '');

  return baseSlug;
}

/**
 * 掃描單個系列目錄
 */
async function scanSeries(series) {
  const seriesDir = join(CONTENT_DIR, series);
  const articles = new Map();

  try {
    const files = await readdir(seriesDir, { recursive: true });

    for (const file of files) {
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;

      const filePath = join(seriesDir, file);
      const content = await readFile(filePath, 'utf-8');
      const { data } = matter(content);

      // 優先使用 frontmatter 中的 slug，否則從檔名構建
      const fileSlug = file.replace(/\.(mdx|md)$/, '');

      // 如果有 frontmatter slug
      let fullUrl;
      if (data.slug) {
        // 檢查 slug 是否已包含系列前綴或語言前綴
        if (data.slug.startsWith(`${series}/`) || data.slug.startsWith('en/')) {
          // 已經是完整路徑，直接使用
          fullUrl = data.slug;
        } else {
          // 不完整的 slug
          // 檢查檔案路徑是否有子目錄（例如 book/article-name.mdx）
          const fileDir = fileSlug.substring(0, fileSlug.lastIndexOf('/') + 1);
          if (fileDir && !data.slug.startsWith(fileDir)) {
            // frontmatter slug 缺少子目錄，補上
            fullUrl = `${series}/${fileDir}${data.slug}`;
          } else {
            // 直接補上系列前綴
            fullUrl = `${series}/${data.slug}`;
          }
        }
      } else {
        // 沒有 slug，從檔名構建完整路徑
        fullUrl = `${series}/${fileSlug}`;
      }

      const lang = data.lang || getLanguageFromSlug(fullUrl);

      // 獲取基礎 slug（移除語言和系列前綴）
      const baseSlug = getBaseSlug(fullUrl, series);

      // 記錄到 map
      if (!articles.has(baseSlug)) {
        articles.set(baseSlug, {});
      }

      const article = articles.get(baseSlug);
      article[lang] = fullUrl;
    }
  } catch (error) {
    console.warn(`Warning: Could not scan series "${series}":`, error.message);
  }

  return articles;
}

/**
 * 主函數
 */
async function main() {
  console.log('🔍 掃描文章並生成翻譯映射表...\n');

  const allArticles = new Map();
  const series = ['ai', 'crypto', 'startup', 'build'];

  // 掃描所有系列
  for (const s of series) {
    console.log(`📁 掃描系列: ${s}`);
    const seriesArticles = await scanSeries(s);
    console.log(`   找到 ${seriesArticles.size} 篇基礎文章\n`);

    // 合併到總映射表
    for (const [baseSlug, translations] of seriesArticles) {
      allArticles.set(baseSlug, translations);
    }
  }

  // 生成 TypeScript 檔案內容
  const translationMap = Object.fromEntries(allArticles);

  const tsContent = `/**
 * 翻譯映射表
 * 自動生成於: ${new Date().toISOString()}
 *
 * 格式：
 * {
 *   "基礎slug": {
 *     "zh-TW": "系列/完整路徑",
 *     "en": "系列/en/完整路徑" | null
 *   }
 * }
 */

export const translationMap: Record<string, Record<string, string | null>> = ${JSON.stringify(translationMap, null, 2)};

/**
 * 獲取翻譯狀態
 * @param baseSlug 基礎 slug（不含語言和系列前綴）
 * @param lang 目標語言
 * @returns 翻譯狀態
 */
export function getTranslationStatus(baseSlug: string, lang: string): {
  exists: boolean;
  url?: string;
} {
  const translations = translationMap[baseSlug];
  if (!translations) {
    return { exists: false };
  }

  const translatedUrl = translations[lang];
  return {
    exists: !!translatedUrl,
    url: translatedUrl || undefined
  };
}

/**
 * 統計資訊
 */
export const stats = {
  totalArticles: ${allArticles.size},
  generated: '${new Date().toISOString()}',
  series: ${JSON.stringify(series)}
};
`;

  // 寫入檔案
  await writeFile(OUTPUT_FILE, tsContent, 'utf-8');

  console.log('✅ 翻譯映射表已生成！');
  console.log(`📄 輸出檔案: ${OUTPUT_FILE}`);
  console.log(`📊 總共 ${allArticles.size} 篇基礎文章`);

  // 顯示統計
  let withEnglish = 0;
  let onlyChinese = 0;

  for (const [, translations] of allArticles) {
    if (translations['en']) {
      withEnglish++;
    } else {
      onlyChinese++;
    }
  }

  console.log(`\n📈 統計：`);
  console.log(`   有英文版: ${withEnglish} 篇`);
  console.log(`   僅中文版: ${onlyChinese} 篇`);
  console.log(`   翻譯覆蓋率: ${((withEnglish / allArticles.size) * 100).toFixed(1)}%`);
}

main().catch(console.error);