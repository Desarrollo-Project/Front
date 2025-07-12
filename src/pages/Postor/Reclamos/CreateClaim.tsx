import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../services/ApiClient';
import { toast } from 'react-toastify';

interface Subasta {
  id: string;
  nombre: string;
}

const CreateClaim: React.FC = () => {
  const { user } = useAuth();
  const [subastas, setSubastas] = useState<Subasta[]>([]);
  const [selectedSubasta, setSelectedSubasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [evidencia, setEvidencia] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔄 Cargar subastas del usuario
  useEffect(() => {
    const fetchSubastas = async () => {
      try {
        //const userId = localStorage.getItem('user_id');
        const data = await apiClient.get(`/api/Subastas/Obtener_Subastas_Pendientes_Activas`);
        //const data = await apiClient.get(`/api/Subastas/Obtener_Subastas_Finalizadas`);
        const mapped = data.map((s: any) => ({
          id: s.id,
          nombre: s.nombre_Subasta,
        }));
        setSubastas(mapped);
      } catch (err) {
        toast.error('Error al cargar subastas');
        console.error(err);
      }
    };
    fetchSubastas();
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedSubasta || !motivo.trim() || !descripcion.trim()) {
    toast.error('Completa todos los campos obligatorios');
    return;
  }

  setIsLoading(true);
  try {
    const form = new FormData();
    form.append('Motivo', motivo);
    form.append('Descripcion', descripcion);
    form.append('Estado', 'Pendiente'); // o el estado inicial que manejes
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      toast.error('No se pudo obtener el ID del usuario');
      return;
    }
    form.append('Id_Usuario', userId);
    form.append('Id_Subasta', selectedSubasta);
    if (evidencia) form.append('EvidenciaFile', evidencia);

    await apiClient.post('/api/Reclamos/crear-reclamo', form);
    toast.success('Reclamo enviado correctamente');
    setMotivo('');
    setDescripcion('');
    setSelectedSubasta('');
    setEvidencia(null);
  } catch (err: any) {
    toast.error(err.message || 'Error al enviar el reclamo');
    console.error('Error al crear reclamo:', err);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">Crear Reclamo</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subasta</label>
                <select
                  value={selectedSubasta}
                  onChange={(e) => setSelectedSubasta(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Selecciona una subasta</option>
                  {subastas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Motivo del Reclamo"
                name="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
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
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
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
                  onChange={(e) => setEvidencia(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-700"
                />
                {evidencia && <p className="text-sm text-gray-600 mt-1">Archivo: {evidencia.name}</p>}
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Reclamo'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CreateClaim;