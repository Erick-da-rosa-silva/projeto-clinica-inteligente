const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clinica')
  .then(() => console.log('✅ MongoDB Conectado com Sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar o MongoDB:', err));

// ========== MODELS ==========

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  role: { type: String, default: 'user' },
  dataCadastro: { type: Date, default: Date.now }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

const pacienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cpf: { type: String, required: true },
  telefone: String,
  cep: String,
  endereco: String,
  dataCadastro: { type: Date, default: Date.now }
});

const Paciente = mongoose.model('Paciente', pacienteSchema);

const agendamentoSchema = new mongoose.Schema({
  paciente: { type: String, required: true },
  medico: { type: String, required: true },
  data: { type: String, required: true },
  hora: { type: String, required: true },
  especialidade: String,
  status: { type: String, default: 'agendado' },
  dataCadastro: { type: Date, default: Date.now }
});

const Agendamento = mongoose.model('Agendamento', agendamentoSchema);

// ========== MIDDLEWARE AUTH ==========

const autenticar = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo123');
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ========== ROTAS AUTH ==========

app.post('/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ error: 'Email já cadastrado' });
    const hash = await bcrypt.hash(senha, 10);
    const usuario = new Usuario({ nome, email, senha: hash });
    await usuario.save();
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao cadastrar' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ error: 'Email ou senha incorretos' });
    const valido = await bcrypt.compare(senha, usuario.senha);
    if (!valido) return res.status(400).json({ error: 'Email ou senha incorretos' });
    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET || 'segredo123',
      { expiresIn: '8h' }
    );
    res.json({ token, usuario: { nome: usuario.nome, email: usuario.email, role: usuario.role } });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao fazer login' });
  }
});

// ========== ROTAS PACIENTES ==========

app.get('/pacientes', autenticar, async (req, res) => {
  const pacientes = await Paciente.find().sort({ dataCadastro: -1 });
  res.json(pacientes);
});

app.post('/pacientes', autenticar, async (req, res) => {
  try {
    const novoPaciente = new Paciente(req.body);
    await novoPaciente.save();
    res.status(201).json(novoPaciente);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao salvar no banco' });
  }
});

app.delete('/pacientes/:id', autenticar, async (req, res) => {
  await Paciente.findByIdAndDelete(req.params.id);
  res.json({ message: 'Paciente removido!' });
});

// ========== ROTAS AGENDAMENTOS ==========

app.get('/agendamentos', autenticar, async (req, res) => {
  const agendamentos = await Agendamento.find().sort({ dataCadastro: -1 });
  res.json(agendamentos);
});

app.post('/agendamentos', autenticar, async (req, res) => {
  try {
    const novo = new Agendamento(req.body);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao agendar' });
  }
});

app.delete('/agendamentos/:id', autenticar, async (req, res) => {
  await Agendamento.findByIdAndDelete(req.params.id);
  res.json({ message: 'Agendamento removido!' });
});

app.patch('/agendamentos/:id', autenticar, async (req, res) => {
  const ag = await Agendamento.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(ag);
});

// ========== START ==========

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});