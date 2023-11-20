let remoteVideo = document.querySelector("#remoteVideo");
window.onload = () => {
  init();
};
let isReload =
  window.performance.getEntriesByType("navigation")[0].type == "reload";
if (isReload) {
  location.href = "/";
}

async function init() {
  const peer = createPeer();
  peer.addTransceiver("video", { direction: "recvonly" });
  // peer.addTransceiver("audio", { direction: "recvonly" });
}

function createPeer() {
  const peer = new RTCPeerConnection();
  peer.ontrack = handleTrackEvent;
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
    sdp: peer.localDescription,
  };

  const { data } = await axios.post("/consumer", payload);
  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch((e) => console.log(e));
}

function handleTrackEvent(e) {
  remoteVideo.setAttribute("controls", "");
  remoteVideo.srcObject = e.streams[0];
}
