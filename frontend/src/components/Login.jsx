import { useState } from "react";

const Login = ({ onLoginSuccess }) => {
  // Ajustamos el nombre de la variable a 'nombreUsuario' para que coincida con el backend
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [clave, setClave] = useState("");

  const login = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Enviamos 'nombreUsuario' que es lo que espera tu ruta app.post('/login')
        body: JSON.stringify({ nombreUsuario, clave }),
      });

      if (!res.ok) {
        alert("Credenciales incorrectas");
        return;
      }

      const data = await res.json();
      // Si el login es exitoso, pasamos los datos del usuario al App.js
      onLoginSuccess(data);

    } catch (error) {
      console.error(error);
      alert("Error en el servidor");
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>Inmobiliaria - Acceso</h2>
      <input
        placeholder="Nombre de Usuario"
        value={nombreUsuario}
        onChange={(e) => setNombreUsuario(e.target.value)}
      />
      <br /><br />
      <input
        type="password"
        placeholder="Clave"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
      />
      <br /><br />
      <button onClick={login}>Ingresar</button>
    </div>
  );
};

export default Login;