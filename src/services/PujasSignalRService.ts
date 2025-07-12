// src/services/PujasSignalRService.ts
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class PujasSignalRService {
    private connection: HubConnection | null = null;
    // Asegúrate de que esta URL sea accesible desde tu frontend
    private readonly hubUrl = 'http://localhost:5029/hub/pujas'; 

    // Iniciar conexión y unirse a subasta
    public async startConnection(subastaId: string, usuarioId: string): Promise<void> {
        this.connection = new HubConnectionBuilder()
            .withUrl(this.hubUrl)
            .configureLogging(LogLevel.Warning) // Puedes cambiar a LogLevel.Information para más detalles
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => 
                    Math.min(retryContext.elapsedMilliseconds * 2, 10000) // Máx 10 seg
            })
            .build();

        try {
            await this.connection.start();
            
            // *** CORRECCIÓN AQUÍ: Cambiado a 'EstablecerConexion' ***
            await this.connection.invoke('EstablecerConexion', subastaId, usuarioId);
            
            console.log('Conexión SignalR establecida');
        } catch (err) {
            console.error('Error al conectar con SignalR:', err);
            throw err;
        }
    }

    // Registrar handler para recibir pujas
    public onRecibirPuja(callback: (monto: number, pujador: string, esAutomatica: boolean) => void): void {
        this.connection?.on('RecibirNuevaPuja', callback);
    }

    // Método para enviar pujas
    public async enviarPuja(subastaId: string, monto: number, usuarioId: string): Promise<void> {
        if (!this.connection) {
            console.error('No hay conexión establecida para enviar puja.');
            throw new Error('No hay conexión establecida');
        }
        
        // Asegúrate de que el método 'EnviarPuja' exista en tu Hub de C#
        await this.connection.invoke('EnviarPuja', subastaId, monto, usuarioId);
    }

    // Desconexión
    public async stopConnection(): Promise<void> {
        await this.connection?.stop();
        console.log('Conexión SignalR detenida.');
    }
}

export const pujasSignalRService = new PujasSignalRService();
