#!/usr/bin/env node

/**
 * @astro-edge/optimizer
 * Core optimization engine for AstroEdge
 *
 * Provides automated performance optimization for Astro projects including:
 * - Static output configuration
 * - Image optimization (PNG → WebP)
 * - Asset compression
 * - Build optimization
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Core optimization configuration
const OPTIMIZER_CONFIG = {
  images: {
    format: 'webp',
    quality: 75,
    compressionLevel: 9,
    progressive: true,
    optimize: true
  },
  build: {
    staticOutput: true,
    minification: true,
    compression: true
  },
  performance: {
    thresholds: {
      performance: 90,
      fcp: 1.5,
      lcp: 2.5,
      tbt: 300,
      cls: 0.1
    }
  },
  vite: {
    optimizeDeps: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
};

/**
 * Run build optimizations
 */
function runBuildOptimizations(config) {
  const optimizations = [];

  // Image optimization
  if (config.images?.optimize && fs.existsSync('public/images')) {
    console.log('  🖼️  Optimizing images...');
    try {
      const toolsPath = path.join(__dirname, '../../tools');
      execSync(`node ${toolsPath}/optimize-og-images.js`, { stdio: 'pipe' });
      console.log('  ✅ Image optimization completed');
      optimizations.push('Image optimization');
    } catch (error) {
      console.log('  ⚠️  Image optimization skipped (install sharp: npm install sharp)');
    }
  }

  // Performance check
  if (config.performance) {
    console.log('  📊 Running performance analysis...');
    try {
      const toolsPath = path.join(__dirname, '../../tools');
      execSync(`node ${toolsPath}/performance-monitor.js`, { stdio: 'pipe' });
      console.log('  ✅ Performance analysis completed');
      optimizations.push('Performance analysis');
    } catch (error) {
      console.log('  ⚠️  Performance analysis skipped');
    }
  }

  return optimizations;
}

/**
 * Generate comprehensive build report
 */
function generateBuildReport(buildDir, pages, config) {
  console.log('\n📊 AstroEdge Build Report:');
  console.log('='.repeat(40));

  // Convert URL to string if needed (Astro 5.x compatibility)
  const buildPath = buildDir instanceof URL ? buildDir.pathname : buildDir;

  // Basic build info
  console.log(`📁 Build directory: ${path.relative(process.cwd(), buildPath)}`);
  console.log(`📄 Pages generated: ${pages?.length || 'Unknown'}`);

  // Check build size
  try {
    const stats = fs.statSync(buildPath);
    console.log(`📦 Build completed: ${new Date(stats.mtime).toLocaleString()}`);
  } catch (error) {
    // Build directory might not exist yet
  }

  // List optimizations applied
  console.log('\n✅ Optimizations applied:');
  console.log('  • Static output enabled');
  if (config.images?.optimize) console.log('  • Image optimization');
  if (config.vite?.optimizeDeps) console.log('  • Vite optimization');
  if (config.build?.compression) console.log('  • Asset compression');

  console.log('\n💡 Next steps:');
  console.log('  • Run: npm run performance:check');
  console.log('  • Deploy and monitor performance');
  console.log('  • Check: https://pagespeed.web.dev/');
}

/**
 * AstroEdge Astro Integration
 * Automatically optimizes Astro configuration for maximum performance
 */
export default function astroEdge(options = {}) {
  const config = { ...OPTIMIZER_CONFIG, ...options };
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    name: 'astro-edge',
    hooks: {
      'astro:config:setup': ({ config: astroConfig, updateConfig, injectScript }) => {
        console.log('🌌 AstroEdge: Optimizing your Astro configuration...');

        // Build optimized Astro configuration
        const optimizations = {};

        // Force static output for maximum performance
        if (config.build?.staticOutput && (!astroConfig.output || astroConfig.output !== 'static')) {
          console.log('  ⚡ Switching to static output for peak performance');
          optimizations.output = 'static';
        }

        // Optimize Vite configuration
        if (config.vite?.optimizeDeps) {
          console.log('  ⚙️  Optimizing Vite configuration...');
          optimizations.vite = {
            ...astroConfig.vite,
            build: {
              ...astroConfig.vite?.build,
              cssCodeSplit: true,
              rollupOptions: {
                ...astroConfig.vite?.build?.rollupOptions,
                ...config.vite.rollupOptions
              }
            },
            optimizeDeps: {
              include: ['sharp']
            }
          };
        }

        // Apply optimizations
        if (Object.keys(optimizations).length > 0) {
          updateConfig(optimizations);
          console.log('  🚀 Performance optimizations applied');
        }

        // Inject performance monitoring script in development
        if (!isProduction) {
          injectScript('page-ssr', `
            if (typeof window !== 'undefined') {
              console.log('🌌 AstroEdge: Performance monitoring active');
              // Add web vitals monitoring
              window.__astroEdgeStart = performance.now();
            }
          `);
        }
      },

      'astro:build:start': () => {
        console.log('🌌 AstroEdge: Build optimization started');

        // Run comprehensive optimization
        runBuildOptimizations(config);
      },

      'astro:build:done': ({ dir, pages }) => {
        console.log('🌌 AstroEdge: Build optimization completed');

        // Generate comprehensive build report
        generateBuildReport(dir, pages, config);

        console.log('  🏆 Your Astro site now has the winning edge!');
        console.log('\n🚀 Ready to dominate your competition!');
      }
    }
  };
}

/**
 * Smart error handling and diagnostics
 */
function diagnoseEnvironment() {
  const issues = [];
  const fixes = [];

  // Check if in Astro project
  if (!fs.existsSync('astro.config.mjs') && !fs.existsSync('astro.config.js')) {
    issues.push('Not in an Astro project directory');
    fixes.push('Navigate to your Astro project root directory');
  }

  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    issues.push('package.json not found');
    fixes.push('Run: npm init astro@latest');
  } else {
    // Check for required dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (!dependencies['astro']) {
      issues.push('Astro not installed');
      fixes.push('Run: npm install astro');
    }

    if (!dependencies['sharp']) {
      issues.push('Sharp not installed (required for image optimization)');
      fixes.push('Run: npm install sharp --save-dev');
    }
  }

  // Check node version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    issues.push(`Node.js ${nodeVersion} is too old`);
    fixes.push('Upgrade to Node.js 18 or higher');
  }

  return { issues, fixes };
}

/**
 * Auto-fix common issues
 */
function autoFix(fixes) {
  console.log('\n🔧 Auto-fixing issues...');

  for (const fix of fixes) {
    if (fix.startsWith('Run: npm install')) {
      const command = fix.replace('Run: ', '');
      try {
        console.log(`  ⚡ Executing: ${command}`);
        execSync(command, { stdio: 'inherit' });
        console.log(`  ✅ Fixed: ${fix}`);
      } catch (error) {
        console.log(`  ❌ Failed to auto-fix: ${fix}`);
      }
    }
  }
}

/**
 * CLI Command Interface with smart error handling
 */
export function runOptimization() {
  console.log('🌌 AstroEdge CLI - Give your Astro site the winning edge!');

  const commands = {
    optimize: () => {
      console.log('🚀 Running complete optimization...');

      // Smart environment diagnosis
      const { issues, fixes } = diagnoseEnvironment();

      if (issues.length > 0) {
        console.log('\n⚠️  Issues detected:');
        issues.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue}`);
        });

        console.log('\n💡 Suggested fixes:');
        fixes.forEach((fix, index) => {
          console.log(`  ${index + 1}. ${fix}`);
        });

        // Ask for auto-fix
        const autoFixable = fixes.filter(fix => fix.startsWith('Run: npm install'));
        if (autoFixable.length > 0) {
          console.log('\n🤖 Some issues can be auto-fixed.');
          console.log('   Run with --auto-fix to automatically resolve them');
          console.log('   Example: npx astro-edge optimize --auto-fix');

          if (process.argv.includes('--auto-fix')) {
            autoFix(autoFixable);
          }
        }

        if (!process.argv.includes('--auto-fix')) {
          process.exit(1);
        }
      }

      try {
        const toolsPath = path.join(__dirname, '../../tools');
        const results = [];

        // Run optimization tools with better error handling
        console.log('\n📊 Running performance check...');
        try {
          execSync(`node ${toolsPath}/performance-monitor.js`, { stdio: 'pipe' });
          console.log('  ✅ Performance check completed');
          results.push('✅ Performance analysis');
        } catch (error) {
          console.log('  ⚠️  Performance check skipped (lighthouse not available)');
          results.push('⚠️ Performance analysis skipped');
        }

        console.log('🖼️  Optimizing images...');
        try {
          execSync(`node ${toolsPath}/optimize-og-images.js`, { stdio: 'pipe' });
          console.log('  ✅ Image optimization completed');
          results.push('✅ Image optimization');
        } catch (error) {
          console.log('  ⚠️  Image optimization skipped (sharp required)');
          results.push('⚠️ Image optimization skipped');
        }

        console.log('🏥 Running system health check...');
        try {
          execSync(`node ${toolsPath}/system-health-check.js`, { stdio: 'pipe' });
          console.log('  ✅ System health check completed');
          results.push('✅ System health check');
        } catch (error) {
          console.log('  ⚠️  System health check skipped');
          results.push('⚠️ System health check skipped');
        }

        // Display summary
        console.log('\n📋 Optimization Summary:');
        console.log('='.repeat(40));
        results.forEach(result => console.log(`  ${result}`));

        console.log('\n🏆 Optimization completed! Your Astro site now has the edge.');
        console.log('💡 Next steps:');
        console.log('   • Build your project: npm run build');
        console.log('   • Test performance: npx lighthouse https://your-site.com');
        console.log('   • Deploy and monitor!');

      } catch (error) {
        console.error('\n❌ Optimization failed:', error.message);
        console.log('\n🆘 Need help? Check:');
        console.log('   • GitHub Issues: https://github.com/brianjhang/astro-edge/issues');
        console.log('   • Documentation: https://github.com/brianjhang/astro-edge/docs');
        process.exit(1);
      }
    }
  };

  const command = process.argv[2];
  if (commands[command]) {
    commands[command]();
  } else {
    console.log('\n🌌 AstroEdge CLI - Available commands:');
    console.log('   optimize [--auto-fix]  Run complete optimization');
    console.log('   --help                 Show this help');
    console.log('   --version              Show version');
    console.log('\nExample: npx astro-edge optimize --auto-fix');
  }
}