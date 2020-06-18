// script.js
// Sinkboat JS code
// author: @mikehess1
// date: 6/12/2020

// Set DOM elements
const form = document.getElementById("setupForm");
const output = document.getElementById("output");
const coordinates = document.getElementById("coordinates");
const results = document.getElementById("results");

// Set Boat Lengths
const destroyer = 2;
const submarine = 3;
const battleship = 4;
const carrier = 5;

// Declare variables
let gridHash = {};
let boat;
let boatLength;
let speed;
let direction;
let shots = 0;
let found = false;

// Load the modal for instructions/setup
$(window).on("load", function () {
  $("#myModal").modal("show");
});

// Hide the modal on form submit
$("#myModal").submit(function (e) {
  e.preventDefault();
  // Coding
  $("#myModal").modal("hide");
  return false;
});

// Form Submit Event
form.addEventListener("submit", startGame);

// Start Game function
function startGame(e) {
  e.preventDefault();
  // Read form and set variables
  setVariables();

  // Set boat length based on boat chosen
  setBoatLength();

  // Place chosen boat randomly
  placeBoat();

  // Print Output
  printOutput();

  // Start Firing then Print Results
  findBoat();
}

// Set variables to form input
function setVariables() {
  boat = form.boat.value;
  direction = form.direction.value;
  speed = Number(form.speed.value);
}

// Sets boat length, default is destroyer
function setBoatLength() {
  if (boat == "Destroyer") boatLength = destroyer;
  else if (boat == "Submarine") boatLength = submarine;
  else if (boat == "Battleship") boatLength = battleship;
  else if (boat == "Carrier") boatLength = carrier;
}

// Choose random starting point and identify coordinates
function placeBoat() {
  // Declare variables for row and column
  let row;
  let col;

  // Generate random starting coordinates
  if (direction == "North and South") {
    row = Math.floor(Math.random() * (8 - (boatLength - 1)));
    col = Math.floor(Math.random() * 8);
  } else {
    row = Math.floor(Math.random() * 8);
    col = Math.floor(Math.random() * (8 - (boatLength - 1)));
  }

  // Create hash table of boat coordinates
  for (let i = 0; i < boatLength; i++) {
    if (direction == "North and South") gridHash[[row + i, col]] = i;
    else gridHash[[row, col + i]] = i;
  }
}

// Fire on each column of each row until boat is hit
async function findBoat() {
  // For each space
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // If boat hasn't been found yet
      if (!found) {
        // Fire a shot at this space
        await fireShot(row, col);
      }
      // When boat has been found
      if (found) {
        sinkBoat(row, col);
        return;
      }
    }
  }
}

// Fires shot at specified coordinate
async function fireShot(row, col) {
  // Pause to show visual output
  await sleep(1000 / speed);

  // Print shot on grid
  var shot = document.getElementById(row.toString() + col.toString());
  shot.textContent = "x";
  shots += 1;

  // If shot hits a boat
  if (isHit(row, col)) {
    // Fill square with red highlight, set boat found to true;
    shot.className = "highlight";
    printCoordinates(row, col);
    found = true;
  }
}

// Finishes firing on the boat
async function sinkBoat(row, col) {
  // If boat is on the last column
  if (col == 7) {
    // Fire down and print results
    fireDown(row, col);
    printResults();
    return;
  }

  // Fire once on next space to the right
  else await fireShot(row, col + 1);

  // If it's a hit, continue firing to the right
  if (isHit(row, col + 1)) {
    fireAcross(row, col + 1);
  } else fireDown(row, col);

  printResults();
}

// Returns true if shot fired is a hit, false if not
function isHit(row, col) {
  if (gridHash.hasOwnProperty([row, col])) {
    return true;
  }
  return false;
}

// Fires downward until boat is sunk
async function fireDown(row, col) {
  for (let i = 1; i < boatLength; i++) {
    await fireShot(row + i, col);
  }
}

// Fires across until boat is sunk
async function fireAcross(row, col) {
  for (let i = 1; i < boatLength - 1; i++) {
    await fireShot(row, col + i);
  }
}

// Print Output
function printOutput() {
  // Reset output div
  clearOutput();

  // Print boat and direction
  var h5 = document.createElement("h5");
  h5.className = "text-left";
  h5.appendChild(
    document.createTextNode("Your " + boat + " is facing " + direction)
  );
  output.appendChild(h5);
  output.appendChild(document.createElement("br"));
  var h5 = document.createElement("h5");
  h5.className = "text-left";
  h5.appendChild(document.createTextNode("Coordinates (row, column): "));
  output.appendChild(h5);
}

// Print Coordinates
function printCoordinates(row, col) {
  // Print boat and direction
  var h5 = document.createElement("h5");
  h5.className = "text-left";
  h5.appendChild(document.createTextNode(row + 1 + ", " + (col + 1) + " "));
  coordinates.appendChild(h5);
}

// Print Results
async function printResults() {
  // Wait for functions to finish
  await sleep(5000 / speed);

  // Print how many shots fired
  var h5 = document.createElement("h5");
  h5.className = "text-left";
  h5.appendChild(document.createTextNode("Shots Fired: " + shots));
  results.appendChild(h5);

  // Calculate and print the average case
  let average = Math.ceil((64 - boatLength) / 2);
  var h5 = document.createElement("h5");
  h5.className = "text-left";
  h5.appendChild(document.createTextNode("Average Case: " + average));
  results.appendChild(h5);

  // Calculate the conclusion
  let conclusion;
  if (shots == boatLength) conclusion = "This Case: Best Case, perfect game!";
  else if (shots < average)
    conclusion =
      "This Case: " + (average / shots).toFixed(2) + "x faster than average";
  else if (shots > average)
    conclusion =
      "This case: " + (shots / average).toFixed(2) + "x slower than average";
  else conclusion = "This case: Exactly average";
  var h5 = document.createElement("h5");
  h5.className = "text-left";
  h5.appendChild(document.createTextNode(conclusion));

  // Append output to output div
  results.appendChild(h5);

  // Show button to play again
  let replay = document.getElementById("replay");
  replay.hidden = false;
}

// Clear Output
function clearOutput() {
  // Reset output div
  output.textContent = "";
  results.textContent = "";
}

// Timeout function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
