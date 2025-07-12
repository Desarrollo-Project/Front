import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../services/ApiClient';
import { toast } from 'react-toastify';

interface Reclamo {
  id: string;
  motivo: string;
  descripcion: string;
  estado: 'Pendiente' | 'En Revisión' | 'Resuelto';
  fechaCreacion: string;
  id_Subasta: string;
}

const MyClaims: React.FC = () => {
  const { user } = useAuth();
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [filtered, setFiltered] = useState<Reclamo[]>([]);
  const [estadoFiltro, setEstadoFiltro] = useState<'Todos' | Reclamo['estado']>('Todos');
  const [isLoading, setIsLoading] = useState(false);
  const [resolucion, setResolucion] = useState<null | {
  metodo_Resolucion: string;
  createdAt: string;
  }>(null);
  const [showResolucionModal, setShowResolucionModal] = useState(false);

const fetchReclamos = async () => {
  setIsLoading(true);
  try {
    const id = localStorage.getItem('user_id');
    const data = await apiClient.get(`/api/Reclamos/reclamos/${id}`);

    const mapped = [{
      id: data.id_Reclamo,
      motivo: data.motivo,
      descripcion: data.descripcion,
      estado: data.estado,
      fechaCreacion: data.createdAt,
      id_Subasta: data.id_Subasta,
    }];

    setReclamos(mapped);
    setFiltered(mapped);
  } catch (err) {
    toast.error('Error al cargar tus reclamos');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchReclamos();
  }, []);

  useEffect(() => {
    if (estadoFiltro === 'Todos') {
      setFiltered(reclamos);
    } else {
      setFiltered(reclamos.filter(r => r.estado === estadoFiltro));
    }
  }, [estadoFiltro, reclamos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Mis Reclamos</h2>
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="Todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Resuelto">Resuelto</option>
              </select>
            </div>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <p className="text-gray-600">Cargando reclamos...</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-600">No tienes reclamos registrados.</p>
            ) : (
              <div className="space-y-4">
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{r.motivo}</h3>
                        <p className="text-sm text-gray-600 mt-1">{r.descripcion}</p>
                        <p className="text-xs text-gray-400 mt-1">Subasta: {r.id_Subasta}</p>
                        <p className="text-xs text-gray-400">Fecha: {new Date(r.fechaCreacion).toLocaleString()}</p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          r.estado === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : r.estado === 'En Revisión'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {r.estado}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const blob = await apiClient.getBlob(`/api/Reclamos/${r.id}/evidencia`);
                            const url = window.URL.createObjectURL(blob);
                            window.open(url, '_blank');
                          } catch (err) {
                            toast.error('Error al obtener la evidencia.');
                            console.error(err);
                          }
                        }}
                      >
                        Ver Evidencia
                      </Button>

                      {r.estado === 'Resuelto' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const data = await apiClient.get(`/api/Reclamos/resoluciones/${r.id}`);
                              setResolucion({
                                metodo_Resolucion: data.metodo_Resolucion,
                                createdAt: data.createdAt,
                              });
                              setShowResolucionModal(true);
                            } catch (err) {
                              toast.error('No se pudo obtener la resolución');
                              console.error(err);
                            }
                          }}
                        >
                          Ver Resolución
                        </Button>
                      )}
                    </div>

                      {showResolucionModal && resolucion && (
                        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Resolución del Reclamo</h3>
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Método:</strong> {resolucion.metodo_Resolucion}
                            </p>
                            <p className="text-sm text-gray-500">
                              <strong>Fecha:</strong> {new Date(resolucion.createdAt).toLocaleString()}
                            </p>
                            <div className="flex justify-end mt-4">
                              <Button variant="primary" onClick={() => setShowResolucionModal(false)}>
                                Cerrar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default MyClaims;