const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Para hash de senhas
const app = express();

app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Anjo100%',  // Substitua pela sua senha correta
  database: 'inonsoft',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Rota de registro
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Log dos dados recebidos para depuração
  console.log('Dados recebidos no registro:', { username, email, password });

  // Verificar se o usuário já existe
  const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
  connection.query(checkUserQuery, [username, email], async (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).send('Erro no servidor.');
    }

    if (results.length > 0) {
      // Usuário já existe
      return res.status(400).send('Usuário ou e-mail já cadastrado.');
    }

    // Se não existir, cadastrar o novo usuário com senha criptografada
    const hashedPassword = await bcrypt.hash(password, 10); // Hash da senha
    console.log('Senha criptografada:', hashedPassword); // Log para depuração

    const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(insertUserQuery, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar usuário:', err);
        return res.status(500).send('Erro no servidor ao cadastrar usuário.');
      }
      res.status(200).send('Usuário cadastrado com sucesso!');
    });
  });
});

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Log dos dados recebidos para depuração
  console.log('Dados recebidos no login:', { username, password });

  const sql = 'SELECT * FROM users WHERE username = ?';
  
  connection.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Erro ao fazer login:', err);
      return res.status(500).send('Erro no servidor.');
    }
    
    if (results.length > 0) {
      const user = results[0];
      
      // Comparar a senha com o hash no banco de dados
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.status(200).send('Login bem-sucedido!');
      } else {
        res.status(400).send('Nome de usuário ou senha incorretos.');
      }
    } else {
      res.status(400).send('Nome de usuário ou senha incorretos.');
    }
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
