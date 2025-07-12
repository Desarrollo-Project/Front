import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import apiClient from '../../services/ApiClient';
import { toast } from 'react-toastify';

interface Reclamo {
  id_Reclamo: string;
  motivo: string;
  descripcion: string;
  estado: string;
  id_Usuario: string;
  id_Subasta: string;
}

const SoporteReclamos: React.FC = () => {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [selectedReclamo, setSelectedReclamo] = useState<Reclamo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [resolucionTexto, setResolucionTexto] = useState('');
  const [tipoResolucion, setTipoResolucion] = useState('Reembolso');

  const fetchReclamos = async () => {
    try {
      const data = await apiClient.get('/api/Reclamos/reclamos-todos');
      const pendientes = data.filter((r: Reclamo) => r.estado === 'Pendiente');
      setReclamos(pendientes);
    } catch (err) {
      toast.error('Error al cargar reclamos');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReclamos();
  }, []);

  const handleVerEvidencia = async (id: string) => {
    try {
      const blob = await apiClient.getBlob(`/api/Reclamos/${id}/evidencia`);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      toast.error('No se pudo cargar la evidencia');
      console.error(err);
    }
  };

  const handleResolver = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedReclamo) return;

  const userId = localStorage.getItem('user_id');
  if (!userId) {
    toast.error('No se pudo obtener el ID del usuario');
    return;
  }

  try {
    await apiClient.post('/api/Reclamos/crear-resolucion', {
      metodo_Resolucion: tipoResolucion,
      id_Reclamo: selectedReclamo.id_Reclamo,
      id_Usuario: userId,
    });

    await apiClient.put('/api/Reclamos/modificar-estado', {
      reclamo_Id: selectedReclamo.id_Reclamo,
      estado: 'Resuelto',
    });

    toast.success('Reclamo resuelto correctamente');
    setShowModal(false);
    setResolucionTexto('');
    setTipoResolucion('Reembolso');
    fetchReclamos();
  } catch (err) {
    toast.error('Error al resolver el reclamo');
    console.error(err);
  }
  useEffect;
};

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Reclamos</h1>

        {reclamos.length === 0 ? (
          <p className="text-gray-600">No hay reclamos pendientes por revisar.</p>
        ) : (
          reclamos.map((r) => (
            <Card key={r.id_Reclamo}>
              <CardHeader>
                <h3 className="text-lg font-semibold">Motivo: {r.motivo}</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-gray-700 mb-2">Descripción: {r.descripcion}</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => handleVerEvidencia(r.id_Reclamo)}>
                    Ver Evidencia
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedReclamo(r);
                      setShowModal(true);
                    }}
                  >
                    Resolver
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}

        {/* Modal de resolución */}
        {showModal && selectedReclamo && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <h3 className="text-xl font-semibold mb-4">Resolver Reclamo</h3>
              <form onSubmit={handleResolver} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Resolución</label>
                  <select
                    value={tipoResolucion}
                    onChange={(e) => setTipoResolucion(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Reembolso">Reembolso</option>
                    <option value="Reenvío del producto">Reenvío del producto</option>
                    <option value="Rechazo del reclamo">Rechazo del reclamo</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    Confirmar Resolución
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoporteReclamos;