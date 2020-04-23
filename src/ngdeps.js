const fs = require('fs').promises;
const path = require('path');

async function generateDependencyGraph(srcDir) {
    return walk(srcDir);
}

async function outputResults(outputDir, data) {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.copyFile(path.join(__dirname, 'skeleton', 'index.html'), path.join(outputDir, 'index.html'));
    await fs.copyFile(path.join(__dirname, 'skeleton', 'main.js'), path.join(outputDir, 'main.js'));
    await fs.copyFile(path.join(__dirname, 'skeleton', 'styles.css'), path.join(outputDir, 'styles.css'));

    data = JSON.stringify({ name: 'root', children: data }, ' ', 4);
    await fs.writeFile(path.join(outputDir, 'data.json'), data);
}

module.exports = {
    generateDependencyGraph: generateDependencyGraph,
    outputResults: outputResults
};

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
                imports = params.map(param => {
                    const split = param.split(':');
                    if (!!split[1]) {
                        split[1].trim();
                    }

                    return null;
                }).filter(p => !!p);
            }

            return { exports: exports, imports: imports };
        });
}
