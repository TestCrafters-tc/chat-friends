import React from 'react';
import { 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  onSnapshot, 
  deleteDoc 
} from 'firebase/firestore';

import { 
  auth, 
  db, 
  APP_ID, 
  OperationType, 
  handleFirestoreError 
} from './firebase';
import { 
  ViewState, 
  ChatMessage, 
  UserPresence 
} from './types';

// Importing Custom Responsive Modules
import UsernameView from './components/UsernameView';
import LandingView from './components/LandingView';
import ChatView from './components/ChatView';
import Toast, { ToastType } from './components/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [isActionLoading, setIsActionLoading] = React.useState(false);

  // Identity state
  const [username, setUsername] = React.useState(() => {
    return localStorage.getItem('whisper_username') || 'Ghost';
  });
  const [avatar, setAvatar] = React.useState(() => {
    return localStorage.getItem('whisper_avatar') || '🐱';
  });

  const [view, setView] = React.useState<ViewState>('username');
  const [roomCode, setRoomCode] = React.useState<string | null>(null);
  const [roomName, setRoomName] = React.useState('Secure Feed');

  // Real-time collections state
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [presences, setPresences] = React.useState<UserPresence[]>([]);
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
  const [myTypingStatus, setMyTypingStatus] = React.useState(false);

  // Unified Toast State
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<ToastType>('info');
  const [isToastVisible, setIsToastVisible] = React.useState(false);

  const showToast = (msg: string, type: ToastType = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setIsToastVisible(true);
  };

  // Helper: Extract current room code from URL hash
  const getRoomFromHash = (): string | null => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/room/')) {
      return hash.replace('#/room/', '').toUpperCase();
    }
    return null;
  };

  // Helper: Set / Sync hash in browser route URL
  const updateURLHash = (code: string | null) => {
    if (typeof window === 'undefined') return;
    if (code) {
      window.location.hash = `/room/${code}`;
    } else {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Phase 1: Authentication & Global Route Event Handling
  React.useEffect(() => {
    // Authenticate user with Firebase
    const authenticate = async () => {
      try {
        const customToken = window.__initial_auth_token;
        if (customToken) {
          await signInWithCustomToken(auth, customToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Firebase Auth sequence failed:', err);
        showToast('Security authentication failed. Please reload.', 'error');
      } finally {
        setIsAuthLoading(false);
      }
    };

    authenticate();

    // Firebase Auth State Observer
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        
        // If profile is already initialized initially, navigate to correct target
        const lUsername = localStorage.getItem('whisper_username') || 'Ghost';
        if (lUsername !== 'Ghost') {
          const hashRoom = getRoomFromHash();
          if (hashRoom) {
            setView('chat');
            setRoomCode(hashRoom);
          } else {
            setView('landing');
          }
        } else {
          setView('username');
        }
      }
    });

    // Hash parameter router synchronization
    const handleHashChange = () => {
      const targetRoom = getRoomFromHash();
      const lUsername = localStorage.getItem('whisper_username') || 'Ghost';
      
      if (!targetRoom) {
        setRoomCode(null);
        if (lUsername !== 'Ghost') {
          setView('landing');
        } else {
          setView('username');
        }
      } else if (targetRoom !== roomCode) {
        if (lUsername !== 'Ghost') {
          setView('chat');
          setRoomCode(targetRoom);
        } else {
          setView('username');
          showToast('Please set your identity profile first!', 'info');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [roomCode]);

  // Phase 2: Set profile details securely & write to local caches
  const handleSaveIdentity = () => {
    localStorage.setItem('whisper_username', username);
    localStorage.setItem('whisper_avatar', avatar);
    
    showToast(`Identity profile updated successfully!`, 'success');

    // Route dynamically based on hash code presence
    const hashRoom = getRoomFromHash();
    if (hashRoom) {
      setRoomCode(hashRoom);
      setView('chat');
    } else {
      setView('landing');
    }
  };

  // Phase 3: Create room on Firestore
  const handleCreateRoom = async (pRoomName: string) => {
    if (!currentUser) return;
    setIsActionLoading(true);

    // Generate readable alphanumeric secure code W-XXXX
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'W-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    try {
      const roomPath = `artifacts/${APP_ID}/public/data/rooms/${code}`;
      const roomDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'rooms', code);
      await setDoc(roomDocRef, {
        roomCode: code,
        roomName: pRoomName,
        createdBy: currentUser.uid,
        createdAt: Date.now()
      });

      setRoomName(pRoomName);
      setRoomCode(code);
      updateURLHash(code);
      setView('chat');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `rooms/${code}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Phase 4: Join room trigger
  const handleJoinRoom = async (pRoomCode: string) => {
    if (!currentUser) return;
    setIsActionLoading(true);

    try {
      const roomDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'rooms', pRoomCode);
      const roomSnap = await getDoc(roomDocRef);
      
      let finalName = 'Secure Feed';
      if (roomSnap.exists()) {
        finalName = roomSnap.data().roomName || 'Secure Feed';
      } else {
        // Fallback: create placeholder Room Meta parameters so communication is active
        await setDoc(roomDocRef, {
          roomCode: pRoomCode,
          roomName: 'Secure Feed',
          createdAt: Date.now()
        });
      }

      setRoomName(finalName);
      setRoomCode(pRoomCode);
      updateURLHash(pRoomCode);
      setView('chat');
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `rooms/${pRoomCode}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Phase 5: Exit active channel and restore landing dashboard
  const handleLeaveRoom = async () => {
    if (roomCode) {
      // Discard typing indicator immediately
      await updateMyTypingState(false);
      await deletePresenceDoc(roomCode);
    }
    setRoomCode(null);
    updateURLHash(null);
    setView('landing');
    setMessages([]);
    setPresences([]);
    setTypingUsers([]);
  };

  // Helper to destroy presence doc before leaving
  const deletePresenceDoc = async (code: string) => {
    if (!currentUser) return;
    try {
      const presenceDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'presences', `${code}_${currentUser.uid}`);
      await deleteDoc(presenceDocRef);
    } catch (e) {}
  };

  // Helper to modify typing state
  const updateMyTypingState = async (status: boolean) => {
    if (!currentUser || !roomCode) return;
    try {
      const typingDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'typing', `${roomCode}_${currentUser.uid}`);
      await setDoc(typingDocRef, {
        roomId: roomCode,
        uid: currentUser.uid,
        username,
        isTyping: status,
        lastUpdated: Date.now()
      });
    } catch (e) {}
  };

  // Phase 6: Active Multi-User Chat real-time snapshots
  React.useEffect(() => {
    if (!roomCode || !currentUser) return;

    // Establish dynamic sync to rooms metadata to ensure header title matches
    const roomDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'rooms', roomCode);
    getDoc(roomDocRef).then((snap) => {
      if (snap.exists()) {
        setRoomName(snap.data().roomName || 'Secure Feed');
      }
    }).catch(() => {});

    // 1. Snapshot Listener - Messages Collection (Filtered locally for performance and indexing)
    const messagesCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'messages');
    const unsubscribeMessages = onSnapshot(messagesCollection, (snapshot) => {
      const msgsList: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatMessage;
        if (data.roomId === roomCode) {
          const mId = docSnap.id;
          msgsList.push({ ...data, id: mId });

          // Auto mark seen if not seen by current user
          if (currentUser && data.uid !== currentUser.uid && (!data.seenBy || !data.seenBy.includes(currentUser.uid))) {
            const messageDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'messages', mId);
            const currentSeen = data.seenBy || [];
            setDoc(messageDocRef, { seenBy: [...currentSeen, currentUser.uid] }, { merge: true }).catch(() => {});
          }
        }
      });
      // Sort chronologically in memory
      msgsList.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(msgsList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `messages`);
    });

    // 2. Snapshot Listener - Connected Multi-User Presences
    const presencesCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'presences');
    const unsubscribePresences = onSnapshot(presencesCollection, (snapshot) => {
      const now = Date.now();
      const list: UserPresence[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserPresence;
        // Filter: active inside this room and updated during last twenty seconds
        if (data.roomId === roomCode && (now - data.lastActive) < 20000) {
          list.push(data);
        }
      });
      setPresences(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `presences`);
    });

    // 3. Snapshot Listener - Typing Indicators
    const typingCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'typing');
    const unsubscribeTyping = onSnapshot(typingCollection, (snapshot) => {
      const now = Date.now();
      const activeTypingNames: string[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as { roomId: string; uid: string; username: string; isTyping: boolean; lastUpdated: number };
        if (
          data.roomId === roomCode && 
          data.uid !== currentUser.uid && 
          data.isTyping && 
          (now - data.lastUpdated) < 6000
        ) {
          activeTypingNames.push(data.username || 'Someone');
        }
      });
      setTypingUsers(activeTypingNames);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `typing`);
    });

    // 4. Repeated Presence Heartbeat Pulse (8 seconds period)
    const writePresenceToken = async () => {
      try {
        const presenceDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'presences', `${roomCode}_${currentUser.uid}`);
        await setDoc(presenceDocRef, {
          roomId: roomCode,
          uid: currentUser.uid,
          username,
          avatar,
          lastActive: Date.now()
        });
      } catch (e) {}
    };

    writePresenceToken();
    const intervalHeartbeat = setInterval(writePresenceToken, 8000);

    // Teardown everything gracefully
    return () => {
      unsubscribeMessages();
      unsubscribePresences();
      unsubscribeTyping();
      clearInterval(intervalHeartbeat);
      
      // Cleanup typing and presence
      const presenceDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'presences', `${roomCode}_${currentUser.uid}`);
      deleteDoc(presenceDocRef).catch(() => {});
      
      const typingDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'typing', `${roomCode}_${currentUser.uid}`);
      deleteDoc(typingDocRef).catch(() => {});
    };
  }, [roomCode, currentUser?.uid, username, avatar]);

  // Phase 7: Send Message Thread with reply info, edits, deletes, reactions
  const handleSendMessage = async (text: string, replyTo: ChatMessage['replyTo'] = null) => {
    if (!currentUser || !roomCode) return;
    try {
      const messagesCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'messages');
      await addDoc(messagesCollection, {
        roomId: roomCode,
        uid: currentUser.uid,
        username,
        avatar,
        text,
        timestamp: Date.now(),
        replyTo,
        reactions: {},
        seenBy: [currentUser.uid]
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `messages`);
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!currentUser || !roomCode) return;
    try {
      const messageDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'messages', messageId);
      await setDoc(messageDocRef, { text: newText, edited: true }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `messages/${messageId}`);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser || !roomCode) return;
    try {
      const messageDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'messages', messageId);
      await deleteDoc(messageDocRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `messages/${messageId}`);
    }
  };

  const handleReactMessage = async (messageId: string, emoji: string) => {
    if (!currentUser || !roomCode) return;
    try {
      const messageDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'messages', messageId);
      const docSnap = await getDoc(messageDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as ChatMessage;
        const reactions = { ...(data.reactions || {}) };
        const userList = [...(reactions[emoji] || [])];
        
        if (userList.includes(currentUser.uid)) {
          reactions[emoji] = userList.filter(uid => uid !== currentUser.uid);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          reactions[emoji] = [...userList, currentUser.uid];
        }
        await setDoc(messageDocRef, { reactions }, { merge: true });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `messages/${messageId}`);
    }
  };

  // Phase 8: Typing drafting event hook
  const typingTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleTypingEvent = () => {
    if (!myTypingStatus) {
      setMyTypingStatus(true);
      updateMyTypingState(true);
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      setMyTypingStatus(false);
      updateMyTypingState(false);
    }, 3000);
  };

  // Clipboard copy helper
  const handleCopyCodeText = () => {
    if (!roomCode) return;
    const dummyInput = document.createElement('input');
    dummyInput.value = roomCode;
    document.body.appendChild(dummyInput);
    dummyInput.select();
    try {
      document.execCommand('copy');
      showToast(`Copied Room Code: ${roomCode}`, 'success');
    } catch (err) {
      showToast('Copying failed.', 'error');
    }
    document.body.removeChild(dummyInput);
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 select-none bg-[#1c1c1e] text-white min-h-screen">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full border-t border-[#0A84FF] animate-spin"></div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">INITIALIZING SECURITY...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] h-[100dvh] md:h-[92vh] md:max-h-[850px] md:rounded-3xl liquid-glass flex flex-col overflow-hidden relative shadow-2xl">
      {/* Dynamic Slide toast overlay */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        isVisible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
      />

      {/* Screen Views switcher router */}
      {view === 'username' && (
        <UsernameView
          username={username}
          setUsername={setUsername}
          avatar={avatar}
          setAvatar={setAvatar}
          onSave={handleSaveIdentity}
        />
      )}

      {view === 'landing' && (
        <LandingView
          username={username}
          avatar={avatar}
          onChangeIdentity={() => setView('username')}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          isLoading={isActionLoading}
        />
      )}

      {view === 'chat' && roomCode && (
        <ChatView
          roomCode={roomCode}
          roomName={roomName}
          messages={messages}
          presences={presences}
          typingUsers={typingUsers}
          myUid={currentUser?.uid || ''}
          myUsername={username}
          myAvatar={avatar}
          onLeave={handleLeaveRoom}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onReactMessage={handleReactMessage}
          onTyping={handleTypingEvent}
          onCopyCode={handleCopyCodeText}
        />
      )}
    </div>
  );
}
