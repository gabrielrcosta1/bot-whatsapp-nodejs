const axios = require('axios');
const venom = require('venom-bot');
const mysql = require('mysql2/promise');
const dbConfig = require('./dbConfig.js');
const commandResponses = require('./menu.js');
const { STAGES, STAGESFROMMANUTENCION } = require('./stages.js');
const { boturl, vodSystem, dataFormatada } = require('./dataBaseVariables.js');

venom
    .create({
        session: 'charles-bot-2'
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
        const response = commandResponses[lowerCaseMessage];


        let username = '';
        let systemType = '';
        let orderName = '';
        let mediaType = '';

        if (lowerCaseMessage === '1') {
            client.sendText(message.from, 'Digite seu *usuário*:');
            userState[message.from] = STAGES.AWAITING_USER;
        } else if (userState[message.from] === 'awaiting-user') {
            userState[message.from] = null;
            username = message.body;
            try {
                const response = await axios.get(`http://localhost:3000/chave_api_usuario_1/usuario/${username}`);
                const userDetails = `*USUÁRIO RECONHECIDO*
Bem Vindo(a) ${username} 
Qual tipo de sistema? (IPTV ou P2P)`;
                client.sendText(message.from, userDetails);
                userState[message.from] = STAGES.AWAITING_SYSTEM_TYPE;
                userState[`${message.from}_username`] = username;
            } catch (error) {
                console.error('Error fetching user data:', error);
                client.sendText(message.from, '*Usuário* inválido. Por favor, digite *1* novamente.');
            }
        } else if (userState[message.from] === 'awaiting-system-type') {
            systemType = message.body;

            client.sendText(message.from, 'É um filme ou série?');
            userState[message.from] = STAGES.AWAITING_ORDER_NAME;
            userState[`${message.from}_systemType`] = systemType;
        } else if (userState[message.from] === 'awaiting-order-name') {
            orderName = message.body;

            client.sendText(message.from, 'Qual é o nome do pedido?');
            userState[message.from] = STAGES.AWAITING_MEDIA_TYPE;
            userState[`${message.from}_orderName`] = orderName;
        } else if (userState[message.from] === 'awaiting-media-type') {
            mediaType = message.body;

            client.sendText(message.from, 'Digite uma breve descrição do pedido:');
            userState[message.from] = STAGES.AWAITING_DESCRIPTION;
            userState[`${message.from}_mediaType`] = mediaType;
        } else if (userState[message.from] === 'awaiting-description') {
            const description = message.body;
            username = userState[`${message.from}_username`];
            systemType = userState[`${message.from}_systemType`];
            orderName = userState[`${message.from}_orderName`];
            mediaType = userState[`${message.from}_mediaType`];

            try {
                await connection.execute(
                    `INSERT INTO vods_requests(url_request, request_user, date_request, vod_name, vod_category, vod_system, vod_type, vod_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [boturl, username, dataFormatada, mediaType, orderName, systemType, vodSystem, description]
                );
                client.sendText(message.from, 'Pedido salvo com sucesso!');
            } catch (error) {
                console.error('Error saving data to database:', error);
                client.sendText(message.from, 'Erro ao salvar pedido no banco de dados.');
            }
            userState[message.from] = null;
        } else if (response) {
            client.sendText(message.from, response);
        }
    });
}
