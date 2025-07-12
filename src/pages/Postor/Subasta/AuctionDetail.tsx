// src/components/AuctionDetail.tsx
import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, TrendingUp, Zap, User } from 'lucide-react';
import { Auction, Bid, AutoBidConfig } from '../../../types';
import { usePujasSignalR } from '../../../hook/usePujasSignalR';
import { toast } from 'react-toastify';
import apiClient from '../../../services/ApiClient';

interface AuctionDetailProps {
  auction: Auction;
  // userId: string; // Se comenta para usar el valor hardcodeado por el momento
}

export const AuctionDetail: React.FC<AuctionDetailProps> = ({ auction }) => {
  // UserId hardcodeado según la solicitud
  const userId = localStorage.getItem('user_id');

  // Estados para manejar la conexión y datos en tiempo real
  const [currentPrice, setCurrentPrice] = useState(auction.currentPrice);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); // Estado para la carga del historial

  // Estados para la puja manual y automática
  const [manualBidIncrement, setManualBidIncrement] = useState<string>('');
  const [autoBidConfig, setAutoBidConfig] = useState<AutoBidConfig>({
    maxAmount: 0,
    increment: auction.minIncrement,
    isActive: false
  });
  const [loading, setLoading] = useState(false); // Para el estado de carga al enviar puja
  const [isAutoBidActiveForUser, setIsAutoBidActiveForUser] = useState(false); // Nuevo estado para controlar si la puja automática está activa para este usuario

  // Calcula el monto mínimo de la próxima puja (precio actual + incremento mínimo de la subasta)
  const minNextBidAmount = currentPrice + auction.minIncrement;

  // Manejador para nuevas pujas recibidas via SignalR
  const handleNuevaPuja = (monto: number, pujador: string, esAutomatica: boolean) => {
    // Actualizar precio actual
    setCurrentPrice(monto);
    
    // Añadir al historial de pujas
    const newBid: Bid = {
      id: Date.now().toString(), // Generar un ID único para la puja
      auctionId: auction.id,
      amount: monto,
      bidder: pujador,
      timestamp: new Date(),
      type: esAutomatica ? 'automatic' : 'manual'
    };
    
    // Añade la nueva puja al principio y mantiene solo las 10 últimas
    setRecentBids(prev => [newBid, ...prev.slice(0, 9)]); 
    
    // Notificar si la puja no es del usuario actual
    if (pujador !== userId) {
      toast.info(`¡Nueva puja de $${monto} por ${pujador}!`, {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  // Conexión a SignalR
  const { connectionStatus } = usePujasSignalR(
    auction.id,
    userId,
    handleNuevaPuja
  );

  // Efecto para manejar cambios en el estado de conexión
  useEffect(() => {
    setIsConnected(connectionStatus === 'Connected');
  }, [connectionStatus]);

  // LÓGICA: Cargar historial de pujas al conectar
  useEffect(() => {
const fetchBidHistory = async () => {
  if (!isConnected) return;

  setIsLoadingHistory(true);
  try {
    const history: any[] = await apiClient.get(`/Historial/${auction.id}`);

    const parsedHistory: Bid[] = history
      .map(bid => ({
        id: bid.id,
        auctionId: bid.auctionId,
        amount: bid.amount.monto_Total,
        bidder: bid.bidder.id_postor,
        timestamp: new Date(bid.timestamp.fecha),
        type: 'manual'
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setRecentBids(parsedHistory.slice(0, 10));

    if (parsedHistory.length > 0) {
      setCurrentPrice(parsedHistory[0].amount);
    }

    // TODO: lógica para puja automática si el backend lo soporta
    // const status = await apiClient.get(`/api/Pujas/AutoBidStatus/${auction.id}/${userId}`);
    // setIsAutoBidActiveForUser(status.isActive);
    // setAutoBidConfig(prev => ({ ...prev, ...status }));

  } catch (error) {
    console.error('Error al cargar el historial de pujas:', error);
    toast.error('No se pudo cargar el historial de pujas.', { position: "top-center" });
  } finally {
    setIsLoadingHistory(false);
  }
};

    fetchBidHistory();
  }, [isConnected, auction.id, userId]); // Dependencias del useEffect

  // Manejador para enviar una puja manual a través del endpoint REST
  const handleManualBid = async () => {
  const incrementValue = parseFloat(manualBidIncrement);

  if (isNaN(incrementValue) || incrementValue < auction.minIncrement) {
    toast.error(`El incremento debe ser de al menos $${auction.minIncrement.toLocaleString()}`, {
      position: "top-center"
    });
    return;
  }

  const totalBidAmount = currentPrice + incrementValue;

  setLoading(true);
  try {
    await apiClient.post('/Crear_Puja', {
      id_Subasta: auction.id,
      id_Postor: userId,
      fecha_Puja: new Date().toISOString(),
      monto: totalBidAmount,
      incremento: incrementValue
    });

    setManualBidIncrement('');
    toast.success('¡Puja manual enviada exitosamente! Esperando confirmación en tiempo real.', {
      position: "top-center"
    });
  } catch (error: any) {
    console.error('Error al enviar la puja manual:', error);
    toast.error(`Error al enviar la puja: ${error.message || 'Inténtalo de nuevo.'}`, {
      position: "top-center"
    });
  } finally {
    setLoading(false);
  }
};

  // Manejador para activar/desactivar la puja automática
  const handleAutoBidToggle = async () => {
  if (!autoBidConfig.isActive) {
    // Activar puja automática
    if (autoBidConfig.maxAmount <= minNextBidAmount) {
      toast.error(
        `El monto máximo debe ser mayor que el precio actual ($${currentPrice.toLocaleString()}) y el incremento mínimo de la subasta ($${auction.minIncrement.toLocaleString()}).`,
        { position: "top-center" }
      );
      return;
    }

    if (autoBidConfig.increment < auction.minIncrement) {
      toast.error(
        `El incremento de la puja automática debe ser al menos $${auction.minIncrement.toLocaleString()}.`,
        { position: "top-center" }
      );
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/Crear_Puja_Automatica', {
        id: '00000000-0000-0000-0000-000000000000', // requerido por el DTO
        id_Subasta: auction.id,
        id_Postor: userId,
        Maximo_Monto: autoBidConfig.maxAmount,
        Incrementos: autoBidConfig.increment,
        Fecha_Creacion_Puja_Automatica: new Date().toISOString(),
      });

      toast.success('¡Puja automática activada exitosamente!', { position: "top-center" });
      setIsAutoBidActiveForUser(true);
      setAutoBidConfig(prev => ({ ...prev, isActive: true }));
    } catch (error: any) {
      console.error('Error al activar la puja automática:', error);
      toast.error(`Error al activar la puja automática: ${error.message || 'Inténtalo de nuevo.'}`, {
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  } else {
    // Desactivar puja automática (solo frontend por ahora)
    toast.info('Puja automática desactivada (solo en frontend).', { position: "top-center" });
    setIsAutoBidActiveForUser(false);
    setAutoBidConfig(prev => ({ ...prev, isActive: false }));
  }
};

  // Formatear tiempo restante para la subasta
  const formatTimeRemaining = (endTime: Date): string => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Formatear tiempo hace cuánto se realizó una puja
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Hace unos segundos';
    if (minutes < 60) return `Hace ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sección de información de la subasta */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Imagen del producto */}
            <img
              src={auction.productImage}
              alt={auction.productName}
              className="w-full h-64 object-cover"
              // Fallback para la imagen en caso de error
              onError={(e) => {
                e.currentTarget.onerror = null; // Evita bucle infinito
                e.currentTarget.src = `https://placehold.co/640x360/E0E0E0/333333?text=No+Image`;
              }}
            />
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{auction.name}</h1>
              <h2 className="text-xl text-gray-700 mb-4">{auction.productName}</h2>
              <p className="text-gray-600 mb-6">{auction.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Indicador de conexión */}
                <div className={`text-center p-4 rounded-lg ${
                  isConnected ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  <div className="flex items-center justify-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      isConnected ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span>{isConnected ? 'Conectado' : 'Conectando...'}</span>
                  </div>
                </div>

                {/* Precio actual */}
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Precio Actual</p>
                  <p className="text-lg font-bold text-blue-600">${currentPrice.toLocaleString()}</p>
                </div>

                {/* Tiempo restante */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Tiempo Restante</p>
                  <p className="text-lg font-semibold">{formatTimeRemaining(auction.endTime)}</p>
                </div>

                {/* Incremento Mínimo */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Incremento Mín.</p>
                  <p className="text-lg font-semibold">${auction.minIncrement.toLocaleString()}</p>
                </div>
              </div>

              {/* Historial de pujas en tiempo real */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pujas Recientes</h3>
                {isLoadingHistory ? (
                  <p className="text-gray-500 text-center py-4">Cargando historial...</p>
                ) : (
                  <div className="space-y-3">
                    {recentBids.length > 0 ? (
                      recentBids.map((bid) => (
                        <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{bid.bidder}</p>
                              <p className="text-sm text-gray-500">
                                {formatTimeAgo(bid.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">${bid.amount.toLocaleString()}</p>
                            {/* Eliminado bid.type ya que no viene del historial */}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay pujas recientes</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel de pujas */}
        <div className="space-y-6">
          {/* Información de conexión */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de Conexión</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  Estado de SignalR: <span className={`font-medium ${
                    isConnected ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {connectionStatus}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  ID de Subasta: <code className="bg-gray-100 px-1 rounded">{auction.id}</code>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID de Usuario: <code className="bg-gray-100 px-1 rounded">{userId}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Pujas manuales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Puja Manual</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="manualBidIncrement" className="block text-sm font-medium text-gray-700 mb-2">
                  Incremento deseado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="manualBidIncrement"
                    value={manualBidIncrement}
                    onChange={(e) => setManualBidIncrement(e.target.value)}
                    min={auction.minIncrement}
                    step={auction.minIncrement}
                    className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={auction.minIncrement.toLocaleString()}
                    disabled={!isConnected || loading || isLoadingHistory || isAutoBidActiveForUser} // Deshabilitar si puja automática activa
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Incremento mínimo de la subasta: ${auction.minIncrement.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Próxima puja mínima: ${minNextBidAmount.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleManualBid}
                disabled={loading || !manualBidIncrement || parseFloat(manualBidIncrement) < auction.minIncrement || !isConnected || isLoadingHistory || isAutoBidActiveForUser} // Deshabilitar si puja automática activa
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Procesando...' : `Pujar con incremento de $${parseFloat(manualBidIncrement).toLocaleString() || 0}`}
              </button>
              {isAutoBidActiveForUser && (
                <p className="text-red-500 text-sm mt-2 text-center">Las pujas manuales están deshabilitadas mientras la puja automática está activa.</p>
              )}
            </div>
          </div>

          {/* Pujas automáticas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Puja Automática</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Monto máximo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="maxAmount"
                    value={autoBidConfig.maxAmount || ''}
                    onChange={(e) => setAutoBidConfig(prev => ({
                      ...prev,
                      maxAmount: parseFloat(e.target.value) || 0
                    }))}
                    min={minNextBidAmount}
                    className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={minNextBidAmount.toLocaleString()}
                    disabled={!isConnected || isLoadingHistory || isAutoBidActiveForUser} // Deshabilitar si ya está activa
                  />
                </div>
              </div>
              <div>
                <label htmlFor="increment" className="block text-sm font-medium text-gray-700 mb-2">
                  Incremento por puja
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="increment"
                    value={autoBidConfig.increment}
                    onChange={(e) => setAutoBidConfig(prev => ({
                      ...prev,
                      increment: parseFloat(e.target.value) || auction.minIncrement
                    }))}
                    min={auction.minIncrement}
                    className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!isConnected || isLoadingHistory || isAutoBidActiveForUser} // Deshabilitar si ya está activa
                  />
                </div>
              </div>
              <button
                onClick={handleAutoBidToggle}
                disabled={!isConnected || (autoBidConfig.maxAmount < minNextBidAmount && !autoBidConfig.isActive) || isLoadingHistory || isAutoBidActiveForUser} // Deshabilitar si ya está activa
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                  autoBidConfig.isActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {autoBidConfig.isActive ? 'Desactivar Puja Automática' : 'Activar Puja Automática'}
              </button>
              {isAutoBidActiveForUser && ( // Mostrar mensaje si está activa
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    Puja automática activa hasta ${autoBidConfig.maxAmount.toLocaleString()} 
                    con incrementos de ${autoBidConfig.increment.toLocaleString()}. Las pujas manuales están deshabilitadas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
