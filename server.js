const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const venom = require('venom-bot');
const fetch = require('node-fetch');
const bodyParser = require("body-parser");
const app = express();
require('dotenv').config(); // Carrega as variáveis de ambiente


let qrCodeImage; // Variável para armazenar o QR code
let client; // Armazena o cliente do Venom-Bot para uso posterior

// Middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do banco de dados MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Anjo100%',  // Substitua pela sua senha
  database: 'inonsoft',
  port: 3306
});

// Conectar ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Rota para iniciar o Venom-Bot
app.get('/start-bot', async (req, res) => {
  if (client) {
    return res.json({ message: 'Bot já está iniciado.' });
  }

  try {
    // Espera até o QR Code ser gerado
    await new Promise((resolve, reject) => {
      venom
        .create({
          session: 'sessionName',
          folderSession: './sessions',
          headless: 'new',
          executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          browserArgs: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-extensions',
            '--headless=new'
          ],
          catchQR: (base64Qr) => {
            qrCodeImage = base64Qr;
            console.log('✅ QR code gerado e armazenado!');
            resolve(); // 🔥 libera o andamento da rota quando o QR é gerado
          }
        })
        .then((newClient) => {
          client = newClient;
          startBot(client);
        })
        .catch((error) => {
          console.error('Erro ao iniciar o bot:', error);
          reject(error);
        });
    });

    // Só executa depois que o QR code foi realmente capturado
    res.json({ message: 'Bot iniciado e QR code pronto!' });

  } catch (error) {
    console.error('Erro geral ao iniciar o bot:', error);
    res.status(500).json({ message: 'Erro ao iniciar o bot.' });
  }
});
// Rota para pegar o QR code
app.get('/qr-code', (req, res) => {
  if (qrCodeImage) {
    res.json({ qrCode: qrCodeImage });
  } else {
    res.status(500).json({ message: 'QR code não disponível no servidor.' });
  }
});

// Rota para status do bot
app.get('/status', (req, res) => {
  res.json({ connected: !!client });
});

// Função que inicia a lógica de atendimento
function startBot(client) {
  console.log('Bot de WhatsApp iniciado com sucesso!');

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  async function atendimentoPadrao(client, msg, nome) {
    await delay(3000);
    client.sendText(
      msg.from,
      `Olá, ${nome}! Sou o assistente virtual da *Açaiteria Zaponi Intense*. Como posso ajudar você hoje? Digite uma das opções abaixo:\n\n` +
        `1 - Ver nosso cardápio\n` +
        `2 - Promoções do dia\n` +
        `3 - Horário de funcionamento\n` +
        `4 - Localização e contato\n` +
        `5 - Outras dúvidas`
    );
  }

  client.onMessage(async (msg) => {
    if (msg.from.endsWith('@c.us')) {
      const contact = await client.getContact(msg.from);
      const nome = contact.pushname?.split(" ")[0] || "Cliente";

      if (/^(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)$/i.test(msg.body)) {
        await atendimentoPadrao(client, msg, nome);
      } else if (msg.body === '1') {
        await delay(3000);
        client.sendText(
          msg.from,
          `*Açaiteria Zaponi Intense - Cardápio*\n\n` +
          `*Açaí*\n - 300ml: R$ 10,00\n - 500ml: R$ 15,00\n - 700ml: R$ 20,00\n - 1L: R$ 25,00\n\n` +
          `*Combos de Açaí:*\n - Fit: R$ 18,00\n - Tropical: R$ 22,00\n - Especial: R$ 25,00\n\n` +
          `*Complementos:* R$ 2,00 a R$ 3,00\n\n` +
          `*Sorvetes:* R$ 6,00 a R$ 7,50\n\n` +
          `*Milkshakes:* R$ 12,00 a R$ 18,00\n\n` +
          `*Bebidas:* R$ 5,00 a R$ 8,00`
        );
      } else if (msg.body === '2') {
        await delay(3000);
        client.sendText(
          msg.from,
          `🌟 *Promoções do Dia* 🌟\n\n` +
          `🍧 Açaí em dobro\n🍦 Sorvete 2L de R$30 por R$25\n\nSó hoje!`
        );
      } else if (msg.body === '3') {
        await delay(3000);
        client.sendText(
          msg.from,
          `🕒 Funcionamento:\nSeg-Sex: 10h-22h\nSáb-Dom: 12h-23h`
        );
      } else if (msg.body === '4') {
        await delay(3000);
        client.sendText(
          msg.from,
          `📍 R. Sandro Antônio Mendes, 175, Parque Vitoria Regia\n📞 (11) 1234-5678`
        );
      } else if (msg.body === '5') {
        await delay(3000);
        client.sendText(
          msg.from,
          `Fale conosco aqui ou pelo telefone: (11) 1234-5678`
        );
      } else {
        // IA via Easy-Peasy
        try {
          const response = await fetch('https://bots.easy-peasy.ai/bot/d68ba378-65f0-48ef-8d7b-e80563b35345/api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': '4ab87c4c-d729-46b2-963a-beaa40653b3d',
            },
            body: JSON.stringify({
              message: msg.body,
              history: [],
              stream: false,
            }),
          });

          const data = await response.json();
          const replyText = data.bot?.text || 'Desculpe, não consegui processar a resposta.';
          await client.sendText(msg.from, replyText);
        } catch (error) {
          console.error('Erro com Easy-Peasy:', error);
          await client.sendText(msg.from, 'Erro ao processar sua mensagem.');
        }
      }
    }
  });
}

// Configuração do transportador do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Substitua pelo seu provedor de e-mail, ex: "gmail"
  auth: {
    user: "lluis.teste10@gmailcom", // Coloque seu e-mail aqui
    pass: "louis12_%" // Coloque a senha do seu e-mail aqui
  }
});

// Rota para envio de mensagens de contato
app.post('/contact', (req, res) => {
  const { nome, telefone, email, mensagem } = req.body;

  // Configura as opções de envio do e-mail
  const mailOptions = {
    from: email,
    to: 'lluis.teste10@gmai.com', // Endereço de e-mail que receberá as mensagens de contato
    subject: `Mensagem de Contato de ${nome}`,
    text: `Nome: ${nome}\nTelefone: ${telefone}\nE-mail: ${email}\nMensagem: ${mensagem}`
  };

  // Envia o e-mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Erro ao enviar e-mail:", error);
      return res.status(500).send("Erro ao enviar mensagem.");
    }
    console.log("E-mail enviado: " + info.response);
    res.status(200).send("Mensagem enviada com sucesso!");
  });
});
// Middleware para autenticação com JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.userId = user.userId; // Adiciona o ID do usuário ao objeto de requisição
      next();
  });
}


// Função de registro de usuário
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
  connection.query(checkUserQuery, [username, email], async (err, results) => {
    if (err) return res.status(500).send('Erro no servidor.');

    if (results.length > 0) return res.status(400).send('Usuário ou e-mail já cadastrado.');

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      connection.query(insertUserQuery, [username, email, hashedPassword], (err) => {
        if (err) return res.status(500).send('Erro ao cadastrar usuário.');
        res.status(201).send('Usuário cadastrado com sucesso!');
      });
    } catch {
      res.status(500).send('Erro no servidor.');
    }
  });
});

// Função de login de usuário
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  connection.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Erro ao fazer login:', err);
      return res.status(500).send('Erro no servidor.');
    }

    if (results.length === 0) {
      console.log('Usuário não encontrado.');
      return res.status(400).send('Nome de usuário ou senha incorretos.');
    }

    const user = results[0];
    if (!user.password) {
      console.error('Hash da senha não encontrado para o usuário:', username);
      return res.status(500).send('Erro no servidor.');
    }

    console.log('Senha fornecida:', password);
    console.log('Hash da senha no banco de dados:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Nome de usuário ou senha incorretos.');

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ token });
  });
});

// Funções para o estoque

// Listar produtos do estoque
app.get('/estoque', (req, res) => {
  connection.query('SELECT * FROM estoque', (err, results) => {
    if (err) return res.status(500).send('Erro no servidor.');
    res.json(results);
  });
});

// Adicionar produto ao estoque
app.post('/estoque', (req, res) => {
  const { codigo, quantidade, valorUnitario } = req.body;
  if (!codigo || quantidade == null || valorUnitario == null)
    return res.status(400).send("Todos os campos (código, quantidade e valor unitário) são obrigatórios.");

  const query = 'INSERT INTO estoque (codigo, quantidade, valorUnitario) VALUES (?, ?, ?)';
  connection.query(query, [codigo, quantidade, valorUnitario], (err) => {
    if (err) return res.status(500).send('Erro ao adicionar produto.');
    res.status(201).send('Produto adicionado com sucesso!');
  });
});

// Editar produto no estoque
app.put('/estoque/:id', (req, res) => {
  const { id } = req.params;
  const { quantidade, valorUnitario } = req.body;
  const query = 'UPDATE estoque SET quantidade = ?, valorUnitario = ? WHERE id = ?';
  connection.query(query, [quantidade, valorUnitario, id], (err) => {
    if (err) return res.status(500).send('Erro ao editar produto.');
    res.status(200).send('Produto atualizado com sucesso!');
  });
});

// Remover produto do estoque
app.delete('/estoque/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM estoque WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send('Erro ao remover produto.');
    res.status(200).send('Produto removido com sucesso!');
  });
});

// Rota para listar produtos disponíveis para venda
app.get('/produtos', (req, res) => {
  connection.query('SELECT * FROM produtos', (err, results) => {
    if (err) return res.status(500).send('Erro no servidor');
    res.json(results);
  });
});

// Rota para finalizar pedido com tipo de venda
app.post('/finalizar-pedido', (req, res) => {
  const { produtos, total, pagamento, desconto, tipoVenda } = req.body;
  const query = 'INSERT INTO pedidos (produtos, total, pagamento, desconto, tipo_venda) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [JSON.stringify(produtos), total, pagamento, desconto, tipoVenda], (err) => {
    if (err) return res.status(500).send('Erro ao finalizar pedido');
    res.status(200).send('Pedido finalizado com sucesso');
  });
});

// Rota para listar produtos com baixa quantidade no estoque
app.get('/produtos-baixa-quantidade', (req, res) => {
  connection.query('SELECT codigo, quantidade FROM estoque WHERE quantidade < 5', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar produtos com baixa quantidade.' });
    res.json(results);
  });
});

// Rota para buscar o valor total de vendas diárias
app.get('/vendas-diarias', (req, res) => {
  const query = `
    SELECT IFNULL(SUM(total), 0) AS total_vendas
    FROM pedidos
    WHERE DATE(data_pedido) = CURDATE()
  `;
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar vendas diárias.' });
    res.json(results[0]);
  });
});

// Rota para buscar o valor total de vendas diárias separadas por tipo de venda
app.get('/vendas-diarias-separadas', (req, res) => {
  const mes = req.query.mes || new Date().getMonth() + 1;
  const ano = req.query.ano || new Date().getFullYear();

  const query = `
    SELECT tipo_venda, IFNULL(SUM(total), 0) AS total_vendas
    FROM pedidos
    WHERE MONTH(data_pedido) = ? AND YEAR(data_pedido) = ?
    GROUP BY tipo_venda
  `;

  connection.query(query, [mes, ano], (err, results) => {
    if (err) {
      console.error('Erro ao buscar vendas diárias separadas:', err);
      return res.status(500).json({ error: 'Erro ao buscar vendas diárias separadas.' });
    }

    const vendas = {
      delivery: 0,
      lojaFisica: 0,
    };

    results.forEach(row => {
      if (row.tipo_venda === 'Delivery') {
        vendas.delivery = row.total_vendas;
      } else if (row.tipo_venda === 'Loja Física') {
        vendas.lojaFisica = row.total_vendas;
      }
    });

    res.json(vendas);
  });
});

// Rota para obter informações do usuário logado
app.get('/usuario-info', authenticateToken, (req, res) => {
  const query = 'SELECT username, email FROM users WHERE id = ?';
  connection.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar informações do usuário:', err);
      return res.status(500).send('Erro no servidor.');
    }
    if (results.length === 0) {
      return res.status(404).send('Usuário não encontrado.');
    }
    res.json(results[0]); // Retorna os dados do usuário
  });
});

// Rota para alterar a senha do usuário logado
app.post('/alterar-senha', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Verifica se os campos estão presentes
  if (!currentPassword || !newPassword) {
    return res.status(400).send('Os campos "currentPassword" e "newPassword" são obrigatórios.');
  }

  const getPasswordQuery = 'SELECT password FROM users WHERE id = ?';

  connection.query(getPasswordQuery, [req.userId], async (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar senha do usuário.');
    if (results.length === 0) return res.status(404).send('Usuário não encontrado.');

    const hashedPassword = results[0].password;
    if (!hashedPassword) {
      console.error('Hash da senha não encontrado no banco de dados.');
      return res.status(500).send('Erro no servidor.');
    }

    console.log('Senha atual fornecida:', currentPassword);
    console.log('Hash da senha no banco de dados:', hashedPassword);

    const isMatch = await bcrypt.compare(currentPassword, hashedPassword);
    if (!isMatch) return res.status(400).send('Senha atual incorreta.');

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
    connection.query(updatePasswordQuery, [newHashedPassword, req.userId], (err) => {
      if (err) return res.status(500).send('Erro ao atualizar senha.');
      res.status(200).send('Senha alterada com sucesso!');
    });
  });
});

// Rota para buscar o valor total de vendas diárias para o mês atual
app.get('/vendas-mensais', (req, res) => {
  const mes = req.query.mes || new Date().getMonth() + 1; // Mês atual se não for passado
  const ano = req.query.ano || new Date().getFullYear(); // Ano atual se não for passado

  const query = `
      SELECT DAY(data_pedido) AS dia, IFNULL(SUM(total), 0) AS total_vendas
      FROM pedidos
      WHERE MONTH(data_pedido) = ? AND YEAR(data_pedido) = ?
      GROUP BY dia
      ORDER BY dia
  `;
  connection.query(query, [mes, ano], (err, results) => {
      if (err) {
          console.error('Erro ao buscar vendas mensais:', err);
          return res.status(500).json({ error: 'Erro ao buscar vendas mensais.' });
      }
      res.json(results);
  });
});


// Iniciar o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
