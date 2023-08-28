const axios = require('axios');
const venom = require('venom-bot');
const mysql = require('mysql2/promise');
const dbConfig = require('./dbConfig.js');
const commandResponses = require('./menu.js');
const { STAGES, STAGESFROMMANUTENCION } = require('./stages.js');
const { boturl, vodSystem, dataFormatada } = require('./dataBaseVariables.js');

venom
    .create({
        session: 'charles-bot-1'
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

        if (lowerCaseMessage === '2') {
            userState[message.from] = STAGESFROMMANUTENCION.AWAITING_USER;
        } else if (userState[message.from] === 'awaiting-user-manutencion') {
            userState[message.from] = null;
            username = message.body;
            try {
                const response = await axios.get(`http://localhost:3000/chave_api_usuario_1/usuario/${username}`);
                const userDetails = `*USUÁRIO RECONHECIDO*
Bem Vindo(a) ${username} 
Qual tipo de sistema? (IPTV ou P2P)`;
                client.sendText(message.from, userDetails);
                userState[message.from] = STAGESFROMMANUTENCION.AWAITING_SYSTEM_TYPE;
                userState[`${message.from}_username`] = username;
            } catch (error) {
                console.error('Error fetching user data:', error);
                client.sendText(message.from, '*Usuário* inválido. Por favor, digite *1* novamente.');
            }
        } else if (userState[message.from] === 'awaiting-system-type-manutencion') {
            systemType = message.body;

            client.sendText(message.from, 'É um filme ou série?');
            userState[message.from] = STAGESFROMMANUTENCION.AWAITING_ORDER_NAME;
            userState[`${message.from}_systemType`] = systemType;
        } else if (userState[message.from] === 'awaiting-order-name-manutencion') {
            orderName = message.body;

            client.sendText(message.from, 'Qual é o nome do VOD a sofrer manutenção?');
            userState[message.from] = STAGESFROMMANUTENCION.AWAITING_MEDIA_TYPE;
            userState[`${message.from}_orderName`] = orderName;
        } else if (userState[message.from] === 'awaiting-media-type-manutencion') {
            mediaType = message.body;

            client.sendText(message.from, 'Digite qual a manutenção:');
            userState[message.from] = STAGESFROMMANUTENCION.AWAITING_DESCRIPTION;
            userState[`${message.from}_mediaType`] = mediaType;
        } else if (userState[message.from] === 'awaiting-description-manutencion') {
            const description = message.body;
            username = userState[`${message.from}_username`];
            systemType = userState[`${message.from}_systemType`];
            orderName = userState[`${message.from}_orderName`];
            mediaType = userState[`${message.from}_mediaType`];

            const vodSystemmanutencion = 'Manutenção';
            try {
                await connection.execute(
                    `INSERT INTO vods_requests(url_request, request_user, date_request, vod_name, vod_category, vod_system, vod_type, vod_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [boturl, username, dataFormatada, mediaType, orderName, systemType, vodSystemmanutencion, description]
                );
                client.sendText(message.from, 'Pedido salvo com sucesso!');
            } catch (error) {
                console.error('Error saving data to database:', error);
                client.sendText(message.from, 'Erro ao salvar pedido no banco de dados.');
            }
        }
        else if (response) {
            client.sendText(message.from, response);
        }
    });
}
