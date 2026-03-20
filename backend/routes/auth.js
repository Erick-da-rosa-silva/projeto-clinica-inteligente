const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ROTA DE CADASTRO
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha, tipo, cep, endereco } = req.body;

        // Verifica se o e-mail já existe
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Usuário já cadastrado' });

        // Cria o novo usuário (o User.js vai criptografar a senha sozinho)
        user = new User({ nome, email, senha, tipo, cep, endereco });
        await user.save();

        res.status(201).json({ msg: 'Usuário criado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

module.exports = router;