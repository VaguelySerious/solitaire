import utils from './utils.js';

// Color picker
const colorPicker = document.querySelector('#color-picker');
const colorPickerItems = document.querySelectorAll('.color-picker-item');

const cardColors = [
  'yellow',
  'orange',
  'red',
  'lavender',
  'blue',
  'aqua',
  'green'
];

let lastSet = '';

// Assign random color to cards

export const setRandom = function () {
  if (lastSet) {
    document.body.classList.remove(lastSet);
  }
  const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)];
  document.body.classList.add(randomColor);
  lastSet = randomColor;
}

export const set = function (color) {
  if (cardColors.includes(color)) {
    if (lastSet) {
      document.body.classList.remove(lastSet);
    }
    document.body.classList.add(color);
    lastSet = color;
  } else {
    throw new Error(`Color ${color} does not exist.`);
  }
}
