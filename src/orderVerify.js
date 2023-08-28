const axios = require('axios');
const venom = require('venom-bot');
const mysql = require('mysql2/promise');
const dbConfig = require('./dbConfig.js');
const commandResponses = require('./menu.js');
const { STAGESFROMVERIFY } = require('./stages.js');
const { getOrdersForUser } = require('./getResponse.js');
const { boturl, vodSystem, dataFormatada } = require('./dataBaseVariables.js');

venom
    .create({
        session: 'charles-bot-3'
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

        let username = '';


        if (lowerCaseMessage === '3') {
            client.sendText(message.from, 'Digite seu *usuário de revenda* para verificar seus pedidos:');
            userState[message.from] = STAGESFROMVERIFY.AWAITING_USER;
        } else if (userState[message.from] === 'awaiting-user-verify') {
            userState[message.from] = null;
            username = message.body;
            (async () => {
                const userOrders = await getOrdersForUser(username);

                if (userOrders.length > 0) {
                    let ordersMessage = '';

                    for (const order of userOrders) {
                        ordersMessage += `PEDIDOS MARCADOS COM *EM ANDAMENTO* TEM PRAZO DE 24hrs PARA CONCLUSÃO\n`;
                        ordersMessage += `Nome do Pedido: *${order.name}*\n`;
                        ordersMessage += `Data de Requisição: *${order.request_date}*\n`;
                        if (order.reponses === null) {
                            ordersMessage += `Resposta do suporte: *sem resposta*\n`;
                        } else {
                            ordersMessage += `Resposta do suporte: *${order.reponses}*\n`;
                        }
                        ordersMessage += `Status: *${order.status}*\n`;

                        if (order.responses) {
                            ordersMessage += `Respostas: *${order.responses}*\n`;
                        }

                        ordersMessage += '\n';
                    }

                    client.sendText(message.from, `Aqui estão os seus pedidos:\n${ordersMessage}`);
                    userState[message.from] = null;
                } else {
                    client.sendText(message.from, 'Você não tem pedidos registrados.');
                    userState[message.from] = null;
                }
            })();
        }

    });
}
