// index.js
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/whatsapp', (req, res) => {
    const incomingMessage = req.body.Body;
    const from = req.body.From;
    
    let responseMessage = 'Desculpe, não entendi sua mensagem.';

    if (incomingMessage.toLowerCase().includes('pedido')) {
        responseMessage = 'Você pode consultar o status do seu pedido enviando o número do pedido.';
    } else if (incomingMessage.toLowerCase().includes('ajuda')) {
        responseMessage = 'Como posso te ajudar?';
    }

    client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: from,
        body: responseMessage
    }).then(message => console.log(message.sid)).catch(err => console.error(err));

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
