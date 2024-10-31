const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Para hash de senhas
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

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
    process.exit(1); // Saída com erro se não conectar
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Função de registro de usuário
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Dados recebidos no registro:', { username, email });

  // Verificar se o usuário ou e-mail já existe
  const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
  connection.query(checkUserQuery, [username, email], async (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).send('Erro no servidor.');
    }

    if (results.length > 0) {
      console.log('Usuário ou e-mail já cadastrado.');
      return res.status(400).send('Usuário ou e-mail já cadastrado.');
    }

    // Criptografar senha e inserir usuário no banco de dados
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Senha criptografada:', hashedPassword);

      const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      connection.query(insertUserQuery, [username, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Erro ao cadastrar usuário:', err);
          return res.status(500).send('Erro no servidor ao cadastrar usuário.');
        }
        res.status(201).send('Usuário cadastrado com sucesso!');
      });
    } catch (error) {
      console.error('Erro ao criptografar senha:', error);
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
        res.status(200).send('Login bem-sucedido!');
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

// estoque

// Listar produtos do estoque
app.get('/estoque', (req, res) => {
  const query = 'SELECT * FROM estoque';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao listar estoque:', err);
      return res.status(500).send('Erro no servidor.');
    }
    res.json(results);
  });
});

//adicionar no estoque
app.post('/estoque', (req, res) => {
  const { codigo, quantidade, valorUnitario } = req.body;

  // Log para depuração
  console.log("Dados recebidos para adicionar produto:", { codigo, quantidade, valorUnitario });

  // Verificar se todos os campos foram enviados
  if (!codigo || quantidade == null || valorUnitario == null) {
    return res.status(400).send("Todos os campos (código, quantidade e valor unitário) são obrigatórios.");
  }

  const query = 'INSERT INTO estoque (codigo, quantidade, valorUnitario, quantidadeEmEstoque) VALUES (?, ?, ?, ?)';
  connection.query(query, [codigo, quantidade, valorUnitario, quantidade], (err, result) => {
    if (err) {
      console.error('Erro ao adicionar produto ao estoque:', err);
      return res.status(500).send('Erro no servidor ao adicionar produto.');
    }
    res.status(201).send('Produto adicionado com sucesso!');
  });
});

// Editar produto no estoque
app.put('/estoque/:id', (req, res) => {
  const { id } = req.params;
  const { quantidade, valorUnitario } = req.body;
  const query = 'UPDATE estoque SET quantidade = ?, valorUnitario = ? WHERE id = ?';
  connection.query(query, [quantidade, valorUnitario, id], (err, result) => {
    if (err) {
      console.error('Erro ao editar produto no estoque:', err);
      return res.status(500).send('Erro no servidor.');
    }
    res.status(200).send('Produto atualizado com sucesso!');
  });
});

// Remover produto do estoque
app.delete('/estoque/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM estoque WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erro ao remover produto do estoque:', err);
      return res.status(500).send('Erro no servidor.');
    }
    res.status(200).send('Produto removido com sucesso!');
  });
});

// Rota para obter todos os produtos
app.get('/produtos', (req, res) => {
  connection.query('SELECT * FROM produtos', (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      return res.status(500).send('Erro no servidor');
    }
    res.json(results);
  });
});

// Rota para finalizar pedido
app.post('/finalizar-pedido', (req, res) => {
  const { produtos, total, pagamento, desconto } = req.body;

  // Armazena os dados do pedido no banco
  const query = 'INSERT INTO pedidos (produtos, total, pagamento, desconto) VALUES (?, ?, ?, ?)';
  connection.query(query, [JSON.stringify(produtos), total, pagamento, desconto], (err, result) => {
    if (err) {
      console.error('Erro ao finalizar pedido:', err);
      return res.status(500).send('Erro no servidor');
    }
    res.status(200).send('Pedido finalizado com sucesso');
  });
});

// Rota para ver o tipo da venda do pedido
app.post('/finalizar-pedido', (req, res) => {
  const { produtos, total, pagamento, desconto, tipoVenda } = req.body;

  if (!tipoVenda) {
    console.error('Tipo de venda não especificado');
    return res.status(400).send('Tipo de venda é obrigatório');
  }

  const query = 'INSERT INTO pedidos (produtos, total, pagamento, desconto, tipo_venda) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [JSON.stringify(produtos), total, pagamento, desconto, tipoVenda], (err, result) => {
    if (err) {
      console.error('Erro ao finalizar pedido:', err);
      return res.status(500).send('Erro no servidor');
    }
    res.status(200).send('Pedido finalizado com sucesso');
  });
});

// Rota para buscar produtos com menos de 5 unidades no estoque
app.get('/produtos-baixa-quantidade', (req, res) => {
  const query = 'SELECT codigo, quantidade FROM estoque WHERE quantidade < 5';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos com baixa quantidade:', err.message); // Log detalhado do erro
      return res.status(500).json({ error: 'Erro ao buscar produtos com baixa quantidade.' });
    }
    console.log('Produtos com baixa quantidade encontrados:', results);
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
    if (err) {
      console.error('Erro ao buscar vendas diárias:', err); // Log detalhado do erro
      return res.status(500).json({ error: 'Erro ao buscar vendas diárias.' });
    }
    res.json(results[0]);
  });
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
