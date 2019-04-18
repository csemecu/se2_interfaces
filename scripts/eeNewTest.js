/*
This would go into an html
<div class="content">
  <svg class="workspace" id="workspace">
  </svg>
  <svg class = "workspace" id="panel">
  </svg>
</div>
*/

////////////// This part is about the end effector ////////////
var ws = document.getElementById("workspace");
var eeRadius = 10;
var offsetX = 15;  // This would be pos.X
var offsetY = 15;  // This would be pos.Y
// I want to relate the orientation to the dashed line with the arrowhead

// Create the circle which is the end effector in itself
var ee = document.createElementNS('http://www.w3.org/2000/svg','circle');
ee.setAttribute("cx",offsetX);
ee.setAttribute("cy",offsetY);
ee.setAttribute("r",eeRadius);
ee.setAttribute("style","fill:black;stroke:black;stroke-width:3");

// Create arrowhead as a marker
var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
const arrowhead = document.createElementNS('http://www.w3.org/2000/svg','marker');
arrowhead.setAttribute("id","Arrow");
arrowhead.setAttribute("viewBox","0 0 10 10");
arrowhead.setAttribute("refX","0");
arrowhead.setAttribute("refY","5");
arrowhead.setAttribute("markerUnits", "strokeWidth");
arrowhead.setAttribute("markerWidth","8");
arrowhead.setAttribute("markerHeight","10");
arrowhead.setAttribute("orient","auto");
const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
arrowhead.appendChild(path);
path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
ws.appendChild(defs);
// The marker needs to be added to the defs
defs.appendChild(arrowhead);

// Create dashed line to indicate orientation of ee
const orient = document.createElementNS('http://www.w3.org/2000/svg','line');
orient.setAttribute("x1", offsetX);
orient.setAttribute("y1", offsetY);
orient.setAttribute("x2", (offsetX + 5*eeRadius).toString());
orient.setAttribute("y2", offsetY);
orient.setAttribute("style","stroke:black;stroke-width:2;stroke-dasharray:5");
orient.setAttribute("marker-end", "url(#Arrow)");

// Maybe there is a way to append the dashed line to the circle (ee), and then only append ee to the workspace.
ws.appendChild(orient);
ws.appendChild(ee);


////////////// This part is about the target ////////////
var panel = document.getElementById("panel");

const svg_container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg_container.setAttribute("width", "300");
svg_container.setAttribute("height", "300");
svg_container.setAttribute("viewbox", "0 0 500 500");

    // Eliptical Arc Params
var mvX = 70;  //these could be center of circle or target position
var mvY = 30;
var lnX = 40; // radius 1 towards arc
var lnY = 70;
var rx = 2; // don't know how this changes the arc. ratio rx/ry = 2 works 
var ry = 1;
var rot = 0; // don't know how this changes the arc
var lgArcFlag = 0; // These two flags need to be 0 so that it's the intersection
var sweepFlag = 0;
var endX = 80; // end point of the arc
var endY = 70;

    //MoveTo mvX mvY Arc rx ry rotate large_arc_flag sweep_flag endX endY Line mvX mvY Z (z to close)
const orientRng = document.createElementNS("http://www.w3.org/2000/svg", "path");
orientRng.setAttribute("d", "M " +mvX+ " " +mvY+ " L " +lnX+ " "+lnY+ " A " +rx+ " " +ry+ " " +rot+ " " +lgArcFlag+ " " +sweepFlag+ " " +endX+ " " +endY+ " Z");
orientRng.setAttribute("stroke","black");
orientRng.setAttribute("fill","green");
orientRng.setAttribute("fill-opacity","0.4");
    
    // attach it to the container
svg_container.appendChild(orientRng);

    // attach container to document
panel.appendChild(svg_container);