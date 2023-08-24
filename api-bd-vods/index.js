const express = require('express');
const mysql = require('mysql');
const app = express();
const PORT = 4000;

const db = mysql.createConnection({
    host: '192.185.209.81',
    user: 'grsoft95_vods',
    password: '30200631@@',
    database: 'grsoft95_vods'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conexão bem-sucedida ao banco de dados');
    }
});

// Simulação de chaves de API armazenadas em um objeto
const apiKeys = {
    'chave_api_usuario_1': true,
    'chave_api_usuario_2': true
};

app.use(express.json());

app.get('/:apiKey/usuario/:username', (req, res) => {
    const apiKey = req.params.apiKey; // Pega a API Key da URL
    const username = req.params.username;

    if (apiKeys[apiKey]) {
        const query = 'SELECT * FROM admin_users WHERE username = ?';
        db.query(query, [username], (err, results) => {
            if (err) {
                console.error('Erro ao buscar usuário:', err);
                res.status(500).send('Erro ao buscar usuário');
            } else {
                if (results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.status(404).send('Usuário não encontrado');
                }
            }
        });
    } else {
        res.status(401).send('Acesso não autorizado');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});