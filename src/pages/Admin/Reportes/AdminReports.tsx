import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/ApiClient';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { FileSpreadsheet, FileText, DollarSign, Gavel, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminReports: React.FC = () => {
  const [subastas, setSubastas] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [pujas, setPujas] = useState<any[]>([]);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [loadingPujas, setLoadingPujas] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [subastaSeleccionada, setSubastaSeleccionada] = useState<any>(null);
  const [pujasModal, setPujasModal] = useState<any[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    cargarSubastas();
    cargarPagos();
  }, []);

const cargarSubastas = async () => {
  try {
    const data = await apiClient.get('/api/Subastas/Obtener_Subastas_All');

    const formateadas = Array.isArray(data)
      ? data.map((s) => ({
          id: s.id,
          id_Dueño_Subasta: s.id_Dueño_Subasta?.id_Dueño_Subasta,
          id_Producto_Asociado: s.id_Producto_Asociado?.id_Producto_Asociado,
          id_ganador: s.idGanador?.id_Ganador,
          nombre_Subasta: s.nombre_Subasta?.nombre,
          estado: s.estado_Subasta?.estado,
          precio_Inicial: s.precio_Inicial?.precio_inicial,
          incremento_Minimo: s.incremento_Minimo?.incremento_minimo,
          fecha_Inicio: s.fecha_Inicio?.fecha,
          // y el resto según lo que necesites
        }))
      : [];

    setSubastas(formateadas);
  } catch (err) {
    console.error('❌ Error al cargar subastas ALL:', err);
  }
};

  const cargarPagos = async () => {
    try {
      const data = await apiClient.get('/api/pagos/All_Pagos');
      setPagos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error al cargar pagos:', err);
    }
  };

  const buscarPujas = async () => {
    if (!filtroUsuario) return;
    setLoadingPujas(true);
    try {
      const resultados: any[] = [];

      for (const sub of subastas) {
        try {
          const historial = await apiClient.get(`/api/Subastas/Historial/${sub.id}`);
          const filtradas = historial.filter((p: any) => {
            return (
              p.bidder?.id_postor === filtroUsuario ||
              p.bidder?.correo?.toLowerCase() === filtroUsuario.toLowerCase()
            );
          });

          for (const puja of filtradas) {
            let usuario = puja.bidder;
            if (usuario && usuario.id_postor && !usuario.correo) {
              try {
                const detalle = await apiClient.get(`/api/Usuarios/${usuario.id_postor}`);
                usuario = { ...usuario, correo: detalle.correo, nombre: detalle.nombre, apellido: detalle.apellido };
              } catch {}
            }

            resultados.push({
              subasta: sub.nombre_Subasta,
              monto: puja.amount?.monto_Total,
              fecha: puja.timestamp?.fecha,
              usuario: `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim(),
              correo: usuario.correo ?? '—',
            });
          }
        } catch (err) {
          console.error(`⚠️ Error historial en subasta ${sub.id}`, err);
        }
      }

      setPujas(resultados);
    } catch (err) {
      console.error('❌ Error al buscar pujas:', err);
    }
    setLoadingPujas(false);
  };

  const cargarPujasSubasta = async (subasta: any) => {
  setModalVisible(true);
  setSubastaSeleccionada(subasta);
  setPujasModal([]);
  setLoadingModal(true);

  try {
    const historial = await apiClient.get(`/Historial/${subasta.id}`);
    const enriquecido = await Promise.all(
      historial.map(async (p: any) => {
        let usuario = p.bidder;
        if (usuario && usuario.id_postor) {
          try {
            const detalle = await apiClient.get(`/api/Usuarios/${usuario.id_postor}`);
            usuario = {
              ...usuario,
              nombre: detalle.nombre,
              apellido: detalle.apellido,
              correo: detalle.correo,
            };
          } catch {
            // Ignora error de usuario
          }
        }
        return {
          monto: p.amount?.monto_Total,
          fecha: p.timestamp?.fecha,
          usuario: `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim(),
          correo: usuario.correo ?? '—',
        };
      })
    );
    setPujasModal(enriquecido);
  } catch (err) {
    console.error(`❌ Error al cargar historial para ${subasta.id}`, err);
  }

  setLoadingModal(false);
};

  const exportExcel = (data: any[], nombre: string) => {
    const sheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Reporte');
    XLSX.writeFile(wb, `${nombre}.xlsx`);
  };

  const exportPDF = (data: any[], columnas: string[], nombre: string) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(nombre, 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [columnas],
      body: data.map(row => columnas.map(col => row[col] ?? '')),
    });
    doc.save(`${nombre}.pdf`);
  };

const exportModalExcel = () => {
  const sheet = XLSX.utils.json_to_sheet(pujasModal);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Pujas');
  XLSX.writeFile(wb, `Pujas_Subasta_${subastaSeleccionada.nombre_Subasta}.xlsx`);
};

const exportModalPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Pujas - ${subastaSeleccionada.nombre_Subasta}`, 14, 22);
  autoTable(doc, {
    startY: 30,
    head: [['Usuario', 'Correo', 'Monto', 'Fecha']],
    body: pujasModal.map((p) => [
      p.usuario,
      p.correo,
      `$${p.monto}`,
      new Date(p.fecha).toLocaleString(),
    ]),
  });
  doc.save(`Pujas_Subasta_${subastaSeleccionada.nombre_Subasta}.pdf`);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-gray-900">📊 Reportes Administrativos</h1>

        {/* Subastas Realizadas */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Gavel size={20} /> Subastas Realizadas</h2>
            <div className="flex gap-2">
              <Button onClick={() => exportExcel(subastas, 'Subastas_Finalizadas')} icon={<FileSpreadsheet size={16} />}>Excel</Button>
              <Button onClick={() => exportPDF(subastas, ['id', 'nombre_Subasta', 'estado'], 'Subastas Finalizadas')} icon={<FileText size={16} />}>PDF</Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4">
              {subastas.map((s) => (
                <div key={s.id} className="p-4 bg-white rounded shadow">
                  <p><strong>{s.nombre_Subasta}</strong></p>
                  <p>Estado: {s.estado}</p>
                  <p>Inicio: {new Date(s.fecha_Inicio).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Pujas por subasta */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users size={20} /> Pujas por Subasta
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4">
              {subastas.map((s) => (
                <div key={s.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                  <div>
                    <p><strong>{s.nombre_Subasta}</strong></p>
                    <p className="text-sm text-gray-600">Inicio: {new Date(s.fecha_Inicio).toLocaleString()}</p>
                  </div>
                  <Button onClick={() => cargarPujasSubasta(s)}>Ver Detalles</Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {modalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 animate-slide-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Pujas – {subastaSeleccionada?.nombre_Subasta}</h3>
                <Button variant="outline" onClick={() => setModalVisible(false)}>Cerrar</Button>
              </div>

              {loadingModal ? (
                <p className="text-center text-gray-600">Cargando pujas...</p>
              ) : pujasModal.length === 0 ? (
                <p className="text-center text-gray-500">No se encontraron pujas para esta subasta.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {pujasModal.map((p, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded border border-gray-200 shadow-sm">
                      <p><strong>Usuario:</strong> {p.usuario}</p>
                      <p><strong>Correo:</strong> {p.correo}</p>
                      <p><strong>Monto:</strong> ${p.monto}</p>
                      <p><strong>Fecha:</strong> {new Date(p.fecha).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <Button icon={<FileSpreadsheet size={16} />} onClick={exportModalExcel} disabled={pujasModal.length === 0}>
                  Excel
                </Button>
                <Button icon={<FileText size={16} />} onClick={exportModalPDF} disabled={pujasModal.length === 0}>
                  PDF
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Pagos Realizados */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><DollarSign size={20} /> Pagos Realizados</h2>
            <div className="flex gap-2">
              <Button onClick={() => exportExcel(pagos, 'Pagos_Realizados')} icon={<FileSpreadsheet size={16} />}>Excel</Button>
              <Button onClick={() => exportPDF(pagos, ['id', 'fecha', 'monto'], 'Pagos Realizados')} icon={<FileText size={16} />}>PDF</Button>
            </div>
          </CardHeader>
            <CardBody>
              <div className="grid gap-4">
              {pagos.map((p) => (
                <div key={p.id} className="p-4 bg-white rounded shadow">
                  <p><strong>ID Pago:</strong> {p.id}</p>
                  <p><strong>Fecha:</strong> {new Date(p.fecha).toLocaleString()}</p>
                  <p><strong>Monto:</strong> ${p.monto}</p>
                </div>))}
                </div>
            </CardBody>
        </Card>
    </div>
</div>
);};

export default AdminReports;



