const packageJson = require('./package.json');
const fs = require('fs');
const readline = require('readline');
const Bling = require('bling-erp.js');

const configFile = './config.json';

const pergunta = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Apresentar as informações ao usuário
function start() {
  console.log(`Gerador de Carnês - Versão: ${packageJson.version}\n`);
  let config = {};

  if (fs.existsSync(configFile)) {
    config = require(configFile);
  }

  if (config.apikey && config.storeName) {
    console.log(`Loja conectada: ${config.storeName}`);
    let bling = new Bling({ apikey: config.apikey });

    pergunta.question('Qual o número do pedido?\n', async (orderNumber) => {
      try {
        let pedido = await bling.pedidos.getByNumber(orderNumber);
        console.log(pedido.pedidos[0].pedido);
        // TODO: Usar dados do pedido para gerar carnê
        pergunta.close();
      } catch (e) {
        console.error(e);
      }
    });
  } else {
    pergunta.question(
      'Loja não configurada. Qual o nome da loja?\n',
      (storeName) => {
        config.storeName = storeName;

        pergunta.question('Qual a chave da api?\n', (apikey) => {
          config.apikey = apikey;
          let configJson = JSON.stringify(config);
          fs.writeFileSync(configFile, configJson);
          pergunta.close();
        });
      }
    );
  }
}

// Abrir tela com pdf ou html do carnê gerado.

start();
