const offerBtn = document.getElementById("create-offer");

function getoffer() {
  const lc = new RTCPeerConnection();
  const dc = lc.createDataChannel("channel");

  dc.onmessage = (e) => {
    console.log("Just a message " + e.data);
  };

  dc.onopen = (e) => {
    console.log("Connection opened!");
  };

  lc.onicecandidate = (e) => {
    console.log(
      "New Ice Cendidate! reprinting SDP" + JSON.stringify(lc.localDescription)
    );
  };

  lc.createOffer()
    .then((offer) => {
      lc.setLocalDescription(offer);
    })
    .then((answer) => {
      console.log("set successfully");
    });
}

function getanswer() {
  console.log(getoffer());
}
