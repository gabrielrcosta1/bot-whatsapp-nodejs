const axios = require('axios');
const venom = require('venom-bot');
const mysql = require('mysql2/promise');
const dbConfig = require('./dbConfig.js');
const commandResponses = require('./menu.js');
const { STAGES, STAGESFROMMANUTENCION } = require('./stages.js');
const { boturl, vodSystem, dataFormatada } = require('./dataBaseVariables.js');

venom
    .create({
        session: 'charles-bot'
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

;

const userState = {};

async function start(client) {
    const connection = await mysql.createConnection(dbConfig);

    client.onMessage(async (message) => {
        let lowerCaseMessage = message.body.toLowerCase();
        const commandsMessage = `📌 Menu de Opções 📌
Olá! Bem-vindo ao nosso menu de escolhas. Por favor, selecione uma das opções abaixo:

1 - Novo pedido✅.
2 - Pedir manutenção⚒️.
3 - Verificar pedido 👁️.

Responda com o número da opção desejada para podermos continuar!`;


        if (lowerCaseMessage === '/menu') {
            client.sendText(message.from, commandsMessage)
        }
    });
}
