require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
// const session = require('express-session');
// const bodyParser = require('body-parser');

const checkAuth = require('./controller/auth.js'); // Middleware to check authentication

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }))
server.set('view engine', 'ejs');

const port = 3000;

const database = mysql.createConnection({
    host:  process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


database.connect(error => {
    if (error) {
        console.error('Database can not be connected :', error);
    }
    else{
        console.log('Database conected');
    }
});

function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

// LOGIN - Form
server.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// LOGIN - Submit
server.post('/login', (req, res) => {
    const { username , password } = req.body;
    
    console.log(username);
    console.log(typeof(username));
    console.log(password);
    console.log(typeof(password));
    
    database.query('SELECT * FROM user WHERE username = ?', [username], async (err, user) => {
    if (!user) return res.render('login', { error: 'Usuário não encontrado' });

    console.log("*************");
    console.log(password);
    console.log(user);
    console.log(user[0].id);
    console.log(user[0].password);
    
    const match = await bcrypt.compare(password, user[0].password);
    if (!match) return res.render('login', { error: 'Senha incorreta' });
    
    req.session.userId = user.id;
    res.redirect('/users');
});
});

// LOGOUT
server.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// GET - user - page
server.get('/users-page', checkAuth, (request,response)=>{
    database.query('SELECT * FROM user', (error, users) => {
        if (error) return response.status(500).send(error);
        response.render('users',{users});
    });
})

// GET - List All Users
server.get('/users', checkAuth,(request, response) => {
    database.query('SELECT * FROM user', (error, datas) => {
        if (error) return response.status(500).send(error);
        response.json(datas);
    });
});

// POST - Create User
server.post('/insertuser',(request, response) => {
    const { username, password } = request.body;
    
    console.log(username);
    console.log(typeof(username));
    console.log(password);
    console.log(typeof(password));

    hashPassword(password).then((newPassword)=>{
        database.query('INSERT INTO user (username, password) VALUES ("'+username+'","'+newPassword+'")', (error) => {
            if (error) return response.status(500).send(error);
            response.status(201).json({username});
        });
    })
});

// PUT - Update User
server.put('/user/:id', checkAuth,(request, response) => {
    const { username } = request.body;
    
    database.query('UPDATE user SET name = "'+username+'" WHERE id = '+request.params.id+'', (error, result) => {
        if (error) return response.status(500).send(error);
        if (result.affectedRows === 0) return response.status(404).send('User not found!');
        response.json({ id: request.params.id, username});
    });
});

// DELETE - Delete User
server.delete('/user/:id', checkAuth,(request, response) => {
    database.query('DELETE FROM user WHERE id = '+request.params.id+'', (error, result) => {
        if (error) return express.response.status(500).send(error);
        if (result.affectedRows === 0) return response.status(404).send('User not found!');
        response.status(204).send();
    });
});

//********************************************* */

// Upload config
const upload = multer({ dest: 'uploads/' });

server.get('/upload', (req, res) => {
    res.render('upload', { error: null });
});

// Rota de assinatura
server.post('/upload', upload.single('pdf'), (req, res) => {
  const pdfPath = req.file.path;
  const originalName = req.file.originalname;
  const signerName = req.body.signature;

  res.render('sign', {
    pdfPath: req.file.filename,
    originalName,
    signerName,
  });
});

// Rota que assina o PDF de verdade
server.post('/sign-pdf', async (req, res) => {
  const { pdfPath, signerName } = req.body;
  const inputPath = path.join(__dirname, 'uploads', pdfPath);
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];

  const now = new Date();
  
  lastPage.drawText(`Date: ${now.toISOString()}`, {
    x: 50,
    y: 50 + Math.random() * 100, // Evita sobreposição
    size: 14,
    color: rgb(0, 0, 0),
  });

  lastPage.drawText(`Signed by: ${signerName}`, {
    x: 50,
    y: 50 + Math.random() * 100, // Evita sobreposição
    size: 14,
    color: rgb(0, 0, 0),
  });

  const signedBytes = await pdfDoc.save();
  const signedPath = path.join(__dirname, 'signed', `signed-${Date.now().toLocaleString()}.pdf`);
  fs.writeFileSync(signedPath, signedBytes);


  console.log(now.toISOString());

  res.download(signedPath, 'final_document.pdf');
});


// Start Server
server.listen(port, () => {
    console.log(`Server its running in http://localhost:${port}`);
});