import React, { useState, useEffect } from 'react';
import { Clock, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { Auction, ApiAuction } from '../../../types';
import apiClient from '../../../services/ApiClient';

interface AuctionListProps {
  onSelectAuction: (auction: Auction) => void;
}

export const AuctionList: React.FC<AuctionListProps> = ({ onSelectAuction }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Aquí no hacemos nada con localStorage al inicio para el GUID.
    // El GUID se cargará SOLO cuando el pop-up se abra para precargar el último usado.

const fetchAuctions = async () => {
  try {
    setLoading(true);
    setError(null);

    const data: ApiAuction[] = await apiClient.get('/api/Subastas/Obtener_Subastas_Pendientes_Activas');

    const mappedAuctions: Auction[] = data.map(apiAuction => ({
      id: apiAuction.id,
      name: apiAuction.nombre_Subasta,
      productName: apiAuction.nombre_Producto,
      productImage: apiAuction.url_Producto,
      basePrice: apiAuction.precio_Inicial,
      currentPrice: apiAuction.precio_Inicial,
      status: apiAuction.estado === 'Pendiente' ? 'inactive' : 'active',
      minIncrement: apiAuction.incremento_Minimo,
      endTime: new Date(new Date(apiAuction.fecha_Inicio).getTime() + 3 * 24 * 60 * 60 * 1000),
      description: `Subasta de ${apiAuction.nombre_Producto}. Precio inicial: $${apiAuction.precio_Inicial}.`,
    }));

    setAuctions(mappedAuctions);
  } catch (err) {
    console.error('Error fetching auctions:', err);
    setError('No se pudieron cargar las subastas. Inténtalo de nuevo más tarde.');
  } finally {
    setLoading(false);
  }
};

    fetchAuctions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'inactive':
        return 'Inactiva';
      case 'completed':
        return 'Finalizada';
      default:
        return 'Desconocido';
    }
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return 'Finalizada';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleEnterAuctionClick = (auction: Auction) => {
  if (auction.status === 'active') {
    const storedGuid = localStorage.getItem('user_id');
    if (storedGuid) {
      onSelectAuction(auction);
    } else {
      alert('No se encontró el GUID del usuario en localStorage.');
    }
  }
};


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
        <p>No hay subastas disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subastas Disponibles</h2>
        <p className="text-gray-600">Encuentra las mejores oportunidades de subasta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <div
            key={auction.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
          >
            <div className="relative">
              <img
                src={auction.productImage}
                alt={auction.productName}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(auction.status)}`}>
                  {getStatusIcon(auction.status)}
                  <span>{getStatusText(auction.status)}</span>
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {auction.name}
              </h3>
              <p className="text-gray-600 mb-2 font-medium">{auction.productName}</p>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{auction.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Precio base:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${auction.basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Precio actual:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${auction.currentPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Tiempo restante:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatTimeRemaining(auction.endTime)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleEnterAuctionClick(auction)}
                disabled={auction.status !== 'active'}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  auction.status === 'active'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>
                  {auction.status === 'active' ? 'Ingresar a la Subasta' : 'Subasta No Disponible'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};