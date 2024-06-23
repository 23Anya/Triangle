const isTouch = // detect touch screen
  (window.PointerEvent &&
    "maxTouchPoints" in navigator &&
    navigator.maxTouchPoints > 0) ||
  window.matchMedia("(any-pointer:coarse)").matches;
const footerDate = document.getElementById("footer-date");
const graph = document.getElementById("cartesian-positive-plane");
const graphOrigin = document.getElementById("origin");
const pointOne = document.getElementById("point-one");
const pointTwo = document.getElementById("point-two");
const [originalX1, originalY1, originalX2, originalY2] = [
  Number(pointOne.getAttribute("cx")),
  Number(pointOne.getAttribute("cy")),
  Number(pointTwo.getAttribute("cx")),
  Number(pointTwo.getAttribute("cy")),
];
const textOne = document.getElementById("text-one");
const textTwo = document.getElementById("text-two");
const triangle = document.getElementById("triangle");
const resetBtn = document.getElementById("reset-btn");
const stopBtn = document.getElementById("stop-btn");
const svgMaxWidth = Number(graph.getAttribute("viewBox").split(" ")[2]);
let stop = false;

stopBtn.addEventListener("click", () => (stop = true));
resetBtn.addEventListener("click", resetSvg);

graph.addEventListener("click", (e) => {
  const mouseLoc = getUserPointOnGraph(e);
  const onVertex = isOnVertex(mouseLoc[0], mouseLoc[1], 10);
  console.log("on vertex is " + onVertex);
  const insideTriangle = isInTriangle(mouseLoc[0], svgMaxWidth - mouseLoc[1]);
  console.log(
    mouseLoc[0] +
      ", " +
      (svgMaxWidth - mouseLoc[1]) +
      (insideTriangle ? " is " : " is not ") +
      "inside the triangle"
  );
  if (!onVertex && insideTriangle) start(e);
});

//begin tracking position
pointOne.addEventListener("touchstart", (e) => startMovePoint(e, pointOne));
pointTwo.addEventListener("touchstart", (e) => startMovePoint(e, pointTwo));
pointOne.addEventListener("mousedown", (e) => startMovePoint(e, pointOne));
pointTwo.addEventListener("mousedown", (e) => startMovePoint(e, pointTwo));

//stop tracking
pointOne.addEventListener("touchend", () => stopMovingPoint(pointOne));
pointTwo.addEventListener("touchend", () => stopMovingPoint(pointTwo));
pointOne.addEventListener("mouseup", () => stopMovingPoint(pointOne));
pointTwo.addEventListener("mouseup", () => stopMovingPoint(pointTwo));

function startMovePoint(event, point) {
  if (point === pointOne) {
    event.stopPropagation();
    if (isTouch) {
      event.preventDefault();
      document.addEventListener("touchmove", movePointOne);
    } else {
      document.addEventListener("mousemove", movePointOne);
    }
  } else {
    event.stopPropagation();
    if (isTouch) {
      event.preventDefault();
      document.addEventListener("touchmove", movePointTwo);
    } else {
      document.addEventListener("mousemove", movePointTwo);
    }
  }
}

function movePointOne(e) {
  e.stopPropagation();
  movePoint(e, pointOne, textOne);
}

function movePointTwo(e) {
  e.stopPropagation();
  movePoint(e, pointTwo, textTwo);
}

// move a point to a location provided by the user touch/dragstart
function movePoint(e, point, textEl) {
  const [newX, newY] = getUserPointOnGraph(e);
  if (newX <= svgMaxWidth && newY <= svgMaxWidth && newX >= 0 && newY >= 0) {
    setPointLocation(point, newX, newY);
    setTextLocation(textEl, 20, -25, newX, newY);
  } else {
    stopMovingPoint(point);
  }
}

// Get the point on the graph/SVG the user is interacting with in terms of the SVG coordinates
function getUserPointOnGraph(e) {
  const offset = getGraphOffset();
  const width = getWidth();
  let newX, newY;
  if (e.type.startsWith("touch")) {
    newX = ((e.touches[0].clientX - offset[0]) * svgMaxWidth) / width;
    newY = ((e.touches[0].clientY - offset[1]) * svgMaxWidth) / width;
  } else {
    newX = ((e.clientX - offset[0]) * svgMaxWidth) / width;
    newY = ((e.clientY - offset[1]) * svgMaxWidth) / width;
  }
  console.log("(" + newX + ", " + newY + ")");
  return [newX, newY];
}

function stopMovingPoint(point) {
  if (point === pointOne) {
    document.removeEventListener("mousemove", movePointOne);
    document.removeEventListener("touchmove", movePointOne);
  } else {
    document.removeEventListener("mousemove", movePointTwo);
    document.removeEventListener("touchmove", movePointTwo);
  }
}

function setPointLocation(point, x, y) {
  point.setAttribute("cx", x);
  point.setAttribute("cy", y);
  let line = triangle.getAttribute("points").split(" ");
  if (point == pointOne) {
    line[1] = x + "," + y;
    triangle.setAttribute("points", line.join(" "));
  } else {
    line[2] = x + "," + y;
    triangle.setAttribute("points", line.join(" "));
  }
}

function setTextLocation(textEl, xOffset, yOffset, pointX, pointY) {
  textEl.setAttribute("x", pointX + xOffset);
  textEl.setAttribute("y", pointY + yOffset);
  textEl.textContent =
    "[" + Math.round(pointX) + ", " + (svgMaxWidth - Math.round(pointY)) + "]";
}

function getGraphOffset() {
  let zero = graph.getBoundingClientRect();
  return [zero.left, zero.top];
}

function start(e) {
  const iterations = document.getElementById("iterations").value;
  graph.removeEventListener("dragstart", start);
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  let graphPts = mouseLocToSvgLoc(x, y);
  let currentVertex = getRandomVertex();
  addPoint(graphPts[0], graphPts[1]);
  let i = 0;
  graph.querySelector("polyline").style.fill = "rgba(255, 255, 0, 0.8)";
  let intervalId = setInterval(() => {
    if (i >= iterations || stop) {
      clearInterval(intervalId);
      graph.querySelector("polyline").style.fill = "white";
      stop = false;
    }
    graphPts = findMiddle(
      graphPts[0],
      graphPts[1],
      currentVertex[0],
      currentVertex[1]
    );
    addPoint(graphPts[0], graphPts[1]);
    currentVertex = getRandomVertex();
    i++;
  }, 0.1);
}

function nextPoint(graphPts, currentVertex) {
  graphPts = findMiddle(
    graphPts[0],
    graphPts[1],
    currentVertex[0],
    currentVertex[1]
  );
  addPoint(graphPts[0], graphPts[1]);
  currentVertex = getRandomVertex();
}

function addPoint(x, y) {
  if (!isOnVertex(x, y, 10)) {
    const newPt = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    newPt.setAttribute("cx", x);
    newPt.setAttribute("cy", y);
    newPt.setAttribute("r", 1);
    newPt.setAttribute("style", "fill: black;");
    graph.appendChild(newPt);
  }
}

function mouseLocToSvgLoc(mouseX, mouseY) {
  const offset = getGraphOffset();
  const width = getWidth();
  return [
    ((mouseX - offset[0]) * svgMaxWidth) / width,
    ((mouseY - offset[1]) * svgMaxWidth) / width,
  ];
}

function isOnVertex(x, y, r) {
  let x1 = Number(pointOne.getAttribute("cx"));
  let y1 = Number(pointOne.getAttribute("cy"));
  let x2 = Number(pointTwo.getAttribute("cx"));
  let y2 = Number(pointTwo.getAttribute("cy"));
  return isOnPoint(x, y, x1, y1, r) || isOnPoint(x, y, x2, y2, r);
}

function isOnPoint(x, y, xVertex, yVertex, r) {
  return (
    x < xVertex + r && x > xVertex - r && y < yVertex + r && y > yVertex - r
  );
}

function getWidth() {
  return Number(
    document.getElementById("triangle-container").getBoundingClientRect().width
  );
}

function getMouseLocOnSvg(e) {
  const offset = getGraphOffset();
  const x = e.clientX - offset[0];
  const y = e.clientY - offset[1];
  return [x, y];
}

function getRandomVertex() {
  let randVertex = Math.floor(Math.random() * 3);
  let currentVertex;
  switch (randVertex) {
    case 0:
      currentVertex = [0, svgMaxWidth];
      break;
    case 1:
      currentVertex = [
        Number(pointOne.getAttribute("cx")),
        Number(pointOne.getAttribute("cy")),
      ];
      break;
    case 2:
      currentVertex = [
        Number(pointTwo.getAttribute("cx")),
        Number(pointTwo.getAttribute("cy")),
      ];
      break;
    default:
      currentVertex = null;
      break;
  }
  return currentVertex;
}

function resetSvg() {
  points = Array.from(graph.querySelectorAll("circle"));
  for (let i = 3; i < points.length; i++) {
    points[i].remove();
  }
  setPointLocation(pointOne, originalX1, originalY1);
  setPointLocation(pointTwo, originalX2, originalY2);
  setTextLocation(textOne, 20, -25, originalX1, originalY1);
  setTextLocation(textTwo, 20, -25, originalX2, originalY2);
}

footerDate.innerText = new Date().getFullYear();
