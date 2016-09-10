import forEachAll from './forEachAll';

function alterTable(index, table) {
  const headers = [];

  forEachAll(table.querySelector('tr').children, (j, tr) => {
    headers.push(tr.innerHTML);
    tr.scope = 'col'; // eslint-disable-line no-param-reassign
  });

  forEachAll(table.querySelectorAll('tr'), (j, tr) => {
    forEachAll(tr.children, (k, td) => {
      if (k === 0) {
        td.setAttribute('scope', 'row');
      } else {
        td.setAttribute('data-title', headers[k]);
      }
    });
  });
}

export default function applyResponsiveTableClassNames() {
  forEachAll(document.querySelectorAll('table.responsive'), alterTable);
}
