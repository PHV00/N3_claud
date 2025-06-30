const crypto = require('crypto');

const fs = require('fs');
const path = require('path');

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const algoritmo = 'aes-256-cbc';

// const textoOriginal = 'Texto secreto feito pelo turma de Segurança da Informação';

// function criptografar(texto){
//     const cipher = crypto.createCipheriv(algoritmo, key, iv);
//     let criptografado = cipher.update(texto, 'utf8', 'hex');
//     criptografado += cipher.final('hex');
//     return criptografado;
// }

// function descriptografar(textoCriptografado){
//     const decipher = crypto.createDecipheriv(algoritmo, key, iv);
//     let texto = decipher.update(textoCriptografado, 'hex', 'utf8');
//     texto += decipher.final('utf8');
//     return texto;
// }

// const textoCriptografado = criptografar(textoOriginal);
// console.log('Texto original: ', textoOriginal);
// console.log('Texto criptografado: ', textoCriptografado);

// const textoDescriptografado = descriptografar(textoCriptografado);
// console.log('Texto descriptografado: ', textoDescriptografado);

function encripitarArquivo(caminhoEntrada, caminhoSaida) {
    const cipher = crypto.createCipheriv(algoritmo, key, iv);
    const entrada = fs.createReadStream(caminhoEntrada);
    const saida = fs.createWriteStream(caminhoSaida);

    entrada.pipe(cipher).pipe(saida);

    saida.on('finish', () => {
        console.log('Arquivo criptografado presente em:', caminhoSaida);
    });
}

function descriptarArquivo(caminhoEntrada, caminhoSaida) {
    const decipher = crypto.createDecipheriv(algoritmo, key, iv);
    const entrada = fs.createReadStream(caminhoEntrada);
    const saida = fs.createWriteStream(caminhoSaida);

    entrada.pipe(decipher).pipe(saida);

    saida.on('finish', () => {
        console.log('Arquivo descriptografado com sucesso:', caminhoSaida);
    });
}

const arquivoEntrada = path.join(__dirname, 'entrada.txt');
const arquivoEncripitado = path.join(__dirname, 'arquivoEncripitado.enc');
const arquivoDesencripitado = path.join(__dirname, 'saida.txt');

encripitarArquivo(arquivoEntrada,arquivoEncripitado);

setTimeout(() => {
    descriptarArquivo(arquivoEncripitado, arquivoDesencripitado);
}, 1000);