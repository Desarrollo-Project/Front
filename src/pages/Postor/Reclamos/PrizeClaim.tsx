import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../services/ApiClient';
import { toast } from 'react-toastify';

interface SubastaGanada {
  id: string;
  nombre: string;
  estadoEntrega: 'No Reclamado' | 'Reclamado' | 'Entregado';
}

const PrizeClaim: React.FC = () => {
  const { user } = useAuth();
  const [subastas, setSubastas] = useState<SubastaGanada[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [direccion, setDireccion] = useState('');
  const [metodo, setMetodo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [premiosReclamados, setPremiosReclamados] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalSubastaId, setModalSubastaId] = useState<string | null>(null);
  const [modalMotivo, setModalMotivo] = useState('Problema con la entrega del premio');
  const [modalDescripcion, setModalDescripcion] = useState('El usuario reportó un problema con la entrega del premio.');
  const [modalEvidencia, setModalEvidencia] = useState<File | null>(null);
  
const fetchGanadas = async () => {
  try {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      toast.error('No se pudo obtener el ID del usuario');
      return;
    }

    const data = await apiClient.get(`/api/Subastas/Obtener_Subastas_Pagadas_Por_Id_Ganador?id_gandor=${userId}`);
    const mapped = data.map((s: any) => ({
      id: s.id,
      nombre: s.nombre_Subasta?.nombre ?? 'Sin título',
      estadoEntrega: 'No Reclamado',
    }));

    setSubastas(mapped);
} catch (err: any) {
  if (err.response?.status === 404) {
    console.info('No hay subastas pagadas para este usuario');
    setSubastas([]); // o setGanadas([])
  } else {
    toast.error('Error al cargar subastas ganadas');
    console.error(err);
  }
}
};

const fetchPremiosReclamados = async () => {
  try {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const data = await apiClient.get(`/api/Reclamos/reclamo-premios/${userId}`);

    const mapped = [{
      id: data.id_Subasta,
      nombre: `Subasta ${data.id_Subasta.slice(0, 8)}...`,
      estadoEntrega: 'Reclamado',
    }];

    setPremiosReclamados(mapped);
  } catch (err: any) {
    if (err.response?.status === 404) {
      // No hay premios reclamados para este usuario
      setPremiosReclamados([]);
    } else {
      toast.error('Error al cargar premios reclamados');
      console.error('Error al obtener premios reclamados:', err);
    }
  }
  useEffect;
};

  useEffect(() => {
    fetchGanadas();
    fetchPremiosReclamados();
  }, []);

  const handleReclamar = async () => {
    if (!selected || !direccion.trim() || !metodo.trim()) {
      toast.error('Completa todos los campos para reclamar tu premio');
      return;
    }

    setIsLoading(true);
    try {
          const userId = localStorage.getItem('user_id');
          if (!userId) {
            toast.error('No se pudo obtener el ID del usuario');
            return;
          }
          console.log('ID de usuario enviado:', userId);
      await apiClient.post('/api/Reclamos/crear-reclamo-premio', {
        direccion_Envio: direccion,
        metodo_Entrega: metodo,
        id_Usuario: userId,
        id_Subasta: selected,
      });

      toast.success('Reclamo de premio enviado correctamente');
      setDireccion('');
      setMetodo('');
      setSelected('');
      fetchGanadas();
    } catch (err: any) {
      toast.error(err.message || 'Error al reclamar premio');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmarEntrega = async (subastaId: string) => {
    try {
          const userId = localStorage.getItem('user_id');
          if (!userId) {
            toast.error('No se pudo obtener el ID del usuario');
            return;
          }
      await apiClient.put('/api/Reclamos/confirmar-entrega-premio', {
        subasta_Id: subastaId,
      });
      toast.success('Entrega confirmada. ¡Gracias por participar!');
      fetchGanadas();
    } catch (err: any) {
      toast.error(err.message || 'Error al confirmar entrega');
      console.error(err);
    }
  };

  const handleReportarProblema = async (subastaId: string) => {
    try {
      await apiClient.post('/api/Reclamos/crear-reclamo', {
        id_Subasta: subastaId,
        motivo: 'Problema con la entrega del premio',
        descripcion: 'El usuario reportó un problema con la entrega del premio.',
      });
      toast.info('Se ha generado un reclamo para soporte.');
    } catch (err: any) {
      toast.error('Error al reportar problema');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">Reclamar Premio</h2>
          </CardHeader>
          <CardBody>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subasta Ganada</label>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Selecciona una subasta</option>
                  {subastas
                    .filter((s) => s.estadoEntrega === 'No Reclamado')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                </select>
              </div>

              <Input
                label="Dirección de Entrega"
                name="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
                fullWidth
              />

              <Input
                label="Método de Entrega"
                name="metodo"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                required
                fullWidth
              />

              <div className="flex justify-end">
                <Button variant="primary" onClick={handleReclamar} disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Reclamar Premio'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className="animate-slide-up delay-75">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Premios Reclamados</h2>
          </CardHeader>
          <CardBody>
            {premiosReclamados.length === 0 ? (
              <p className="text-gray-600">No has reclamado ningún premio aún.</p>
            ) : (
              <div className="space-y-4">
                {premiosReclamados.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{s.nombre}</h3>
                      <p className="text-sm text-gray-600">Estado: {s.estadoEntrega}</p>
                    </div>
                    <div className="flex gap-2">
                      {s.estadoEntrega === 'Reclamado' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleConfirmarEntrega(s.id)}>
                            Confirmar Entrega
                          </Button>

                            {showModal && (
                              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                                  <h3 className="text-lg font-semibold mb-4">Reportar Problema</h3>
                                  <form
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      const userId = localStorage.getItem('user_id');
                                      if (!userId || !modalSubastaId) return;

                                      const form = new FormData();
                                      form.append('Motivo', modalMotivo);
                                      form.append('Descripcion', modalDescripcion);
                                      form.append('Estado', 'Pendiente');
                                      form.append('Id_Usuario', userId);
                                      form.append('Id_Subasta', modalSubastaId);
                                      if (modalEvidencia) form.append('EvidenciaFile', modalEvidencia);

                                      try {
                                        await apiClient.post('/api/Reclamos/crear-reclamo', form);
                                        toast.success('Reclamo enviado correctamente');
                                        setShowModal(false);
                                        setModalEvidencia(null);
                                      } catch (err: any) {
                                        toast.error('Error al enviar el reclamo');
                                        console.error(err);
                                      }
                                    }}
                                    className="space-y-4"
                                  >
                                    <Input
                                      label="Motivo"
                                      name="motivo"
                                      value={modalMotivo}
                                      onChange={(e) => setModalMotivo(e.target.value)}
                                      required
                                      fullWidth
                                    />

                                    <div>
                                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                      </label>
                                      <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={modalDescripcion}
                                        onChange={(e) => setModalDescripcion(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Evidencia (opcional)</label>
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setModalEvidencia(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-gray-700"
                                      />
                                      {modalEvidencia && <p className="text-sm text-gray-600 mt-1">Archivo: {modalEvidencia.name}</p>}
                                    </div>

                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" onClick={() => setShowModal(false)}>
                                        Cancelar
                                      </Button>
                                      <Button type="submit" variant="primary">
                                        Enviar Reclamo
                                      </Button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setModalSubastaId(s.id);
                                setModalMotivo('Problema con la entrega del premio');
                                setModalDescripcion('El usuario reportó un problema con la entrega del premio.');
                                setModalEvidencia(null);
                                setShowModal(true);
                              }}
                            >
                              Reportar Problema
                            </Button>
                        </>
                      )}
                      {s.estadoEntrega === 'Entregado' && (
                        <span className="text-green-600 font-medium text-sm">Entregado</span>
                      )}
                    </div>
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

export default PrizeClaim;