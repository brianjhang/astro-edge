# Getting Started with AstroEdge

**Give your Astro site the winning edge in under 5 minutes.**

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **Astro**: 4.0.0 or higher
- **npm/yarn**: Latest version

## Quick Installation

### Method 1: NPM Package (Coming Soon)
```bash
npm install astro-edge --save-dev
```

### Method 2: Manual Installation
```bash
# Clone the repository
git clone https://github.com/brianjhang/astro-edge.git
cd astro-edge

# Install dependencies
npm install

# Copy tools to your Astro project
cp -r tools/ /path/to/your/astro/project/
```

## Basic Setup

### 1. Astro Integration

Add AstroEdge to your `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import astroEdge from 'astro-edge';

export default defineConfig({
  integrations: [astroEdge()],
});
```

### 2. Package Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "optimize": "astro-edge optimize",
    "optimize:images": "node tools/optimize-og-images.js",
    "optimize:complete": "npm run optimize:images && echo '✅ Optimization complete'",
    "performance:check": "npx lighthouse https://your-domain.com --preset=desktop --only-categories=performance",
    "performance:monitor": "node tools/performance-monitor.js",
    "system:health": "node tools/system-health-check.js"
  }
}
```

## First Optimization

### 1. Static Output Configuration

AstroEdge automatically configures your Astro project for maximum performance by enabling static output:

```javascript
// This is done automatically by AstroEdge
export default defineConfig({
  output: 'static', // ⚡ Massive performance boost
  integrations: [astroEdge()],
});
```

### 2. Image Optimization

If you have images in `public/images/`, run:

```bash
npm run optimize:images
```

This will:
- Convert PNG → WebP (82% compression)
- Maintain 75% quality for perfect visual experience
- Automatically backup original files

### 3. Performance Check

Verify your optimization results:

```bash
npm run performance:check
```

Expected results:
- **Performance Score**: 90-100/100
- **FCP**: <1.5 seconds
- **LCP**: <2.5 seconds
- **Perfect Core Web Vitals**

## Advanced Configuration

### Custom Optimization Settings

```javascript
import astroEdge from 'astro-edge';

export default defineConfig({
  integrations: [
    astroEdge({
      images: {
        format: 'webp',
        quality: 80, // Custom quality
        compressionLevel: 9
      },
      performance: {
        thresholds: {
          performance: 95, // Stricter threshold
          fcp: 1.0,
          lcp: 2.0
        }
      }
    })
  ],
});
```

### Monitoring Setup

For continuous monitoring, add to your CI/CD:

```yaml
# .github/workflows/performance.yml
name: Performance Check
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run performance:check
      - run: npm run system:health
```

## Troubleshooting

### Common Issues

**1. "Not in an Astro project directory"**
```bash
# Make sure you're in your Astro project root
ls astro.config.mjs  # Should exist
```

**2. "Sharp not found" (Image optimization)**
```bash
# Install Sharp dependency
npm install sharp --save-dev
```

**3. "Permission denied" (macOS)**
```bash
# Make tools executable
chmod +x tools/*.js
```

### Performance Issues

If you don't see expected performance improvements:

1. **Check output mode**:
   ```bash
   # Verify static output is enabled
   grep "output.*static" astro.config.mjs
   ```

2. **Run complete optimization**:
   ```bash
   npm run optimize:complete
   ```

3. **Check build output**:
   ```bash
   npm run build
   # Should see static files in dist/
   ```

## Next Steps

- **[Performance Guide](performance-optimization.md)** - Deep dive into optimization strategies
- **[Automation Handbook](automation-handbook.md)** - Complete tool reference
- **[Best Practices](best-practices.md)** - Battle-tested patterns

## Support

- **GitHub Issues**: [Report problems](https://github.com/brianjhang/astro-edge/issues)
- **Discussions**: [Community support](https://github.com/brianjhang/astro-edge/discussions)
- **Origin Story**: [Brian Jhang's Edge](https://brianjhang.com)

---

**🚀 Ready to dominate your competition? Your Astro site now has the winning edge!**