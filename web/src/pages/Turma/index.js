import React, { useEffect, useState } from "react";
import {
  FaCheck,
  FaEdit,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import { useParams, useLocation, useHistory } from "react-router-dom";
import api from "../../services/api";

import "./styles.css";

export default function Turma() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEstudante, setIsLoadingEstudante] = useState(true);

  const [turma, setTurma] = useState({});

  const [estudanteId, setEstudanteId] = useState(0);
  const [estudante, setEstudante] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [showInputTeorico, setShowInputTeorico] = useState(false);
  const [showInputPratico, setShowInputPratico] = useState(false);
  const [notaTeorica, setNotaTeorica] = useState("0.0");
  const [notaPratica, setNotaPratica] = useState("0.0");

  const location = useLocation();
  const history = useHistory();
  const turmaId = useParams().id;

  useEffect(() => {
    async function handleInit() {
      if (!location.state) {
        history.push("/");
        return;
      }

      const { nome } = location.state;

      const resultado = await api.get(`/turma/${turmaId}`);

      if (resultado.status == 200) {
        setTurma({
          nome,
          alunos: resultado.data,
        });
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }

    handleInit();
  }, []);

  useEffect(() => {
    console.log(estudante);
  }, [estudante]);

  useEffect(() => {
    if (estudanteId) {
      handleEstudanteInfo();
    }
  }, [estudanteId]);

  function handleCloseModal(event) {
    if (event.target !== event.currentTarget) return;

    setShowModal((showModal) => !showModal);
    setEstudante({});
    setIsLoadingEstudante(true);
  }

  function handleEstudanteModal(id) {
    setEstudanteId(id);
    setShowModal((showModal) => !showModal);
  }

  async function handleEstudanteInfo() {
    const result = await api.get(`/estudante/${estudanteId}/${turmaId}`);

    if (result.status === 200) {
      setEstudante(result.data);

      setTimeout(() => {
        setIsLoadingEstudante((isLoadingEstudante) => !!!isLoadingEstudante);
      }, 1500);
    }
  }

  function handleCreditoTeorico() {
    setShowInputTeorico((showInputTeorico) => !showInputTeorico);
  }

  async function handleNewCreditoTeorico() {
    try {
      const resultado = await api.post("/avaliacao", {
        nota: notaTeorica,
        tipo: "teórico",
        turma: turmaId,
        estudante: estudanteId,
      });

      if (resultado.status === 200) {
        setIsLoadingEstudante(true);
        handleEstudanteInfo();
        setShowInputTeorico(false);
        setNotaTeorica("0.0");
      }
    } catch (error) {
      setShowInputTeorico(false);
      setNotaTeorica("0.0");
      alert("Não foi possível realizar a operação. \nMotivo: algum.");
    }
  }

  async function handleNewCreditoPratico() {
    try {
      const resultado = await api.post("/avaliacao", {
        nota: notaPratica,
        tipo: "prático",
        turma: turmaId,
        estudante: estudanteId,
      });

      if (resultado.status === 200) {
        setIsLoadingEstudante(true);
        handleEstudanteInfo();
        setNotaPratica("0.0");
        setShowInputPratico(false);
      }
    } catch (error) {
      setNotaPratica("0.0");
      setShowInputPratico(false);
      alert("Não foi possível realizar a operação. \nMotivo: algum.");
    }
  }

  async function handleUpdateCredito(id, valor) {
    try {
      const resultado = await api.put(`/avaliacao/${id}`, { nota: valor });

      if (resultado.status === 200) {
        setIsLoadingEstudante(true);
        handleEstudanteInfo();
      }
    } catch (error) {
      alert("Não foi possível realizar a operação. \nMotivo: algum.");
    }
  }

  function handleCreditoPratico() {
    setShowInputPratico((showInputPratico) => !showInputPratico);
  }

  async function handleDelete(id) {
    try {
      if (
        window.confirm(
          "Tem certeza? As alterações realizadas são irreversíveis!"
        )
      ) {
        const resultado = await api.delete(`/avaliacao/${id}`);

        if (resultado.status === 204) {
          setIsLoadingEstudante(true);
          handleEstudanteInfo();
        }
      }
    } catch (error) {
      alert("Não foi possível realizar a operação. \nMotivo: algum.");
    }
  }

  function handleEditNota(id, tipo) {
    if (tipo === "teorico") {
      setEstudante((estudante) => {
        return {
          ...estudante,
          creditosTeoricos: estudante.creditosTeoricos.map((credito) => {
            if (credito.id == id) {
              return { ...credito, edit: !credito.edit };
            }
            return credito;
          }),
        };
      });
    } else {
      setEstudante((estudante) => {
        return {
          ...estudante,
          creditosPraticos: estudante.creditosPraticos.map((credito) => {
            if (credito.id == id) {
              return { ...credito, edit: !credito.edit };
            }
            return credito;
          }),
        };
      });
    }
  }

  function handleChangeCredito(e, id, tipo) {
    setEstudante({
      ...estudante,
      creditosTeoricos:
        tipo === "teórico"
          ? estudante.creditosTeoricos.map((credito) => {
              if (credito.id == id) {
                return {
                  ...credito,
                  nota: numberMask(e.target.value, credito.nota),
                };
              }

              return credito;
            })
          : estudante.creditosTeoricos,
      creditosPraticos:
        tipo === "prático"
          ? estudante.creditosPraticos.map((credito) => {
              if (credito.id == id) {
                return {
                  ...credito,
                  nota: numberMask(e.target.value, credito.nota),
                };
              }

              return credito;
            })
          : estudante.creditosPraticos,
    });
  }

  function numberMask(value, original) {
    if (value.length <= 4) {
      value = value.replace(/\D/g, "");
      if (value.length >= 2 && value[0] == "1" && value[1] == "0") {
        return value.replace(/(\d{2})(\d)/g, "$1.$2");
      } else {
        return value.replace(/(\d)(\d)/g, "$1.$2");
      }
    }

    return original;
  }

  if (isLoading) {
    return (
      <FaSpinner className="animated-spinner" color="#ff6800" size="50px" />
    );
  }

  return (
    <div className="container">
      {showModal && (
        <div className="modal-background" onClick={(e) => handleCloseModal(e)}>
          <div className="modal-container">
            {!isLoadingEstudante ? (
              <>
                <h2>{estudante.nome}</h2>
                <div className="title-container">
                  <h3>Créditos teóricos</h3>
                  <button onClick={() => handleCreditoTeorico()}>
                    <FaPlus color="#FF6800" size="15pt" />
                  </button>
                </div>
                {estudante.creditosTeoricos.map((credito) => (
                  <div className="credito-container">
                    {!credito.edit ? (
                      <>
                        <span>{credito.notaOriginal}</span>
                        <div className="actions-container">
                          <button
                            onClick={() =>
                              handleEditNota(credito.id, "teorico")
                            }
                          >
                            <FaEdit color="#777777" size="15pt" />
                          </button>
                          <button onClick={() => handleDelete(credito.id)}>
                            <FaTrash color="#FF4D4D" size="15pt" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="input-container">
                        <input
                          type="text"
                          value={credito.nota}
                          style={{ marginLeft: 0 }}
                          onChange={(e) =>
                            handleChangeCredito(e, credito.id, credito.tipo)
                          }
                        />
                        <button
                          onClick={() =>
                            handleUpdateCredito(credito.id, credito.nota)
                          }
                        >
                          <FaCheck size="15pt" color="#4BB543" />
                        </button>
                        <button
                          onClick={() => handleEditNota(credito.id, "teorico")}
                        >
                          <FaTimes size="15pt" color="#777" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {showInputTeorico && (
                  <div id="input-teorico-container" className="input-container">
                    <input
                      type="text"
                      value={notaTeorica}
                      onChange={(e) =>
                        setNotaTeorica(numberMask(e.target.value, notaTeorica))
                      }
                    />
                    <button onClick={() => handleNewCreditoTeorico()}>
                      <FaCheck size="15pt" color="#4BB543" />
                    </button>
                    <button
                      onClick={() => {
                        setNotaTeorica("0.0");
                        setShowInputTeorico(false);
                      }}
                    >
                      <FaTimes size="15pt" color="#777" />
                    </button>
                  </div>
                )}
                <div className="title-container">
                  <h3>Créditos práticos</h3>
                  <button onClick={() => handleCreditoPratico()}>
                    <FaPlus color="#FF6800" size="15pt" />
                  </button>
                </div>
                {estudante.creditosPraticos.map((credito) => (
                  <div className="credito-container">
                    {!credito.edit ? (
                      <>
                        <span>{credito.notaOriginal}</span>
                        <div className="actions-container">
                          <button
                            onClick={() =>
                              handleEditNota(credito.id, "pratico")
                            }
                          >
                            <FaEdit color="#777777" size="15pt" />
                          </button>
                          <button onClick={() => handleDelete(credito.id)}>
                            <FaTrash color="#FF4D4D" size="15pt" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="input-container">
                        <input
                          type="text"
                          value={notaPratica}
                          onChange={(e) =>
                            setNotaPratica(
                              numberMask(e.target.value, notaPratica)
                            )
                          }
                          style={{ marginLeft: 0 }}
                        />
                        <button
                          onClick={() =>
                            handleUpdateCredito(credito.id, credito.nota)
                          }
                        >
                          <FaCheck size="15pt" color="#4BB543" />
                        </button>
                        <button
                          onClick={() => handleEditNota(credito.id, "pratico")}
                        >
                          <FaTimes size="15pt" color="#777" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {showInputPratico && (
                  <div id="input-pratico-container" className="input-container">
                    <input
                      type="text"
                      value={notaPratica}
                      onChange={(e) =>
                        setNotaPratica(numberMask(e.target.value, notaPratica))
                      }
                    />
                    <button onClick={() => handleNewCreditoPratico()}>
                      <FaCheck size="15pt" color="#4BB543" />
                    </button>
                    <button
                      onClick={() => {
                        setNotaPratica("0.0");
                        setShowInputPratico(false);
                      }}
                    >
                      <FaTimes size="15pt" color="#777" />
                    </button>
                  </div>
                )}
                <div class="media-container">
                  <h4>Média Parcial</h4>
                  <span>{estudante.media}</span>
                </div>
              </>
            ) : (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FaSpinner
                  className="animated-spinner"
                  color="#ff6800"
                  size="50px"
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="content">
        <h1>{turma.nome}</h1>
        <div className="alunos">
          {turma.alunos.map((aluno) => (
            <button
              key={aluno.matricula}
              onClick={() => handleEstudanteModal(aluno.matricula)}
            >
              {aluno.nome}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
