#!/usr/bin/env node

/**
 * AstroEdge CLI
 * Give your Astro site the winning edge.
 */

import { runOptimization } from '../packages/astro-optimizer/index.js';

// Handle CLI commands
const command = process.argv[2];

if (!command) {
  console.log(`
🌌 AstroEdge CLI - Give your Astro site the winning edge!

Usage:
  astro-edge optimize    # Run complete optimization
  astro-edge --help      # Show this help
  astro-edge --version   # Show version

Available optimizations:
  🚀 Static output configuration
  🖼️  Image compression (PNG → WebP)
  📊 Performance monitoring
  🩺 System health checks

Example:
  cd your-astro-project
  astro-edge optimize

For more info: https://github.com/brianjhang/astro-edge
  `);
  process.exit(0);
}

if (command === '--help' || command === 'help') {
  console.log(`
🌌 AstroEdge - Complete Performance & Health Toolkit for Astro

Commands:
  optimize     Run complete optimization suite
  --version    Show version information
  --help       Show this help message

Examples:
  astro-edge optimize              # Run all optimizations

Get started:
  1. cd your-astro-project
  2. astro-edge optimize
  3. Enjoy your optimized Astro site!

Documentation: https://github.com/brianjhang/astro-edge
Issues: https://github.com/brianjhang/astro-edge/issues
  `);
  process.exit(0);
}

if (command === '--version' || command === 'version') {
  const { readFileSync } = await import('fs');
  const { join, dirname } = await import('path');
  const { fileURLToPath } = await import('url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packagePath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));

  console.log(`AstroEdge v${pkg.version}`);
  process.exit(0);
}

// Run the optimization
runOptimization();