const socket = io();
let peerConnection;
let roomId;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }; // Basic STUN for NAT traversal

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const createBtn = document.getElementById('createSession');
const startShareBtn = document.getElementById('startShare');
const joinKeyInput = document.getElementById('joinKey');
const joinBtn = document.getElementById('joinSession');
const sessionKeyP = document.getElementById('sessionKey');

// Create a random key (room ID)
function generateKey() {
  return Math.random().toString(36).substring(2, 10);
}

// Host: Create session
createBtn.onclick = () => {
  roomId = generateKey();
  sessionKeyP.textContent = `Session Key: ${roomId}`;
  socket.emit('join-room', roomId);
  startShareBtn.disabled = false;
};

// Host: Start sharing screen
startShareBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    localVideo.srcObject = stream;

    peerConnection = new RTCPeerConnection(config);
    setupPeerConnection();

    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', { offer, roomId });
  } catch (err) {
    console.error('Error sharing screen:', err);
  }
};

// Viewer: Join session
joinBtn.onclick = () => {
  roomId = joinKeyInput.value.trim();
  if (!roomId) return alert('Enter a key');
  socket.emit('join-room', roomId);
  initViewer();
};

// Viewer init
async function initViewer() {
  peerConnection = new RTCPeerConnection(config);
  setupPeerConnection();
}

// Common peer setup
function setupPeerConnection() {
  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', { candidate: event.candidate, roomId });
    }
  };

  socket.on('offer', async (data) => {
    if (!peerConnection.remoteDescription) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answer', { answer, roomId });
    }
  });

  socket.on('answer', async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  });

  socket.on('ice-candidate', async (data) => {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  });
}
