#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all required files and dependencies are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Tamagotchi App Setup...\n');

let allGood = true;

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));
console.log(`📦 Node.js version: ${nodeVersion}`);
if (majorVersion < 16) {
  console.log('   ❌ Node.js version should be 16 or higher');
  allGood = false;
} else {
  console.log('   ✅ Node.js version OK');
}

// Check required files
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'public/index.html',
  'src/index.tsx',
  'src/App.tsx',
  'src/types/tamagotchi.ts',
  'src/store/tamagotchiStore.ts',
  'src/services/aiService.ts',
];

console.log('\n📁 Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ Missing: ${file}`);
    allGood = false;
  }
});

// Check package.json scripts
console.log('\n📜 Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

  const requiredScripts = ['start', 'build', 'test'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`   ✅ Script "${script}" found`);
    } else {
      console.log(`   ❌ Missing script: "${script}"`);
      allGood = false;
    }
  });

  // Check key dependencies
  console.log('\n📚 Checking key dependencies...');
  const requiredDeps = ['react', 'react-dom', 'typescript', 'zustand', 'framer-motion'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ Missing dependency: ${dep}`);
      allGood = false;
    }
  });
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
  allGood = false;
}

// Check node_modules
console.log('\n📦 Checking node_modules...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('   ✅ node_modules exists');
} else {
  console.log('   ⚠️  node_modules not found - run "npm install"');
  allGood = false;
}

// Check components
console.log('\n🧩 Checking components...');
const components = ['Actions', 'Chat', 'Environment', 'House', 'Learn', 'Pet', 'Reminders', 'Social', 'Stats'];
components.forEach(comp => {
  const compPath = path.join(__dirname, 'src', 'components', comp);
  if (fs.existsSync(compPath)) {
    console.log(`   ✅ ${comp}`);
  } else {
    console.log(`   ❌ Missing component: ${comp}`);
    allGood = false;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All checks passed! You\'re ready to run:');
  console.log('   npm start');
} else {
  console.log('❌ Some issues found. Please:');
  console.log('   1. Make sure you have the latest code');
  console.log('   2. Run: npm install');
  console.log('   3. Check SETUP.md for detailed instructions');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);
