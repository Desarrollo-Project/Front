import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

interface Auction {
  id: string;
  nombre_Subasta: string;
  descripcion?: string;
  fecha_Inicio: string;
  fecha_Fin: string;
  precio_Inicial: number;
  estado: string;
  id_Producto_Asociado: string;
}

interface Producto {
  id: string;
  nombre: { valor: string };
  imagenUrl: { valor: string };
  estado: { valor: string };
}

const AuctionsAuctionner: React.FC = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [productos, setProductos] = useState<Record<string, Producto>>({});
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [idProductoAsociado, setIdProductoAsociado] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre_Subasta: '',
    fecha_Inicio: '',
    fecha_Fin: '',
    precio_Inicial: '',
    incremento_Minimo: '',
    precio_Reserva: '',
    precioCierre_Automatico: '',
  });

  const token = localStorage.getItem('access_token');

  if (!user || user.userType !== 'auctioneer') return <Navigate to="/" replace />;

  const esFechaValida = (iso: string) =>
    !iso.startsWith('0001-01-01') && !iso.startsWith('1970-01-01');

  const fetchAuctions = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Subastas/Obtener_Subastas_Dueño?idDueño=${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log('📦 Subastas:', data);
    setAuctions(Array.isArray(data) ? data : []);
  };

  const fetchProductos = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/productos/productos/usuario/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log('📦 Productos:', data);

    const map: Record<string, Producto> = {};
    const disponibles: Producto[] = [];

    data.forEach((p: Producto) => {
      map[p.id] = p;
      if (p.estado?.valor === 'Disponible') disponibles.push(p);
    });

    setProductos(map);
    setProductosDisponibles(disponibles);
    if (disponibles.length > 0) setIdProductoAsociado(disponibles[0].id);
  };

  useEffect(() => {
    fetchAuctions();
    fetchProductos();
  }, []);

  const agruparPorEstado = (lista: Auction[]) => {
    const grupos: Record<string, Auction[]> = {};
    lista.forEach((s) => {
      if (!grupos[s.estado]) grupos[s.estado] = [];
      grupos[s.estado].push(s);
    });
    return grupos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !idProductoAsociado) return;

      const errores: string[] = [];

      const fechaInicio = new Date(formData.fecha_Inicio);
      const fechaFin = new Date(formData.fecha_Fin);
      const fechaActual = new Date();

      const precioInicial = parseFloat(formData.precio_Inicial);
      const precioReserva = parseFloat(formData.precio_Reserva);

      // 🗓️ Validaciones de fecha
      if (fechaInicio < fechaActual) {
        errores.push('La fecha de inicio no puede ser menor que la fecha actual.');
      }
      if (fechaFin <= fechaInicio) {
        errores.push('La fecha de fin debe ser posterior a la fecha de inicio.');
      }

      // 💰 Validaciones de precios
      if (isNaN(precioInicial) || precioInicial <= 0) {
        errores.push('El precio inicial debe ser mayor a 0.');
      }
      if (isNaN(precioReserva) || precioReserva < precioInicial) {
        errores.push('El precio de reserva debe ser mayor o igual al precio inicial.');
      }

      // Muestra todos los errores como alerta o visualmente
      if (errores.length > 0) {
        alert(errores.join('\n')); // o setError(errores.join('\n'))
        return;
      }

    const body = {
      id_Dueño_Subasta: user.id,
      id_Producto_Asociado: idProductoAsociado,
      nombre_Subasta: formData.nombre_Subasta,
      precio_Inicial: parseFloat(formData.precio_Inicial),
      precioCierre_Automatico: 1,
      precio_Reserva: parseFloat(formData.precio_Reserva),
      incremento_Minimo: parseFloat(formData.incremento_Minimo),
      fecha_Inicio: new Date(formData.fecha_Inicio).toISOString(),
      fecha_Fin: new Date(formData.fecha_Fin).toISOString()
    };

    console.log('🚀 JSON enviado:', JSON.stringify(body, null, 2));

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Subastas/Crear_Subasta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      console.log('🎉 Subasta creada');
      fetchAuctions();
      resetForm();
      setIsModalOpen(false);
    } else {
      console.error('❌ Fallo al crear subasta:', await res.text());
    }

    fetchAuctions();
    useEffect;
  };

  const resetForm = () => {
    setFormData({
      nombre_Subasta: '',
      fecha_Inicio: '',
      fecha_Fin: '',
      precio_Inicial: '',
      incremento_Minimo: '',
      precio_Reserva: '',
      precioCierre_Automatico: '',
    });
    setIdProductoAsociado(null);
  };


  const handleDelete = async (id: string) => {
  if (!window.confirm('¿Eliminar esta subasta pendiente?')) return;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Subastas/Eliminar_Subasta`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      console.log('🗑️ Subasta eliminada');
      fetchAuctions(); // refresca la lista
    } else {
      const errorText = await res.text();
      console.error('❌ Error al eliminar subasta:', errorText);
    }
  } catch (err) {
    console.error('❌ Excepción en handleDelete:', err);
  }
  fetchAuctions();
  useEffect;
};

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Mis Subastas</h1>
          <Button variant="primary" icon={<Plus size={20} />} onClick={() => setIsModalOpen(true)}>
            Crear Subasta
          </Button>
        </div>

        {auctions.length === 0 ? (
          <p className="text-center text-gray-500">No hay subastas disponibles.</p>
        ) : (
          Object.entries(agruparPorEstado(auctions)).map(([estado, grupo]) => (
            <div key={estado} className="mb-10">
              <h2 className="text-2xl font-semibold text-primary-700 mb-4">{estado}</h2>
              <Card className="animate-fade-in">
                <CardBody>
                  <div className="grid gap-6">
                    {grupo.map((sub) => {
                      const producto = productos[sub.id_Producto_Asociado];
                      const imagen = producto?.imagenUrl?.valor;

                      return (
                      <div key={sub.id} className="flex gap-4 border rounded-lg p-4 bg-white shadow-sm">
                        {imagen ? (
                          <img src={imagen} alt="Producto" className="w-32 h-32 object-cover rounded" />
                        ) : (
                          <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                            Sin imagen
                          </div>
                        )}
                        <div className="flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{sub.nombre_Subasta}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {producto?.nombre?.valor ?? 'Producto'}
                            </p>
                            <p className="text-sm text-gray-500">
                              <strong>Inicio:</strong> {new Date(sub.fecha_Inicio).toLocaleString()}<br />
                              <strong>Fin:</strong>{' '}
                              {esFechaValida(sub.fecha_Fin) ? new Date(sub.fecha_Fin).toLocaleString() : 'No asignada'}<br />
                              <strong>Precio Inicial:</strong> ${sub.precio_Inicial.toFixed(2)}<br />
                              <strong>Estado:</strong> {sub.estado}
                            </p>
                          </div>

                          {sub.estado === 'Pendiente' && (
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(sub.id)}
                                icon={<Trash2 size={16} />}
                              >
                                Eliminar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </div>
          ))
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">Crear Subasta</h2>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto Asociado</label>
                  <select
                    value={idProductoAsociado ?? ''}
                    onChange={(e) => setIdProductoAsociado(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    {productosDisponibles.length === 0 ? (
                      <option value="" disabled>No hay productos disponibles</option>): 
                      (productosDisponibles.map((prod) => (<option key={prod.id} value={prod.id}>{prod.nombre?.valor}
                      </option>)))}
                    </select>
                  </div>
                            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre de Subasta"
                value={formData.nombre_Subasta}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_Subasta: e.target.value })
                }
                required
                fullWidth
              />
              <Input
                label="Fecha de Inicio"
                type="datetime-local"
                value={formData.fecha_Inicio}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_Inicio: e.target.value })
                }
                required
                fullWidth
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha de Fin"
                type="datetime-local"
                value={formData.fecha_Fin}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_Fin: e.target.value })
                }
                required
                fullWidth
              />
              <Input
                label="Precio Inicial"
                type="number"
                value={formData.precio_Inicial}
                onChange={(e) =>
                  setFormData({ ...formData, precio_Inicial: e.target.value })
                }
                required
                fullWidth
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Precio de Reserva"
                type="number"
                value={formData.precio_Reserva}
                onChange={(e) =>
                  setFormData({ ...formData, precio_Reserva: e.target.value })
                }
                required
                fullWidth
              />
            </div>

            <Input
              label="Incremento Mínimo"
              type="number"
              value={formData.incremento_Minimo}
              onChange={(e) =>
                setFormData({ ...formData, incremento_Minimo: e.target.value })
              }
              required
              fullWidth
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Crear
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
</div>
); };
export default AuctionsAuctionner;
