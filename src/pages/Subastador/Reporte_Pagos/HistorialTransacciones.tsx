import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/ApiClient';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { DollarSign, Timer } from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, FileSpreadsheet } from 'lucide-react';

const cargarPagosDesdeIdsDeSubastas = async (idDueño: string): Promise<any[]> => {
  try {
    const subResp = await apiClient.get(`/api/Subastas/Obtener_Subastas_Dueño?idDueño=${idDueño}`); 
    const subastas = Array.isArray(subResp) ? subResp : [];

    if (subastas.length === 0) {
      console.warn("⚠️ No se encontraron subastas para este dueño.");
      return [];
    }

    const idsSubastas = subastas.map(sub => sub.id);
    const pagosTotales: any[] = [];

    await Promise.all(
      idsSubastas.map(async (idSubasta) => {
        try {
          const pagoResp = await apiClient.get(`/api/pagos/Consultar_Pagos_Subasta/${idSubasta}`);
          const pagos = Array.isArray(pagoResp) ? pagoResp : [];

          pagos.forEach((pago: any) => {
            const subastaRef = subastas.find(s => s.id === idSubasta);
            pagosTotales.push({
              ...pago,
              nombre_Subasta: subastaRef?.nombre_Subasta ?? 'Subasta desconocida',
              estado: subastaRef?.estado ?? 'Desconocido',
              fecha_Inicio: subastaRef?.fecha_Inicio ?? null,
            });
          });
        } catch (error) {
          console.error(`❌ Error al obtener pagos para subasta ${idSubasta}:`, error);
        }
      })
    );

    return pagosTotales;
  } catch (error) {
    console.error("❗ Error general al cargar subastas:", error);
    return [];
  }
};

const HistorialTransacciones: React.FC = () => {
  const [pagosTotales, setPagosTotales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const idDueño = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchData = async () => {
      const pagos = await cargarPagosDesdeIdsDeSubastas(idDueño);
      setPagosTotales(pagos);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Cargando historial de transacciones...</p>;
  }


  const exportToExcel = (data: any[]) => {
  const sheet = XLSX.utils.json_to_sheet(data.map(p => ({
    Subasta: p.nombre_Subasta,
    Estado: p.estado,
    Fecha_Subasta: new Date(p.fecha_Inicio).toLocaleString(),
    Fecha_Pago: new Date(p.fecha).toLocaleString(),
    Monto: p.monto,
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Transacciones');
  XLSX.writeFile(wb, 'HistorialTransacciones.xlsx');
};

const exportToPDF = (data: any[]) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Historial de Transacciones', 14, 22);

  autoTable(doc, {
    startY: 30,
    head: [['Subasta', 'Estado', 'Fecha Subasta', 'Fecha Pago', 'Monto']],
    body: data.map(p => [
      p.nombre_Subasta,
      p.estado,
      new Date(p.fecha_Inicio).toLocaleString(),
      new Date(p.fecha).toLocaleString(),
      `$${p.monto}`,
    ]),
  });

  doc.save('HistorialTransacciones.pdf');
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Historial de Transacciones</h1>

        {pagosTotales.length === 0 ? (
          <p className="text-gray-500 text-center">No hay transacciones disponibles.</p>
        ) : (
        <>
          {/* Botones de Exportación */}
          <div className="flex justify-end gap-4 mb-6">
            <Button onClick={() => exportToExcel(pagosTotales)} icon={<FileSpreadsheet size={18} />}>
              Exportar Excel
            </Button>
            <Button onClick={() => exportToPDF(pagosTotales)} icon={<FileText size={18} />}>
              Exportar PDF
            </Button>
          </div>

          <div className="space-y-6">
            {pagosTotales.map((pago) => (
              <Card key={pago.id} className="animate-slide-up">
                <CardHeader className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{pago.nombre_Subasta}</h2>
                    <span className="text-sm text-gray-600">{pago.estado}</span>
                  </div>
                  <Timer size={20} className="text-primary-500" />
                </CardHeader>
                <CardBody>
                  <p><strong>Fecha de Subasta:</strong> {new Date(pago.fecha_Inicio).toLocaleString()}</p>
                  <p><strong>Fecha de Pago:</strong> {new Date(pago.fecha).toLocaleString()}</p>
                  <p className="text-primary-700 font-semibold mt-2"><DollarSign className="inline mr-1" /> ${pago.monto}</p>
                </CardBody>
              </Card>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HistorialTransacciones;