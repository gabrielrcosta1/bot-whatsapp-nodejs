const axios = require('axios');
const venom = require('venom-bot');
const mysql = require('mysql2/promise'); // Importando a versão Promise do mysql2

const dbConfig = {
    host: '162.212.158.182',
    user: 'root',
    password: '30200631Gbr.@@',
    database: 'vods',
};

venom
    .create({
        session: 'session-name'
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

const commandResponses = {
    'comandos': `
    📌 Menu de Opções 📌

Olá! Bem-vindo ao nosso menu de escolhas. Por favor, selecione uma das opções abaixo:

1 - Novo pedido✅.
2 - Pedir manutenção⚒️.
3 - Verificar pedido 👁️.
Responda com o número da opção desejada para podermos continuar!`,
    '1': 'Você escolheu Novo Pedido. Por favor, digite seu *usuário* válido para continuar.',
    '2': 'Você escolheu Manutenção. Por favor, explique qual é o problema.',
};

const userState = {};

async function start(client) {
    const connection = await mysql.createConnection(dbConfig);

    client.onMessage(async (message) => {
        let lowerCaseMessage = message.body.toLowerCase();
        const response = commandResponses[lowerCaseMessage];
        const commandsMessage = `
        📌 Menu de Opções 📌

Olá! Bem-vindo ao nosso menu de escolhas. Por favor, selecione uma das opções abaixo:

1 - Novo pedido✅.
2 - Pedir manutenção⚒️.
3 - Verificar pedido 👁️.
Responda com o número da opção desejada para podermos continuar!`;

        let username = '';
        let systemType = '';
        let orderName = '';
        let mediaType = '';

        if (lowerCaseMessage === 'menu') {
            client
                .sendText(message.from, commandsMessage)
                .then((result) => {
                    console.log('Result: ', result);
                })
                .catch((erro) => {
                    console.error('Error when sending: ', erro);
                });
        } else if (lowerCaseMessage === '1') {
            client.sendText(message.from, 'Digite seu *usuário*:');
            userState[message.from] = 'awaiting-user';
        } else if (userState[message.from] === 'awaiting-user') {
            userState[message.from] = null;
            username = message.body;

            try {
                const response = await axios.get(`http://localhost:3000/chave_api_usuario_1/usuario/${username}`);
                const data = response.data;
                const userDetails = `*USUÁRIO RECONHECIDO*
Bem Vindo(a) ${username} 
Qual tipo de sistema? (IPTV ou P2P)`;
                client.sendText(message.from, userDetails);
                userState[message.from] = 'awaiting-system-type';
                userState[`${message.from}_username`] = username;
            } catch (error) {
                console.error('Error fetching user data:', error);
                client.sendText(message.from, '*Usuário* inválido. Por favor, tente novamente.');
            }
        } else if (userState[message.from] === 'awaiting-system-type') {
            systemType = message.body;

            client.sendText(message.from, 'É um filme ou série?');
            userState[message.from] = 'awaiting-order-name';
            userState[`${message.from}_systemType`] = systemType;
        } else if (userState[message.from] === 'awaiting-order-name') {
            orderName = message.body;

            client.sendText(message.from, 'Qual é o nome do pedido?');
            userState[message.from] = 'awaiting-media-type';
            userState[`${message.from}_orderName`] = orderName;
        } else if (userState[message.from] === 'awaiting-media-type') {
            mediaType = message.body;

            client.sendText(message.from, 'Digite uma breve descrição do pedido:');
            userState[message.from] = 'awaiting-description';
            userState[`${message.from}_mediaType`] = mediaType;
        } else if (userState[message.from] === 'awaiting-description') {
            const description = message.body;
            const dataAtual = new Date();
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            const dataFormatada = dataAtual.toLocaleDateString('pt-BR', options);
            const boturl = 'BOT';
            const vodSystem = 'Adição';
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
