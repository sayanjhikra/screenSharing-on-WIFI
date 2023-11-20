const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const webrtc = require("wrtc");

let senderStream;

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const fs = require("fs");
const options = {
  key: fs.readFileSync("./server/ssl/key.pem", "utf-8"),
  cert: fs.readFileSync("./server/ssl/cert.pem", "utf-8"),
};
const server = require("https").Server(options, app);
server.listen(443, () => {
  console.log(`https://127.0.0.1`);
});

app.set(`view engine`, `ejs`);
app.use(express.static(`public`));

app.get("/", (req, res) => {
  res.render("index", {});
});
app.get("/viewer", (req, res) => {
  res.render("viewer", {});
});

// app.post("/streamStatus", async ({ body }, res) => {
//   res.send("status check req");
// });

app.post("/consumer", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection();
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);
  if (senderStream != undefined) {
    senderStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, senderStream));
  }
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = {
    sdp: peer.localDescription,
  };

  res.json(payload);
});

app.post("/broadcast", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection();
  peer.ontrack = (e) => handleTrackEvent(e, peer);
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = {
    sdp: peer.localDescription,
  };

  res.json(payload);
});

function handleTrackEvent(e, peer) {
  senderStream = e.streams[0];
}
