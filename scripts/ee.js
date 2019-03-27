/**
 * ee.js
 * The end effector that needs to be re-configured.
 * Represented by a triangle.
 */

var isOneTouch = false;
var control = 3;
var controlTypes = ["arrows", "drag", "target", "arrowsClick"];


var ee = null;
var ring = null;
var target = null;

var score = 0;

var isTranslating = false;
var isRotating = false;
var refPos = null;
var startRot = null;
var startPos = null;

var pos = null;
var rot = null;

// Target Params
var targetPos = null;
var targetRot = null;
var targetRed = "#930";
var targetGreen = "#393";
var threshold = 3;


// The global variables used by the arrows
var scale = 1;
var arrowRight;
var arrowLeft;
var arrowUp;
var arrowDown;
var arrows;

var arrowRightXOffset;
var arrowRightYOffset;
var arrowLeftXOffset;
var arrowLeftYOffset;
var arrowUpXOffset;
var arrowUpYOffset;
var arrowDownXOffset;
var arrowDownYOffset;

// Additional variables used by arrowClick and arrowOver
var arrowCW;
var arrowCCW;
var arrowCWXOffset;
var arrowCWYOffset;
var arrowCCWXOffset;
var arrowCCWYOffset;
var arrowsSix;

// Constant variables for the arrows
const RIGHT = 0;
const LEFT = 1;
const UP = 2;
const DOWN = 3;
const CW = 4;
const CCW = 5;

// The global variables used by the target control type
var targetFixedX = null;
var targetFixedY = null;
var ghost;
var lineThickness = 2;

// Arrow params
var arrowShaftLength = 22;
var lipHeight = 6;
var arrowheadLength = 22;
var arrowLengthTot = arrowShaftLength + arrowheadLength;
var arrowWidth = 16;

// Trajectory arrow params and variables
var numTrajArrows = 10;
var trajArrowLength = 100;
var trajFontSize = 30;
var trajArrows;
var trajNums;

// Radius and width of the control ring
var innerR = 40;
var triangleSize = 30;
var ringWidth = 18;
var pointOffset = triangleSize - ringWidth;

// Top angle of the triangle representing the EE
var triAlpha = 45*Math.PI/180.0;
var triHeightDiff = Math.round(triangleSize*Math.cos(triAlpha));
var triWidth = Math.round((2*triangleSize-triHeightDiff)*Math.tan(triAlpha/2))*2;

// Grid params
var gridSideLength = 3;

// Pie params
var numSlices = 4;

function createEE() {
    var ws = document.getElementById("workspace");
    var rect = ws.getBoundingClientRect();
    ee = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    ee.setAttribute("id", "ee");
    ee.style.fill = "#ACC";
    ee.style.stroke = "#333";

    //Initialize end-effector
    pos = [Math.round(rect.width / 2), Math.round(rect.height / 2)];
    rot = 0;

    ee.setAttribute("class", "draggable");
    arrowsSix = null;

    if (controlTypes[control] === "drag") {
        if (isOneTouch)
            ee.setAttributeNS(null, "onclick", "startDrag(evt)");
        else
            ee.setAttributeNS(null, "onmousedown", "startDrag(evt)");
        createRing();
    }
    else if (controlTypes[control] === "arrows") {
        createRing();
        createArrows();
        if (isOneTouch) {
            arrowRight.setAttribute("onclick", "startDrag(evt, RIGHT)");
            arrowLeft.setAttribute("onclick", "startDrag(evt, LEFT)");
            arrowUp.setAttribute("onclick", "startDrag(evt, UP)");
            arrowDown.setAttribute("onclick", "startDrag(evt, DOWN)");
        }
        else {
            arrowRight.setAttribute("onmousedown", "startDrag(evt, RIGHT)");
            arrowLeft.setAttribute("onmousedown", "startDrag(evt, LEFT)");
            arrowUp.setAttribute("onmousedown", "startDrag(evt, UP)");
            arrowDown.setAttribute("onmousedown", "startDrag(evt, DOWN)");
        }
    }
    else if (controlTypes[control] === "arrowsClick") {
        createSixArrows();
        if (isOneTouch) {
            arrowRight.setAttribute("onclick", "startDrag(evt, RIGHT)");
            arrowLeft.setAttribute("onclick", "startDrag(evt, LEFT)");
            arrowUp.setAttribute("onclick", "startDrag(evt, UP)");
            arrowDown.setAttribute("onclick", "startDrag(evt, DOWN)");
            arrowCW.setAttribute("onclick", "startDrag(evt,CW)");
            arrowCCW.setAttribute("onclick", "startDrag(evt,CCW)");
        }
        else {
            arrowRight.setAttribute("onmousedown", "startDrag(evt, RIGHT)");
            arrowLeft.setAttribute("onmousedown", "startDrag(evt, LEFT)");
            arrowUp.setAttribute("onmousedown", "startDrag(evt, UP)");
            arrowDown.setAttribute("onmousedown", "startDrag(evt, DOWN)");
            arrowCW.setAttribute("onmousedown", "startDrag(evt,CW)");
            arrowCCW.setAttribute("onmousedown", "startDrag(evt,CCW)");
        }
    }
    else if (controlTypes[control] === "target") {
        createGhost();
        if(isOneTouch) {
            ws.setAttribute("onclick", "startGhost(evt)");
        }
        else {
            ws.setAttribute("onmousedown", "startGhost(evt)");
        }
    }

    else {
        console.error("Please select a valid control");
    }

    ws.appendChild(ee);

    createTarget();
    resetPose();
}



function createTrajectoryArrows() {
    var ws = document.getElementById("workspace");
    trajArrows = [];
    trajNums = [];
    for(var i = 0; i < numTrajArrows; i++){
        var angle = ((2 * Math.PI) / numTrajArrows) * i;
        var unitX = Math.cos(angle);
        var unitY = Math.sin(angle);
        var x = unitX * trajArrowLength;
        var y = unitY * trajArrowLength;

        var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arrow.setAttribute('x1', 0);
        arrow.setAttribute('y1', 0);
        arrow.setAttribute('x2', x);
        arrow.setAttribute('y2', y);
        arrow.setAttribute('stroke', "red");
        arrow.setAttribute('stroke-width', lineThickness);
        arrow.setAttribute('id', (i + 1));
        arrow.setAttribute('value', String(unitX + "," + unitY));
        moveObject(arrow, pos[0], pos[1], rot);
        trajArrows.push(arrow);
        ws.appendChild(arrow);

        var num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        num.setAttribute('x', x * 1.2);
        num.setAttribute('y', y * 1.2);
        num.style.fontSize = trajFontSize + "px";
        num.innerHTML = i;
        trajNums.push(num);
        ws.appendChild(num);
    }
}

function createGhost(){
    var ws = document.getElementById("workspace");
    ghost = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ghost.setAttribute('x1', 0);
    ghost.setAttribute('y1', 0);
    ghost.setAttribute('x2', 0);
    ghost.setAttribute('y2', 0);
    ghost.setAttribute('stroke', "red");
    ghost.setAttribute('stroke-width', lineThickness);
    ws.appendChild(ghost);
}

function createTarget() {
    var ws = document.getElementById("workspace");
    var rect = ws.getBoundingClientRect();
    var edgeBuffer = innerR + ringWidth +(arrowLengthTot * scale);
    targetPos = [edgeBuffer + Math.random()*(rect.width - 2 * edgeBuffer),
        edgeBuffer + Math.random()*(rect.height - 2 * edgeBuffer)];
    targetRot = Math.random()*360 - 180;
    target = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    target.setAttribute("id", "target");
    target.setAttribute("stroke-width", 4);
    target.style.fill = "none";
    target.style.stroke = targetRed;
    target.setAttribute("points", (-triWidth/2)+","+(-triHeightDiff)+","+(triWidth/2)+","+(-triHeightDiff)+","+ 0 +","+ (innerR - pointOffset));
    moveObject(target, targetPos[0], targetPos[1], targetRot);
    //Initialize end-effector
    ws.appendChild(target);
}

function createRing() {
    var ws = document.getElementById("workspace");
    var rect = ws.getBoundingClientRect();
    ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("id", "ring");
    // ring.setAttribute("cx", Math.round(rect.width/2));
    // ring.setAttribute("cy", Math.round(rect.height/2));
    ring.setAttribute("r", innerR + ringWidth/2);
    ring.setAttribute("stroke-width", ringWidth);
    ring.style.fill = "none";
    ring.style.stroke = "#AAC";
    ring.setAttribute("class", "draggable");
    ring.setAttribute("stroke-dasharray", "30, 0.3");
    if (isOneTouch)
        ring.setAttributeNS(null, "onclick", "startRotate(evt)");
    else
        ring.setAttributeNS(null, "onmousedown", "startRotate(evt)");
    ws.appendChild(ring);
}

function createArrows() {
    var ws = document.getElementById("workspace");

    arrowRight = document.createElementNS('http://www.w3.org/2000/svg','path');
    arrowLeft = document.createElementNS('http://www.w3.org/2000/svg','path');
    arrowUp = document.createElementNS('http://www.w3.org/2000/svg','path');
    arrowDown = document.createElementNS('http://www.w3.org/2000/svg','path');

    arrows = [arrowRight, arrowLeft, arrowUp, arrowDown];

    arrows.forEach(function(arrow) {
        arrow.setAttribute("d", "M0,"+(0)+" h"+arrowShaftLength+"v"+(-lipHeight)+"l"+arrowheadLength+","+(lipHeight +
            (arrowWidth /2)) +"l"+ (-arrowheadLength)+","+
            (lipHeight + (arrowWidth /2)) +"v"+(-lipHeight)+"h"+(-arrowShaftLength)+"z");
    });

    arrowRight.style.fill = "#181acc";
    arrowLeft.style.fill = "#181acc";
    arrowUp.style.fill = "#cc070e";
    arrowDown.style.fill = "#cc070e";

    arrows.forEach(function(arrow) {
        ws.appendChild(arrow);
    });

    arrowRightXOffset = innerR + ringWidth;
    arrowRightYOffset = - arrowWidth / 2;
    arrowLeftXOffset = - (innerR + ringWidth);
    arrowLeftYOffset =  arrowWidth / 2;
    arrowUpXOffset = - arrowWidth / 2;
    arrowUpYOffset =  - (innerR + ringWidth);
    arrowDownXOffset = arrowWidth / 2;
    arrowDownYOffset = (innerR + ringWidth);

    // The transform attribute gets set in resetPose()
}

function createSixArrows() {
    var ws = document.getElementById("workspace");

    arrowRight = document.createElementNS('http://www.w3.org/2000/svg','path');
    arrowLeft = document.createElementNS('http://www.w3.org/2000/svg','path');
    arrowUp = document.createElementNS('http://www.w3.org/2000/svg','path');
    arrowDown = document.createElementNS('http://www.w3.org/2000/svg','path');
    arrowCW = document.createElementNS('http://www.w3.org/2000/svg','path');
    arrowCCW = document.createElementNS('http://www.w3.org/2000/svg','path');

    arrowsSix = [arrowRight, arrowLeft, arrowUp, arrowDown, arrowCW, arrowCCW];

    arrowsSix.forEach(function(arrow) {
        arrow.setAttribute("d", "M0,"+(0)+" h"+arrowShaftLength+"v"+(-lipHeight)+"l"+arrowheadLength+","+(lipHeight +
            (arrowWidth /2)) +"l"+ (-arrowheadLength)+","+
            (lipHeight + (arrowWidth /2)) +"v"+(-lipHeight)+"h"+(-arrowShaftLength)+"z");
    });

    arrowRight.style.fill = "#181acc";
    arrowLeft.style.fill = "#181acc";
    arrowUp.style.fill = "#cc070e";
    arrowDown.style.fill = "#cc070e";
    arrowCW.style.fill = "#a442f4"; // when clicked = #bf42f4
    arrowCCW.style.fill = "#36bc3d";// for now when clicked = #4cef23

    arrowRightXOffset = innerR + ringWidth;
    arrowRightYOffset = - arrowWidth / 2;
    arrowLeftXOffset = - (innerR + ringWidth);
    arrowLeftYOffset =  arrowWidth / 2;
    arrowUpXOffset = - arrowWidth / 2;
    arrowUpYOffset =  - (innerR + ringWidth);
    arrowDownXOffset = arrowWidth / 2;
    arrowDownYOffset = (innerR + ringWidth);
    arrowCWXOffset = Math.round((innerR + ringWidth - arrowWidth / 2)*0.707) + arrowWidth /2;
    arrowCWYOffset = - Math.round((innerR + ringWidth + arrowWidth / 2)*0.707) - arrowWidth;
    arrowCCWXOffset = - Math.round((innerR + ringWidth + arrowWidth / 2)*0.707) + arrowWidth /2;
    arrowCCWYOffset = - Math.round((innerR + ringWidth - arrowWidth / 2)*0.707) - arrowWidth;

    arrowsSix.forEach(function(arrow) {
        ws.appendChild(arrow);
    });

    // The transform attribute gets set in resetPose()
}


function startGhost(evt) {
    var ws = document.getElementById("workspace");
    ghost.setAttribute("x1",0);
    ghost.setAttribute("x2",0);
    ghost.setAttribute("y1",0);
    ghost.setAttribute("y2",0);
    targetFixedX = evt.offsetX;
    targetFixedY = evt.offsetY;
    ws.setAttribute("onmousemove", "drawGhost(evt)");
    if (isOneTouch) {
        ws.setAttribute("onclick", "targetMoveEE(evt)");
    }
    else {
        ws.setAttribute("onmouseup", "targetMoveEE(evt)");
    }
}


function drawGhost(evt) {
    ghost.setAttribute('x1', targetFixedX);
    ghost.setAttribute('y1', targetFixedY);
    ghost.setAttribute('x2', evt.offsetX);
    ghost.setAttribute('y2', evt.offsetY);

    var deltaX = evt.offsetX - targetFixedX;
    var deltaY = evt.offsetY - targetFixedY;
    var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    angle -= 90;
    if (angle > 180)
        angle -= 360;
    if (angle < -180)
        angle += 360;

    if(checkGoal(targetFixedX, targetFixedY, targetPos[0], targetPos[1], angle, targetRot)){
        target.setAttribute("stroke-dasharray", "10, 5");
        target.style.stroke = targetGreen;
    }
    else {
        target.removeAttribute("stroke-dasharray");
        target.style.stroke = targetRed;
    }
}

function targetMoveEE(evt) {
    var ws = document.getElementById("workspace");
    console.log("moving");
    ws.removeAttribute("onmousemove");
    target.removeAttribute("stroke-dasharray");
    pos = [targetFixedX, targetFixedY];
    var deltaX = evt.offsetX - targetFixedX;
    var deltaY = evt.offsetY - targetFixedY;
    var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    angle -= 90;
    rot = angle;
    if (rot > 180)
        rot -= 360;
    if (rot < -180)
        rot += 360;

    resetPose();
    if(checkGoal(pos[0], pos[1], targetPos[0], targetPos[1], rot, targetRot)){
        success();
    }


    if (isOneTouch)
        ws.setAttribute("onclick", "startGhost(evt)");

}

function resetPose() {
    var x = 0;
    var y = 0;
    ee.setAttribute("points", (x-triWidth/2)+","+(y-triHeightDiff)+","+(x+triWidth/2)+","+(y-triHeightDiff)+","+(x)+","+
        (y+innerR - pointOffset));
    moveObject(ee, pos[0], pos[1], rot);
    if(ring) {
        moveObject(ring, pos[0], pos[1], rot);
    }

    if(arrows){
        moveObjectAndScale(arrowRight, pos[0] + arrowRightXOffset, pos[1] + arrowRightYOffset, 0, scale);
        moveObjectAndScale(arrowLeft, pos[0] + arrowLeftXOffset, pos[1] + arrowLeftYOffset, 180, scale);
        moveObjectAndScale(arrowUp, pos[0] + arrowUpXOffset, pos[1] + arrowUpYOffset, -90, scale);
        moveObjectAndScale(arrowDown, pos[0] + arrowDownXOffset, pos[1] + arrowDownYOffset, 90, scale);
    }
    if(arrowsSix){
      var center = [105,105];
      moveObjectAndScale(arrowRight, center[0] + arrowRightXOffset, center[1] + arrowRightYOffset, 0, scale);
      moveObjectAndScale(arrowLeft, center[0] + arrowLeftXOffset, center[1] + arrowLeftYOffset, 180, scale);
      moveObjectAndScale(arrowUp, center[0] + arrowUpXOffset, center[1] + arrowUpYOffset, -90, scale);
      moveObjectAndScale(arrowDown, center[0] + arrowDownXOffset, center[1] + arrowDownYOffset, 90, scale);
      arrowCCW.setAttribute("transform", "translate(" + (center[0] + arrowCCWXOffset) + " " + (center[1] + arrowCCWYOffset) + ") rotate(" + (135) + " " + 0 + " " + 0 + ") scale(" + scale + ")" );
      arrowCW.setAttribute("transform", "translate(" + (center[0] + arrowCWXOffset) + " " + (center[1] + arrowCWYOffset) +") rotate(" + (45) + " " + 0 + " " + 0 + ") scale(" + scale + ")" );
    }
    /*
    if(trajArrows){
        trajArrows.forEach(function (arrow) {
            moveObject(arrow, pos[0], pos[1], 0);

        });
    }

    if(trajNums){
        trajNums.forEach(function (num) {
            moveObject(num, pos[0], pos[1], 0);
        });
    }*/

    if(checkGoal(pos[0], pos[1], targetPos[0], targetPos[1], rot, targetRot)){
        target.style.stroke = targetGreen;
    }
    else{
        target.style.stroke = targetRed;
    }

}


function startDrag(evt, direction) {
    console.log("drag starts");
    isTranslating = true;
    var ws = document.getElementById("workspace");
    var rect = ws.getBoundingClientRect();
    var mouseX = evt.clientX - rect.left;
    var mouseY = evt.clientY - rect.top;
    refPos = [mouseX, mouseY];
    startPos = pos;

    // this is for controlType = "drag"
    if (direction == undefined ) {
        ws.setAttributeNS(null, "onmousemove", "drag(evt)");

        if (isOneTouch)
            ee.setAttributeNS(null, "onclick", "stopDrag(evt)");
        else
            ws.setAttributeNS(null, "onmouseup", "stopDrag(evt)");
        ee.style.fill = "#9EE";
    }
    // This is for controlTypes involving arrows
    else {
        if(controlTypes[control] == "arrowsClick"){
          ws.setAttributeNS(null, "onmousedown", "drag(evt, " + direction + ")");
        }
        if(controlTypes[control] == "arrowsHover"){
          ws.setAttributeNS(null, "onmouseover", "drag(evt, " + direction + "");
        }
        else{
          ws.setAttributeNS(null, "onmousemove", "drag(evt, " + direction + ")");
        }
        if(direction == LEFT || direction == RIGHT){
          evt.target.style.fill = "#4a4aff"
        }
        else if(direction == UP || direction == DOWN){
          evt.target.style.fill = "#ff070e"
        }
        else if(direction == CW){
          evt.target.style.fill = "#bf42f4"
        }
        else if(direction == CCW){
          evt.target.style.fill = "#4cef23"
        }
        if (isOneTouch) {
            arrows.forEach(function(arrow) {
               arrow.setAttributeNS(null, "onclick", "stopDrag(evt, " + direction + ")");
            });
            ws.setAttribute("onclick", "stopDrag(evt, " + direction + ")");
            evt.stopPropagation();
        }
        else
            ws.setAttributeNS(null, "onmouseup", "stopDrag(evt, " + direction + ")");

    }

}

function startRotate(evt) {
    isRotating = true;
    var ws = document.getElementById("workspace");
    var rect = ws.getBoundingClientRect();
    var mouseX = evt.clientX - rect.left;
    var mouseY = evt.clientY - rect.top;
    refPos = [mouseX, mouseY];
    startPos = pos;
    startRot = rot;
    var ws = document.getElementById("workspace");
    ws.setAttributeNS(null, "onmousemove", "rotate(evt)");

    if (isOneTouch) {
        ring.setAttributeNS(null, "onclick", "stopRotate(evt)");
        ws.setAttribute("onclick","stopRotate(evt)");
        evt.stopPropagation();
    }
    else
        ws.setAttributeNS(null, "onmouseup", "stopRotate(evt)");
    ring.style.stroke = "#99E";
}

function drag(evt, direction) {
    var ws = document.getElementById("workspace");
    var rect = ws.getBoundingClientRect();
    var mouseX = evt.clientX - rect.left;
    var mouseY = evt.clientY - rect.top;
    var newPoint = [mouseX, mouseY];
    var a = diff(newPoint, refPos);
    if(controlTypes[control] === "arrowsClick"){
      // Here we want to get the current position of the triangle and add a delta of motion
      // I considered making this delta inversely proportional to the distance to the goal. For example, 10px for far away, 5px increment when mid-range, 1px for when you are close (within 5px?)
      var delta = 3;
      if(direction == LEFT || direction == UP){
        a = [-delta,-delta];
      }
      else{
      a = [delta,delta];
      }
    }
    console.log(pos);

    if(direction == undefined) {
        pos = [startPos[0] + a[0], startPos[1] + a[1]];
    }
    else if(direction == RIGHT || direction == LEFT){
        pos = [startPos[0] + a[0], startPos[1]];
    }else if(direction == UP || direction == DOWN){
        pos = [startPos[0], startPos[1] + a[1]];
    }else {
        console.error("Bad direction");
    }

    console.log("moved");
    resetPose();
}

// Check if target is reached
function checkGoal(currPoseX, currPoseY, goalPoseX, goalPoseY, currRot, goalRot){
    var xErr = Math.abs(currPoseX-goalPoseX);
    var yErr = Math.abs(currPoseY-goalPoseY);
    var rotErr = Math.abs(currRot-goalRot);

    return (xErr < threshold && yErr < threshold && rotErr < threshold);


}

function rotate(evt) {
    var ws = document.getElementById("workspace");
    var rect = ws.getBoundingClientRect();
    var mouseX = evt.clientX - rect.left;
    var mouseY = evt.clientY - rect.top;
    var newPoint = [mouseX, mouseY];
    var centerPoint = pos;
    var a = diff(newPoint, refPos);
    var aUnit = [a[0]/length(a),a[1]/length(a)];
    var b = diff(newPoint, centerPoint);
    var c = diff(refPos, centerPoint);
    var cUnitOrth = [c[1]/length(c), -c[0]/length(c)];
    var alphaSign = -Math.sign(dot(cUnitOrth, b));
    var dist = dot(aUnit,b);
    var alpha1 = Math.asin(dist/length(b));
    var alpha2 = Math.asin((length(a)-dist)/length(c));
    var alpha = alphaSign*(alpha1+alpha2);
    var alphaDeg = Math.round(180.0*alpha/Math.PI);

    if (!isNaN(alpha)) {
        rot = startRot + alphaDeg;

        if (rot > 180)
            rot -= 360;
        if (rot < -180)
            rot += 360;

        resetPose();
    }
}

function dot(p1, p2) {
    return (p1[0]*p2[0])+(p1[1]*p2[1]);
}

function diff(p1, p2) {
    return [(p1[0]-p2[0]), (p1[1]-p2[1])];
}

function length(v1) {
    return Math.sqrt(Math.pow(v1[0],2) + Math.pow(v1[1],2));
}

function dist(p1, p2) {
    return Math.sqrt(Math.pow((p1[0]-p2[0]),2) + Math.pow((p1[1]-p2[1]),2));
}

function stopDrag(evt, direction) {
    if (isTranslating) {
        var ws = document.getElementById("workspace");
        ws.removeAttributeNS(null, "onmousemove");

        if (direction == undefined) {
            if (isOneTouch) {
                ee.setAttributeNS(null, "onclick", "startDrag(evt)");
            }
            else {
                ws.removeAttributeNS(null, "onmouseup");
            }
        } else {

            if (isOneTouch) {
                arrowRight.setAttributeNS(null, "onclick", "startDrag(evt, RIGHT)");
                arrowLeft.setAttributeNS(null, "onclick", "startDrag(evt, LEFT)");
                arrowUp.setAttributeNS(null, "onclick", "startDrag(evt, UP)");
                arrowDown.setAttributeNS(null, "onclick", "startDrag(evt, DOWN)");
            }
            else {
                ws.removeAttributeNS(null, "onmouseup");
            }
            arrowRight.style.fill = "#181acc";
            arrowLeft.style.fill = "#181acc";
            arrowUp.style.fill = "#cc070e";
            arrowDown.style.fill = "#cc070e";
            arrowCW.style.fill = "#a442f4";
            arrowCCW.style.fill = "#36bc3d";
        }

        if(checkGoal(pos[0], pos[1], targetPos[0], targetPos[1], rot, targetRot)){
            success(); }
        ee.style.fill = "#ACC";
        isTranslating = false;
    }
}

function stopRotate(evt, direction) {
    if (isRotating) {
        var ws = document.getElementById("workspace");
        ws.removeAttributeNS(null, "onmousemove");
        if (isOneTouch) {
            ring.setAttributeNS(null, "onclick", "startRotate(evt)");
            ws.removeAttributeNS(null, "onclick");
        }
        else
            ws.removeAttributeNS(null, "onmouseup");
        isRotating = false;
        ring.style.stroke = "#AAC";
        if(checkGoal(pos[0], pos[1], targetPos[0], targetPos[1], rot, targetRot)){
            success();
        }
    }
}

function continuousMove(x, y) {

}

function clearWorkspace() {
    var ws = document.getElementById("workspace");
    while(ws.hasChildNodes()){
        ws.removeChild(ws.firstChild);
    }
    ws.removeAttribute("onmousemove");
    ws.removeAttribute("onclick");
    ws.removeAttribute("onmousedown");
    ws.removeAttribute("onmouseup");
}

function moveObject(object, x, y, theta) {
    object.setAttribute("transform", "translate(" + x + " " + y + ") rotate(" + theta + " " + 0 + " " + 0 + ")");
    // This is where you can log the object, and how it is moving
}

function moveObjectAndScale(object, x, y, theta, scale) {
    object.setAttribute("transform", "translate(" + x + " " + y + ") rotate(" + theta + " " + 0 + " " + 0 + ") scale(" + scale + ")" );
    // This is where you can log the object, and how it is moving
}


function success() {
    target.style.stroke = targetGreen;
    score++;
    clearWorkspace();
    createEE();
    console.log("SUCCESS!");
}
