#!/usr/bin/env node
/**
 * 社交媒體內容自動生成腳本
 * 
 * 功能：
 * 1. 掃描指定日期發布的文章
 * 2. 自動創建對應的 social-content-{date}.md 文件
 * 3. 生成標準化的社交媒體內容模板
 * 
 * 使用方法：
 * node scripts/generate-social-content.js [YYYY-MM-DD]
 * 
 * 如果不指定日期，則使用今天的日期
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 取得台灣時區的日期
function getTaiwanDate(dateStr = null) {
    const date = dateStr ? new Date(dateStr) : new Date();
    // 轉換到台灣時區 UTC+8
    const taiwanTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    return taiwanTime.toISOString().split('T')[0];
}

// 掃描指定日期的文章
async function findArticlesByDate(targetDate) {
    const contentPath = 'src/content';
    const series = ['ai', 'crypto', 'startup'];
    const articles = [];
    
    for (const seriesName of series) {
        const pattern = `${contentPath}/${seriesName}/**/*.mdx`;
        const files = await glob(pattern);
        
        files.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                
                if (frontmatterMatch) {
                    const frontmatter = frontmatterMatch[1];
                    const dateMatch = frontmatter.match(/date:\s*["']?([^"'\n]+)["']?/);
                    
                    if (dateMatch && dateMatch[1] === targetDate) {
                        const titleMatch = frontmatter.match(/title:\s*["']([^"']+)["']/);
                        articles.push({
                            series: seriesName,
                            title: titleMatch ? titleMatch[1] : path.basename(file, '.mdx'),
                            filePath: file,
                            date: dateMatch[1]
                        });
                    }
                }
            } catch (error) {
                console.warn(`警告：無法讀取文件 ${file}:`, error.message);
            }
        });
    }
    
    return articles;
}

// 生成社交媒體內容模板
function generateSocialContentTemplate(articles, targetDate) {
    const seriesEmojis = {
        'ai': '🤖',
        'crypto': '🔗', 
        'startup': '💡'
    };
    
    const seriesNames = {
        'ai': 'AI 小百科',
        'crypto': '幣圈筆記',
        'startup': '創業筆記'
    };
    
    let template = `# 社交媒體內容 - ${targetDate}

## 📝 今日發表文章

${articles.map((article, index) => 
    `${index + 1}. **${seriesNames[article.series]}**: ${article.title}`
).join('\n')}

---

`;

    // 為每篇文章生成社交內容段落
    articles.forEach(article => {
        const emoji = seriesEmojis[article.series];
        const seriesName = seriesNames[article.series];
        
        template += `## ${emoji} ${seriesName}：${article.title}

### Twitter/X (3條推文)

**推文 1**：
\`\`\`
[請根據文章內容生成核心洞察推文]

#${seriesName.replace(' ', '')} #相關標籤
\`\`\`

**推文 2**：
\`\`\`
[請生成詳細說明或技術要點推文]

#${seriesName.replace(' ', '')} #技術標籤  
\`\`\`

**推文 3**：
\`\`\`
[請生成實際應用或總結推文]

#${seriesName.replace(' ', '')} #應用標籤
\`\`\`

### Facebook (2個教育版本)

**版本 1**：
\`\`\`
💡 【深度解析】${article.title}

[請根據文章內容生成教育性長文，包含：]
- 核心問題說明
- 解決方案介紹  
- 實際價值分析
- 行動呼籲

#${seriesName} #相關主題標籤
\`\`\`

**版本 2**：
\`\`\`
🧠 【深度思考】[請生成另一個角度的教育性內容]

[包含：]
- 不同視角的分析
- 具體案例說明
- 實用建議
- 完整文章連結

#技術趨勢 #學習分享
\`\`\`

---

`;
    });

    template += `## 📊 發布統計

- **總推文數**: ${articles.length * 9}條
- **Twitter/X**: ${articles.length * 3}條 (每篇文章3條)
- **Facebook**: ${articles.length * 2}條 (每篇文章2條教育版本)
- **覆蓋主題**: ${articles.map(a => seriesNames[a.series]).join('、')}
- **目標受眾**: 科技愛好者、創業者、投資者、學習者

## 🎯 內容重點

1. **教育導向**: 所有內容以知識分享和教育為主，避免投資建議
2. **平台適配**: 針對不同平台特性調整內容長度和風格  
3. **價值導向**: 強調實用性和可操作性，提供具體洞察
4. **風險聲明**: 加密貨幣相關內容包含適當風險提醒

---

*文件生成時間: ${new Date().toISOString()}*  
*對應文章發布日期: ${targetDate}*
*🤖 由自動化腳本生成，請根據實際文章內容完善社交媒體推文*`;

    return template;
}

// 主函數
async function main() {
    const targetDate = process.argv[2] || getTaiwanDate();
    console.log(`🔍 掃描日期: ${targetDate}`);
    
    // 查找指定日期的文章
    const articles = await findArticlesByDate(targetDate);
    
    if (articles.length === 0) {
        console.log(`❌ 未找到 ${targetDate} 發布的文章`);
        console.log('請確認：');
        console.log('1. 文章的 frontmatter 中 date 字段格式正確');
        console.log('2. 文章已保存在 src/content/ 對應系列目錄中');
        process.exit(1);
    }
    
    console.log(`✅ 找到 ${articles.length} 篇文章：`);
    articles.forEach(article => {
        console.log(`   - ${article.series}: ${article.title}`);
    });
    
    // 生成社交內容模板
    const template = generateSocialContentTemplate(articles, targetDate);
    
    // 創建輸出文件路徑
    const outputDir = 'docs/internal';
    const outputFile = path.join(outputDir, `social-content-${targetDate}.md`);
    
    // 確保目錄存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 檢查文件是否已存在
    if (fs.existsSync(outputFile)) {
        console.log(`⚠️  文件已存在: ${outputFile}`);
        console.log('如要覆蓋，請手動刪除現有文件後重新執行');
        process.exit(0);
    }
    
    // 寫入文件
    try {
        fs.writeFileSync(outputFile, template, 'utf-8');
        console.log(`🎉 社交媒體內容模板已生成: ${outputFile}`);
        console.log('📝 請根據實際文章內容完善推文內容');
    } catch (error) {
        console.error('❌ 文件寫入失敗:', error.message);
        process.exit(1);
    }
}

// 如果直接執行此腳本則運行主函數
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    getTaiwanDate,
    findArticlesByDate,
    generateSocialContentTemplate
};