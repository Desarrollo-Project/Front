import { useEffect, useState } from 'react';
import apiClient from '../../../services/ApiClient';

interface Transaccion {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  idSubasta: string;
}

const TransactionHistory = () => {
  const [txs, setTxs] = useState<Transaccion[]>([]);
  const userId = localStorage.getItem('user_id') || '';

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const data = await apiClient.get(`/api/pagos/Consultar_Pagos_Usuario/${userId}`);

        const pagosMapeados = data.map((p: any) => ({
          id: p.id,
          fecha: p.fecha,
          descripcion: '', // se llenará luego
          monto: p.monto,
          idSubasta: p.idSubasta,
        }));

        const pagosConSubastas = await Promise.all(
          pagosMapeados.map(async (tx) => {
            try {
              const subasta = await apiClient.get(
                `/api/Subastas/Obtener_Subasta_Por_Id?idSubasta=${tx.idSubasta}`
              );
              return {
                ...tx,
                descripcion: subasta.nombre_Subasta?.nombre || `Subasta ${tx.idSubasta}`,
              };
            } catch (error) {
              console.warn(`No se pudo obtener la subasta ${tx.idSubasta}`);
              return {
                ...tx,
                descripcion: `Subasta ${tx.idSubasta}`,
              };
            }
          })
        );

        setTxs(pagosConSubastas);
      } catch (err) {
        console.error('Error al cargar pagos:', err);
      }
    };

    fetchPagos();
  }, [userId]);

  return txs.length === 0 ? (
    <p className="text-gray-600">No hay transacciones</p>
  ) : (
    <table className="w-full border border-gray-200 rounded-md overflow-hidden shadow-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3 text-sm font-medium text-gray-700">Fecha</th>
          <th className="p-3 text-sm font-medium text-gray-700">Descripción</th>
          <th className="p-3 text-sm font-medium text-gray-700">Monto</th>
        </tr>
      </thead>
      <tbody>
        {txs.map((t) => (
          <tr key={t.id}>
            <td className="p-3 text-sm text-gray-800">{new Date(t.fecha).toLocaleDateString()}</td>
            <td className="p-3 text-sm text-gray-800">{t.descripcion}</td>
            <td className="p-3 text-sm text-gray-800">${t.monto.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionHistory;