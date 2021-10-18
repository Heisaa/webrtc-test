const socket = io("/");



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

let userId = "";
document.getElementById("userId").addEventListener("input", (event) => {
  userId = event.target.value;
  console.log(event.target.value)
});

pc.onicecandidate = event => {
  socket.emit("ice-candidate", event.candidate, ROOM_ID);
}

socket.on("remote-answer", async (answer) => {
  await pc.setRemoteDescription(answer);
  console.log(answer)
  const remoteVideo = document.createElement("video");
  addVideoStream(remoteVideo, remoteStream)
});

socket.on("receive-candidates", async (candidates) => {
  pc.addIceCandidate(candidates)
})


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

  socket.on("user-connected", async (userId, offer) => {
    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    pc.setLocalDescription(answer);

    const remoteVideo = document.createElement("video");
    addVideoStream(remoteVideo, remoteStream)
    socket.emit("answer", answer, ROOM_ID);
  });



  socket.emit("join-room", ROOM_ID, userId, offerDescription);


}

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  })
  videoGrid.append(video);
}