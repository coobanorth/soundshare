import { upload_audio } from "./chats.js";

// Change this in audiorecord.js
export function init_audio_recorder(current_user, current_room) {
  const messageBox = document.getElementById("message_box");
  const btn = document.getElementById("rec_audio_toggle");

  // Run the logic immediately instead of adding a listener
  messageBox.insertAdjacentHTML("beforeend", `
    <section class="main-controls">
        <canvas class="visualizer" height="60px"></canvas>
        <div id="buttons">
            <button class="record">Record</button>
            <button class="stop">Stop</button>
        </div>
    </section>
    <section class="sound-clips"></section>
  `);

  btn.disabled = true;
  record_audio(current_user, current_room);
}

function record_audio(current_user, current_room) {
  const record = document.querySelector(".record");
  const stop = document.querySelector(".stop");
  const soundClips = document.querySelector(".sound-clips");
  const canvas = document.querySelector(".visualizer");
  const mainSection = document.querySelector(".main-controls");


  // Disable stop button while not recording
  stop.disabled = true;

  // Visualiser setup 
  let audioCtx;
  const canvasCtx = canvas.getContext("2d");

  if (navigator.mediaDevices.getUserMedia) {
    console.log("The mediaDevices.getUserMedia() method is supported.");

    const constraints = { audio: true };
    let chunks = [];

    let onSuccess = function (stream) {
      const mediaRecorder = new MediaRecorder(stream);

      visualize(stream);

      record.onclick = function () {
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log("Recorder started.");
        record.style.background = "red";

        stop.disabled = false;
        record.disabled = true;
      };

      stop.onclick = function () {
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log("Recorder stopped.");
        record.style.background = "";
        record.style.color = "";

        stop.disabled = true;
        record.disabled = false;
      };

      mediaRecorder.onstop = function () {

        const clipContainer = document.createElement("article");
        const audio = document.createElement("audio");
        const send = document.createElement("button");

        clipContainer.classList.add("clip");

        audio.setAttribute("controls", "");
        send.textContent = "SEND";

        clipContainer.appendChild(audio);
        clipContainer.appendChild(send);
        soundClips.appendChild(clipContainer);

        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;

        chunks = [];

        send.onclick = function () {

          upload_audio(blob, current_user, current_room);

          console.log("clip sent");

          document.querySelector(".main-controls")?.remove();
          document.querySelector(".sound-clips")?.remove();
          document.getElementById("rec_audio_toggle").disabled = false;
        };
      };

    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    };
  };

  let onError = function (err) {
    console.log("The following error occured: " + err);
  };

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} else {
  console.log("MediaDevices.getUserMedia() not supported on your browser!");
}

function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const bufferLength = 2048;
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = bufferLength;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);

  draw();

  function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}

window.onresize = function () {
  canvas.width = mainSection.offsetWidth;
};

window.onresize();
}