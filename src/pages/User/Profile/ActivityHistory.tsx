import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Calendar, Filter, Clock, Activity } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext'; // ✅ lo estás usando correctamente
import apiClient from '../../../services/ApiClient';

interface ActivityLog {
  id: string;
  usuarioId: string;
  action: string;
  details: string;
  timestamp: string;
}

const ActivityHistory: React.FC = () => {
  const { user } = useAuth(); // ✅ usuario y token ya están en memoria
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    actionType: 'all',
  });

  const fetchActivities = async () => {
    const usuarioId = localStorage.getItem("user_id");

    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('desde', filters.startDate);
    if (filters.endDate) queryParams.append('hasta', filters.endDate);
    if (filters.actionType !== 'all') queryParams.append('tipoAccion', filters.actionType);

    try {
      const  data  = await apiClient.get(`/api/Usuarios/${usuarioId}/historial?${queryParams.toString()}`);

      const mappedActivities = data.map((item: any) => ({
        id: item.id,
        usuarioId: item.usuarioId,
        action: item.tipoAccion,
        timestamp: item.fecha,
        details: item.detalles,
      }));

    setActivities(mappedActivities);
    } catch (err: any) {
      setError('Failed to load activity history');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchActivities();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Activity History</h1>
        </div>

        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-primary-600" />
              <h2 className="text-xl font-semibold">Filters</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="date"
                name="startDate"
                label="Start Date"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
              <Input
                type="date"
                name="endDate"
                label="End Date"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Type
                </label>
                <select
                  name="actionType"
                  value={filters.actionType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                >
                  <option value="all">All Actions</option>
                  <option value="Usuario Registrado">Usuario Registrado</option>
                  <option value="Cuenta Confirmada">Cuenta Confirmada</option>
                  <option value="Perfil Actualizado">Perfil Actualizado</option>
                  <option value="Cambio de Contraseña">Cambio de Contraseña</option>
                  <option value="OTRO">OTRO</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="animate-slide-up delay-75">
          <CardBody>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activity found for the selected filters
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="bg-primary-100 p-2 rounded-full">
                      <Activity size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{activity.action}</h3>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {activity.timestamp && !isNaN(Date.parse(activity.timestamp)) ? (
                            new Date(activity.timestamp).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          ) : (
                            <span className="text-red-500">Fecha inválida</span>
                          )}
                        </span>
                      </div>
                      <p className="text-gray-600">{activity.details}</p>
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

export default ActivityHistory;
