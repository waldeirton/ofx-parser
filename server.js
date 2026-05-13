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

        const conteudo = fs.readFileSync(req.file.path);

        const textoOFX = iconv.decode(conteudo, "latin1");

        const resultado = await ofx.parse(textoOFX);

        console.log(JSON.stringify(resultado, null, 2));

        return res.json(resultado);

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            sucesso: false,
            erro: erro.message
        });

    }

});