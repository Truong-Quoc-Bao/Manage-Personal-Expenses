import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private audio: HTMLAudioElement | null = null;
  private hasInteracted = false;

  connect() {
    this.socket = io(process.env.REACT_APP_SOCKET_URL || '');
    this.initAudio();
    this.setupInteractionListener();
  }

  private initAudio() {
    this.audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    this.audio.volume = 0.75;
  }

  private setupInteractionListener() {
    const handler = () => {
      this.hasInteracted = true;
      window.removeEventListener('click', handler);
    };
    window.addEventListener('click', handler);
  }

  playNotifSound() {
    if (this.hasInteracted && this.audio) {
      this.audio.play().catch(() => {});
    }
  }

  onBankNotification(callback: (data: any) => void) {
    this.socket?.on('bank_notification', callback);
  }

  onNewNotification(callback: (data: any) => void) {
    this.socket?.on('new_notification', callback);
  }

  getSocket() { return this.socket; }
}

export const socketService = new SocketService();