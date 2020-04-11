const fs = require('fs').promises;
const path = require('path');

const testDir = 'test';

walk(path.join(__dirname, testDir))
    .then(res => {
        console.log(JSON.stringify(res, ' ', 4));
    });

async function walk(dir, currentDir = '') {
    let files = await fs.readdir(dir);
    files = await Promise.all(files.map(async file => {
        const filepath = path.join(dir, file);
        const stats = await fs.stat(filepath);

        if (stats.isDirectory()) {
            const kiddos = await walk(filepath, path.join(currentDir, file));
            return { name: file, children: kiddos };
        } else if (stats.isFile()) {
            const importsExports = await getImportsExports(filepath);
            return {
                name: file,
                path: path.join(currentDir, file),
                imports: importsExports.imports,
                exports: importsExports.exports
            };
        }
    }));
    
    return files;
}

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
