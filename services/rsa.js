const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  }
});

console.log('Chave Pública:\n', publicKey);
console.log('Chave Privada:\n', privateKey);

const mensagem = "Olá, mundo! Esta é uma mensagem secreta.";

const mensagemEncriptada = crypto.publicEncrypt(
  publicKey,
  Buffer.from(mensagem)
);

console.log('Mensagem Encriptada (em base64):\n', mensagemEncriptada.toString('base64'));

const mensagemDescriptografada = crypto.privateDecrypt(
  privateKey,
  mensagemEncriptada
);

console.log('Mensagem Descriptografada:\n', mensagemDescriptografada.toString());