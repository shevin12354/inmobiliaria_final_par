import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    apt: 0,
    cont: 0,
    clientes: 0
  });
  const [ingresos, setIngresos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Promise.all lanza todas las peticiones al mismo tiempo
        const [resApt, resCont, resCli, resIng] = await Promise.all([
          fetch("http://localhost:5000/apartamento"),
          fetch("http://localhost:5000/contrato"),
          fetch("http://localhost:5000/cliente"),
          fetch("http://localhost:5000/ingresos")
        ]);

        const dataApt = await resApt.json();
        const dataCont = await resCont.json();
        const dataCli = await resCli.json();
        const dataIng = await resIng.json();

        setStats({
          apt: Array.isArray(dataApt) ? dataApt.length : 0,
          cont: Array.isArray(dataCont) ? dataCont.length : 0,
          clientes: Array.isArray(dataCli) ? dataCli.length : 0
        });

        // Validamos que TOTAL exista, si es un array tomamos el primer índice
        const totalCalculado = Array.isArray(dataIng) ? dataIng[0]?.TOTAL : dataIng?.TOTAL;
        setIngresos(totalCalculado || 0);

      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading-dash">Cargando datos del sistema...</div>;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Resumen Operativo</h2>

      <div className="cards">
        <StatCard title="Apartamentos" icon="🏢" value={stats.apt} label="Registrados" />
        <StatCard title="Contratos" icon="📄" value={stats.cont} label="Activos" />
        <StatCard title="Clientes" icon="👥" value={stats.clientes} label="Totales" />
        <StatCard 
          title="Ingresos" 
          icon="💰" 
          value={`$${ingresos.toLocaleString('es-CO')}`} 
          label="Total generado" 
          isMoney 
        />
      </div>
    </div>
  );
};

// Componente interno para no repetir código de las tarjetas
const StatCard = ({ title, icon, value, label, isMoney }) => (
  <div className="card-stat">
    <div className="card-header">
      <h3>{icon} {title}</h3>
    </div>
    <p className={`number ${isMoney ? 'money' : ''}`}>{value}</p>
    <span className="label">{label}</span>
  </div>
);

export default Dashboard;