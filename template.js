module.exports = function generateHtml(pedido) {
  return `
Pedido: ${pedido.numero}<br>
Data: ${pedido.data}<br>
Valor Total: ${pedido.totalvenda}<br>
`;
};
