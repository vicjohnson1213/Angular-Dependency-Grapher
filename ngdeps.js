const fs = require('fs').promises;
const path = require('path');

const testDir = 'test';

getTsFiles(path.join(__dirname, testDir))
    .then(files => Promise.all(files.map(f => getImportsExports(path.join(__dirname, testDir, f)))))
    .then(importsExports => console.log(importsExports));

async function getImportsExports(filepath) {
    return await fs.readFile(filepath, 'utf8')
        .then(content => {
            let exports = [];
            let imports = [];

            const exportsRe = /export\s+class\s+([A-Za-z\d_]+)/;
            const importsRe = /constructor\(([^{]*)\)/;

            const exportMatches = content.match(exportsRe);
            const constructorMatches = content.match(importsRe);
            
            if (exportMatches) {
                exports = [exportMatches[1]];
            }

            if (constructorMatches) {
                const params = constructorMatches[1].split(',');
                imports = params.map(param => param.split(':')[1].trim());
            }

            return { exports: exports, imports: imports };
        });
}

async function getTsFiles(dir, currentDir = '') {
    let files = await fs.readdir(dir);
    files = await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
            return getTsFiles(filePath, path.join(currentDir, file));
        } else if (stats.isFile()) {
            return path.join(currentDir, file);
        }
    }));
    
    return files.reduce((all, folderContents) => all.concat(folderContents), [])
        .filter(file => file.split('.').pop() === 'ts');
}
