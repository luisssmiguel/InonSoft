const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Conectar ao banco de dados MySQL
const connection = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: 'Anjo100%',
   database: 'inonsoft'
});

connection.connect((err) => {
   if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      return;
   }
   console.log('Conectado ao banco de dados MySQL.');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para registrar usuário
app.post('/register', (req, res) => {
   const { username, email, password } = req.body;
   const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
   connection.query(sql, [username, email, password], (err, result) => {
      if (err) {
         console.error('Erro ao cadastrar usuário:', err);
         res.status(500).send('Erro ao cadastrar usuário.');
      } else {
         res.status(200).send('Usuário cadastrado com sucesso.');
      }
   });
});

// Rota para login
app.post('/login', (req, res) => {
   const { username, password } = req.body;
   const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
   connection.query(sql, [username, password], (err, results) => {
      if (err) {
         console.error('Erro ao fazer login:', err);
         res.status(500).send('Erro no servidor.');
      } else if (results.length > 0) {
         res.status(200).send('Login bem-sucedido!');
      } else {
         res.status(400).send('Nome de usuário ou senha incorretos.');
      }
   });
});

app.listen(port, () => {
   console.log(`Servidor rodando em http://localhost:${port}`);
});
