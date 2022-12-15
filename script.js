// Simple Face Filter Using pretrained model 
// it's not perfect the size of mask not the same as face because i don't have time
// to do it so i make it as demo version.

//using p5.js library

let state = 'loading...', dom_state, image_source = 0, imgs = [],
  video, model, detector, enableWebcamButton, KeyPoints = [];

var filters = [
  'filters/dog.png',
  'filters/fox.png',
  'filters/kola.png',
  'filters/lion.png',
  'filters/rabbit.png',
  'filters/tiger.png',
]

async function load_model() {
  // load the pretrained model  
  model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: 'tfjs',
  };
  detector = await faceLandmarksDetection.createDetector(model, detectorConfig);

}

load_model();

function getInfo(element) {
  let images = document.getElementsByClassName('img');
  for (let i = 0; i < images.length; i++) {
    if (images[i].classList.contains('filter-content-active')) {
      images[i].classList.remove('filter-content-active');
    }
  }
  element.parentElement.classList.add('filter-content-active');

  image_source = element.id;
}

// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

let diameter = [];

function preload() {
  for (let i = 0; i < filters.length; i++) {
    imgs.push(loadImage(filters[i]));
  }
}

function setup() {
  createCanvas(600, 450);

  enableWebcamButton = select('#webcamButton');
  contentDiv = select('#content');
  dom_state = select('#state');

  // if the device support camera show the content     
  if (getUserMediaSupported) {
    contentDiv.removeClass('invisible');
  }


  enableWebcamButton.mousePressed(() => {
    // create Video Content with webcam    
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
    enableWebcamButton.attribute('disabled', '');
  });

}

let centerX = [], centerY = [];

function draw() {
  background(128, 200, 244);
  frameRate(10);

  if (model && detector) {
    dom_state.html('Model Loaded');
  }
  let min, avg, d_min, d_max, dist;

  if (video) {
    image(video, 0, 0);
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    predictWebcam();
    // get the center value of the lips to use mask
    // check if there is a value
    if (centerY.length > 0 && diameter.length > 0) {
      // find min y
      min = centerY.reduce((a, b) => { return Math.min(a, b) });

      // find average x
      avg = centerX.reduce((a, b) => a + b, 0) / centerX.length;

      // find the diameter by add the max and min
      d_min = diameter.reduce((a, b) => { return Math.min(a, b) });
      d_max = diameter.reduce((a, b) => { return Math.max(a, b) });

      // dist = Math.sqrt((d_min * d_min) + (d_max * d_max) );
      dist = d_max - d_min;
    }

    var WIDTH = dist, HEIGHT = dist;

    image(imgs[image_source], avg - WIDTH, min - HEIGHT - 50, WIDTH * 2, HEIGHT * 2);
    //clear the values
    diameter = [];
    centerY = [];
    centerX = [];
  }
}

function predictWebcam() {
  var vid = document.querySelector('video');

  detector.estimateFaces(vid).then(
    // make function to take the lips points
    function(pred) {
      if (pred.length > 0) {
        for (let i = 0; i < pred[0].keypoints.length; i++) {
          // check if there is labeled keypoint
          if (!!pred[0].keypoints[i].name) {
            // get keypoints of lips
            if (pred[0].keypoints[i].name == 'lips') {
              centerX.push(pred[0].keypoints[i].x);
              centerY.push(pred[0].keypoints[i].y);
            }
            if (pred[0].keypoints[i].name == 'faceOval') {
              diameter.push(pred[0].keypoints[i].x);
            }
          }
        }

      }
    }
  );
}

// Thank you for reviewing my project