/* TODO:
 * - Criar design do template html.
 * - Colocar tudo em um pkg .exe
 * - gerar notas promissórias
 *
 *
 */

const packageJson = require('./package.json');
const fs = require('fs');
const readline = require('readline');
const Bling = require('bling-erp.js');
const { exec } = require('child_process');
const generateHtml = require('./template.js');

const configFile = process.cwd()+'\\config.json';
const tempHtmlFile = './index.html';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Apresentar as informações ao usuário
async function start() {
  console.log(`Gerador de Carnês - Versão: ${packageJson.version}\n`);
  let config = {};

  if (fs.existsSync(configFile)) {
    config = require(configFile);
  }

  if (config.apikey && config.storeName) {
    console.log(`Loja conectada: ${config.storeName}`);
    let bling = new Bling({ apikey: config.apikey });
    rl.question('Qual o número do pedido?\n', async (orderNumber) => {
      // Essa linha atribui o pedido 3168, uso somente para desenvolvimento
      orderNumber = orderNumber ? orderNumber : 3168;

      let pedido = await bling.pedidos.getByNumber(orderNumber);

      // Abre as promissórias
      openPromissories( pedido.pedidos[0].pedido.parcelas );

      fs.writeFileSync(tempHtmlFile, generateHtml(pedido.pedidos[0].pedido));
      openBrowser(tempHtmlFile);
      // abrir uma página com geração de carnê
      rl.close();
      console.log('Gerando carnê...\nReiniciando...');
      start();
    });
  } else {
    rl.question('Loja não configurada. Qual o nome da loja?\n', (storeName) => {
      config.storeName = storeName;

      rl.question('Qual a chave da api?\n', (apikey) => {
        config.apikey = apikey;
        let configJson = JSON.stringify(config);
        fs.writeFileSync(configFile, configJson);
        rl.close();
        start();
      });
    });
  }
}

const openBrowser = (tempHtmlFile) => {
  return new Promise((resolve) => {
    exec(`start "" ${tempHtmlFile}`);
    resolve();
  });
};

const openPromissories = ( paymentsArray ) => {
  for ( parcela of paymentsArray ) {
    let idParcela = parcela.parcela.idLancamento;
    openBrowser (`https://www.bling.com.br/b/conta.gerar.titulo.credito.php?id=${idParcela}&tipo=notapromissoria`);
  }
}

start();
