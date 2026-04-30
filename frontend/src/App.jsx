import { useEffect, useState } from "react";

function validarCampo(valor, rotulo) {
  if (!valor.trim()) return `O ${rotulo} é obrigatório.`;
  if (valor.trim().length < 2) return `O ${rotulo} deve ter pelo menos 2 caracteres.`;
  if (valor.trim().length > 50) return `O ${rotulo} deve ter no máximo 50 caracteres.`;
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(valor.trim())) return `O ${rotulo} deve conter apenas letras.`;
  return null;
}

function App() {
  const [message, setMessage] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [saudacao, setSaudacao] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("https://localhost:7162/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => {
        console.error("Erro:", error);
        setMessage("Erro ao conectar com a API");
      });
  }, []);

  async function handleEnviar() {
    const erroNome = validarCampo(nome, "nome");
    if (erroNome) { setErro(erroNome); setSaudacao(""); return; }

    const erroSobrenome = validarCampo(sobrenome, "sobrenome");
    if (erroSobrenome) { setErro(erroSobrenome); setSaudacao(""); return; }

    setErro("");

    try {
      const response = await fetch("https://localhost:7162/api/hello/saudacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: `${nome.trim()} ${sobrenome.trim()}` }),
      });

      if (response.ok) {
        const data = await response.json();
        setSaudacao(data.saudacao);
      } else {
        const data = await response.json();
        setErro(data.erro || "Erro ao processar o nome.");
      }
    } catch {
      setErro("Erro ao conectar com a API.");
    }
  }

  return (
    <div>
      <h1>Hello World Full Stack</h1>
      <p>{message}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "fit-content" }}>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => { setNome(e.target.value); setErro(""); }}
        />
        <input
          type="text"
          placeholder="Seu sobrenome"
          value={sobrenome}
          onChange={(e) => { setSobrenome(e.target.value); setErro(""); }}
        />
        <button onClick={handleEnviar}>Enviar</button>
      </div>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {saudacao && <p>{saudacao}</p>}
    </div>
  );
}

export default App;