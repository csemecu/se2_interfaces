/**
 * ee.js
 * The end effector that needs to be re-configured.
 * Represented by a triangle.
 */

var control = 0;
var controlTypes = ["arrows", "drag", "target", "arrowsClick", "arrowsHover"];


var ee = null;
var ring = null;
var target = null;

var score = 0;

var isTranslating = false;
var isRotating = false;
var refPos = [0,0];
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

// Additional variables used by arrowClick and arrowHover
var arrowCW;
var arrowCCW;
var arrowCWXOffset;
var arrowCWYOffset;
var arrowCCWXOffset;
var arrowCCWYOffset;
var arrowsSix;
var circleRight;
var circleLeft;
var circleUp;
var circleDown;
var circleCW;
var circleCCW;


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
        ee.setAttributeNS(null, "onmousedown", "startDrag(evt)");
        createRing();
    }
    else if (controlTypes[control] === "arrows") {
        createRing();
        createArrows();
        arrowRight.setAttribute("onmousedown", "startDrag(evt, RIGHT)");
        arrowLeft.setAttribute("onmousedown", "startDrag(evt, LEFT)");
        arrowUp.setAttribute("onmousedown", "startDrag(evt, UP)");
        arrowDown.setAttribute("onmousedown", "startDrag(evt, DOWN)");
    }
    else if (controlTypes[control] === "target") {
      createGhost();
      ws.setAttribute("onmousedown", "startGhost(evt)");
    }
    else if (controlTypes[control] === "arrowsClick") {
        createSixArrows();
        circleRight.setAttribute("onmousedown", "startDrag(evt, RIGHT)");
        circleLeft.setAttribute("onmousedown", "startDrag(evt, LEFT)");
        circleUp.setAttribute("onmousedown", "startDrag(evt, UP)");
        circleDown.setAttribute("onmousedown", "startDrag(evt, DOWN)");
        circleCW.setAttribute("onmousedown", "startRotate2(evt,CW)");
        circleCCW.setAttribute("onmousedown", "startRotate2(evt,CCW)");
    }
    else if (controlTypes[control] === "arrowsHover") {
        createSixArrows();
        circleRight.setAttribute("onmouseover", "startDrag(evt, RIGHT)");
        circleLeft.setAttribute("onmouseover", "startDrag(evt, LEFT)");
        circleUp.setAttribute("onmouseover", "startDrag(evt, UP)");
        circleDown.setAttribute("onmouseover", "startDrag(evt, DOWN)");
        circleCW.setAttribute("onmouseover", "startRotate2(evt,CW)");
        circleCCW.setAttribute("onmouseover", "startRotate2(evt,CCW)");
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
    var ws = document.getElementById("controlPanel");
    var center = [135,135];
    var fittsDist = 55;

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
    arrowCCW.style.fill = "#a442f4";
    //arrowCCW.style.fill = "#36bc3d";// for now when clicked = #4cef23

    arrowRightXOffset = fittsDist - arrowLengthTot/2;
    arrowRightYOffset = - arrowWidth/2;
    arrowLeftXOffset = - fittsDist + arrowLengthTot/2;
    arrowLeftYOffset =  arrowWidth/2;
    arrowUpXOffset = - arrowWidth/2;
    arrowUpYOffset = - fittsDist + arrowLengthTot/2;
    arrowDownXOffset = arrowWidth/2;
    arrowDownYOffset = fittsDist - arrowLengthTot/2;
    arrowCWXOffset = Math.round(1.5*fittsDist - arrowWidth*0.707/2);
    arrowCWYOffset = - Math.round(1.5*fittsDist) - arrowWidth;
    arrowCCWXOffset = - Math.round(1.5*fittsDist - arrowWidth);
    arrowCCWYOffset = - Math.round(1.5*fittsDist) - arrowWidth/2;

    // parameters: (object, x, y, theta, scale)

    circleRight = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleRight.setAttribute("r","35");
    circleRight.setAttribute("fill","yellow");
    circleLeft = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleLeft.setAttribute("r","35");
    circleLeft.setAttribute("fill","yellow");
    circleUp = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleUp.setAttribute("r","35");
    circleUp.setAttribute("fill","cyan");
    circleDown = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleDown.setAttribute("r","35");
    circleDown.setAttribute("fill","cyan");
    circleCW = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleCW.setAttribute("r","35");
    circleCW.setAttribute("fill","black");
    circleCCW = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleCCW.setAttribute("r","35");
    circleCCW.setAttribute("fill","black");

    moveObjectAndScale(circleRight, center[0] + fittsDist , center[1] , 0, scale);
    moveObjectAndScale(circleLeft, center[0] - fittsDist , center[1] , 0, scale);
    moveObjectAndScale(circleUp, center[0] , center[1] - fittsDist , 0, scale);
    moveObjectAndScale(circleDown, center[0] , center[1] + fittsDist , 0, scale);
    moveObjectAndScale(circleCW, center[0] + 1.5*fittsDist , center[1] - 1.5*fittsDist , 0, scale);
    moveObjectAndScale(circleCCW, center[0] - 1.5*fittsDist , center[1] - 1.5*fittsDist , 0, scale);

    ws.appendChild(circleRight);
    ws.appendChild(circleLeft);
    ws.appendChild(circleUp);
    ws.appendChild(circleDown);
    ws.appendChild(circleCW);
    ws.appendChild(circleCCW);

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
    ws.setAttribute("onmouseup", "targetMoveEE(evt)");
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
      var center = [135,135];  // TO-DO this should be placed in a different element, not inside "workspace"
      // parameters: (object, x, y, theta, scale)
      moveObjectAndScale(arrowRight, center[0] + arrowRightXOffset, center[1] + arrowRightYOffset, 0, scale);
      moveObjectAndScale(arrowLeft, center[0] + arrowLeftXOffset, center[1] + arrowLeftYOffset, 180, scale);
      moveObjectAndScale(arrowUp, center[0] + arrowUpXOffset, center[1] + arrowUpYOffset, -90, scale);
      moveObjectAndScale(arrowDown, center[0] + arrowDownXOffset, center[1] + arrowDownYOffset, 90, scale);
      arrowCCW.setAttribute("transform", "translate(" + (center[0] + arrowCCWXOffset) + " " + (center[1] + arrowCCWYOffset) + ") rotate(" + (135) + " " + 0 + " " + 0 + ") scale(" + scale + ")" );
      arrowCW.setAttribute("transform", "translate(" + (center[0] + arrowCWXOffset) + " " + (center[1] + arrowCWYOffset) +") rotate(" + (45) + " " + 0 + " " + 0 + ") scale(" + scale + ")" );
    }

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
        ws.setAttributeNS(null, "onmouseup", "stopDrag(evt)");
        ee.style.fill = "#9EE";
    }
    // This is for controlTypes involving arrows
    else {
        if(controlTypes[control] == "arrows"){
            ws.setAttributeNS(null, "onmousemove", "drag(evt, " + direction + ")");
            ws.setAttributeNS(null, "onmouseup", "stopDrag(evt, " + direction + ")");
        }
        if(controlTypes[control] == "arrowsClick"){
            ws.setAttributeNS(null,"onmousedown","move2(" + direction + ")");
            //ws.setAttributeNS(null, "onmousedown", "move2(evt, " + direction + ")");
            //ws.setAttributeNS(null, "onmouseup", "stopDrag(evt, " + direction + ")");
            let clicked = true;
            const move = window.setInterval(function() {
                if(clicked) {
                    //console.log("pos = " + pos);
                    move2(direction);
                    startPos = pos;
                }
            }, 50);
            evt.target.addEventListener("mouseup", function() {
                clicked = false;
                circleRight.style.fill = "yellow";
                circleLeft.style.fill = "yellow";
                circleUp.style.fill = "cyan";
                circleDown.style.fill = "cyan";
                if(checkGoal(pos[0], pos[1], targetPos[0], targetPos[1], rot, targetRot)){
                    success(); }
                ee.style.fill = "#ACC";
            });
            evt.stopPropagation();
        }
        if(controlTypes[control] == "arrowsHover"){
            ws.setAttributeNS(null,"onmouseover","move2(" + direction + ")");
            //ws.setAttributeNS(null, "onmouseover", "move2(evt, " + direction + ")");
            //ws.setAttributeNS(null, "onmouseout", "stopDrag(evt, " + direction + ")");
            let hover = true;
            const move = window.setInterval(function() {
                if(hover) {
                    //console.log("pos = " + pos);
                    move2(direction);
                    startPos = pos;
                }
            }, 50);
            evt.target.addEventListener("mouseout", function() {
                hover = false;
                circleRight.style.fill = "yellow";
                circleLeft.style.fill = "yellow";
                circleUp.style.fill = "cyan";
                circleDown.style.fill = "cyan";
                if(checkGoal(pos[0], pos[1], targetPos[0], targetPos[1], rot, targetRot)){
                    success(); }
                ee.style.fill = "#ACC";
            });
            evt.stopPropagation();
        }
        if(direction == LEFT || direction == RIGHT){
            evt.target.style.fill = "#4a4aff"
        }
        else if(direction == UP || direction == DOWN){
            evt.target.style.fill = "#ff070e"
        }
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
    ws.setAttributeNS(null, "onmouseup", "stopRotate(evt)");
    ring.style.stroke = "#99E";
}

function startRotate2(evt, direction) {
    isRotating = true;
    startPos = pos;
    startRot = rot;
    var ws = document.getElementById("workspace");
    if(controlTypes[control] == "arrowsClick"){
        ws.setAttributeNS(null,"onmousedown","rotate2(" + direction + ")");
        //ws.setAttributeNS(null, "onmousedown", "rotate(evt, " + direction + ")");
        //ws.setAttributeNS(null, "onmouseup", "stopRotate2(evt, " + direction + ")");
        let clicked = true;
        const move = window.setInterval(function() {
            if(clicked) {
                //console.log("pos = " + pos);
                rotate2(direction);
                startPos = pos;
                startRot = rot;
            }
        }, 50);
        evt.target.addEventListener("mouseup", function() {
            clicked = false;
            circleCW.style.fill = "black";
            circleCCW.style.fill = "black";
            if(checkGoal(pos[0], pos[1], targetPos[0], targetPos[1], rot, targetRot)){
            success();
            }
        });
        evt.stopPropagation();
    }
    if(controlTypes[control] == "arrowsHover"){
        ws.setAttributeNS(null,"onmouseover","rotate2(" + direction + ")");
        //ws.setAttributeNS(null, "onmouseover", "rotate(evt, " + direction + ")");
        //ws.setAttributeNS(null, "onmouseout", "stopRotate2(evt, " + direction + ")");
        let hover = true;
        const move = window.setInterval(function() {
            if(hover) {
                //console.log("pos = " + pos);
                rotate2(direction);
                startPos = pos;
                startRot = rot;
            }
        }, 50);
        evt.target.addEventListener("mouseout", function() {
            hover = false;
            circleCW.style.fill = "black";
            circleCCW.style.fill = "black";
            if(checkGoal(pos[0], pos[1], targetPos[0], targetPos[1], rot, targetRot)){
            success();
            }
        });
        evt.stopPropagation();
    }
    if(direction == CW){
        evt.target.style.fill = "#bf42f4"
    }
    else if(direction == CCW){
        evt.target.style.fill = "#bf42f4"
    }
    //ws.setAttributeNS(null, "onmouseup", "stopRotate2(evt)");
}

function move2(direction){
    var ws = document.getElementById("workspace");
    var a = 0;
    var delta = 1;
    if(direction == LEFT || direction == UP){
        a = [-delta,-delta];
    }
    else{
        a = [delta,delta];
    }
    if(direction == RIGHT || direction == LEFT){
        pos = [startPos[0] + a[0], startPos[1]];
    }
    else if(direction == UP || direction == DOWN){
        pos = [startPos[0], startPos[1] + a[1]];
    }
    else {
        console.error("Bad direction");
    }

    console.log("moved");
    resetPose();
}

function drag(evt, direction) {
    var ws = document.getElementById("workspace");
    var rect = ws.getBoundingClientRect();
    var mouseX = evt.clientX - rect.left;
    var mouseY = evt.clientY - rect.top;
    var newPoint = [mouseX, mouseY];
    var a = diff(newPoint, refPos);

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

    console.log("dragged");
    resetPose();
}

// Check if target is reached
function checkGoal(currPoseX, currPoseY, goalPoseX, goalPoseY, currRot, goalRot){
    var xErr = Math.abs(currPoseX-goalPoseX);
    var yErr = Math.abs(currPoseY-goalPoseY);
    var rotErr = Math.abs(currRot-goalRot);

    return (xErr < threshold && yErr < threshold && rotErr < threshold);


}

function rotate2(direction){
    var alphaDeg = 0;
    if(direction == CW){

        alphaDeg = 1;
    }
    else if(direction == CCW){
        alphaDeg = -1;
    }
    rot = startRot + alphaDeg;

        if (rot > 180)
            rot -= 360;
        if (rot < -180)
            rot += 360;
        console.log("rotated, ", rot);
        resetPose();
}


function rotate(evt, direction) {
    var newPoint = [0,0];
    var delta = 1.75;
    var alpha = 0.0;
    if(direction == undefined){
      // This was the original rotate method with the undefined direction part
      var ws = document.getElementById("workspace");
      var rect = ws.getBoundingClientRect();
      var mouseX = evt.clientX - rect.left;
      var mouseY = evt.clientY - rect.top;
      newPoint = [mouseX, mouseY];
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
      alpha = alphaSign*(alpha1+alpha2);
      var alphaDeg = Math.round(180.0*alpha/Math.PI);
    }
    else if(direction == CW){
      alphaDeg = 1;
    }
    else if(direction == CCW){
      alphaDeg = -1;
    }
    if (!isNaN(alpha)) {
        rot = startRot + alphaDeg;

        if (rot > 180)
            rot -= 360;
        if (rot < -180)
            rot += 360;
        console.log(rot);
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
        ws.removeAttributeNS(null, "onmouseup");
        arrowRight.style.fill = "#181acc";
        arrowLeft.style.fill = "#181acc";
        arrowUp.style.fill = "#cc070e";
        arrowDown.style.fill = "#cc070e";
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
        ws.removeAttributeNS(null, "onmouseup");
        isRotating = false;
        ring.style.stroke = "#AAC";
        if(checkGoal(pos[0], pos[1], targetPos[0], targetPos[1], rot, targetRot)){
            success();
        }
    }
}

function stopRotate2(evt, direction) {
    if (isRotating) {
        var ws = document.getElementById("workspace");
        if(controlTypes[control] == "arrowsClick"){
            ws.removeAttributeNS(null, "onmousedown");
            ws.removeAttributeNS(null, "onmouseup");
        }
        if(controlTypes[control] == "arrowsHover"){
            ws.removeAttributeNS(null, "onmouseover");
            ws.removeAttributeNS(null, "onmouseout");
        }
        isRotating = false;
        arrowCW.style.fill = "#a442f4";
        arrowCCW.style.fill = "#36bc3d";
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
    ws.removeAttribute("onmouseover");
    ws.removeAttribute("onmouseout");
    sixArrows = null;
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
