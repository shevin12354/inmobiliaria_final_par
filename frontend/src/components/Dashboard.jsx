import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";

const Dashboard = () => {

  const [stats, setStats] = useState({
    apt: 0,
    cont: 0,
    clientes: 0
  });

  const [ingresos, setIngresos] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apt = await fetch("http://localhost:5000/apartamento");
        const cont = await fetch("http://localhost:5000/contrato");
        const cli = await fetch("http://localhost:5000/cliente");
        const ing = await fetch("http://localhost:5000/ingresos");

        const dataApt = await apt.json();
        const dataCont = await cont.json();
        const dataCli = await cli.json();
        const dataIng = await ing.json();

        setStats({
          apt: dataApt.length,
          cont: dataCont.length,
          clientes: dataCli.length
        });

        setIngresos(dataIng.TOTAL);

      } catch (error) {
        console.error("Error cargando estadísticas", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">

      <h2 className="dashboard-title">Panel General</h2>

      <div className="cards">

        <div className="card-stat">
          <h3>🏢 Apartamentos</h3>
          <p className="number">{stats.apt}</p>
          <span className="label">Registrados</span>
        </div>

        <div className="card-stat">
          <h3>📄 Contratos</h3>
          <p className="number">{stats.cont}</p>
          <span className="label">Activos</span>
        </div>

        <div className="card-stat">
          <h3>👥 Clientes</h3>
          <p className="number">{stats.clientes}</p>
          <span className="label">Totales</span>
        </div>

        <div className="card-stat">
          <h3>💰 Ingresos</h3>
          <p className="number">
            ${ingresos.toLocaleString('es-CO')}
          </p>
          <span className="label">Total generado</span>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;