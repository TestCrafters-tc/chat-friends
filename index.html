<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>WhisperWire - Secure Multi-User Chat</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght=300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <!-- FontAwesome for Icons -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />

    <link rel="stylesheet" href="style.css" />
    <link rel="manifest" href="manifest.json" />
  </head>
  <body
    class="min-h-dynamic-screen flex items-center justify-center p-0 md:p-6"
  >
    <!-- Main Application Box -->
    <div
      class="w-full max-w-[1600px] h-dynamic-screen md:h-[92vh] md:max-h-[800px] md:rounded-2xl glass-panel shadow-2xl flex flex-col overflow-hidden relative"
    >
      <!-- Toast Notification Overlay -->
      <div
        id="toast"
        class="absolute top-4 left-1/2 -translate-x-1/2 z-50 glass-panel border border-indigo-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transform -translate-y-20 opacity-0 transition-all duration-300 pointer-events-none"
      >
        <span id="toastIcon" class="text-indigo-400"
          ><i class="fa-solid fa-circle-info"></i
        ></span>
        <span id="toastText" class="text-sm font-medium"
          >Notification message</span
        >
      </div>

      <!-- VIEW 1: Username & Profile Selection -->
      <div
        id="usernameView"
        class="flex-1 flex flex-col justify-center items-center px-6 py-12 max-w-md mx-auto w-full transition-all duration-300"
      >
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4 text-indigo-400 text-3xl"
          >
            <i class="fa-solid fa-user-astronaut"></i>
          </div>
          <h1
            class="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent"
          >
            Identity Setup
          </h1>
          <p class="text-slate-400 text-sm mt-2">
            Choose your persona before joining the secure feed.
          </p>
        </div>

        <div class="w-full space-y-6">
          <div>
            <label
              class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
              >Selected Avatar</label
            >
            <div class="grid grid-cols-6 gap-2 mb-4" id="avatarSelector">
              <!-- Dynamically populated avatar list -->
            </div>
          </div>

          <div>
            <label
              for="usernameInput"
              class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
              >Display Name</label
            >
            <input
              type="text"
              id="usernameInput"
              placeholder="Enter custom username..."
              maxlength="20"
              class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-center font-medium"
            />
          </div>

          <button
            id="saveUsernameBtn"
            class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <span>Continue to Hub</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- VIEW 2: Landing Room Hub (Create or Join) -->
      <div
        id="landingView"
        class="hidden flex-1 flex-col justify-center items-center px-6 py-12 max-w-md mx-auto w-full transition-all duration-300"
      >
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-2 mb-4">
            <div
              id="currentUserPill"
              class="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 px-4 py-1.5 rounded-full text-xs font-medium text-indigo-300 cursor-pointer hover:bg-slate-800 transition-all"
            >
              <span id="userAvatarSpan">🛸</span>
              <span id="userNameSpan">Anonymous</span>
              <i class="fa-solid fa-pen text-[10px] opacity-75"></i>
            </div>
            <button
              id="pwaInstallBtn"
              type="button"
              class="inline-flex items-center gap-1.5 bg-indigo-600/20 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-all"
            >
              <i class="fa-solid fa-download"></i>
              <span>Install App</span>
            </button>
          </div>
          <h1
            class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent"
          >
            WhisperWire
          </h1>
          <p class="text-slate-400 text-sm mt-2">
            Ultra-secure, ephemeral rooms with multi-user sharing capabilities.
          </p>
        </div>

        <!-- Main Actions -->
        <div class="w-full space-y-6">
          <!-- Create Chat Room Box -->
          <div
            class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
          >
            <h2
              class="font-semibold text-sm text-slate-300 flex items-center gap-2"
            >
              <i class="fa-solid fa-plus-circle text-indigo-400"></i> Start a
              New Chat Room
            </h2>
            <div>
              <input
                type="text"
                id="roomNameInput"
                placeholder="Room Name (e.g., Marketing Sync)"
                maxlength="25"
                class="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div class="flex flex-col gap-1.5 text-left">
              <label for="roomDurationSelect" class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Room Lifespan</label>
              <select id="roomDurationSelect" class="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all">
                <option value="1">1 Hour</option>
                <option value="3">3 Hours</option>
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24" selected>24 Hours</option>
              </select>
            </div>
            <button
              id="createRoomBtn"
              class="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Generate Secure Room</span>
              <i class="fa-solid fa-shield-halved text-indigo-400"></i>
            </button>
          </div>

          <!-- Join Room Form -->
          <form
            id="joinRoomForm"
            class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
          >
            <h2
              class="font-semibold text-sm text-slate-300 flex items-center gap-2"
            >
              <i class="fa-solid fa-door-open text-indigo-400"></i> Join
              Existing Room
            </h2>
            <div class="flex gap-2">
              <input
                type="text"
                id="joinCodeInput"
                placeholder="Enter Room Code (e.g., W-7634)"
                uppercase
                maxlength="12"
                required
                class="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all tracking-wider font-semibold text-center text-sm"
              />
              <button
                type="submit"
                class="bg-indigo-600 hover:bg-indigo-500 px-5 rounded-xl transition-all flex items-center justify-center"
              >
                <i class="fa-solid fa-arrow-right-to-bracket text-white"></i>
              </button>
            </div>
          </form>

          <!-- Room History Box -->
          <div id="roomHistoryBox" class="hidden p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 class="font-semibold text-sm text-slate-300 flex items-center gap-2">
              <i class="fa-solid fa-clock-rotate-left text-indigo-400"></i> Room History
            </h2>
            <div id="roomHistoryList" class="space-y-2 max-h-[160px] overflow-y-auto">
              <!-- Populated dynamically -->
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW 3: Immersive Chat Feed (Multi-User View) -->
      <div id="chatView" class="hidden flex-1 flex flex-col md:flex-row h-full">
        <!-- Primary Chat Segment -->
        <div
          class="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-800/50"
        >
          <!-- Chat Header -->
          <header
            class="h-16 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/40 relative z-10"
          >
            <div class="flex items-center gap-3">
              <button
                id="leaveChatBtn"
                class="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
              >
                <i class="fa-solid fa-arrow-left"></i>
              </button>
              <div class="leading-none">
                <h3
                  id="headerRoomTitle"
                  class="font-bold text-white text-base truncate max-w-[150px] sm:max-w-[240px]"
                >
                  Secure Feed
                </h3>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span
                    class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                  ></span>
                  <span
                    id="activeUserCount"
                    class="text-[11px] text-slate-400 font-medium"
                    >1 Online</span
                  >
                </div>
              </div>
            </div>

            <!-- Room Credentials Copy Panel -->
            <div class="flex items-center gap-2">
              <button
                id="headerCodeDisplay"
                class="px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800 text-indigo-300 font-mono text-xs font-bold hover:border-indigo-500/40 transition-all flex items-center gap-1.5"
              >
                <span id="headerCodeText">ROOM_CODE</span>
                <i class="fa-solid fa-copy text-[10px] opacity-70"></i>
              </button>
              <button
                id="toggleParticipantsBtn"
                class="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all md:hidden relative"
              >
                <i class="fa-solid fa-users"></i>
                <span
                  id="mobileBadge"
                  class="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full hidden"
                ></span>
              </button>
            </div>
          </header>

          <!-- Message List Context Area -->
          <div
            id="messageContainer"
            class="flex-1 p-4 overflow-y-auto smooth-scroll"
          >
            <!-- Welcome Guidelines card -->
            <div
              class="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 max-w-md mx-auto text-center my-6 space-y-3"
            >
              <span
                class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 mb-1"
              >
                <i class="fa-solid fa-shield-halved"></i>
              </span>
              <h4 class="font-semibold text-slate-200">
                Ephemeral Room Opened
              </h4>
              <p class="text-xs text-slate-400 leading-relaxed">
                WhisperWire works on transient channels. Messages are synced
                instantly across active users. Make sure you copy and share the
                Room Code with friends so they can join!
              </p>
            </div>

            <!-- Populated Messages Container -->
            <div id="messagesList" class="space-y-4 w-full pb-4"></div>
          </div>

          <!-- System Alerts / Status Indicators -->
          <div
            class="px-4 py-1.5 bg-slate-900/20 border-t border-slate-800/30 flex items-center justify-between text-xs text-slate-500"
          >
            <!-- Dynamic Multi-User Typing status -->
            <span
              id="typingIndicator"
              class="italic flex items-center gap-1.5"
            ></span>
            <span class="hidden md:inline font-medium"
              >Secured with SSL via Firestore</span
            >
          </div>

          <!-- Input Delivery Form -->
          <form id="messageForm" class="message-input-container p-4">
            <!-- Reply Preview Box (hidden by default) -->
            <div
              id="replyPreviewContainer"
              class="hidden reply-preview-container flex items-center justify-between"
            >
              <div class="flex-1 min-w-0 pr-4">
                <div
                  class="text-xs font-bold text-indigo-400"
                  id="replyPreviewUser"
                >
                  Replying to username
                </div>
                <div class="reply-preview-snippet" id="replyPreviewText">
                  Message content snippet...
                </div>
              </div>
              <button
                type="button"
                id="cancelReplyBtn"
                class="text-slate-400 hover:text-white shrink-0"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="flex gap-2 items-end">
              <textarea
                id="messageInput"
                placeholder="Secure a thought to the wire..."
                required
                autocomplete="off"
                rows="1"
                class="flex-1 px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-sm multiline-input"
              ></textarea>
              <button
                type="submit"
                class="bg-indigo-600 hover:bg-indigo-500 text-white w-12 h-[46px] rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-600/10 shrink-0"
              >
                <i class="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>
          </form>
        </div>

        <!-- Sidebar Segment: Active Users Panel -->
        <aside
          id="participantsSidebar"
          class="hidden md:flex w-full md:w-72 lg:w-80 bg-slate-950/40 flex-col h-full border-l border-slate-800/50 absolute md:static inset-0 z-20 md:z-auto transition-transform duration-300"
        >
          <!-- Sidebar Header (Mobile-friendly toggle support) -->
          <div
            class="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/20"
          >
            <span
              class="text-sm font-semibold tracking-wider uppercase text-slate-400"
              >ACTIVE USERS</span
            >
            <button
              id="closeParticipantsBtn"
              class="p-1 text-slate-400 hover:text-white md:hidden"
            >
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Live List of Active Senders -->
          <div
            id="participantsList"
            class="flex-1 overflow-y-auto p-4 space-y-3"
          >
            <!-- Populated active personas -->
          </div>

          <!-- Current User Self Card in Sidebar -->
          <div
            class="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center gap-3"
          >
            <div
              id="selfAvatar"
              class="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-lg shadow-inner"
            >
              👾
            </div>
            <div class="leading-none overflow-hidden">
              <p
                id="selfName"
                class="text-xs font-semibold text-slate-200 truncate"
              >
                You
              </p>
              <span class="text-[10px] text-emerald-400 font-medium"
                >Connected</span
              >
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Main JavaScript modules -->
    <script type="module" src="script.js"></script>
  </body>
</html>
