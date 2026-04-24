import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [nome, setNome] = useState("");
  const [saudacao, setSaudacao] = useState("");

  useEffect(() => {
    fetch("https://localhost:7162/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => {
        console.error("Erro:", error);
        setMessage("Erro ao conectar com a API");
      });
  }, []);

  function handleEnviar() {
    if (nome.trim()) {
      setSaudacao(`Olá ${nome}!`);
    }
  }

  return (
    <div>
      <h1>Hello World Full Stack</h1>
      <p>{message}</p>
      <div>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <button onClick={handleEnviar}>Enviar</button>
      </div>
      {saudacao && <p>{saudacao}</p>}
    </div>
  );
}

export default App;