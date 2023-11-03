const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define o Schema do usuário
const UsersSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  verificationCode: { type: Number, required: true },
  verified: { type: Boolean, default: false },
});

// Exporta o modelo
module.exports = mongoose.model('User', UsersSchema);
