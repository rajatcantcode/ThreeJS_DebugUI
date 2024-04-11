import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GSAP from "gsap";
import GUI from "lil-gui";

/*Debug */
const gui = new GUI({
  width: 300,
  title: "Fuck Debug",
  closeFolders: true,
});
gui.close(); //close the main folder that is Fuck Debug

//will open/close debug only by press the key
window.addEventListener("keydown", (e) => {
  if (e.key == "d") {
    gui.show(gui._hidden);
  }
});

const cubeTweaks = gui.addFolder("Awesome Cube");
// cubeTweaks.close(); //by default it will be closed
// or can use closeFolders : true in GUI
//note : we can put folders into folders

const debugObject = {};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

debugObject.color = "#b91818";

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: debugObject.color,
  wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//range
cubeTweaks.add(mesh.position, "y", -3, 3, 0.01).name("elevation"); //min , max , how much increase
cubeTweaks.add(mesh.position, "x", -3, 3, 0.01).name("horizontal"); //min , max , how much increase

//Checkbox
cubeTweaks.add(mesh, "visible");
cubeTweaks.add(mesh.material, "wireframe");

//Colors
//They are tricky one
//Cons : It does not show the same color as per in debug UI
// gui.addColor(mesh.material, "color");
//This is becasue Three JS do some color mangement in order to optimize the rendering
// How to get rid of this👇
// onChange method will give us continuous changes in color
// change the color explicitly to hexdecimal
// gui.addColor(mesh.material, "color").onChange((value) => {
//   console.log(value.getHexString()); //We will be getting our hexa color
//We could paste this color in material.color 0xXXXXX
//But this way is also not very handy will use a different way
// });

//Efficient way
cubeTweaks.addColor(debugObject, "color").onChange((value) => {
  material.color.set(value);
});

//Function/Button
//Same problem can't put right away
debugObject.spin = () => {
  GSAP.to(mesh.rotation, {
    y: mesh.rotation.y + Math.PI * 2,
    duration: 10,
  });
};
cubeTweaks.add(debugObject, "spin");

//Tweak the subdivision
// gui.add(geometry, "widthSegments", 1, 20, 1); //We cannot do like this becuase
//widthSegments are the property that is used to generate the whole geometry only once
//We can't just change the parameter and expect it to recreate the parameter
// debugObject.subdivisions = 2;
// gui.add(debugObject, "subdivisions", 1, 10, 0.1).onChange(() => {
//   console.log("subdivisions changes");
// });
//But wait we width Segments changes in to create a new geometry
//Building a geometry is a stress for GPU
//The Change Event can be triggered just if the user drags and drops the range too much
//Replcae it by finish Change
debugObject.subdivisions = 2;
cubeTweaks.add(debugObject, "subdivisions", 1, 10, 0.1).onFinishChange(() => {
  //to reduce the stress on GPU
  //dispose the old geometry before creating the new one
  mesh.geometry.dispose();
  mesh.geometry = new THREE.BoxGeometry(
    1,
    1,
    1,
    debugObject.subdivisions,
    debugObject.subdivisions,
    debugObject.subdivisions
  );
});
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Fullscreen
 */
window.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
