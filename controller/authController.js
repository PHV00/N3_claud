const connection = require("../database.js");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

exports.loginUsuario = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: "Email e senha obrigatórios" });

    try {
        const [results] = await connection.query("SELECT * FROM secretaria WHERE user = ?", [email]);
        if (results.length === 0) {
            return res.status(401).json({ message: "Email ou senha incorretos" });
        }

        const usuario = results[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaCorreta) {
            return res.status(401).json({ message: "Email ou senha incorretos" });
        }
        
        const payload = { id: usuario.id_secretaria, email: usuario.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.status(200).json({ message: "Login realizado com sucesso!", token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.criarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const [results] = await connection.query(
            "INSERT INTO user (name , password) VALUES (?, ?, ?)",
            [nome, email, senhaCriptografada]
        );
        res.status(201).json({ message: "Usuário criado com sucesso", id: results.insertId });
    } catch (err) {
        console.error("ERRO DETALHADO NO CATCH AO CRIAR USUÁRIO:", err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Este email já está em uso." });
        }
    
        res.status(500).json({ message: 'Ocorreu um erro interno ao processar seu cadastro.' });
    }
};