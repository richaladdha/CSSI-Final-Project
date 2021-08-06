// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    HSB, background, color, colorMode, createCanvas, ellipse, fill, height, line, mouseIsPressed,
 *    mouseX, mouseY, rect, stroke, strokeWeight, width, io, ml5, text, textSize, textAlign, CENTER, noStroke, createCapture, VIDEO, image, createButton, noFill, createDiv,
      cursor, HAND, loadImage, second, key, circle, dist
 */

let brushHue, globalWeight, globalS, globalB, shouldDraw, priorX, priorY;
let socket;
let classifier1;
let score;
let prev_label;
let prev_score;
let start;
let end;

let circles;
var d = 40;

let clearCanvasButton;

// let imageModelURL = "https://teachablemachine.withgoogle.com/models/RDDm8jXTg/";
let classifier;
let video, flippedVideo;
let confidence;
let label = "NA";
let label1 = "";
// let img;

let scoreModel, colorModel;

let soundModel = "https://teachablemachine.withgoogle.com/models/b1KwnOVrm/";

class TeachableMachine {
  constructor(modelID, classifierFn) {
    this.modelURL = "https://teachablemachine.withgoogle.com/models/" + modelID;
    this.classifier = classifierFn(this.modelURL + "/" + "model.json");
    this.label = "";
  }

  gotResult(error, results, callback) {
    if (error) {
      console.error(error);
      return;
    }
    if (this.label != results[0].label) {
      // different behavior
      console.log(results);
      callback(this);
    }
    this.label = results[0].label;
  }
}

function preload() {
  // Load the model
  // classifier = ml5.imageClassifier(imageModelURL + "model.json");
  classifier1 = ml5.soundClassifier(soundModel + "model.json");
  // img = loadImage("https://cdn.glitch.com/9e45f1d6-e82c-4d06-9b1e-dfb3a690ee6d%2Fone-stroke-v2.jpeg?v=1628023541862")
  // scoreModel = new TeachableMachine("RDDm8jXTg", ml5.imageClassifier);
  // colorModel = new TeachableMachine("b1KwnOVrm", ml5.soundClassifier);
  scoreModel = new TeachableMachine("RDDm8jXTg", ml5.imageClassifier);
  colorModel = new TeachableMachine("b1KwnOVrm", ml5.soundClassifier);
}

function setup() {
  // Canvas & color settings
  createCanvas(1000, 800);
  colorMode(HSB, 360, 100, 100);

  prev_label = "NA";
  score = 0;
  shouldDraw = false;
  
  // Initialize brushHue to 0 (which is declared at the top)
  brushHue = 175;
  globalS = 85;
  globalB = 85;

  globalWeight = 8;
  priorX = 0;
  priorY = 0;

  // Draw the background to clear the screen at the beginning of the frame
  background(95);

  clearCanvasButton = createButton("Clear Whole Canvas");
  clearCanvasButton.position(850, 50);
  clearCanvasButton.mousePressed(eraseCanvas);

  socket = io.connect("https://the-painter-app.glitch.me");
  socket.on("draw", handleDrawEvent);
  socket.on("score", handleScoreEvent);

  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  flippedVideo = ml5.flipImage(video);
  console.log("HERE1");

  classifyImage(); // Start classifying

  // colorModel.classifier.classify(colorModel.gotResult);
  classifier1.classify(gotResult1);
  console.log("HERE2");

  circles = [];

  circles.push (
    new ColorCircle(width / 22, height / 2.6, 40, 0, globalS, globalB)
    );
   
  circles.push (
    new ColorCircle(width / 22, height / 2.28, 40, 30, globalS, globalB)
    );
  
  circles.push (
    new ColorCircle(width / 22, height / 2.03, 40, 60, globalS, globalB)
    );
    
  circles.push (
    new ColorCircle(width / 22, height / 1.83, 40, 90, globalS, globalB)
    );
  
  circles.push (
    new ColorCircle(width / 22, height / 1.66, 40, 120, globalS, globalB)
    );
  
  circles.push (
    new ColorCircle(width / 11, height / 1.66, 40, 180, globalS, globalB)
    );
  
  circles.push (
    new ColorCircle(width / 11, height / 1.83, 40, 210, globalS, globalB)
    );
  
  circles.push (
    new ColorCircle(width / 11, height / 2.03, 40, 240, globalS, globalB)
    );
  
  circles.push (
    new ColorCircle(width / 11, height / 2.28, 40, 270, globalS, globalB)
    );
  circles.push (
    new ColorCircle(width / 11, height / 2.6, 40, 300, globalS, globalB)
    );
 
}

function handleDrawEvent(data) {
  drawLine(data.priorX, data.priorY, data.x, data.y, data.hue);
}

function handleScoreEvent(data) {
  score = data.score;
  displayScore(score);
}

function draw() {
  image(flippedVideo, 0, 0);
  
  noStroke();
  fill(95);
  rect(20, 245, 100, 240);

  noStroke();
  textSize(30);
  fill(0);
  text("Colors:", width / 45, height / 2.85);

  noStroke();
  textSize(20);

  if(mouseIsPressed && mouseX < width / 10 + d / 2) {
    // check if user is clicking on a color palette
    var a;
    for(var i = 0; i < circles.length; i++) {
      a = dist(circles[i].xPos,circles[i].yPos, mouseX, mouseY);
      if (a < d / 2){
        brushHue = circles[i].hue; 
      }
    }
   }
  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];
    circle.display();
  }

  // fill(0, globalS, globalB);
  // rect(width/25, height/2.75, 50, 20)
  // fill(0, 0, 0);
  // text("Red", width / 22, height / 2.6);
  // text("Blue", width / 23, height / 2.42);
  // text("Green", width / 27, height / 2.27);
  // text("Pink", width / 22, height / 2.125);
  // text("Orange", width / 30, height / 2);
  // text("Yellow", width / 27, height / 1.88);

  fill(10, 50, 30);
  // text("Eraser", width / 28, height / 1.68);
  
  fill(95);
  rect(width / 53, height/1.57, 90, 30);
  fill(0);
  textSize(25);
  text("Guess?____________________", width / 50, height / 1.5);
  text("____________________", width / 9.4, height / 1.35);
  text("____________________", width / 9.4, height / 1.22);
  
  fill(95);
  rect(width/3, height/14, 500, 60);
  
  fill(0);
  textSize(12);
  text("Instructions: Player 1: Choose a color using your voice and start to draw!", width/3, height/11)
  text("If Player 2 guesses correctly, raise your thumb to increase the score", width/2.21, height/9)
  text("If Player 2 guesses incorrectly 3 times, erase the canvas", width/2.21, height/7.5)
 
  
  noStroke();
  fill(95);
  rect(325, 14, 140, 40);

  // Handle score change and draw.
  // alterScore();
  textSize(25);
  displayScore(score);

  // Handle paint drawing.
  if (shouldDraw) {
    let hue = chooseColors();

    let data = {
      x: mouseX,
      y: mouseY,
      priorX: priorX,
      priorY: priorY,
      hue: hue
    };

    socket.emit("draw", data);

    drawLine(priorX, priorY, mouseX, mouseY, hue);
    resetPriorCoords();
  }
  
  textSize(25);
  displayScore(score);

}

// voice
function gotResult1(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label1 = results[0].label;
}

// video
// function gotResult(error, results) {
//   if (error) {
//     console.error(error);
//     return;
//   }
//   label = results[0].label;
//   confidence = results[0].confidence;
//   // console.log(results[0]);
//   classifyImage(); //Ensure that the loop repeats
// }

function drawLine(pX, pY, x, y, brushHue) {
  strokeWeight(globalWeight);
  stroke(brushHue, globalS, globalB);
  fill(brushHue, globalS, globalB);
  // Draw a 15 x 15 sized square at mouseX and mouseY
  line(pX, pY, x, y);
}

function resetPriorCoords() {
  priorX = mouseX;
  priorY = mouseY;
}

function touchStarted() {
  shouldDraw = true;

  resetPriorCoords();
  return false;
}

function touchEnded() {
  shouldDraw = false;
  resetPriorCoords();
  return false;
}

function keyPressed() {
  eraseCanvas();
}

function eraseCanvas() {
  background(95);
  score = 0;
}

/* A function that sets the stroke and fill of our "paint brush". */
function chooseColors() {
  if (label1 == "Red") {
    brushHue = 0;
  }

  if (label1 == "Blue") {
    brushHue = 240;
  }

  //   if(label1 == 'Green'){
  //     brushHue = 120;

  //   if(label1 == 'Pink'){
  //     brushHue = 320;

  //   if(label1 == 'Orange'){
  //     brushHue = 20;

  //   if(label1 == 'Yellow'){
  //     brushHue = 55;

  //   if(label1 == 'Eraser'){
  //     brushHue = 95;
  //

  return brushHue;
}

// function alterScore() {
//   if (prev_label != scoreModel.label && scoreModel.label === "Right") {
//     score++;
//     prev_label = scoreModel.label;
//     socket.emit("score", {score: score});
//   }
//   if (prev_label != scoreModel.label && scoreModel.label === "NA") {
//     prev_label = scoreModel.label;
//   }
// }



// function alterScore() {
//   
  //if (prev_label != scoreModel.label && scoreModel.label === "Right") {
//     score++;
//     prev_label = scoreModel.label;
//     socket.emit("score", {score: score});
//   }
//   if (prev_label != scoreModel.label && scoreModel.label === "NA") {
//     prev_label = scoreModel.label;
//   }
// }
// if (frameCount % 75 < 1)

function syncDelay(milliseconds){
 var start = new Date().getTime();
 var end=0;
 while( (end-start) < milliseconds){
     end = new Date().getTime();
 }
}

/*
function scoreChanged () {
    if (scoreModel.label === "Right") {
      score++
      socket.emit("score", { score: score });
    // syncDelay(5000);
*/


function scoreChanged () {
  //can you make the change
  if (score == 0){ 
    if (scoreModel.label === "Right") {
      score++
      socket.emit("score", { score: score });
    // syncDelay(5000);
    }
  } else if (score > 0){
    if (scoreModel.label === "Right") {
      if (frameCount % 60 == 0){
        score++
        socket.emit("score", { score: score });
      }
      
  }
  
  if (scoreModel.label === "Right") {
      score++
      socket.emit("score", { score: score });
    // syncDelay(5000);
  }
}
}

// if (frameCount % 75 < 1){



function classifyImage() {
  flippedVideo = ml5.flipImage(video);
  // classifier.classify(flippedVideo, gotResult);
  scoreModel.classifier.classify(flippedVideo, (error, results) => {
    scoreModel.gotResult(error, results, scoreChanged);
    // TODO: It looks like classifyImage() is being called before gotResult() completes.
    // I suggest moving classify image into gotResult() at the end of the function.
    // If that doesn't work, ping me on slack and I'll help! -Adam
    classifyImage();
  });
  flippedVideo.remove();
}

function displayScore(score1) {
  fill(0);
  text(`Score: ${score1}`, 340, 40);
}

class ColorCircle {
  constructor(x, y, diameter, hue, saturation, brightness) {
    this.xPos = x;
    this.yPos = y;
    this.diameter = diameter;
    this.hue = hue;
    this.saturation = saturation;
    this.brightness = brightness;
  }

  display() {
    fill(this.hue, this.saturation, this.brightness);
    noStroke();
    circle(this.xPos, this.yPos, this.diameter);
  }
}

/*

There are quite a few methods for debugging. They include:
  - manually looking at your code
  - using printout statements
      - in p5, can use the text() function
      - in any JS, leverage console.log()
 - using the browser's JS debugger
      - breakpoints
      - step over, step into, step out of
      - resume
      - 'watch' variables
*/
