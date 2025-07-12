// src/hook/usePujasSignalR.ts
import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export const usePujasSignalR = (
  subastaId: string,
  usuarioId: string,
  onNuevaPuja: (monto: number, pujador: string, esAutomatica: boolean) => void
) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Disconnected');
  
  // Usar useRef para el callback para evitar problemas con dependencias de useEffect
  const onNuevaPujaRef = useRef(onNuevaPuja);
  useEffect(() => {
    onNuevaPujaRef.current = onNuevaPuja;
  }, [onNuevaPuja]);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5029/hub/pujas')
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => 
            Math.min(retryContext.elapsedMilliseconds * 2, 10000)
      })
      .build();

    setConnection(newConnection);
    setConnectionStatus('Connecting');

    newConnection.start()
      .then(() => {
        setConnectionStatus('Connected');
        // Se mantiene 'EstablecerConexion' para registrar al usuario en el grupo
        newConnection.invoke('EstablecerConexion', subastaId, usuarioId)
          .then(() => console.log('Invocado EstablecerConexion'))
          .catch(err => console.error('Error al invocar EstablecerConexion:', err));
      })
      .catch(error => {
        console.error('SignalR Connection Error:', error);
        setConnectionStatus('Disconnected');
      });

    // *** CAMBIO AQUÍ: Escuchar el evento 'PrecioActualizado' y pasar los parámetros correctos ***
    newConnection.on('PrecioActualizado', (monto: number, pujador: string, esAutomatica: boolean) => {
      onNuevaPujaRef.current(monto, pujador, esAutomatica);
    });

    // Limpieza al desmontar el componente
    return () => {
      newConnection.stop()
        .then(() => setConnectionStatus('Disconnected'))
        .catch(err => console.error('Error al detener conexión SignalR:', err));
    };
  }, [subastaId, usuarioId]); // Dependencias del useEffect

  const sendBid = async (monto: number) => {
    if (connection && connectionStatus === 'Connected') {
      try {
        console.log(`Puja de $${monto} enviada por ${usuarioId} (a través de SignalR si se habilita)`);
      } catch (error) {
        console.error('Error sending bid via SignalR hook:', error);
      }
    } else {
      console.warn('No se pudo enviar la puja: Conexión no establecida o no conectada.');
    }
  };

  return { connectionStatus, sendBid };
};
