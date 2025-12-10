/**
 * Script to replace console.error statements with error monitoring
 * Run with: node scripts/replace-console-errors.js
 */

const fs = require('fs');
const path = require('path');

// Files to process (identified from grep search)
const filesToProcess = [
    'src/utils/trackingUtils.ts',
    'src/utils/tmdbApiCleanup.ts',
    'src/utils/streamingUtils.ts',
    'src/utils/securityUtils.ts',
    'src/utils/realtimeSync.ts',
    'src/utils/productionUtils.ts',
    'src/utils/productionReadiness.ts',
    'src/utils/productionLogger.ts',
    'src/utils/premiumUtils.ts',
    'src/utils/mediaCache.ts',
    'src/utils/errorReporting.ts',
    'src/utils/debugUtils.ts',
    'src/utils/contentUtils.ts',
    'src/utils/aiUtils.ts',
    'src/services/personalization.ts',
    'src/pages/ContactSupport.tsx',
    'src/pages/DeleteAccount.tsx',
    'src/pages/Downloads.tsx',
    'src/pages/Favorites.tsx',
    'src/pages/WatchHistory.tsx',
    'src/pages/ExportData.tsx',
    'src/hooks/useContentPreload.ts',
    'src/hooks/useSmartDownload.ts',
    'src/hooks/useUserProfile.ts',
    'src/hooks/useWatchTracking.ts',
    'src/hooks/usePWA.ts',
    'src/hooks/useCreditSystem.ts',
    'src/hooks/useContinueWatching.ts',
    'src/hooks/useContentDetails.ts',
    'src/hooks/useAIRecommendations.ts',
    'src/contexts/AuthContext.tsx',
    'src/components/PremiumCodeInput.tsx',
    'src/components/navigation/SearchBar.tsx'
];

function getComponentName(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    return fileName;
}

function addImportIfNeeded(content) {
    // Check if import already exists
    if (content.includes('from \'@/services/errorMonitoring\'') ||
        content.includes('from "@/services/errorMonitoring"')) {
        return content;
    }

    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
            lastImportIndex = i;
        }
    }

    // Add import after last import
    if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0,
            'import { captureException, ErrorSeverity } from \'@/services/errorMonitoring\';');
        return lines.join('\n');
    }

    // If no imports found, add at the beginning
    return 'import { captureException, ErrorSeverity } from \'@/services/errorMonitoring\';\n\n' + content;
}

function replaceConsoleErrors(content, componentName) {
    let modified = content;
    let replacementCount = 0;

    // Pattern 1: console.error('message', error)
    const pattern1 = /console\.error\(['"]([^'"]+)['"],\s*(\w+)\);?/g;
    modified = modified.replace(pattern1, (match, message, errorVar) => {
        replacementCount++;
        return `captureException(${errorVar}, {
      component: '${componentName}',
      action: 'error',
      metadata: { message: '${message}' }
    }, ErrorSeverity.ERROR);`;
    });

    // Pattern 2: console.error(error)
    const pattern2 = /console\.error\((\w+)\);?/g;
    modified = modified.replace(pattern2, (match, errorVar) => {
        replacementCount++;
        return `captureException(${errorVar}, {
      component: '${componentName}',
      action: 'error'
    }, ErrorSeverity.ERROR);`;
    });

    // Pattern 3: console.error('message')
    const pattern3 = /console\.error\(['"]([^'"]+)['"]\);?/g;
    modified = modified.replace(pattern3, (match, message) => {
        replacementCount++;
        return `captureMessage('${message}', ErrorSeverity.ERROR, {
      component: '${componentName}'
    });`;
    });

    // Pattern 4: console.error with template literals
    const pattern4 = /console\.error\(`([^`]+)`\);?/g;
    modified = modified.replace(pattern4, (match, message) => {
        replacementCount++;
        return `captureMessage(\`${message}\`, ErrorSeverity.ERROR, {
      component: '${componentName}'
    });`;
    });

    return { content: modified, count: replacementCount };
}

function processFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return { processed: false, count: 0 };
    }

    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        const componentName = getComponentName(filePath);

        // Replace console.error statements
        const { content: modifiedContent, count } = replaceConsoleErrors(content, componentName);

        if (count > 0) {
            // Add import if needed
            const finalContent = addImportIfNeeded(modifiedContent);

            // Write back to file
            fs.writeFileSync(fullPath, finalContent, 'utf8');
            console.log(`✅ ${filePath}: Replaced ${count} console.error statement(s)`);
            return { processed: true, count };
        } else {
            console.log(`ℹ️  ${filePath}: No console.error statements found`);
            return { processed: false, count: 0 };
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return { processed: false, count: 0 };
    }
}

function main() {
    console.log('🚀 Starting console.error replacement...\n');

    let totalProcessed = 0;
    let totalReplacements = 0;

    filesToProcess.forEach(filePath => {
        const result = processFile(filePath);
        if (result.processed) {
            totalProcessed++;
            totalReplacements += result.count;
        }
    });

    console.log('\n📊 Summary:');
    console.log(`   Files processed: ${totalProcessed}/${filesToProcess.length}`);
    console.log(`   Total replacements: ${totalReplacements}`);
    console.log('\n✨ Done! Please review the changes and test thoroughly.');
}

// Run the script
main();
