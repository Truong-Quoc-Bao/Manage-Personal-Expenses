import { io, Socket } from 'socket.io-client';

type EventCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private audio: HTMLAudioElement | null = null;
  private hasInteracted = false;

  connect() {
    if (this.socket) return;

    const socketUrl =
      import.meta.env.VITE_AI_SOCKET_URL ||
      (window.location.hostname === 'localhost' ? 'http://localhost:4005' : '');

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO đã kết nối tới AI Service!');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('⚠️ Socket.IO ngắt kết nối:', reason);
    });

    this.socket.on('connect_error', (err: Error) => {
      console.error('❌ Socket.IO lỗi kết nối:', err.message);
    });

    this.initAudio();
    this.setupInteractionListener();
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
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

  on(event: string, callback: EventCallback) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: EventCallback) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  getSocket() { return this.socket; }
}

export const socketService = new SocketService();
