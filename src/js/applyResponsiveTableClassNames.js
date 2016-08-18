var forEachAll = require('./forEachAll');

function alterTable(index, table) {
    var headers = [];

    forEachAll(table.querySelector('tr').children, (j, tr) => {
        headers.push(tr.innerHTML);
        tr.scope = 'col';
    });

    forEachAll(table.querySelectorAll('tr'), (j, tr) => {
        forEachAll(tr.children, (k, td) => {
            if ( k === 0)
            {
            td.setAttribute('scope', 'row');
            }
            else
            {
            td.setAttribute('data-title', headers[k]);
            }
        });
    });
}

function applyResponsiveTableClassNames() {
    forEachAll(document.querySelectorAll('table.responsive'), alterTable);
}

module.exports = applyResponsiveTableClassNames;