const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Para hash de senhas
const jwt = require('jsonwebtoken'); // Para autenticação com JWT
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();

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
  console.log('Dados recebidos no login:', { username });

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

    // Verificar senha criptografada
    const user = results[0];
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        console.log('Login bem-sucedido para o usuário:', username);

        // Gera o token e inclui o userId
        const token = jwt.sign({ userId: user.id }, 'sua_chave_secreta', { expiresIn: '1h' });

        // Envia o token para o frontend como JSON
        res.status(200).json({ token }); // Retorna o token para o frontend
      } else {
        console.log('Senha incorreta para o usuário:', username);
        res.status(400).send('Nome de usuário ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro ao comparar senha:', error);
      res.status(500).send('Erro no servidor.');
    }
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
  const query = `
    SELECT tipo_venda, IFNULL(SUM(total), 0) AS total_vendas
    FROM pedidos
    WHERE DATE(data_pedido) = CURDATE()
    GROUP BY tipo_venda
  `;

  connection.query(query, (err, results) => {
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
  const query = 'SELECT nomeCompleto, papel FROM users WHERE id = ?';
  connection.query(query, [req.userId], (err, results) => {
      if (err) {
          console.error('Erro ao buscar informações do usuário:', err);
          return res.status(500).send('Erro no servidor.');
      }
      if (results.length === 0) {
          return res.status(404).send('Usuário não encontrado.');
      }
      res.json(results[0]);
  });
});

// Rota para alterar a senha do usuário logado
app.post('/alterar-senha', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const getPasswordQuery = 'SELECT password FROM users WHERE id = ?';
  
  connection.query(getPasswordQuery, [req.userId], async (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar senha do usuário.');
    if (results.length === 0) return res.status(404).send('Usuário não encontrado.');

    const isMatch = await bcrypt.compare(currentPassword, results[0].password);
    if (!isMatch) return res.status(400).send('Senha atual incorreta.');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
    connection.query(updatePasswordQuery, [hashedPassword, req.userId], (err) => {
      if (err) return res.status(500).send('Erro ao atualizar senha.');
      res.status(200).send('Senha alterada com sucesso!');
    });
  });
});

// Rota para buscar o valor total de vendas diárias para o mês atual
app.get('/vendas-mensais', (req, res) => {
  const query = `
      SELECT DAY(data_pedido) AS dia, IFNULL(SUM(total), 0) AS total_vendas
      FROM pedidos
      WHERE MONTH(data_pedido) = MONTH(CURDATE()) AND YEAR(data_pedido) = YEAR(CURDATE())
      GROUP BY dia
      ORDER BY dia
  `;
  connection.query(query, (err, results) => {
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
