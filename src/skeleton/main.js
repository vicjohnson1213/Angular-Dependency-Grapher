const radius = 400;
const width = 800;
const colorout = "#F42272";
const colorin = "#001F54";
const colornone = "#ccc";

tree = d3.cluster().size([2 * Math.PI, radius - 210]);
line = d3.lineRadial()
    .curve(d3.curveBundle.beta(0.8))
    .radius(d => d.y)
    .angle(d => d.x);

fetchLocal('./data.json')
    .then(res => res.json())
    .then((data) => generateChart(data))
    .catch(err => { throw err });

function generateChart(data) {
    const root = tree(bilink(d3.hierarchy(data)));

    const svg = d3.select("#chart")
        .append('svg')
        .attr('viewBox', [-width / 2, -width / 2, width, width]);

    const node = svg.append('g')
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .attr('fill', d => color(d))
        .text(d => d.parent.data.name + '.' + d.data.name)
        .each(function (d) { d.text = this; })
        .on("mouseover", overed)
        .on("mouseout", outed);

    const link = svg.append("g")
        .attr("stroke", colornone)
        .attr("fill", "none")
        .selectAll("path")
        .data(root.leaves().flatMap(leaf => leaf.importedBy))
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", ([i, o]) => line(i.path(o)))
        .each(function (d) { d.path = this; });

    function overed(d) {
        link.style("mix-blend-mode", null);
        d3.select(this).attr("font-weight", "bold");
        d3.selectAll(d.imports.map(d => d.path)).attr("stroke", colorin).raise();
        d3.selectAll(d.imports.map(([d]) => d.text)).attr("font-weight", "bold");
        d3.selectAll(d.importedBy.map(d => d.path)).attr("stroke", colorout).raise();
        d3.selectAll(d.importedBy.map(([, d]) => d.text)).attr("font-weight", "bold");
    }

    function outed(d) {
        link.style("mix-blend-mode", "multiply");
        d3.select(this).attr("font-weight", null);
        d3.selectAll(d.imports.map(d => d.path)).attr("stroke", null);
        d3.selectAll(d.imports.map(([d]) => d.text)).attr("font-weight", null);
        d3.selectAll(d.importedBy.map(d => d.path)).attr("stroke", null);
        d3.selectAll(d.importedBy.map(([, d]) => d.text)).attr("font-weight", null);
    }
}

function bilink(root) {
    const allExported = {};

    root.leaves().forEach(leaf => {
        leaf.data.exportedClasses.forEach(c => allExported[c] = leaf);
    });

    root.leaves().forEach(leaf => {
        leaf.importedBy = [];
        leaf.imports = leaf.data.importedClasses
            .filter(c => !!allExported[c])
            .map(c => [leaf, allExported[c]]);
    });

    root.leaves().forEach(leaf => {
        leaf.imports.forEach(i => i[1].importedBy.push(i));
    });

    return root;
}

function id(node) {
    return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}

function color(leaf) {
    if (leaf.parent.data.name === 'services')
        return '#3F7D20';
    if (leaf.parent.data.name === 'stores')
        return '#3185FC';
    if (leaf.parent.data.name === 'providers')
        return '#BC3908';

    return '#B74F6F';
}

async function fetchLocal(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest
        xhr.onload = function () {
            resolve(new Response(xhr.responseText, { status: xhr.status }))
        }
        xhr.onerror = function () {
            reject(new TypeError('Local request failed'))
        }
        xhr.open('GET', url)
        xhr.send(null)
    })
}
