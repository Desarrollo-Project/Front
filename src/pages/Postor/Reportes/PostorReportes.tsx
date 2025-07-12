import { useEffect, useState } from 'react';
import apiClient from '../../../services/ApiClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface Auction {
  id: string;
  titulo: string;
  monto: number;
  idGanador?: string;
  fechaPago?: string;
}

interface Puja {
  idSubasta: string;
  tituloSubasta: string;
  montoPuja: number;
  fechaPuja: string;
}

const PostorReportes = () => {
  const [finalizadas, setFinalizadas] = useState<Auction[]>([]);
  const [ganadas, setGanadas] = useState<Auction[]>([]);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const userId = localStorage.getItem('user_id') || '';

  useEffect(() => {
    fetchFinalizadas();
    fetchGanadas();
    fetchPujasDelUsuario();
  }, [userId]);

  // Fetch subastas finalizadas
  const fetchFinalizadas = async () => {
    try {
      const data = await apiClient.get('/api/Subastas/Obtener_Subastas_Finalizadas');
      const mapped = Array.isArray(data)
        ? data.map((s: any) => ({
            id: s.id,
            titulo: s.nombre_Subasta?.nombre,
            monto: s.monto_Final,
            idGanador: s.id_ganador,
          }))
        : [];
      setFinalizadas(mapped);
    } catch (err) {
      console.error('Error al cargar subastas finalizadas:', err);
    }
  };


  const fetchGanadas = async () => {
    try {
      const data = await apiClient.get(`/api/Subastas/Obtener_Subastas_Ganadas_Por_Id_Ganador?id_gandor=${userId}`);
      const mapped = Array.isArray(data)
        ? data.map((s: any) => ({
            id: s.id,
            titulo: s.nombre_Subasta?.nombre,
            monto: s.monto_Final,
            fechaPago: s.fecha_Pago,
          }))
        : [];
      setGanadas(mapped);
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.info('No hay subastas ganadas para este usuario.');
        setGanadas([]);
      } else {
        console.error('Error al cargar subastas ganadas:', err);
      }
    }
  };

const fetchPujasDelUsuario = async () => {
  try {
    const subastas = await apiClient.get('/api/Subastas/Obtener_Subastas_All');
    console.log("🟨 Subastas finalizadas recuperadas:", subastas.length);

    const cleanUserId = userId.trim();
    console.log("🧩 ID de usuario limpio:", cleanUserId);

    const resultados = await Promise.all(
      subastas.map(async (s: any) => {
        console.log(`🔍 Consultando historial para subasta: ${s.id} - ${s.nombre_Subasta?.nombre}`);

        try {
          const historial = await apiClient.get(`/Historial/${s.id}`);
          console.log(`📝 Historial recibido (${s.id}):`, historial);

          const pujasUsuario = Array.isArray(historial)
            ? historial.filter((p: any) => {
                const pujadorId = p.bidder?.id_postor?.trim();
                console.log("👤 Pujador:", pujadorId, "vs", cleanUserId);
                return pujadorId === cleanUserId;
              })
            : [];

          console.log(`✅ Pujas del usuario en subasta ${s.id}:`, pujasUsuario.length);

          return pujasUsuario.map((p: any) => ({
            idSubasta: p.auctionId,
            tituloSubasta: s.nombre_Subasta?.nombre,
            montoPuja: p.amount.monto_Total,
            fechaPuja: p.timestamp.fecha,
          }));
        } catch (err: any) {
          if (err.response?.status === 404) {
            console.info(`⚠️ Subasta ${s.id} no tiene historial (404).`);
            return [];
          } else {
            console.error(`❌ Error inesperado en subasta ${s.id}:`, err);
            return [];
          }
        }
      })
    );

    const pujasFinales = resultados.flat();
    console.log("🎯 Total de pujas encontradas del usuario:", pujasFinales.length);
    setPujas(pujasFinales);
  } catch (err) {
    console.error('❌ Error al obtener pujas del usuario:', err);
  }
};

  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportToPDF = (data: any[], columns: string[], title: string) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [columns],
      body: data.map(item => columns.map(col => item[col] ?? '')),
    });
    doc.save(`${title}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-6 sm:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-10">📋 Reportes del Postor</h1>

        {/* Finalizadas */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Subastas Finalizadas</h2>
            <div className="flex gap-3">
              <button
                onClick={() => exportToExcel(finalizadas, 'Subastas_Finalizadas')}
                className="btn-export"
              >
                <FileSpreadsheet size={18} />
                Excel
              </button>
              <button
                onClick={() => exportToPDF(finalizadas, ['titulo', 'monto', 'idGanador'], 'Subastas Finalizadas')}
                className="btn-export"
              >
                <FileText size={18} />
                PDF
              </button>
            </div>
          </div>
          <div className="grid gap-6">
            {finalizadas.map((s) => (
              <div key={s.id} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
                <p className="text-lg font-semibold text-gray-900">{s.titulo}</p>
                <p className="text-gray-700">Monto: ${s.monto}</p>
                <p className="text-sm text-gray-500">ID Ganador: {s.idGanador || '—'}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ganadas */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Subastas Ganadas</h2>
            <div className="flex gap-3">
              <button
                onClick={() => exportToExcel(ganadas, 'Subastas_Ganadas')}
                className="btn-export"
              >
                <FileSpreadsheet size={18} />
                Excel
              </button>
              <button
                onClick={() => exportToPDF(ganadas, ['titulo', 'monto', 'fechaPago'], 'Subastas Ganadas')}
                className="btn-export"
              >
                <FileText size={18} />
                PDF
              </button>
            </div>
          </div>
          <div className="grid gap-6">
            {ganadas.map((s) => (
              <div key={s.id} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
                <p className="text-lg font-semibold text-gray-900">{s.titulo}</p>
                <p className="text-gray-700">Monto Pagado: ${s.monto}</p>
                <p className="text-sm text-gray-500">Fecha: {s.fechaPago || '—'}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pujas realizadas */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Pujas Realizadas</h2>
            <div className="flex gap-3">
              <button
                onClick={() => exportToExcel(pujas, 'Pujas_Usuario')}
                className="btn-export"
              >
                <FileSpreadsheet size={18} />
                Excel
              </button>
              <button
                onClick={() => exportToPDF(pujas, ['tituloSubasta', 'montoPuja', 'fechaPuja'], 'Pujas Realizadas')}
                className="btn-export"
              >
                <FileText size={18} />
                          PDF
          </button>
        </div>
      </div>
      <div className="grid gap-6">
        {pujas.length > 0 ? (
          pujas.map((p, index) => (
            <div key={`${p.idSubasta}-${index}`} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
              <p className="text-lg font-semibold text-gray-900">{p.tituloSubasta}</p>
              <p className="text-gray-700">Monto Pujado: ${p.montoPuja}</p>
              <p className="text-sm text-gray-500">Fecha: {new Date(p.fechaPuja).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No has realizado pujas en subastas finalizadas.</p>
        )}
      </div>
    </section>
  </div>
</div>
); };
export default PostorReportes;
