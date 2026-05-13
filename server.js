const express = require("express");
const multer = require("multer");
const fs = require("fs");
const ofx = require("ofx-js");
const iconv = require("iconv-lite");
const cors = require("cors");

const app = express();

app.use(cors());

const upload = multer({
  dest: "uploads/"
});

function formatarData(ofxDate) {
  if (!ofxDate) return null;

  const ano = ofxDate.substring(0, 4);
  const mes = ofxDate.substring(4, 6);
  const dia = ofxDate.substring(6, 8);

  return `${ano}-${mes}-${dia}`;
}

app.post("/parse-ofx", upload.single("file"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        sucesso: false,
        erro: "Arquivo não enviado"
      });
    }

    const buffer = fs.readFileSync(req.file.path);

    let conteudo = iconv.decode(buffer, "latin1");

    const ofxData = ofx.parse(conteudo);

    console.log(JSON.stringify(resultado, null, 2));

res.json(resultado);

    const transacoes = transacoesOriginais.map((t) => ({
      tipo: t.TRNTYPE || null,

      data: formatarData(t.DTPOSTED),

      valor: Number(t.TRNAMT || 0),

      descricao: t.MEMO || "",

      documento: t.CHECKNUM || "",

      id: t.FITID || ""
    }));

    fs.unlinkSync(req.file.path);

    return res.json({
      sucesso: true,
      total: transacoes.length,
      transacoes
    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({
      sucesso: false,
      erro: erro.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});