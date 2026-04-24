import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("https://localhost:7162/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => {
        console.error("Erro:", error);
        setMessage("Erro ao conectar com a API");
      });
  }, []);

  return (
    <div>
      <h1>Hello World Full Stack</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;