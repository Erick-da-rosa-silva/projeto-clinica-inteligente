const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    telefone: String,
    email: String,
    dataNascimento: Date,
    historico: String,
    dataCadastro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paciente', PacienteSchema);