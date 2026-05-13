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

        if (!req.file) {

            return res.status(400).json({
                sucesso: false,
                erro: "Arquivo não enviado"
            });

        }

        const conteudo = fs.readFileSync(req.file.path);

        const textoOFX = iconv.decode(conteudo, "latin1");

        const resultado = await ofx.parse(textoOFX);

        const transacoesOriginais =
            resultado?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN || [];

        const transacoes = transacoesOriginais.map((t) => ({

            tipo: t.TRNTYPE || null,

            data: t.DTPOSTED || null,

            valor: Number(t.TRNAMT || 0),

            id: t.FITID || "",

            descricao: t.MEMO || "",

            documento: t.CHECKNUM || ""

        }));

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