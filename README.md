# 🌌 AstroEdge

**Give your Astro site the winning edge.**
_Built at Brian Jhang's Edge_

[![NPM Version](https://img.shields.io/npm/v/astro-edge.svg?style=flat&color=blue)](https://www.npmjs.com/package/astro-edge)
[![GitHub Stars](https://img.shields.io/github/stars/brianjhang/astro-edge.svg?style=social)](https://github.com/brianjhang/astro-edge)
[![License](https://img.shields.io/github/license/brianjhang/astro-edge)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/astro-edge.svg?style=flat&color=green)](https://www.npmjs.com/package/astro-edge)

---

Tired of seeing your competitors lead with faster sites? Stop settling for mediocre Lighthouse scores and slow builds. **AstroEdge** is the all-in-one toolkit designed to give your Astro project the ultimate performance advantage.

At its core, AstroEdge is powered by the `astro-optimizer` engine to automate the complex optimizations that separate the good sites from the great ones. Gain a decisive edge in speed, SEO, and user experience in minutes.

---

## ✨ Your Competitive Advantage

* **🚀 Peak Performance, Instantly:** Automatically compress images, bundle critical assets, and purge unused code to crush the competition with near-perfect Lighthouse scores.
* **⏱️ Develop at Lightspeed:** Slash build times from minutes to seconds with intelligent caching and parallel processing. Outpace your development cycle.
* **🩺 Bulletproof Reliability:** Go beyond speed. Our system health checks monitor dependencies, security, and performance trends, ensuring your site is not just fast, but also stable and secure.
* **🔌 Pluggable & Scalable:** Start with powerful presets, then customize and extend optimizers as your project grows. AstroEdge is built to keep you ahead.

---

## 🏆 Proven Results

**Real-world transformation from Brian Jhang's Edge:**
- ⚡ **Performance Score**: 79 → 100/100 (+21 points)
- 🖼️ **Image Optimization**: 4.2MB → 0.8MB (82% reduction)
- 🎯 **Core Web Vitals**: Perfect scores across FCP, LCP, TBT, CLS
- 🔧 **Build Time**: 3min → 30sec (83% faster)

---

## 🚀 Quick Start in 3 Steps

**1. Installation**

```bash
# Install globally for CLI usage
npm install -g astro-edge

# Or install in your project
npm install astro-edge --save-dev

# Or use directly with npx
npx astro-edge optimize
```

**2. Configure Astro Integration (Recommended)**

For maximum performance, integrate AstroEdge directly in your `astro.config.mjs`:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import astroEdge from 'astro-edge';

export default defineConfig({
  integrations: [
    astroEdge({
      optimization: {
        images: { format: 'webp', quality: 80 },
        static: true,
        compression: true
      },
      monitoring: {
        lighthouse: true,
        thresholds: { performance: 95 }
      }
    })
  ],
  output: 'static', // 🚀 Key performance optimization
});
```

**3. Run Optimization**

```bash
# Quick CLI usage
npx astro-edge optimize

# Or if installed globally
astro-edge optimize

# Auto-fix common issues
npx astro-edge optimize --auto-fix
```

---

## 🛠️ Available Tools

**Performance Optimization**
```bash
npm run optimize:images      # Convert PNG → WebP, compress assets
npm run optimize:complete    # Full optimization pipeline
```

**Performance Monitoring**
```bash
npm run performance:check    # Quick Lighthouse audit
npm run performance:monitor  # Detailed performance analysis
npm run performance:trends   # Historical performance tracking
```

**System Health**
```bash
npm run system:health        # Comprehensive system diagnostics
npm run project:maintenance  # Automated maintenance tasks
```

**OG Image Generation**
```bash
npm run og:generate         # Generate social media images
npm run og:sync            # Sync OG image paths
npm run og:clean           # Clean up unused OG images
```

---

## 📊 Core Features

### 🎯 Performance Optimization
- **Static Site Generation**: Automatic `output: 'static'` configuration
- **Image Compression**: Smart PNG → WebP conversion with 75% quality retention
- **Asset Optimization**: CSS/JS minification and bundling
- **Render Mode Optimization**: Intelligent prerendering strategies

### 📈 Intelligent Monitoring
- **Lighthouse Integration**: Automated performance scoring with thresholds
- **Trend Analysis**: Historical performance tracking and alerting
- **Custom Metrics**: Project-specific KPI monitoring
- **Detailed Reports**: JSON export for CI/CD integration

### 🩺 System Health
- **Dependency Auditing**: Security vulnerability scanning with auto-fix
- **Build System Validation**: Configuration optimization checks
- **Resource Management**: Automatic cleanup and backup
- **Health Scoring**: Overall project health assessment

### 🧠 Smart Error Handling
- **Environment Diagnostics**: Automatic detection of common configuration issues
- **Fix Suggestions**: Clear, actionable resolution steps
- **Auto-Fix**: One-click solutions for common dependency problems
- **Friendly Guidance**: Clear error messages and helpful instructions

---

## 🪐 Roadmap: The AstroEdge Ecosystem

AstroEdge is more than just an optimizer. It's the beginning of a complete ecosystem for professional Astro developers. Our vision includes:

**v1.0.0** (Stable Release): Now featuring true Astro integration and smart error handling!

Current features in v0.9.x:
- ✅ **True Astro Integration**: Direct integration in astro.config.mjs
- ✅ **Smart Error Handling**: Auto-diagnosis and auto-fix capabilities
- ✅ **Astro 5.x Compatibility**: Full support for latest Astro versions

Coming in v1.0.x:
- **Advanced Image Pipeline**: Deeper control over image formats, quality, and CDN integration
- **Interactive Setup Wizard**: Guided configuration for optimal performance
- **Visual Performance Reports**: Rich charts and performance analytics
- **VS Code Extension**: Integrated development experience

👉 We are building the ultimate toolkit to keep your Astro projects on the cutting edge.

---

## 📚 Documentation

- **[Getting Started](docs/getting-started.md)** - Your first AstroEdge optimization
- **[Performance Guide](docs/performance-optimization.md)** - Deep dive into optimization strategies
- **[Automation Handbook](docs/automation-handbook.md)** - Complete tool reference
- **[Best Practices](docs/best-practices.md)** - Battle-tested patterns and workflows

---

## 🏗️ Project Structure

```
astro-edge/
├── packages/
│   ├── astro-optimizer/     # Core optimization engine
│   ├── performance-monitor/ # Performance monitoring & alerting
│   ├── health-checker/      # System health & maintenance
│   └── cli/                # Command-line interface (coming soon)
├── docs/                   # Documentation & guides
├── examples/               # Example projects & demos
└── tools/                 # Development & build tools
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [issues page](https://github.com/brianjhang/astro-edge/issues).

**Development Setup:**

```bash
git clone https://github.com/brianjhang/astro-edge.git
cd astro-edge
npm install
npm test
```

---

## 💬 Community & Support

- **GitHub**: [Issues](https://github.com/brianjhang/astro-edge/issues) & [Discussions](https://github.com/brianjhang/astro-edge/discussions)
- **Origin Story**: Built from real optimization challenges at [Brian Jhang's Edge](https://brianjhang.com)
- **Blog**: [Performance optimization journey](https://brianjhang.com/build/)

---

## 🤖 A New Development Paradigm

`AstroEdge` is not built by a single entity, but by a collaborative symphony between a human director and a team of specialized AIs. This project adheres to a **Human-Led, AI-Powered** development philosophy, showcasing a new way to build powerful software with agility and lean resources.

For the initial `v0.9.x` release, the core AI collaborators included:

* **Project Lead, Strategy & Vision:**
    * **Brian Jhang** ([Brian Jhang's Edge](https://brianjhang.com))
* **AI Development Team:**
    * **Lead AI Programmer (Code Generation):** Anthropic's **Claude Code**
    * **AI Strategic Advisor (Branding & Documentation):** Google's **Gemini**
    * **AI Brainstorming Partner (Initial Concepts):** OpenAI's **ChatGPT**

This collaborative model is the essence of the "one-person AI super-individual company".

---

## 🌐 Multi-Language Support

- **[English](README.md)** - You're reading this version
- **[中文](README-zh.md)** - Chinese version with localized features

---

## 📜 License

MIT © 2025 Brian Jhang

---

**🚀 Ready to dominate your competition? Get the edge with AstroEdge.**