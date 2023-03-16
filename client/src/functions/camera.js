const NodeWebcam = require("node-webcam");

var opts = {
  //Picture related

  width: 1280,

  height: 720,

  quality: 100,

  // Number of frames to capture
  // More the frames, longer it takes to capture
  // Use higher framerate for quality. Ex: 60

  frames: 60,

  //Delay in seconds to take shot
  //if the platform supports miliseconds
  //use a float (0.1)
  //Currently only on windows
  delay: 0,

  //Save shots in memory
  saveShots: true,

  // [jpeg, png] support varies
  // Webcam.OutputTypes

  output: "jpeg",

  //Which camera to use
  //Use Webcam.list() for results
  //false for default device

  device: false,

  // [location, buffer, base64]
  // Webcam.CallbackReturnTypes

  callbackReturn: "base64",

  //Logging

  verbose: true,
};

const Webcam = NodeWebcam.create(opts);

// captures the image from the camera
// and saves it to the client?
export function startCamera(event, arg) {
  // Will automatically append location output type
  Webcam.capture("test_picture", function (err, data) {});
}

// sends the image to the renderer
export function getVideoFeed(event, mainWindow) {
  // send data via mainWindow.webContents.send('channel', data)
  // data is image that is serialized in base64
  //Return type with base 64 image
  Webcam.capture("test_picture", function (err, data) {
    mainWindow.webContents.send("getVideoFeed", data);
  });
}
