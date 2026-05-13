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

app.get("/", (req, res) => {
    res.send("OFX Parser Online");
});

app.post("/parse-ofx", upload.single("file"), async (req, res) => {

    try {

        // Verifica se recebeu arquivo
        if (!req.file) {

            return res.status(400).json({
                sucesso: false,
                erro: "Arquivo não enviado"
            });

        }

        console.log("Arquivo recebido:");
        console.log(req.file);

        // Lê arquivo
        const conteudo = fs.readFileSync(req.file.path);

        // Converte encoding
        const textoOFX = iconv.decode(conteudo, "latin1");

        // Faz parse do OFX
        const resultado = await ofx.parse(textoOFX);

        // Exibe estrutura completa no Render Logs
        console.log("====================================");
        console.log("ESTRUTURA OFX:");
        console.log(JSON.stringify(resultado, null, 2));
        console.log("====================================");

        // Retorna estrutura completa para o Bubble
        return res.json(resultado);

    } catch (erro) {

        console.error("ERRO NO PARSER:");
        console.error(erro);

        return res.status(500).json({
            sucesso: false,
            erro: erro.message
        });

    }

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {

    console.log("====================================");
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("====================================");

});