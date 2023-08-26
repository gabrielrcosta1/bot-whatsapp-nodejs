const { exec } = require('child_process');

// Função para executar uma API
function startApi(apiPath) {
    console.log(`Iniciando serve ....`)
    const apiProcess = exec(`node ${apiPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao executar a API em ${apiPath}: ${error}`);
            return;
        }
        console.log(`API em ${apiPath} executada: ${stdout}`);

    });


}

// Executa as APIs
startApi('api-bd-xui/index.js');
