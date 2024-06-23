function isInTriangle(x, y) {
  const svgHeight = Number(graph.getAttribute("viewBox").split(" ")[2]);
  const triangle = document.getElementById("triangle");
  const points = triangle.getAttribute("points").split(" ");
  const pOne = points[1].split(",");
  const pTwo = points[2].split(",");

  const m1 = (svgHeight - pOne[1]) / pOne[0];
  const m2 = (svgHeight - pTwo[1]) / pTwo[0];
  if (m1 === m2) return false; // not a triangle, colinear points

  const m3 =
    (svgHeight - pOne[1] - (svgHeight - pTwo[1])) / (pOne[0] - pTwo[0]);
  const topPoint = m1 > m2 ? pOne : pTwo;
  const bottomPoint = topPoint === pOne ? pTwo : pOne;
  const mTop = topPoint === pOne ? m1 : m2;
  const mBot = mTop === m1 ? m2 : m1;

  const minX = Math.min(topPoint[0], bottomPoint[0]);
  const maxX = Math.max(topPoint[0], bottomPoint[0]);
  const xMinIsTop = topPoint[0] < bottomPoint[0];
  // find y intercept for line 3. y1 - a × x1
  // y = mx + b  -> b = y - mx
  const y0 = svgHeight - topPoint[1] - m3 * topPoint[0];

  // if the point is outside the triangle, return false
  // x is beyond the largest x value
  if (x > maxX) {
    return false;
  }
  // x is between 0 and the smallest x value, and is above the top line or below the bottom line
  if (xMinIsTop && x <= minX && (y > x * mTop || y < x * mBot)) {
    return false;
  }
  if (!xMinIsTop && x <= minX && (y > x * mTop || y < x * mBot)) {
    return false;
  }
  if (xMinIsTop) {
    if (x > minX && x <= maxX && (y < x * mBot || y > m3 * x + y0)) {
      return false;
    }
  }
  if (!xMinIsTop) {
    if (x > minX && x <= maxX && (y >= x * mTop || y < m3 * x + y0)) {
      return false;
    }
  }
  // otherwise return true
  return true;
}

function findMiddle(x1, y1, x2, y2) {
  const x = (x1 + x2) / 2;
  const y = (y1 + y2) / 2;
  const middle = [x, y];
  return middle;
}
