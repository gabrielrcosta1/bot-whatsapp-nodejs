const mysql = require('mysql2/promise');

const dbConfig = {
    host: '162.212.158.182',
    user: 'root',
    password: '30200631Gbr.@@',
    database: 'vods',
};
const statusMap = {
    0: 'Pendente',
    1: 'Finalizado',
    2: 'Em andamento'
};

const getReplay = async (keyword) => {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT responses FROM `chat-bot` WHERE quests = ?', [keyword]);
    connection.end();
    if (rows.length > 0) return rows[0].responses;
    return false;
}
async function getOrdersForUser(username) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const query = 'SELECT vod_name, date_request, vod_status, vod_response FROM vods_requests WHERE request_user = ?';
        const [rows] = await connection.execute(query, [username]);


        const translatedRows = rows.map(row => ({
            name: row.vod_name,
            request_date: row.date_request,
            reponses: row.vod_response,
            status: statusMap[row.vod_status]
        }));

        return translatedRows;
    } catch (error) {
        console.error('Erro ao consultar o banco de dados:', error);
        return [];
    } finally {
        connection.end();
    }
}


module.exports = { getReplay, getOrdersForUser };