import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
import {
  initializeAppCheck,
  ReCaptchaV3Provider
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app-check.js';

// Application Variables Setup & Fallbacks
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'whisperwire-chat';

const firebaseConfig = {
  apiKey: "AIzaSyChtFMVu3t_FUhzwrjcgLJ6ettDOTgiPuo",
  authDomain: "chat-friends-24d14.firebaseapp.com",
  projectId: "chat-friends-24d14",
  storageBucket: "chat-friends-24d14.firebasestorage.app",
  messagingSenderId: "759058935291",
  appId: "1:759058935291:web:4280edd1a10c7566aaef5e",
  measurementId: "G-EWSEYYR4CE"
};

// Initializing SDKs
const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(
    '6LeKCSEtAAAAAP0Y4wVl0pc5R8hM0gokHWTzyoOf'
  ),
  isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);
const db = getFirestore(app);

// Setup Local Persona / Custom State Data
let currentUser = null;
let selectedAvatar = "🐱";
let myUsername = "Ghost";
let currentRoom = null;
let isTyping = false;
let typingTimer = null;

// New Feature State
let replyTarget = null;
let editTarget = null;

// Subscriptions List to cleanly teardown
let messageUnsubscribe = null;
let activeUsersUnsubscribe = null;
let typingStatusUnsubscribe = null;
let presencePulseTimer = null;

// Supported Emoji Avatars
const AVATARS = ["🐱", "🦊", "🦁", "🐨", "🐼", "🤖", "👾", "👽", "🤠", "🧛", "🧑‍🚀", "🧙"];

// UI Element Binding
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
const toastIcon = document.getElementById('toastIcon');

const usernameView = document.getElementById('usernameView');
const landingView = document.getElementById('landingView');
const chatView = document.getElementById('chatView');

const avatarSelector = document.getElementById('avatarSelector');
const usernameInput = document.getElementById('usernameInput');
const saveUsernameBtn = document.getElementById('saveUsernameBtn');

const currentUserPill = document.getElementById('currentUserPill');
const userNameSpan = document.getElementById('userNameSpan');
const userAvatarSpan = document.getElementById('userAvatarSpan');

const createRoomBtn = document.getElementById('createRoomBtn');
const roomNameInput = document.getElementById('roomNameInput');
const joinRoomForm = document.getElementById('joinRoomForm');
const joinCodeInput = document.getElementById('joinCodeInput');

const leaveChatBtn = document.getElementById('leaveChatBtn');
const headerRoomTitle = document.getElementById('headerRoomTitle');
const headerCodeDisplay = document.getElementById('headerCodeDisplay');
const headerCodeText = document.getElementById('headerCodeText');
const activeUserCount = document.getElementById('activeUserCount');

const messagesList = document.getElementById('messagesList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messageContainer = document.getElementById('messageContainer');

const typingIndicator = document.getElementById('typingIndicator');
const toggleParticipantsBtn = document.getElementById('toggleParticipantsBtn');
const closeParticipantsBtn = document.getElementById('closeParticipantsBtn');
const participantsSidebar = document.getElementById('participantsSidebar');
const participantsList = document.getElementById('participantsList');
const selfAvatar = document.getElementById('selfAvatar');
const selfName = document.getElementById('selfName');
const mobileBadge = document.getElementById('mobileBadge');

// Bind new elements
const replyPreviewContainer = document.getElementById('replyPreviewContainer');
const replyPreviewUser = document.getElementById('replyPreviewUser');
const replyPreviewText = document.getElementById('replyPreviewText');
const cancelReplyBtn = document.getElementById('cancelReplyBtn');

// Bind PWA and Room History elements
const pwaInstallBtn = document.getElementById('pwaInstallBtn');
const roomDurationSelect = document.getElementById('roomDurationSelect');
const roomHistoryBox = document.getElementById('roomHistoryBox');
const roomHistoryList = document.getElementById('roomHistoryList');

// Toast Utility
function showToast(message, type = 'info') {
  toastText.innerText = message;
  if (type === 'error') {
    toastIcon.innerHTML = `<i class="fa-solid fa-circle-exclamation text-rose-400"></i>`;
  } else if (type === 'success') {
    toastIcon.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i>`;
  } else {
    toastIcon.innerHTML = `<i class="fa-solid fa-circle-info text-indigo-400"></i>`;
  }
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Dynamic Route Verification Support
function getRoomFromHash() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/room/')) {
    return hash.replace('#/room/', '').toUpperCase();
  }
  return null;
}

function updateURLState(code) {
  if (code) {
    window.location.hash = `/room/${code}`;
  } else {
    window.location.hash = '';
  }
}

// Active View Manager
function showView(viewName) {
  usernameView.classList.add('hidden');
  landingView.classList.add('hidden');
  chatView.style.display = 'none';
  chatView.classList.remove('active');

  if (viewName === 'username') {
    usernameView.classList.remove('hidden');
    usernameView.classList.add('active');
  } else if (viewName === 'landing') {
    landingView.classList.remove('hidden');
    landingView.classList.add('active');
    userNameSpan.textContent = myUsername;
    userAvatarSpan.textContent = selectedAvatar;
    renderRoomHistoryUI();
  } else if (viewName === 'chat') {
    chatView.style.display = 'flex';
    chatView.classList.add('active');
  }
}

// ==================================================
// PWA & SERVICE WORKER LOGIC
// ==================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then((reg) => {
      console.log('ServiceWorker registered successfully: ', reg.scope);
    }).catch((err) => {
      console.error('ServiceWorker registration failed: ', err);
    });
  });
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (pwaInstallBtn) {
    pwaInstallBtn.classList.remove('hidden');
  }
});

if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      pwaInstallBtn.classList.add('hidden');
    } else {
      showToast(
        'Use Chrome menu → Add to Home Screen to install WhisperWire.',
        'info'
      );
    }
  });
}

window.addEventListener('appinstalled', () => {
  if (pwaInstallBtn) {
    pwaInstallBtn.classList.add('hidden');
  }
  deferredPrompt = null;
  showToast('WhisperWire installed successfully!', 'success');
});

// ==================================================
// ROOM HISTORY LOCAL STORAGE UTILITIES
// ==================================================
function getRoomHistory() {
  try {
    const data = localStorage.getItem('whisperwire_room_history');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function addRoomToHistory(roomId, roomName, createdAt, expiresAt) {
  let history = getRoomHistory();
  history = history.filter(item => item.roomId !== roomId);
  history.unshift({
    roomId,
    roomName,
    createdAt,
    expiresAt,
    lastJoinedAt: Date.now()
  });
  if (history.length > 20) {
    history = history.slice(0, 20);
  }
  try {
    localStorage.setItem('whisperwire_room_history', JSON.stringify(history));
  } catch (e) {}
}

function renderRoomHistoryUI() {
  if (!roomHistoryList || !roomHistoryBox) return;
  const history = getRoomHistory();
  roomHistoryList.innerHTML = '';
  if (history.length === 0) {
    roomHistoryBox.classList.add('hidden');
    return;
  }
  roomHistoryBox.classList.remove('hidden');
  history.forEach(item => {
    const isExpired = item.expiresAt && Date.now() > item.expiresAt;
    const div = document.createElement('div');
    div.className = `history-item${isExpired ? ' expired' : ''}`;
    let statusText = '';
    if (isExpired) {
      statusText = '<span class="history-badge-expired">Expired</span>';
    } else if (item.expiresAt) {
      const diffMs = item.expiresAt - Date.now();
      const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
      statusText = `<span class="history-expiry">Expires in ${diffHrs}h</span>`;
    }
    div.innerHTML = `
      <div style="min-width:0;flex:1;padding-right:12px">
        <div class="history-name">${escapeHTML(item.roomName)}</div>
        <div class="history-code">${item.roomId}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        ${statusText}
        ${!isExpired ? `<i class="fa-solid fa-arrow-right" style="font-size:11px;color:var(--blue)"></i>` : ''}
      </div>
    `;
    if (!isExpired) {
      div.addEventListener('click', () => {
        updateURLState(item.roomId);
        joinRoom(item.roomId);
      });
    }
    roomHistoryList.appendChild(div);
  });
}

// Populating Avatars in setup screen
function buildAvatarList() {
  avatarSelector.innerHTML = '';
  AVATARS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `avatar-btn${selectedAvatar === emoji ? ' selected' : ''}`;
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      selectedAvatar = emoji;
      buildAvatarList();
    });
    avatarSelector.appendChild(btn);
  });
}

// Save Display Username Info
saveUsernameBtn.addEventListener('click', () => {
  const inputVal = usernameInput.value.trim();
  if (!inputVal) {
    showToast("Please enter a display name first", "error");
    return;
  }
  myUsername = inputVal;
  showView('landing');

  // Update sidebar state
  selfAvatar.textContent = selectedAvatar;
  selfName.textContent = `${myUsername} (You)`;

  // If URL already had a room parameters, join it directly now
  const hashRoom = getRoomFromHash();
  if (hashRoom) {
    joinRoom(hashRoom);
  }
});

// Edit Name Pill
currentUserPill.addEventListener('click', () => {
  showView('username');
});

// Room Code Generator
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'W-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create Room Logic
createRoomBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  const proposedRoomName = roomNameInput.value.trim() || "Whisper Hub";
  const newRoomCode = generateRoomCode();

  try {
    const roomDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'rooms', newRoomCode);
    await setDoc(roomDocRef, {
      roomCode: newRoomCode,
      roomName: proposedRoomName,
      createdBy: currentUser.uid,
      createdAt: Date.now()
    });

    roomNameInput.value = '';
    updateURLState(newRoomCode);
    joinRoom(newRoomCode);
  } catch (err) {
    showToast("Error establishing room. Please try again.", "error");
  }
});

// Join Code Submission
joinRoomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const rawCode = joinCodeInput.value.trim().toUpperCase();
  if (rawCode) {
    joinCodeInput.value = '';
    updateURLState(rawCode);
    joinRoom(rawCode);
  }
});

// Establish multi-user Presence pulses
async function startPresenceTracking(roomCode) {
  if (!currentUser) return;
  
  const presenceDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'presences', `${roomCode}_${currentUser.uid}`);
  
  const writePresence = async () => {
    try {
      await setDoc(presenceDocRef, {
        roomId: roomCode,
        uid: currentUser.uid,
        username: myUsername,
        avatar: selectedAvatar,
        lastActive: Date.now()
      });
    } catch (e) {
      // Silent failure
    }
  };

  await writePresence();
  
  // Heartbeat pulse every 8 seconds
  presencePulseTimer = setInterval(writePresence, 8000);
}

// Terminate local multi-user tracking
async function stopPresenceTracking(roomCode) {
  if (presencePulseTimer) {
    clearInterval(presencePulseTimer);
    presencePulseTimer = null;
  }
  if (currentUser && roomCode) {
    try {
      const presenceDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'presences', `${roomCode}_${currentUser.uid}`);
      await deleteDoc(presenceDocRef);
    } catch(e) {}
  }
}

// Monitor Senders present in Room
function listenToPresence(roomCode) {
  const presenceCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'presences');
  
  activeUsersUnsubscribe = onSnapshot(presenceCollection, (snapshot) => {
    const now = Date.now();
    const activeUsers = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filter in memory for current room & active within last 20 seconds
      if (data.roomId === roomCode && (now - data.lastActive) < 20000) {
        activeUsers.push(data);
      }
    });

    updateActiveUsersUI(activeUsers);
  }, (err) => {
    // Handle gracefully
  });
}

// Update Side Panel interface
function updateActiveUsersUI(usersList) {
  participantsList.innerHTML = '';
  activeUserCount.innerText = `${usersList.length} Online`;
  
  if (usersList.length > 1) {
    mobileBadge.classList.remove('hidden');
  } else {
    mobileBadge.classList.add('hidden');
  }

  usersList.forEach(user => {
    const isMe = user.uid === currentUser?.uid;
    const div = document.createElement('div');
    div.className = `participant-row${isMe ? ' is-me' : ''}`;
    
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;min-width:0">
        <span class="participant-avatar">${user.avatar || '👤'}</span>
        <span class="participant-name${isMe ? ' bold' : ''}">${user.username}${isMe ? ' (You)' : ''}</span>
      </div>
      <span class="participant-online-dot"></span>
    `;
    participantsList.appendChild(div);
  });
}

// Listen to Multi-User Typing status changes
function listenToTypingStates(roomCode) {
  const typingCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'typing');
  
  typingStatusUnsubscribe = onSnapshot(typingCollection, (snapshot) => {
    const activeTypers = [];
    const now = Date.now();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Check if typing state updated in last 5 seconds, belongs to this room, and is not current user
      if (data.roomId === roomCode && data.uid !== currentUser?.uid && data.isTyping && (now - data.lastUpdated < 6000)) {
        activeTypers.push(data.username || "Someone");
      }
    });

    if (activeTypers.length === 0) {
      typingIndicator.innerHTML = '';
    } else if (activeTypers.length === 1) {
      typingIndicator.innerHTML = `
        <span class="typing-dot"></span>
        <span>${activeTypers[0]} is drafting…</span>
      `;
    } else {
      typingIndicator.innerHTML = `
        <span class="typing-dot"></span>
        <span>Multiple users drafting…</span>
      `;
    }
  });
}

// Write Own Drafting/Typing Indicator State
async function setMyTypingState(status) {
  if (!currentUser || !currentRoom) return;
  try {
    const typingDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'typing', `${currentRoom}_${currentUser.uid}`);
    await setDoc(typingDocRef, {
      roomId: currentRoom,
      uid: currentUser.uid,
      username: myUsername,
      isTyping: status,
      lastUpdated: Date.now()
    });
  } catch (e) {}
}

// Textarea height autogrow
function autoResizeInput() {
  messageInput.style.height = 'auto';
  messageInput.style.height = (messageInput.scrollHeight) + 'px';
}

messageInput.addEventListener('input', () => {
  autoResizeInput();
  if (!isTyping) {
    isTyping = true;
    setMyTypingState(true);
  }
  
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    isTyping = false;
    setMyTypingState(false);
  }, 3000);
});

// Shift+Enter creates new line, Enter sends message
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    messageForm.requestSubmit();
  }
});

// Retrieve and setup main Room Details
async function joinRoom(roomCode) {
  if (!currentUser) return;
  
  // Tear down past subscriptions cleanly
  if (messageUnsubscribe) messageUnsubscribe();
  if (activeUsersUnsubscribe) activeUsersUnsubscribe();
  if (typingStatusUnsubscribe) typingStatusUnsubscribe();
  await stopPresenceTracking(currentRoom);

  // Clear features states
  cancelReply();
  cancelEdit();

  try {
    // Fetch Room Document for dynamic room names
    const roomDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'rooms', roomCode);
    const roomSnap = await getDoc(roomDocRef);
    
    let roomDisplayName = "Secure Feed";
    if (roomSnap.exists()) {
      roomDisplayName = roomSnap.data().roomName || "Secure Feed";
    } else {
      // If room meta doc does not exist, establish fallback default room parameters
      await setDoc(roomDocRef, {
        roomCode: roomCode,
        roomName: "Secure Feed",
        createdAt: Date.now()
      });
    }

    currentRoom = roomCode;
    headerRoomTitle.textContent = roomDisplayName;
    headerCodeText.textContent = roomCode;
    
    showView('chat');
    showToast(`Connected to room: ${roomDisplayName}`, "success");

    // Open live pipelines
    await startPresenceTracking(roomCode);
    listenToPresence(roomCode);
    listenToTypingStates(roomCode);
    listenToMessages(roomCode);

  } catch (e) {
    showToast("Access failed. Check network connection.", "error");
  }
}

// Listen to Messages in Room
function listenToMessages(roomCode) {
  const messagesCollection = collection(db, 'artifacts', APP_ID, 'public', 'data', 'messages');
  
  messageUnsubscribe = onSnapshot(messagesCollection, (snapshot) => {
    const msgs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.roomId === roomCode) {
        msgs.push({ ...data, id: doc.id });
      }
    });

    // Local sort chronologically
    msgs.sort((a, b) => a.timestamp - b.timestamp);
    renderMessages(msgs);
  });
}

// Receipt status tracking helper
async function markAsRead(msg) {
  if (!currentUser || msg.uid === currentUser.uid) return;
  
  const updates = {};
  let needUpdate = false;
  
  const deliveredTo = msg.deliveredTo || [];
  const seenBy = msg.seenBy || [];

  if (!deliveredTo.includes(currentUser.uid)) {
    deliveredTo.push(currentUser.uid);
    updates.deliveredTo = deliveredTo;
    needUpdate = true;
  }

  if (currentRoom && !seenBy.includes(currentUser.uid)) {
    seenBy.push(currentUser.uid);
    updates.seenBy = seenBy;
    needUpdate = true;
  }

  if (needUpdate) {
    try {
      const msgDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'messages', msg.id);
      await updateDoc(msgDocRef, updates);
    } catch (err) {
      console.error("Error updating receipt status: ", err);
    }
  }
}

// Send Message Input Logic
messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !currentUser || !currentRoom) return;

  messageInput.value = '';
  autoResizeInput();
  
  // Clear typing status immediately
  isTyping = false;
  await setMyTypingState(false);

  if (editTarget) {
    const msgId = editTarget.id;
    cancelEdit();
    try {
      const msgDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'messages', msgId);
      await updateDoc(msgDocRef, {
        text: text,
        edited: true
      });
      showToast("Message updated", "success");
    } catch (err) {
      showToast("Message edit failed.", "error");
    }
  } else {
    try {
      const msgRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'messages');
      const payload = {
        roomId: currentRoom,
        uid: currentUser.uid,
        username: myUsername,
        avatar: selectedAvatar,
        text: text,
        timestamp: Date.now(),
        deliveredTo: [],
        seenBy: []
      };

      if (replyTarget) {
        payload.replyToId = replyTarget.id;
        payload.replyToUser = replyTarget.username;
        payload.replyToText = replyTarget.text;
        cancelReply();
      }

      await addDoc(msgRef, payload);
    } catch (err) {
      showToast("Message delivery failed.", "error");
    }
  }
});

// Group Chat Participant Name Colors
const SENDER_COLORS = [
  'text-emerald-400', 'text-amber-400', 'text-teal-400', 'text-rose-400', 
  'text-cyan-400', 'text-fuchsia-400', 'text-violet-400', 'text-orange-400', 
  'text-sky-400', 'text-pink-400'
];
function getSenderColorClass(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SENDER_COLORS.length;
  return SENDER_COLORS[index];
}

// Reply targets management
function setReplyTarget(msgId, username, text) {
  cancelEdit();
  replyTarget = { id: msgId, username, text };
  replyPreviewUser.textContent = `Replying to ${username}`;
  replyPreviewText.textContent = text;
  replyPreviewContainer.classList.remove('hidden');
  messageInput.focus();
}

function cancelReply() {
  replyTarget = null;
  replyPreviewContainer.classList.add('hidden');
}

cancelReplyBtn.addEventListener('click', cancelReply);

// Edit targets management
function startEdit(msgId, text) {
  cancelReply();
  editTarget = { id: msgId, originalText: text };
  messageInput.value = text;
  messageInput.focus();
  autoResizeInput();
  
  messageInput.classList.add('editing');
  showToast("Editing message...", "info");
}

function cancelEdit() {
  editTarget = null;
  messageInput.value = '';
  autoResizeInput();
  messageInput.classList.remove('editing');
}

// Clipboard Copy
window.copyToClipboard = function(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied to clipboard", "success");
    }).catch(() => {
      showToast("Copy failed", "error");
    });
  } else {
    const dummy = document.createElement('textarea');
    dummy.value = text;
    document.body.appendChild(dummy);
    dummy.select();
    try {
      document.execCommand('copy');
      showToast("Copied to clipboard", "success");
    } catch (err) {
      showToast("Copy failed", "error");
    }
    document.body.removeChild(dummy);
  }
};

// Delete Message
window.deleteMessage = async function(msgId) {
  if (confirm("Delete this message?")) {
    try {
      const msgDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'messages', msgId);
      await deleteDoc(msgDocRef);
      showToast("Message deleted", "success");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  }
};

// Scroll to original message in reply
window.scrollToMessage = function(id) {
  const el = document.querySelector(`[data-msg-id="${id}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('highlight-flash');
    setTimeout(() => {
      el.classList.remove('highlight-flash');
    }, 1500);
  } else {
    showToast("Original message not found in room context", "info");
  }
};

// Swipe gesture configuration & click toggle for actions
function setupSwipeGesture(el, indicator, msg, msgBlock) {
  let startX = 0;
  let startY = 0;
  let diffX = 0;
  let isSwiping = false;
  let hasDragged = false;

  const onStart = (clientX, clientY) => {
    startX = clientX;
    startY = clientY;
    isSwiping = false;
    hasDragged = false;
    el.style.transition = 'none';
  };

  const onMove = (clientX, clientY) => {
    diffX = clientX - startX;
    const diffY = clientY - startY;

    if (!isSwiping && Math.abs(diffY) > Math.abs(diffX)) {
      return;
    }

    if (Math.abs(diffX) > 5) {
      hasDragged = true;
    }

    if (diffX > 0) {
      isSwiping = true;
      const translateVal = Math.min(diffX, 70);
      el.style.transform = `translateX(${translateVal}px)`;
      
      const progress = Math.min(translateVal / 50, 1);
      indicator.style.opacity = progress;
      indicator.style.transform = `scale(${progress})`;
    }
  };

  const onEnd = () => {
    el.style.transition = 'transform 0.2s ease';
    el.style.transform = 'none';
    
    indicator.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    indicator.style.opacity = 0;
    indicator.style.transform = 'scale(0.5)';

    if (isSwiping && diffX > 50) {
      setReplyTarget(msg.id, msg.username, msg.text);
    }
    
    isSwiping = false;
    diffX = 0;
  };

  el.addEventListener('touchstart', (e) => {
    onStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  el.addEventListener('touchmove', (e) => {
    if (isSwiping) {
      e.preventDefault();
    }
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  el.addEventListener('touchend', onEnd);

  let isMouseDown = false;
  el.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    onStart(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    onMove(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    if (isMouseDown) {
      isMouseDown = false;
      onEnd();
    }
  });

  // Handle click to toggle context menu
  el.addEventListener('click', (e) => {
    if (hasDragged) {
      hasDragged = false;
      return;
    }
    const selection = window.getSelection().toString();
    if (selection) return;

    const parent = msgBlock;
    const wasOpen = parent.classList.contains('show-actions');
    
    // Close other open message actions
    document.querySelectorAll('.msg-bubble-container.show-actions').forEach(openEl => {
      if (openEl !== parent) {
        openEl.classList.remove('show-actions');
      }
    });

    parent.classList.toggle('show-actions');
  });
}

// Render Room Messages UI
function renderMessages(list) {
  const wasAtBottom =
    messageContainer.scrollHeight -
    messageContainer.scrollTop -
    messageContainer.clientHeight < 100;

  messagesList.innerHTML = '';
  
  if (list.length === 0) {
    messagesList.innerHTML = `
      <div style="text-align:center;padding:32px 0;color:var(--text-tertiary);font-size:13px;font-style:italic">
        No whispers yet. Write the first message below.
      </div>
    `;
    return;
  }

  list.forEach(msg => {
    const isMe = msg.uid === currentUser?.uid;
    
    if (currentUser && msg.uid !== currentUser.uid) {
      markAsRead(msg);
    }

    const msgBlock = document.createElement('div');
    msgBlock.className = `msg-bubble-container ${isMe ? 'from-me' : 'from-them'}`;
    msgBlock.dataset.msgId = msg.id;

    const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let replyHtml = '';
    if (msg.replyToId) {
      replyHtml = `
        <div class="reply-quote">
          <div class="reply-quote-user">${msg.replyToUser}</div>
          <div class="reply-quote-text">${msg.replyToText}</div>
        </div>
      `;
    }

    const senderColor = isMe ? 'text-indigo-200/90' : getSenderColorClass(msg.username);

    let receiptHtml = '';
    if (isMe) {
      const isSeen = msg.seenBy && msg.seenBy.some(uid => uid !== currentUser.uid);
      const isDelivered = msg.deliveredTo && msg.deliveredTo.some(uid => uid !== currentUser.uid);
      
      if (isSeen) {
        receiptHtml = `<span class="receipt-icon receipt-seen" title="Seen"><i class="fa-solid fa-check-double"></i></span>`;
      } else if (isDelivered) {
        receiptHtml = `<span class="receipt-icon receipt-delivered" title="Delivered"><i class="fa-solid fa-check-double"></i></span>`;
      } else {
        receiptHtml = `<span class="receipt-icon receipt-sent" title="Sent"><i class="fa-solid fa-check"></i></span>`;
      }
    }

    const editedHtml = msg.edited ? `<span class="edited-tag">(edited)</span>` : '';

    msgBlock.innerHTML = `
      ${!isMe ? `
        <div class="bubble-sender-row">
          <span style="font-size:14px">${msg.avatar || '👤'}</span>
          <span class="bubble-sender-name ${senderColor}">${msg.username}</span>
        </div>
      ` : ''}
      
      <div style="position:relative;width:100%;display:flex;${isMe ? 'justify-content:flex-end' : 'justify-content:flex-start'};align-items:center">
        <div class="reply-indicator">
          <i class="fa-solid fa-reply"></i>
        </div>
        
        <div class="swipeable-message msg-bubble ${isMe ? 'bubble-mine' : 'bubble-theirs'} message-bubble-wrapper">
          ${replyHtml}
          <p class="bubble-text">${escapeHTML(msg.text)}</p>
          <div class="bubble-meta">
            <span class="bubble-time">${formattedTime}</span>
            ${editedHtml}
            ${receiptHtml}
          </div>
        </div>
      </div>
      
      <div class="message-actions-trigger">
        <div class="actions-row">
          <button type="button" class="btn-reply message-action-btn" title="Reply">
            <i class="fa-solid fa-reply"></i> Reply
          </button>
          <button type="button" class="btn-copy message-action-btn" title="Copy">
            <i class="fa-solid fa-copy"></i> Copy
          </button>
          ${isMe ? `
            <button type="button" class="btn-edit message-action-btn" title="Edit">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button type="button" class="btn-delete message-action-btn" title="Delete" style="color:var(--rose)">
              <i class="fa-solid fa-trash"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    if (msg.replyToId) {
      const quoteEl = msgBlock.querySelector('.reply-quote');
      if (quoteEl) {
        quoteEl.addEventListener('click', () => {
          window.scrollToMessage(msg.replyToId);
        });
      }
    }

    const btnReply = msgBlock.querySelector('.btn-reply');
    if (btnReply) {
      btnReply.addEventListener('click', () => {
        setReplyTarget(msg.id, msg.username, msg.text);
      });
    }

    const btnCopy = msgBlock.querySelector('.btn-copy');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        window.copyToClipboard(msg.text);
      });
    }

    if (isMe) {
      const btnEdit = msgBlock.querySelector('.btn-edit');
      if (btnEdit) {
        btnEdit.addEventListener('click', () => {
          startEdit(msg.id, msg.text);
        });
      }

      const btnDelete = msgBlock.querySelector('.btn-delete');
      if (btnDelete) {
        btnDelete.addEventListener('click', () => {
          window.deleteMessage(msg.id);
        });
      }
    }

    const swipeableEl = msgBlock.querySelector('.swipeable-message');
    const indicatorEl = msgBlock.querySelector('.reply-indicator');
    if (swipeableEl && indicatorEl) {
      setupSwipeGesture(swipeableEl, indicatorEl, msg, msgBlock);
    }

    messagesList.appendChild(msgBlock);
  });

  if (wasAtBottom) {
    requestAnimationFrame(() => {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth"
      });
    });
  }
}

// HTML Escaping Utility
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Clipboard Copy Utility (Room Code)
function handleCopyRoomCode() {
  if (!currentRoom) return;
  const dummyInput = document.createElement('input');
  dummyInput.value = currentRoom;
  document.body.appendChild(dummyInput);
  dummyInput.select();
  try {
    document.execCommand('copy');
    showToast(`Copied room code: ${currentRoom}`, "success");
  } catch (err) {
    showToast("Copy command failed.", "error");
  }
  document.body.removeChild(dummyInput);
}

headerCodeDisplay.addEventListener('click', handleCopyRoomCode);

// Leave Chat View Action
async function leaveCurrentRoom() {
  if (messageUnsubscribe) {
    messageUnsubscribe();
    messageUnsubscribe = null;
  }
  if (activeUsersUnsubscribe) {
    activeUsersUnsubscribe();
    activeUsersUnsubscribe = null;
  }
  if (typingStatusUnsubscribe) {
    typingStatusUnsubscribe();
    typingStatusUnsubscribe = null;
  }
  
  await setMyTypingState(false);
  await stopPresenceTracking(currentRoom);

  currentRoom = null;
  updateURLState(null);
  showView('landing');
}

leaveChatBtn.addEventListener('click', leaveCurrentRoom);

// Sidebar Mobile Drawer Event Observers
toggleParticipantsBtn.addEventListener('click', () => {
  participantsSidebar.classList.add('mobile-open');
});

closeParticipantsBtn.addEventListener('click', () => {
  participantsSidebar.classList.remove('mobile-open');
});

// Detect back or refresh events
window.addEventListener('popstate', () => {
  const targetRoom = getRoomFromHash();
  if (!targetRoom && currentRoom) {
    leaveCurrentRoom();
  } else if (targetRoom && targetRoom !== currentRoom) {
    joinRoom(targetRoom);
  }
});

// Master Authenticator & Setup Logic
async function initializeSecurity() {
  buildAvatarList();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      
      const hashRoom = getRoomFromHash();
      
      if (myUsername === "Ghost") {
        showView('username');
      } else if (hashRoom) {
        joinRoom(hashRoom);
      } else {
        showView('landing');
      }
    }
  });

  try {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }
  } catch (authError) {
    console.error("Authentication setup failed: ", authError);
    showToast("Authentication sequence interrupted. Retry loading.", "error");
  }
}

window.addEventListener('DOMContentLoaded', initializeSecurity);
