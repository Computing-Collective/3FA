import * as React from "react";

export function Stream() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos#demo
  const width = 320; // We will scale the photo width to this
  const height = 0; // This will be computed based on the input stream
  let streaming = false; // This will be set to true when the video stream is started

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  let video = document.getElementById("video");
  let canvas = document.getElementById("canvas");
  let photo = document.getElementById("photo");
  let startbutton = document.getElementById("startbutton");

  // constraints for the video stream
  const constraints = {
    audio: false,
    video: true,
  };
  // the state for the video
  const [mediaStream, setMediaStream] = React.useState(null);
  // on first load of page, get user media
  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (mediaStream) {
        // video.srcObject = mediaStream;
        // video.play();

        setMediaStream(mediaStream);

        // video.srcObject = mediaStream;
        // video.onloadedmetadata = function (e) {
        //   video.play();
        // };
      })
      .catch(function (err) {
        console.log(err.name + ": " + err.message);
      });
  }, []);

  video.addEventListener(
    "canplay",
    (ev) => {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        video.setAttribute("width", width);
        video.setAttribute("height", height);
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        streaming = true;
      }
    },
    false
  );

  startbutton.addEventListener(
    "click",
    (ev) => {
      takepicture();
      ev.preventDefault();
    },
    false
  );

  // on first load of page clear photo
  React.useEffect(() => clearphoto(), []);

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.
  const captureVideo = () => {
    const context = canvas.getContext("2d");
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
    } else {
      clearphoto();
    }
  };
  return (
    <>
      <video autoPlay muted id="videoElement" src={mediaStream}>
        Video stream not available.
      </video>
      <button id="startbutton" onClick={captureVideo}>
        Take photo
      </button>
      <canvas id="canvas" />
      <div class="output">
        <img id="photo" alt="The screen capture will appear in this box." />
      </div>
    </>
  );
}
