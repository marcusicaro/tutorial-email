require('dotenv').config();
const express = require('express');
const app = express();
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('./models/user');
const { sendEmail } = require('./utils/sendMail');
var validator = require('email-validator');
var bodyParser = require('body-parser');

const MongoDBKey = process.env.MONGODB_KEY;
const MongoDBName = process.env.MONGODB_NAME;
const dev_db_url = `mongodb+srv://admin:${MongoDBKey}@cluster0.lnrds0m.mongodb.net/${MongoDBName}?retryWrites=true&w=majority`;
const mongoDB = dev_db_url;

async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

app.use(bodyParser.json());

// Define as rotas da aplicação
app.post(
  '/create_account',
  asyncHandler(async (req, res) => {
    try {
      const verificationCode = Math.floor(Math.random() * 1000000);
      const { username, email } = req.body;

      if (!validator.validate(email)) {
        return res.status(400).send('Email inválido');
      }
      const userWithSameEmail = await User.findOne({ email: email });
      if (userWithSameEmail) {
        return res.status(400).send('Email já cadastrado');
      }
      if (typeof username !== 'string' || !username.length > 0) {
        return res.status(400).send('Usuário inválido');
      }
      const userWithSameUsername = await User.findOne({ username: username });
      if (userWithSameUsername) {
        return res.status(400).send('Usuário já existe');
      }

      const user = new User({
        username: username,
        email: email,
        verificationCode: verificationCode,
      });

      await user.save();
      await sendEmail(email, verificationCode);
      return res.status(201).send('Usuário criado com sucesso');
    } catch (err) {
      return res.status(500).send('Erro ao criar conta');
    }
  })
);

app.post(
  '/validate_user',
  asyncHandler(async (req, res) => {
    try {
      const { username, verificationCode } = req.body;
      const user = await User.findOne({
        username: username,
        verificationCode: verificationCode,
      });
      if (!user) {
        return res.status(400).send('Usuário não encontrado');
      }
      if (user.verified === true) {
        return res.status(400).send('Usuário já validado');
      }
      user.verified = true;
      await user.save();
      return res.status(200).send('Usuário validado com sucesso');
    } catch {
      return res.status(500).send('Erro ao validar usuário');
    }
  })
);

app.post(
  '/login',
  asyncHandler(async (req, res) => {
    try {
      const { username } = req.body;
      const user = await User.findOne({
        username: username,
      });
      if (user.verified === false) {
        return res.status(400).send('Usuário não validado');
      }
      return res.send('Olá, usuário validado!');
    } catch {
      return res.status(500).send('Erro ao realizar login.');
    }
  })
);

// Inicializa o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
