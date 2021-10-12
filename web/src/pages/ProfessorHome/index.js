import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import api from "../../services/api";

import "./styles.css";

export default function ProfessorHome() {
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(1);
  const [nomeProfessor, setNomeProfessor] = useState("");

  const history = useHistory();

  useEffect(() => {
    async function handleInit() {
      const result = await api.get("/professor/1");

      if (result.status == 200) {
        setNomeProfessor(result.data.nome);
      }

      const disciplinasResult = await api.get("/disciplinas", {
        headers: { "professor-id": 1 },
      });

      if (disciplinasResult.status == 200) {
        setTurmas(disciplinasResult.data);
      }
    }

    handleInit();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const nomeTurma = await turmas.map((turma) => {
      if (turma.id == turmaSelecionada) {
        return turma.nome;
      }
    });

    history.push({
      pathname: `/turma/${turmaSelecionada}`,
      state: {
        nome: nomeTurma,
      },
    });
  }

  return (
    <div className="container">
      <div className="content">
        <h1>Olá, {nomeProfessor}!</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="turma">Selecione uma turma</label>
          <select
            name="turma"
            id="turma"
            onChange={(e) => setTurmaSelecionada(e.target.value)}
          >
            {turmas.map((turma) => (
              <option value={turma.id} key={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
          <button type="submit">Continuar</button>
        </form>
      </div>
    </div>
  );
}
