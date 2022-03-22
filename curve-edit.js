/*
	curve-edit -- tool to generate linear curves for POV-Ray
	(c) 2022 B.M.Deeal.
	curve-edit is distributed under the terms of the ISC License, see the provided license.txt or visit <https://opensource.org/licenses/ISC> for details.
	
	This is curve-edit version 0.1-alpha.
	TODO:
	* we assume all values are 0-255 but like, is that ever well defined anywhere?
*/

"use strict";
var canvas;
var ctx;
var data_pov;
var data_raw;
var points=[];
var TAU=Math.PI*2;
var dragging=false;
var drag_item=-1;
var handle_size=6;

function init() {
	data_pov.value="//Nothing here yet."
	data_raw.value=""
	redraw();
}

//convert a 0 to 512 number to a 0.0-1.0 one
function numToFloat(num) {
	return num/512;
}

//generate data you can copy into POV-Ray
//TODO: fromPOVFormat, which probably won't be too hard to write, but more work than I'd like
function toPOVFormat() {
	data_pov.value="linear_spline " + String(points.length) + "\n";
	for (var ii=0; ii<points.length; ii++) {
		data_pov.value+="<"+String(1-numToFloat(points[ii].x))+", "+String(1-numToFloat(points[ii].y))+">";
		if (ii!=points.length-1) {
			data_pov.value+=",";
		}
		data_pov.value+="\n";
	}
}

//reset the list of points
function resetPoints() {
	points=[];
	redraw();
}

//look for a point where the mouse is and begin a drag if found
function checkDrag(e) {
	console.log("checking drag");
	var mouse_pos=getMouseXY(e);
	console.log(getStringXY(mouse_pos));
	for (let ii=0; ii<points.length; ii++) {
		if (mouse_pos.x>points[ii].x-handle_size && mouse_pos.x<points[ii].x+handle_size && mouse_pos.y>points[ii].y-handle_size && mouse_pos.y<points[ii].y+handle_size) {
			dragging=true;
			drag_item=ii;
			return;
		}
	}
}

//if we're dragging, keep updating the position of the point
function doDrag(e) {
	if (dragging) {
		console.log("dragging");
		var mouse_pos=getMouseXY(e);
		points[drag_item]=mouse_pos;
		console.log(getStringXY(mouse_pos));
		redraw();
	}
}

//drop the point if we're done dragging, update the list
function endDrag(e) {
	if (dragging) {
		console.log("ending drag");
		var mouse_pos=getMouseXY(e);
		console.log(getStringXY(mouse_pos));
		dragging=false;
		redraw();
	}
}

//draw everything over
function redraw() {
	//blank everything
	ctx.clearRect(0,0,canvas.width,canvas.height);
	//draw background grid
	ctx.strokeStyle = "#888888";
	ctx.beginPath();
	ctx.moveTo(0,canvas.height/2);
	ctx.lineTo(canvas.width,canvas.height/2);
	ctx.moveTo(canvas.width/2,0);
	ctx.lineTo(canvas.width/2,canvas.height);
	ctx.stroke();
	ctx.strokeStyle = "#888888";
	//draw the curve
	var prev_pos;
	for (let ii=0; ii<points.length; ii++) {
		//edge case on first point with line drawing
		if (ii==0) {
			prev_pos=points[0]
		}
		else {
			prev_pos=points[ii-1];
		}
		var current_pos=points[ii];
		//draw lines
		ctx.strokeStyle= "#000000";
		ctx.beginPath();
		ctx.moveTo(prev_pos.x,prev_pos.y);
		ctx.lineTo(current_pos.x,current_pos.y);
		ctx.stroke()
		//draw control points
		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.arc(current_pos.x,current_pos.y,handle_size,0,TAU);
		ctx.fill();
	}
	toPOVFormat();
}

function getMouseXY(e) {
	var rect=canvas.getBoundingClientRect();
	return {x: e.clientX-rect.left, y: e.clientY-rect.top};
}

//convert an object that has x,y parameters to a string
function getStringXY(item) {
	return String(item.x)+", "+String(item.y);
}

//TODO: add new data from the raw points list, assuming I keep that feature
function updateData() {
	var number_list = data_raw.value.split("\n");
	for (var ii=0; ii < number_list.length; ii++) {
		number_list[ii] = number_list[ii].split(" ");
	}
	redraw();
	console.log(number_list);
}


function addPoint(e) {
	//for some reason, this gets called twice?
	if (e===undefined) {
		return;
	}
	console.log("asdf")
	console.log(e);
	var mouse_pos=getMouseXY(e);
	console.log(mouse_pos);
	points.push({x:mouse_pos.x, y:mouse_pos.y});
	redraw();
}

//initialize everything once the page has loaded
document.addEventListener("DOMContentLoaded", function(event) {
	canvas = document.getElementById("canvas_main");
	canvas.addEventListener("dblclick", addPoint);
	canvas.addEventListener("mousedown", checkDrag);
	canvas.addEventListener("mousemove",doDrag);
	canvas.addEventListener("mouseup", endDrag);
	ctx = canvas.getContext("2d");
	data_raw = document.getElementById("text_raw");
	data_pov = document.getElementById("text_pov");
	init();
});