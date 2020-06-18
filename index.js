/* eslint-disable */


/*
 * Imports
 */
// npm
import * as THREE from 'three';
import gsap from 'gsap';

import i_arch from "./img/morphoDots_arch.svg";
import i_3d from "./img/morphoDots_3d.svg";
import i_code from "./img/morphoDots_code.svg";
import i_circle from "./img/morphoDots_circle.png";

/*
 * Declarations
 */
// Constants
const container = document.getElementById('container');

const size = 200;
const canvas = document.createElement('canvas');
canvas.width = size;
canvas.height = size;
const ctx = canvas.getContext("2d");

const images = [i_arch, i_3d, i_code];

// Variables
let camera; let scene; let renderer;
let gallery, geometry;
let current = 0;
let time = 0;


/*
 * Functions
 */
function init(img0) {

  /* Setup THREE boilerplate */
  scene = new THREE.Scene();
  scene.destination = { x: 0, y: 0 };

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight);

  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    container.offsetWidth / container.offsetHeight,
    0.001, 2500
  );
  camera.position.set(0, 0, 2000);

  /* Start custom stuff */
  let texture = new THREE.TextureLoader().load(i_circle);
  let material = new THREE.PointsMaterial({
    size: 10,
    map: texture,
    alphaTest: 0.6,
    vertexColors: true
  });

  geometry = new THREE.BufferGeometry();

  let vertices = new Float32Array(img0.length * 3);
  let colors = new Float32Array(img0.length * 3);

  for (let i = 0; i < img0.length; i++) {
    vertices[3 * i] = img0[i][0];
    vertices[3 * i + 1] = img0[i][1];
    vertices[3 * i + 2] = 100 * Math.random();

    let randomColor = Math.random() + 0.3;
    colors[3 * i] = randomColor;
    colors[3 * i + 1] = randomColor;
    colors[3 * i + 2] = randomColor;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  let points = new THREE.Points(geometry, material);

  scene.add(points);

  resize();
}

function animate() {
  time += 0.05;

  const arrayLength = geometry.attributes.position.count;

  for (let i = 0; i < arrayLength; i++) {
    const dimension = i % 3;

    if (dimension === 2) {
      geometry.attributes.position.array[i] += 50 * Math.sin(time / 10 + i / 3);
    }
  }

  geometry.attributes.position.needsUpdate = true;

  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}

/*
 * Helper functions and event listeners
 */
function resize() {
  const w = container.offsetWidth;
  const h = container.offsetHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function loadImages(paths, callback) {
  const imgs = [];
  paths.forEach(path => {
    const img = new Image(size, size);
    img.onload = () => {
      imgs.push(img);

      if (imgs.length == paths.length) {
        callback(imgs);
      }
    }
    img.src = path;
  });
}

function getCoordinatesFromImage(img) {
  const imageCoords = [];
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  let data = ctx.getImageData(0, 0, size, size).data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let alpha = data[((size * y) + x) * 4 + 3];
      if (alpha > 0) {
        imageCoords.push([10 * (x - size / 2), 10 * (size / 2 - y)]);
      }
    }
  }

  return fillUp(imageCoords, 20000);
}

function fillUp(array, max) {
  const length = array.length;
  for (let i = 0; i < max - length; i++) {
    let index = Math.floor(Math.random() * (length - 1));
    array.push(array[index]);
  }
  return array;
}

function onClick() {
  const newPositionArray = new Float32Array(60000);
  current++;
  current = current % gallery.length;
  geometry.attributes.position.array.forEach((coord, index) => {
    const dimension = index % 3;
    const targetCoord = dimension == 2 ? Math.random() * 100 : gallery[current][Math.floor(index / 3)][dimension];

    newPositionArray[index] = targetCoord;
  });

  gsap.to(geometry.attributes.position.array, 1, newPositionArray);
}


/*
 * Calls
 */
loadImages(images, imgs => {

  gallery = [];
  imgs.forEach(img => {
    gallery.push(getCoordinatesFromImage(img));
  });

  window.addEventListener('resize', resize);
  document.body.addEventListener("click", onClick);

  init(gallery[0]);
  animate();
});
