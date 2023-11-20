var sBtn = document.querySelector("#share-button");
var wBtn = document.querySelector("#watch-button");
let localVideo = document.querySelector("#localVideo");

sBtn.onclick = () => {
  init();
};
wBtn.onclick = () => {
  location.href = "/viewer";
};

//
// window.onload = () => {
//   checkStreamStatus()
//   if (1) {
//     location.href = "/viewer";
//   }
// };
//
async function init() {
  const stream = await navigator.mediaDevices
    .getDisplayMedia({
      video: {
        width: {
          max: 1920,
          // max: 1280,
        },
        height: {
          max: 1080,
          // max: 720,
        },
        frameRate: { max: 30 },
        cursor: "always",
        displaySurface: "monitor",
      },
      // audio: true,
    })
    .catch((e) => {
      window.location.href = "/";
    });
  localVideo.srcObject = stream;
  const peer = createPeer();
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));

  localVideo.setAttribute("controls", "");
  wBtn.classList.add("d-none");
  sBtn.classList.add("d-none");
}

function createPeer() {
  const peer = new RTCPeerConnection();
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
    sdp: peer.localDescription,
  };
  const { data } = await axios.post("/broadcast", payload);
  ipAddress = data.sdp.sdp.split("c=IN")[1].split("a=rtcp")[0].split("IP4 ")[1];
  document.getElementById("ipInput").classList.remove("d-none");
  copyIp = `https://${ipAddress}`;
  document.getElementById("ipInput").value = copyIp;
  // navigator.clipboard.writeText(copyIp.value);

  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch((e) => console.log(e));
}

async function checkStreamStatus() {
  const data1 = await axios.post("/streamStatus", "");
  console.log(data1);
}
