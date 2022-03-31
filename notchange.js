const offerBtn = document.getElementById("create-offer");
const asnwerBtn = document.getElementById("create-answer");
const sendbtn = document.getElementById("chatbutton");

textelement = document.getElementById("textoffer");
var getOffer;
var getanswer;
var finalAnswer;

var lc;
var rc;
var dc;
const signaling = new BroadcastChannel("webrtc");
signaling.onmessage = (e) => {
  switch (e.data.type) {
    case "offer":
      createanswer(e.data);
      break;
    case "answer":
      connect(e.data);
      break;
    case "candidate":
      handleCandidate(e.data);
      break;
    default:
      console.log("unhandled", e);
      break;
  }
};

async function getoffer() {
  offerBtn.disabled = true;
  lc = new RTCPeerConnection();
  dc = lc.createDataChannel("channel");
  dc.onmessage = (e) => {
    console.log("just got a message" + e.data);
  };
  dc.onopen = (e) => {
    console.log("Connection opened!");
  };
  lc.onicecandidate = (e) => {
    console.log("Created offer");
    console.log(lc.localDescription);
  };
  lc.createOffer()
    .then((offer) => {
      lc.setLocalDescription(offer);
      console.log(offer);
      signaling.postMessage({ type: "offer", sdp: offer.sdp });
    })
    .then((answer) => {
      console.log("set successfully");
    });
}

function createanswer(offer) {
  rc = new RTCPeerConnection();
  rc.onicecandidate = (e) => {
    console.log(JSON.stringify(rc.localDescription));
  };

  rc.ondatachannel = (e) => {
    console.log("here");
    console.log(e);
    rc.dc = e.channel;
    rc.dc.onmessage = (e) => {
      console.log("new message from client " + e.data);
    };
    rc.dc.onopen = (e) => {
      console.log("Connection OPENED!");
    };
  };
  rc.setRemoteDescription(offer).then((answer) => {
    console.log("offer set");
  });

  rc.createAnswer()
    .then((answer) => {
      console.log(answer);
      rc.setLocalDescription(answer);
      console.log(rc.setLocalDescription);
      signaling.postMessage({ type: "answer", sdp: answer.sdp });
    })
    .then((answer) => {
      console.log("answer created!");
    });
}

function connect(e) {
  const t = JSON.stringify(e);
  console.log(JSON.stringify({ type: "answer", sdp: e.sdp }));
  lc.setRemoteDescription({ type: "answer", sdp: e.sdp });
}
