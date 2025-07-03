require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const crypto = require('crypto');
const upload = multer({ dest: 'uploads/' });

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

// // LOGIN - Form
// server.get('/login', (req, res) => {
//     res.render('login', { error: null });
// });

// // LOGIN - Submit
// server.post('/login', (req, res) => {
//     const { username , password } = req.body;
    
//     console.log(username);
//     console.log(typeof(username));
//     console.log(password);
//     console.log(typeof(password));
    
//     database.query('SELECT * FROM user WHERE username = ?', [username], async (err, user) => {
//     if (!user) return res.render('login', { error: 'Usuário não encontrado' });

//     console.log("*************");
//     console.log(password);
//     console.log(user);
//     console.log(user[0].id);
//     console.log(user[0].password);
    
//     const match = await bcrypt.compare(password, user[0].password);
//     if (!match) return res.render('login', { error: 'Senha incorreta' });
    
//     req.session.userId = user.id;
//     res.redirect('/users');
// });
// });

// // LOGOUT
// server.get('/logout', (req, res) => {
//     req.session.destroy(() => {
//         res.redirect('/login');
//     });
// });

// // GET - user - page
// server.get('/users-page', checkAuth, (request,response)=>{
//     database.query('SELECT * FROM user', (error, users) => {
//         if (error) return response.status(500).send(error);
//         response.render('users',{users});
//     });
// })

// // GET - List All Users
// server.get('/users', checkAuth,(request, response) => {
//     database.query('SELECT * FROM user', (error, datas) => {
//         if (error) return response.status(500).send(error);
//         response.json(datas);
//     });
// });

// // POST - Create User
// server.post('/insertuser',(request, response) => {
//     const { username, password } = request.body;
    
//     console.log(username);
//     console.log(typeof(username));
//     console.log(password);
//     console.log(typeof(password));

//     hashPassword(password).then((newPassword)=>{
//         database.query('INSERT INTO user (username, password) VALUES ("'+username+'","'+newPassword+'")', (error) => {
//             if (error) return response.status(500).send(error);
//             response.status(201).json({username});
//         });
//     })
// });

// // PUT - Update User
// server.put('/user/:id', checkAuth,(request, response) => {
//     const { username } = request.body;
    
//     database.query('UPDATE user SET name = "'+username+'" WHERE id = '+request.params.id+'', (error, result) => {
//         if (error) return response.status(500).send(error);
//         if (result.affectedRows === 0) return response.status(404).send('User not found!');
//         response.json({ id: request.params.id, username});
//     });
// });

// // DELETE - Delete User
// server.delete('/user/:id', checkAuth,(request, response) => {
//     database.query('DELETE FROM user WHERE id = '+request.params.id+'', (error, result) => {
    //         if (error) return express.response.status(500).send(error);
//         if (result.affectedRows === 0) return response.status(404).send('User not found!');
//         response.status(204).send();
//     });
// });

//********************************************* */

// Upload config

server.get('/', (req, res) => {
    res.render('login', { error: null }); 
});

server.get('/upload', (req, res) => {
    res.render('upload', { error: null });
});

server.get('/upload-crypto', checkAuth, (req, res) => {
    res.render('upload-crypto', { error: null });
});

server.get('/validate', checkAuth,(req, res) => {
    res.render('validate', { error: null });
});

server.get('/result', (req, res) => {
    res.render('result', { error: null });
});

// Rota de assinatura
server.post('/upload', checkAuth, upload.single('pdf'), (req, res) => {
  const originalName = req.file.originalname;
  const signerName = req.body.signature;

  res.render('sign', {
    pdfPath: req.file.filename,
    originalName,
    signerName,
  });
});

// Rota que assina o PDF de verdade
server.post('/sign-pdf', checkAuth, async (req, res) => {
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

  res.download(signedPath, 'final_document.pdf');
});

const signedDir = path.join(__dirname, 'signed');
if (!fs.existsSync(signedDir)) fs.mkdirSync(signedDir);

const privateKey = fs.readFileSync(path.join(__dirname, 'keys/private.pem'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, 'keys/public.pem'), 'utf8');


function signData(dataBuffer) {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(dataBuffer);
  signer.end();
  return signer.sign(privateKey, 'base64');
}

const { generateKeyPairSync } = require('crypto');

// const { publicKey, privateKey } = generateKeyPairSync('rsa', {
//   modulusLength: 2048,
//   publicKeyEncoding: {
//     type: 'spki',
//     format: 'pem',
//   },
//   privateKeyEncoding: {
//     type: 'pkcs8',
//     format: 'pem',
//   },
// });

// fs.writeFileSync('keys/private.pem', privateKey);
// fs.writeFileSync('keys/public.pem', publicKey);

server.post('/upload-crypto', upload.single('pdf'), async (req, res) => {
  const { username } = req.body;
  const pdfBuffer = fs.readFileSync(req.file.path);

  const hash = crypto.createHash('sha256').update(pdfBuffer).digest();

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(hash);
  signer.end();

  const privateKey = fs.readFileSync(path.join(__dirname, 'keys/private.pem'), 'utf8');
  const digitalSignature = signer.sign(privateKey, 'base64');

  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const page = pdfDoc.getPages()[0];
  page.drawText(`Assinado por: ${username}`, { x: 50, y: 50, size: 12 });

  const savedPdf = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'signed', `signed-${Date.now()}.pdf`);
  fs.writeFileSync(outputPath, savedPdf);

  res.send(`
    <h2>Assinatura digital gerada com sucesso!</h2>
    <textarea rows="6" cols="100">${digitalSignature}</textarea>
    <p><strong>Importante:</strong> Guarde essa assinatura para validar posteriormente.</p>
    <a href="/validate">Ir para Validação</a>
  `);
});

server.post('/validate', upload.single('pdf'), async (req, res) => {
  const { signature } = req.body;
  const pdfBuffer = fs.readFileSync(req.file.path);
  const hash = crypto.createHash('sha256').update(pdfBuffer).digest();

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(hash);
  verifier.end();

  const publicKey = fs.readFileSync(path.join(__dirname, 'keys/public.pem'), 'utf8');

  let isValid = false;
  try {
    isValid = verifier.verify(publicKey, Buffer.from(signature, 'base64'));
  } catch (e) {
    console.error('Erro ao validar:', e.message);
  }

  fs.unlinkSync(req.file.path);

  res.render('result', { isValid });
});

// Start Server
server.listen(port, () => {
    console.log(`Server its running in http://localhost:${port}`);
});