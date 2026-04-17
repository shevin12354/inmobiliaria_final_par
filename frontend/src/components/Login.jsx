import { useState } from "react";

const Login = ({ onLoginSuccess }) => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [clave, setClave] = useState("");

  const login = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombreUsuario, clave }),
      });

      if (!res.ok) {
        alert("Credenciales incorrectas");
        return;
      }

      const data = await res.json();
      onLoginSuccess(data);

    } catch (error) {
      console.error(error);
      alert("Error en el servidor");
    }
  };

  return (
    <div className="login-wrapper">

      <div className="login-card">

        {/* LOGO / TITULO */}
        <h2>🏢 Inmobiliaria</h2>
        <p className="login-subtitle">Acceso al sistema</p>

        {/* INPUT USUARIO */}
        <input
          placeholder="Nombre de Usuario"
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
        />

        {/* INPUT PASSWORD */}
        <input
          type="password"
          placeholder="Clave"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />

        {/* BOTON */}
        <button onClick={login}>
          Ingresar
        </button>

      </div>

    </div>
  );
};

export default Login;