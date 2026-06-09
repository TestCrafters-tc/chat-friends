export type ViewState = 'username' | 'landing' | 'chat';

export interface UserPersona {
  uid: string;
  username: string;
  avatar: string;
}

export interface ChatRoom {
  roomCode: string;
  roomName: string;
  createdBy: string;
  createdAt: number;
}

export interface ChatMessage {
  id?: string; // Firestore document ID
  roomId: string;
  uid: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: number;
  edited?: boolean;
  replyTo?: {
    id: string;
    text: string;
    username: string;
  } | null;
  reactions?: {
    [emoji: string]: string[]; // Mapping of emoji to array of user UIDs
  };
  seenBy?: string[]; // Array of UIDs who have render-read the message
}

export interface UserPresence {
  roomId: string;
  uid: string;
  username: string;
  avatar: string;
  lastActive: number;
}

export interface TypingState {
  roomId: string;
  uid: string;
  username: string;
  isTyping: boolean;
  lastUpdated: number;
}
