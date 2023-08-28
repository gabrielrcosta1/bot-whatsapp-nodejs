const mysql = require('mysql2/promise');

const dbConfig = {
    host: '162.212.158.182',
    user: 'root',
    password: '30200631Gbr.@@',
    database: 'vods',
};

const getReplay = async (keyword) => {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT responses FROM `chat-bot` WHERE quests = ?', [keyword]);
    connection.end();
    if (rows.length > 0) return rows[0].responses;
    return false;
}





module.exports = getReplay;