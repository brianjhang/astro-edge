#!/usr/bin/env node
/**
 * 智能社交媒體內容生成腳本 (AI Enhanced)
 * 
 * 功能：
 * 1. 掃描指定日期發布的文章
 * 2. 讀取文章完整內容
 * 3. 使用 LLM 自動生成社交媒體推文
 * 4. 創建完整的 social-content-{date}.md 文件
 * 
 * 使用方法：
 * node scripts/generate-social-content-ai.js [YYYY-MM-DD]
 * 
 * 環境變數：
 * OPENAI_API_KEY - OpenAI API 金鑰
 * 
 * 如果不指定日期，則使用今天的日期
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

// 取得台灣時區的日期
function getTaiwanDate(dateStr = null) {
    const date = dateStr ? new Date(dateStr) : new Date();
    const taiwanTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    return taiwanTime.toISOString().split('T')[0];
}

// 掃描指定日期的文章並讀取完整內容
async function findArticlesWithContent(targetDate) {
    const contentPath = 'src/content';
    const series = ['ai', 'crypto', 'startup'];
    const articles = [];
    
    for (const seriesName of series) {
        const pattern = `${contentPath}/${seriesName}/**/*.mdx`;
        const files = await glob(pattern);
        
        files.forEach(file => {
            try {
                const fileContent = fs.readFileSync(file, 'utf-8');
                const { data: frontmatter, content } = matter(fileContent);
                
                if (frontmatter.date === targetDate) {
                    articles.push({
                        series: seriesName,
                        title: frontmatter.title || path.basename(file, '.mdx'),
                        filePath: file,
                        date: frontmatter.date,
                        description: frontmatter.description || '',
                        summary: frontmatter.summary || '',
                        tags: frontmatter.tags || [],
                        content: content,
                        canonicalUrl: frontmatter.canonicalUrl || '',
                        frontmatter: frontmatter
                    });
                }
            } catch (error) {
                console.warn(`警告：無法讀取文件 ${file}:`, error.message);
            }
        });
    }
    
    return articles;
}

// LLM API 調用函數 (使用 Claude 或 OpenAI)
async function generateWithLLM(prompt, options = {}) {
    const { maxTokens = 800, temperature = 0.7 } = options;
    
    // 這裡可以根據環境變數選擇不同的 LLM 提供商
    const provider = process.env.LLM_PROVIDER || 'openai';
    
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
        return await generateWithOpenAI(prompt, { maxTokens, temperature });
    } else if (provider === 'claude' && process.env.ANTHROPIC_API_KEY) {
        return await generateWithClaude(prompt, { maxTokens, temperature });
    } else {
        // 如果沒有配置 API，則返回模板
        console.warn('⚠️  未配置 LLM API，使用模板模式');
        return '[AI生成內容 - 請配置 LLM API]';
    }
}

// OpenAI API 調用
async function generateWithOpenAI(prompt, options) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: '你是專業的社交媒體內容創作者，專長於將技術文章轉化為吸引人的社交媒體推文。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens,
                temperature: options.temperature
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API 錯誤: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI API 調用失敗:', error.message);
        return '[AI生成失敗 - 請檢查API配置]';
    }
}

// Claude API 調用
async function generateWithClaude(prompt, options) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: options.maxTokens,
                temperature: options.temperature,
                messages: [
                    {
                        role: 'user',
                        content: `你是專業的社交媒體內容創作者，專長於將技術文章轉化為吸引人的社交媒體推文。\\n\\n${prompt}`
                    }
                ]
            })
        });
        
        if (!response.ok) {
            throw new Error(`Claude API 錯誤: ${response.status}`);
        }
        
        const data = await response.json();
        return data.content[0].text.trim();
    } catch (error) {
        console.error('Claude API 調用失敗:', error.message);
        return '[AI生成失敗 - 請檢查API配置]';
    }
}

// 生成 Twitter 推文
async function generateTwitterPosts(article) {
    const seriesContext = {
        'ai': 'AI 小百科系列，專注於深入淺出的AI技術解析',
        'crypto': '幣圈筆記系列，客觀教育導向的加密貨幣分析',
        'startup': '創業筆記系列，經典商業智慧的現代應用'
    };
    
    const seriesHashtags = {
        'ai': ['#AI小百科', '#人工智慧', '#機器學習'],
        'crypto': ['#幣圈筆記', '#區塊鏈', '#加密貨幣'],
        'startup': ['#創業筆記', '#商業策略', '#創業智慧']
    };
    
    const prompt = `
請為以下文章生成 3 條 Twitter 推文，每條推文需要：

文章信息：
- 標題：${article.title}
- 系列：${seriesContext[article.series]}
- 簡介：${article.description}
- 摘要：${article.summary}
- 主要標籤：${article.tags.join(', ')}
- 文章連結：${article.canonicalUrl}

推文要求：
1. 每條推文控制在 250 字符以內（留空間給標籤和連結）
2. 第1條：核心洞察或反直覺觀點
3. 第2條：技術要點或實用知識
4. 第3條：實際應用或行動呼籲
5. 語調要吸引人但專業，避免過度炒作
6. 包含適當的 emoji 但不要過多
7. 每條推文結尾包含 2-3 個相關標籤

可用標籤：${seriesHashtags[article.series].join(', ')}

請用以下格式輸出：

**推文 1**：
[推文內容]

**推文 2**：
[推文內容]

**推文 3**：
[推文內容]
`;
    
    return await generateWithLLM(prompt, { maxTokens: 600 });
}

// 生成 Facebook 內容
async function generateFacebookPosts(article) {
    const seriesContext = {
        'ai': 'AI 小百科：深入淺出的人工智慧技術解析',
        'crypto': '幣圈筆記：客觀教育導向的區塊鏈知識分享',
        'startup': '創業筆記：經典商業智慧在現代的實踐應用'
    };
    
    const prompt = `
請為以下文章生成 2 個 Facebook 教育性貼文，每個貼文需要：

文章信息：
- 標題：${article.title}
- 系列：${seriesContext[article.series]}
- 簡介：${article.description}
- 摘要：${article.summary}
- 內容概要：${article.content.substring(0, 1000)}...
- 文章連結：${article.canonicalUrl}

貼文要求：
1. 每個貼文 400-600 字
2. 教育性語調，正式但親和
3. 版本 1：問題導向，引發思考
4. 版本 2：解決方案導向，提供價值
5. 包含具體要點和實用建議
6. 結尾包含行動呼籲
7. 使用適當的 emoji 和標籤

請用以下格式輸出：

**版本 1**：
[Facebook 貼文內容 1]

**版本 2**：
[Facebook 貼文內容 2]
`;
    
    return await generateWithLLM(prompt, { maxTokens: 800 });
}

// 生成完整的社交媒體內容
async function generateSocialContentWithAI(articles, targetDate) {
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
    
    console.log('🤖 開始使用 AI 生成社交媒體內容...');
    
    let template = `# 社交媒體內容 - ${targetDate}

## 📝 今日發表文章

${articles.map((article, index) => 
    `${index + 1}. **${seriesNames[article.series]}**: ${article.title}`
).join('\\n')}

---

`;

    // 為每篇文章生成 AI 內容
    for (const article of articles) {
        const emoji = seriesEmojis[article.series];
        const seriesName = seriesNames[article.series];
        
        console.log(`📝 正在為《${article.title}》生成內容...`);
        
        template += `## ${emoji} ${seriesName}：${article.title}

### Twitter/X (3條推文)

`;
        
        // 生成 Twitter 內容
        try {
            const twitterContent = await generateTwitterPosts(article);
            template += twitterContent + '\\n\\n';
        } catch (error) {
            console.error(`Twitter 內容生成失敗:`, error.message);
            template += `**推文 1**：
\`\`\`
[AI 生成失敗 - 請手動完善]

#${seriesName.replace(' ', '')} #相關標籤
\`\`\`

**推文 2**：
\`\`\`
[AI 生成失敗 - 請手動完善]

#${seriesName.replace(' ', '')} #技術標籤  
\`\`\`

**推文 3**：
\`\`\`
[AI 生成失敗 - 請手動完善]

#${seriesName.replace(' ', '')} #應用標籤
\`\`\`

`;
        }
        
        template += `### Facebook (2個教育版本)

`;
        
        // 生成 Facebook 內容
        try {
            const facebookContent = await generateFacebookPosts(article);
            template += facebookContent + '\\n';
        } catch (error) {
            console.error(`Facebook 內容生成失敗:`, error.message);
            template += `**版本 1**：
\`\`\`
💡 【深度解析】${article.title}

[AI 生成失敗 - 請根據文章內容手動完善]

#${seriesName} #相關主題標籤
\`\`\`

**版本 2**：
\`\`\`
🧠 【深度思考】[請手動生成另一個角度的教育性內容]

[AI 生成失敗 - 請根據文章內容手動完善]

#技術趨勢 #學習分享
\`\`\`
`;
        }
        
        template += `---

`;
        
        // 添加小延遲避免 API 限制
        if (articles.indexOf(article) < articles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    template += `## 📊 發布統計

- **總推文數**: ${articles.length * 5}條
- **Twitter/X**: ${articles.length * 3}條 (每篇文章3條)
- **Facebook**: ${articles.length * 2}條 (每篇文章2條教育版本)
- **覆蓋主題**: ${articles.map(a => seriesNames[a.series]).join('、')}
- **目標受眾**: 科技愛好者、創業者、投資者、學習者

## 🎯 內容重點

1. **AI 生成**: 使用 LLM 自動生成個性化推文內容
2. **教育導向**: 所有內容以知識分享和教育為主，避免投資建議
3. **平台適配**: 針對不同平台特性調整內容長度和風格  
4. **價值導向**: 強調實用性和可操作性，提供具體洞察
5. **風險聲明**: 加密貨幣相關內容包含適當風險提醒

## 🤖 AI 生成說明

- **LLM 提供商**: ${process.env.LLM_PROVIDER || 'openai'}
- **模型**: ${process.env.LLM_PROVIDER === 'claude' ? 'Claude-3 Sonnet' : 'GPT-4'}
- **生成時間**: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
- **品質提醒**: AI 生成內容建議人工審核和調整

---

*文件生成時間: ${new Date().toISOString()}*  
*對應文章發布日期: ${targetDate}*
*🤖 由 AI 增強腳本生成，內容經 LLM 自動生成*`;

    return template;
}

// 主函數
async function main() {
    const targetDate = process.argv[2] || getTaiwanDate();
    console.log(`🔍 掃描日期: ${targetDate}`);
    
    // 檢查 API 配置
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
        console.log('⚠️  未檢測到 LLM API 配置，將使用模板模式');
        console.log('設置環境變數：');
        console.log('  export OPENAI_API_KEY="your-openai-key"');
        console.log('  export ANTHROPIC_API_KEY="your-claude-key"');
        console.log('  export LLM_PROVIDER="openai" # 或 "claude"');
    }
    
    // 查找指定日期的文章
    const articles = await findArticlesWithContent(targetDate);
    
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
    
    // 生成 AI 增強的社交內容
    const template = await generateSocialContentWithAI(articles, targetDate);
    
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
        console.log(`🎉 AI 增強社交媒體內容已生成: ${outputFile}`);
        console.log('📝 請審核 AI 生成的內容並根據需要進行調整');
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
    findArticlesWithContent,
    generateSocialContentWithAI,
    generateWithLLM
};