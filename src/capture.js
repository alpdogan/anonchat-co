// shamelessely taken from mozilla-cdn webRTC tutorials

// The width and height of the captured photo. We will set the
// width to the value defined here, but the height will be
// calculated based on the aspect ratio of the input stream.

var width = 320; // We will scale the photo width to this
var height = 0; // This will be computed based on the input stream

// |streaming| indicates whether or not we're currently streaming
// video from the camera. Obviously, we start at false.

var streaming = false;

// The various HTML elements we need to configure or control. These
// will be set by the startup() function.

var video = null;
var canvas = null;
var photo = null;
var startbutton = null;
var mediaStream;

function startup() {
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  photo = document.getElementById("photo");
  startbutton = document.getElementById("startbutton");
  var constraints = {
    video: {
      deviceId: "deviceId",
    },
    audio: false,
  };
  // Updates the select element with the provided set of cameras
  function updateCameraList(cameras) {
    const listElement = document.querySelector("select#availableCameras");
    listElement.innerHTML = "";
    cameras
      .map((camera) => {
        const cameraOption = document.createElement("option");
        cameraOption.label = camera.label;
        cameraOption.value = camera.deviceId;
        cameraOption.textContent = camera.label != "" ? camera.label : camera.deviceId;
        return cameraOption;
      })
      .forEach((cameraOption) => listElement.add(cameraOption));
    listElement.addEventListener("change", (e) => {
      stopStreaming();
      constraints.video.deviceId = e.target.value;
      startStreaming();
    });
  }

  // Fetch an array of devices of a certain type
  async function getConnectedDevices(type) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === type);
  }

  // Get the initial set of cameras connected
  getConnectedDevices("videoinput").then((videoCameras) => {
    updateCameraList(videoCameras);
  });

  // Listen for changes to media devices and update the list accordingly
  navigator.mediaDevices.addEventListener("devicechange", async () => {
    const newCameraList = await getConnectedDevices("videoinput");
    updateCameraList(newCameraList);
  });

  function startStreaming() {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        mediaStream = stream;
        video.srcObject = stream;
        video.play();
      })
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });
  }
  startStreaming();
  video.addEventListener(
    "canplay",
    function (ev) {
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
    function (ev) {
      takepicture();
      ev.preventDefault();
    },
    false
  );

  clearphoto();
}

// Fill the photo with an indication that none has been
// captured.

function clearphoto() {
  var context = canvas.getContext("2d");
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.width, canvas.height);

  var data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}

// Capture a photo by fetching the current contents of the video
// and drawing it into a canvas, then converting that to a PNG
// format data URL. By drawing it on an offscreen canvas and then
// drawing that to the screen, we can change its size and/or apply
// other changes before drawing it.

function takepicture() {
  var context = canvas.getContext("2d");
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    var data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  } else {
    clearphoto();
  }
}
function stopStreaming() {
  if (streaming) {
    mediaStream.getTracks().forEach((e) => {
      e.stop();
    });
  }
}
module.exports = { startup, stopStreaming };
