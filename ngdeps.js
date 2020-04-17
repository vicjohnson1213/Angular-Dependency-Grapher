const fs = require('fs').promises;
const path = require('path');

const testDir = 'test';

walk(path.join(__dirname, testDir))
    .then(res => {

        console.log(JSON.stringify({ name: 'root', children: res }, ' ', 4));
    });

async function walk(dir, currentDir = '') {
    let files = await fs.readdir(dir);
    files = await Promise.all(files.map(async file => {
        const filepath = path.join(dir, file);
        const stats = await fs.stat(filepath);

        if (stats.isDirectory()) {
            let kiddos = await walk(filepath, path.join(currentDir, file))
            kiddos = kiddos.filter(k => k.type === 'ts' || k.type === 'dir');
            return { name: file, type: 'dir', children: kiddos };
        } else if (stats.isFile()) {
            const importsExports = await getImportsExports(filepath);

            return {
                name: file,
                type: file.split('.').pop(),
                path: path.join(currentDir, file),
                importedClasses: importsExports.imports,
                exportedClasses: importsExports.exports
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
