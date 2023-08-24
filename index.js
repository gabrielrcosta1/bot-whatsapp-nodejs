const axios = require('axios');
const venom = require('venom-bot');
const mysql = require('mysql2/promise'); // Importe o pacote mysql2
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '30200631',
    database: 'pedidos',
};

venom
    .create({
        session: 'session-name' // nome da sessão
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

const commandResponses = {
    'comandos': `
    ❗❗= Comandos =❗❗
    ✅ [ 1 ] - Novo Pedido
    ✅ [ 2 ] - Manutenção`,
    '1': 'Você escolheu Novo Pedido. Por favor, digite um CEP válido para continuar.',
    '2': 'Você escolheu Manutenção. Por favor, explique qual é o problema.',
};

const userState = {};

async function start(client) {
    client.onMessage(async (message) => {
        const connection = await mysql.createConnection(dbConfig);
        const lowerCaseMessage = message.body.toLowerCase();
        const response = commandResponses[lowerCaseMessage];
        const commandsMessage = `
        ❗❗= Comandos =❗❗
        ✅ [ 1 ] - Consultar CEP
        ✅ [ 2 ] - Manutenção`;
        if (lowerCaseMessage === 'menu') {
            client
                .sendText(message.from, commandsMessage)
                .then((result) => {
                    console.log('Result: ', result); // objeto de sucesso retornado
                })
                .catch((erro) => {
                    console.error('Error when sending: ', erro); // objeto de erro retornado
                });
        } else if (lowerCaseMessage === '1') {
            client.sendText(message.from, 'Digite seu CEP (apenas numeros)');
            userState[message.from] = 'awaiting-cep'; // Define o estado do usuário para aguardar o CEP
        } else if (userState[message.from] === 'awaiting-cep') {
            userState[message.from] = null; // Limpa o estado do usuário
            const cep = message.body.replace(/\D/g, ''); // Remove caracteres não numéricos do CEP
            if (cep.length !== 8) {
                client.sendText(message.from, 'CEP inválido. Por favor, insira um CEP válido.');
                return;
            }
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                const data = response.data;

                const cepDetails = `Detalhes do CEP:
Localidade: ${data.localidade}
UF: ${data.uf}
DDD: ${data.ddd}`;
                client.sendText(message.from, cepDetails);
                try {
                    // Salvar informações no banco de dados
                    await connection.execute(
                        `INSERT INTO cep_data (user, cep, localidade, uf, ddd) VALUES (?, ?, ?, ?, ?)`,
                        [message.from, cep, data.localidade, data.uf, data.ddd]
                    );

                    client.sendText(message.from, 'Informações do CEP salvas no banco de dados.');
                } catch (error) {
                    console.error('Error saving data to database:', error);
                    client.sendText(message.from, 'Erro ao salvar informações no banco de dados.');
                }
            } catch (error) {
                console.error('Error fetching data from ViaCEP:', error);
                client.sendText(message.from, 'CEP inválido. Por favor, tente novamente.');
            }
        } else if (response) {
            client.sendText(message.from, response);
        }
    });
}

