const offerBtn = document.getElementById("create-offer");
const asnwerBtn = document.getElementById("create-answer");
const sendbtn = document.getElementById("chatbutton");

lctext = document.getElementById("lc-text");
rctext = document.getElementById("lc-text");
const txt = "";

var getOffer;
var getanswer;
var finalAnswer;

var lc;
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
    txt = e.data;
    lctext.value = txt;
  };
  dc.onopen = (e) => {
    console.log("Connection opened!");
  };
  lc.onicecandidate = (e) => {
    console.log("Created offer");
    console.log(lc.localDescription);
  };
  lc.createOffer()
    .then(async (offer) => {
      return lc.setLocalDescription(offer);
    })
    .then(function () {
      return new Promise(function (resolve) {
        if (lc.iceGatheringState === "complete") {
          resolve();
        } else {
          function checkState() {
            if (lc.iceGatheringState === "complete") {
              lc.removeEventListener("icegatheringstatechange", checkState);
              resolve();
            }
          }
          lc.addEventListener("icegatheringstatechange", checkState);
        }
      });
    })
    .then(function () {
      var offer = lc.localDescription;
      console.log(offer);
      signaling.postMessage({ type: "offer", sdp: offer.sdp });
    });
}

async function createanswer(offer) {
  lc = new RTCPeerConnection();
  lc.onicecandidate = (e) => {
    console.log("created offered");
  };

  lc.ondatachannel = (e) => {
    console.log("here");
    console.log(e);
    lc.dc = e.channel;
    lc.dc.onmessage = (e) => {
      console.log("new message from client " + e.data);
    };
    lc.dc.onopen = (e) => {
      console.log("Connection OPENED!");
    };
  };
  lc.setRemoteDescription(offer).then((answer) => {
    console.log("offer set");
  });

  await lc
    .createAnswer()
    .then(async (answer) => {
      console.log(answer);
      await lc.setLocalDescription(answer);
      console.log(lc.setLocalDescription);
      signaling.postMessage({ type: "answer", sdp: answer.sdp });
    })
    .then((answer) => {
      console.log("answer created!");
    });
}

async function connect(e) {
  await lc.setRemoteDescription({ type: "answer", sdp: e.sdp });
}
