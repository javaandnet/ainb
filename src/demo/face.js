const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs');

// Load models and weights
const MODEL_URL = './models';
faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
faceapi.nets.faceExpressionNet.loadFromDisk(MODEL_URL);

// Load image
const img = await canvas.loadImage('./path/to/image.jpg');

// Detect faces
const detections = await faceapi.detectAllFaces(img).withFaceExpressions();

// Display expressions for each face
detections.forEach((detection, i) => {
    const expressions = detection.expressions;
    console.log(`Face ${i + 1} Expressions:`);
    console.log(`Angry: ${expressions.angry}`);
    console.log(`Happy: ${expressions.happy}`);
    console.log(`Sad: ${expressions.sad}`);
    console.log(`Neutral: ${expressions.neutral}`);
    console.log(`Surprised: ${expressions.surprised}`);
});
