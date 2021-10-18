const socket = io("/");

socket.emit("join-room", ROOM_ID, 10);

socket.on("user-connected", userId => {
  console.log("User connected: " + userId);
});

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun3.l.google.com:19302"]
    },
  ],
  iceCandidatePoolSize: 10,
}

const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

const videoGrid = document.getElementById("video-grid");
const localVideo = document.createElement("video");
localVideo.muted = true;


document.getElementById("startCall").onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  }

  addVideoStream(localVideo, localStream);

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);


}

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  })
  videoGrid.append(video);
}