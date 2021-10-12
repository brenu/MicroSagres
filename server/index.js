const express = require("express");
require("dotenv").config();
const db = require("./db");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/professor/:id", async (req, res) => {
  const professorId = req.params.id;

  let resultado = await db.query("SELECT * FROM usuario WHERE matricula = $1", [
    professorId,
  ]);
  resultado = { ...resultado[0], senha: "NãoInteressaPraVocêPalhaço" };

  return res.status(200).json(resultado);
});

app.get("/disciplinas", async (req, res) => {
  const professorId = req.headers["professor-id"];

  let resultado = await db.query(
    "SELECT turma.id, disciplina.nome AS nome_disciplina, turma.nome AS nome_turma, CONCAT(disciplina.nome,' - ',turma.nome) AS nome FROM turma INNER JOIN disciplina ON disciplina.id = turma.disciplina WHERE turma.professor = $1",
    [professorId]
  );

  return res.status(200).json(resultado);
});

app.get("/turma/:id", async (req, res) => {
  const turmaId = req.params.id;

  const resultado = await db.query(
    "SELECT usuario.matricula, usuario.nome FROM estudante_turma INNER JOIN usuario ON usuario.matricula = estudante_turma.estudante WHERE estudante_turma.turma = $1 AND estudante_turma.ativo",
    [turmaId]
  );

  return res.status(200).json(resultado);
});

app.get("/estudante/:matricula/:turma", async (req, res) => {
  const estudanteId = req.params.matricula;
  const turmaId = req.params.turma;

  let nomeEstudante = await db.query(
    "SELECT nome FROM usuario WHERE matricula = $1",
    [estudanteId]
  );

  nomeEstudante = nomeEstudante[0].nome;

  const avaliacoes = await db.query(
    "SELECT id, nota, tipo FROM avaliacao WHERE estudante = $1 AND turma = $2",
    [estudanteId, turmaId]
  );

  const avaliacoesTeoricas = [];
  const avaliacoesPraticas = [];

  await avaliacoes.map((avaliacao) => {
    if (avaliacao.tipo == "teórico") {
      avaliacoesTeoricas.push({
        ...avaliacao,
        notaOriginal: avaliacao.nota,
        edit: false,
      });
    } else {
      avaliacoesPraticas.push({
        ...avaliacao,
        notaOriginal: avaliacao.nota,
        edit: false,
      });
    }
  });

  let media = await db.func("media", [estudanteId, turmaId]);
  media = media[0].media;

  return res.status(200).json({
    nome: nomeEstudante,
    creditosTeoricos: avaliacoesTeoricas,
    creditosPraticos: avaliacoesPraticas,
    media,
  });
});

app.post("/avaliacao", async (req, res) => {
  try {
    const { nota, tipo, turma, estudante } = req.body;

    const resultado = await db.proc("cria_avaliacao", [
      estudante,
      turma,
      nota,
      tipo,
    ]);

    return res.status(200).json(resultado);
  } catch (error) {
    let errorMessage = "Só Deus sabe :D";

    if (error.message.split(" ")[0] === "Quantidade") {
      errorMessage = error.message;
    }

    return res.status(400).json({ success: false, reason: errorMessage });
  }
});

app.put("/avaliacao/:id", async (req, res) => {
  try {
    const avaliacaoId = req.params.id;
    const { nota } = req.body;

    const resultado = await db.query(
      "UPDATE avaliacao SET nota = $1 WHERE id = $2",
      [nota, avaliacaoId]
    );

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ success: false, reason: "Não interessa :D" });
  }
});

app.delete("/avaliacao/:id", async (req, res) => {
  try {
    const avaliacaoId = req.params.id;

    await db.query("DELETE FROM avaliacao WHERE id = $1", [avaliacaoId]);

    return res.status(204).json({});
  } catch (error) {
    return res.status(400).json({ success: false, reason: "Não interessa :D" });
  }
});

app.get("/", async (req, res) => {
  let resultado = await db.func("get_carga_pratica", 3);
  resultado = resultado[0]["get_carga_pratica"];

  return res.status(200).json({ resultado });
});

app.listen(3333);
