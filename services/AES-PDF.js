const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
 
function calcularHashArquivo(caminhoArquivo) {
  const buffer = fs.readFileSync(caminhoArquivo);
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}
 
async function anexarHashAoPdf(caminhoEntrada, caminhoSaida) {
  const hash = calcularHashArquivo(caminhoEntrada);
  console.log('Hash SHA-256 calculado:', hash);

  const existingPdfBytes = fs.readFileSync(caminhoEntrada);
 
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
    
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = lastPage.getSize();
 
  lastPage.drawText(`Hash SHA-256: ${hash}`, {
    x: 50,
    y: 50, 
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
 
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(caminhoSaida, pdfBytes);
 
  console.log(`PDF salvo com hash anexado: ${caminhoSaida}`);
}

const arquivoOriginal = path.join(__dirname, 'teste.pdf');
const arquivoEditado = path.join(__dirname, 'exemplo_com_hash.pdf');

anexarHashAoPdf(arquivoOriginal, arquivoEditado).catch(console.error);
 