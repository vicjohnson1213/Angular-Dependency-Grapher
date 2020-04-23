#!/usr/bin/env node

const path = require('path');
const { program } = require('commander');
const ngDeps = require('./ngdeps');


program
    .arguments('<srcDir>')
    .option('-o --output <outputDir>', 'The directory to output the results to')
    .action(srcDir => {
        ngDeps.generateDependencyGraph(path.join(process.cwd(), srcDir))
            .then(data => {
                if (program.output) {
                    return ngDeps.outputResults(path.join(process.cwd(), program.output), data);
                }

                console.log(JSON.stringify(data, ' ', 2));
            });
    })
    .parse(process.argv);
