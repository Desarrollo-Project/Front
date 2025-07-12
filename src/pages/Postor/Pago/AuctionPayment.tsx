import { useEffect, useState } from 'react';
import apiClient from '../../../services/ApiClient';

interface Auction {
  id: string;
  titulo: string;
  monto: number;
}

interface PaymentMethod {
  Id_MP: string;
  Stripe_Mp_Id: string;
  Tarjeta_Marca: string;
  Tarjeta_Ultimos4: string;
  Tarjeta_ExpMes: number;
  Tarjeta_ExpAno: number;
}

interface AuctionPaymentProps {
  methods: PaymentMethod[];
  defaultMethodId: string;
}

const AuctionPayment = ({ methods, defaultMethodId }: AuctionPaymentProps) => {
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const userId = localStorage.getItem('user_id') || '';

useEffect(() => {
const fetchSubastas = async () => {
  try {
    const data = await apiClient.get(`/api/Subastas/Obtener_Subastas_Finalizadas_Por_Id_Ganador?id_gandor=${userId}`);
    
    const mapped = Array.isArray(data)
      ? data
          .filter((s: any) => !s.pagada)
          .map((s: any) => ({
            id: s.id,
            titulo: s.nombre_Subasta?.nombre,
            monto: s.monto_Final,
          }))
      : [];

    setWonAuctions(mapped);
  } catch (err: any) {
    // Verifica si es un 404 con mensaje personalizado
    if (err.response?.status === 404) {
      setWonAuctions([]); // vacía la lista sin mostrar error genérico
      console.info('No hay subastas ganadas para este usuario.');
    } else {
      console.error('Error al cargar subastas finalizadas:', err);
    }
  }
};

  fetchSubastas();
}, [userId]);

useEffect(() => {
  if (methods.length > 0) {
    const found = methods.find(m => m.Stripe_Mp_Id === defaultMethodId);
    setSelectedMethod(found?.Id_MP || methods[0].Id_MP);
  }
}, [methods, defaultMethodId]);

  const handlePay = async () => {
    if (!selected) return alert('Selecciona una subasta');
    if (!selectedMethod) return alert('Selecciona un método de pago');

    try {
      await apiClient.post('/api/pagos/Realizar_pago_subasta', {
        idUsuario: userId,
        idSubasta: selected,
        metodoPagoId: selectedMethod,
      });
      alert('Pago realizado correctamente');
      setSelected('');
    } catch (err) {
      console.error('Error al realizar el pago:', err);
      alert('Error al procesar el pago');
    }
  };

  return (
    
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Realizar Pago de Subasta</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subasta Ganada</label>

          {wonAuctions.length === 0 ? (
            <p className="text-sm text-gray-500 italic mt-1">No tienes subastas pendientes por pagar.</p>
          ) : (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 shadow-sm"
            >
              <option value="">-- Elige subasta ganada --</option>
              {wonAuctions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titulo} - ${a.monto}
                </option>
              ))}
            </select>
          )}
        </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 shadow-sm"
        >
          <option value="">-- Selecciona un método --</option>
          <optgroup label="Predeterminado">
            {methods
              .filter(m => m.Stripe_Mp_Id === defaultMethodId)
              .map((m) => (
                <option key={m.Id_MP} value={m.Id_MP}>
                  ⭐ {m.Tarjeta_Marca} ****{m.Tarjeta_Ultimos4}
                </option>
              ))}
          </optgroup>
          <optgroup label="Otros">
            {methods
              .filter(m => m.Stripe_Mp_Id !== defaultMethodId)
              .map((m) => (
                <option key={m.Id_MP} value={m.Id_MP}>
                  {m.Tarjeta_Marca} ****{m.Tarjeta_Ultimos4}
                </option>
              ))}
          </optgroup>
        </select>
      </div>

      <button
        onClick={handlePay}
        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition"
      >
        Pagar
      </button>
    </div>
  );
};

export default AuctionPayment;