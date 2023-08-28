
const boturl = 'BOT';
const vodSystem = 'Adição';
const vodSystemmanutencion = 'Manutenção';
const dataAtual = new Date();
const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
const dataFormatada = dataAtual.toLocaleDateString('pt-BR', options);

module.exports = {
    boturl,
    vodSystem,
    vodSystemmanutencion,
    dataFormatada
}

