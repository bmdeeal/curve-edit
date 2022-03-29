/*
	curve-edit -- tool to generate linear curves for POV-Ray
	(c) 2022 B.M.Deeal.
	curve-edit is distributed under the terms of the ISC License, see the provided license.txt or visit <https://opensource.org/licenses/ISC> for details.
	
	This is curve-edit version 0.1-beta.
	TODO:
	* we assume all values are 0-512 but like, is that ever well defined anywhere?
	* how should I handle adding a point to the beginning? should I just have an option to flip the first and last point? doesn't seem intuitive, even if this program is intended for a probably technical audience
	* option to generate closed shapes
	* option to generate solid lathe objects (eg, return to 0 on the x-axis)
	* option to normalize the y-position based on the lowest one
	* generate a basic object with a material attached so you can just throw it into the scene without changes? dunno
	* smooth curve support - look into <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo> and <http://www.povray.org/documentation/view/3.7.1/60/>
*/

"use strict";
var canvas;
var ctx;
var data_pov; //data in POV-Ray format
var data_ce; //data in curve-edit format
var points=[];
var TAU=Math.PI*2;
//var dragging=false;
var drag_item=-1;
var selected_item=-1;
var handle_size=6;
var close_shape;

function init() {
	data_pov.value="//Nothing here yet.";
	data_ce.value="";
	redraw();
}

//convert a 0 to 512 number to a 0.0-1.0 one
function numCEToFloat(num) {
	return num/512;
}

//generate data you can copy into POV-Ray
function toPOVFormat() {
	//data_pov.value="//curve-edit generated data start\n"
	let check=0;
	if (close_shape.checked) {
		check=1;
	}
	data_pov.value="linear_spline " + String(points.length+check) + "\n";
	for (var ii=0; ii<points.length; ii++) {
		data_pov.value+="<"+String(1-numCEToFloat(points[ii].x))+", "+String(1-numCEToFloat(points[ii].y))+">";
		if (ii!=points.length-1) {
			data_pov.value+=",";
		}
		data_pov.value+="\n";
	}
	//data_pov.value+="//curve-edit generated data end"
	if (close_shape.checked && points.length>2) {
		data_pov.value+="<"+String(1-numCEToFloat(points[0].x))+", "+String(1-numCEToFloat(points[0].y))+">";
	}
}

//generate data in the simple curve-edit format
function toCEFormat() {
	data_ce.value="#!curve-edit-format 1\n"
	for (var ii=0; ii<points.length; ii++) {
		data_ce.value+=String(points[ii].x)+" "+String(points[ii].y)+"\n";
	}
}

//load data in the simple curve-edit format
function fromCEFormat() {
	let points_new=[]
	let data=data_ce.value.split("\n");
	selected_item=-1;
	for (var ii=0; ii<data.length; ii++) {
		data[ii]=data[ii].trim();
		if (data[ii]=="" || data[ii].charAt(0)=="#") {
			continue
		}
		let current_point=data[ii].split(" ")
		if (current_point.length != 2) {
			alert("Wrong number of values on line " + ii + "!");
			return;
		}
		let new_x=Number(current_point[0])
		let new_y=Number(current_point[1])
		if (Number.isNaN(new_x) || Number.isNaN(new_y)) {
			alert("Could not parse number on line " + ii + "!");
			return;
		}
		points_new.splice(points_new.length,0,{x:Number(current_point[0]), y:Number(current_point[1])});
	}
	points=points_new;
	redraw()
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
			//dragging=true;
			drag_item=ii;
			selected_item=ii;
			return;
		}
	}
}

//if we're dragging, keep updating the position of the point
function doDrag(e) {
	if (drag_item>=0) {
		console.log("dragging");
		var mouse_pos=getMouseXY(e);
		points[drag_item]=mouse_pos;
		console.log(getStringXY(mouse_pos));
		redraw();
	}
}

//drop the point if we're done dragging, update the list
function endDrag(e) {
	if (drag_item>=0) {
		console.log("ending drag");
		var mouse_pos=getMouseXY(e);
		console.log(getStringXY(mouse_pos));
		//dragging=false;
		drag_item=-1;
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
		let handle_scale=1
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
		//show last item (may not keep this? not sure how I might design things yet)
		if (ii==points.length-1) {
			ctx.fillStyle = "#cc0000";
		}
		//show selected item
		if (selected_item==ii) {
			ctx.fillStyle = "#0000cc";
			handle_scale=1.25
		}
		ctx.beginPath();
		ctx.arc(current_pos.x,current_pos.y,handle_size*handle_scale,0,TAU);
		ctx.fill();
	}
	//TODO: this will need a rewrite when smooth curves are added
	if (close_shape.checked) {
		ctx.strokeStyle= "#888888";
		ctx.beginPath();
		ctx.moveTo(points[points.length-1].x,points[points.length-1].y);
		ctx.lineTo(points[0].x,points[0].y);
		ctx.stroke();
	}
	
	toPOVFormat();
	toCEFormat();
}

function getMouseXY(e) {
	var rect=canvas.getBoundingClientRect();
	return {x: e.clientX-rect.left+0.5, y: e.clientY-rect.top};
}

//convert an object that has x,y parameters to a string
function getStringXY(item) {
	return String(item.x)+", "+String(item.y);
}

//add a new point to the object
function addPoint(e) {
	//for some reason, this gets called twice?
	if (e===undefined) {
		return;
	}
	console.log("asdf")
	console.log(e);
	var mouse_pos=getMouseXY(e);
	console.log(mouse_pos);
	//points.push({x:mouse_pos.x, y:mouse_pos.y});
	selected_item++;
	points.splice(selected_item,0,{x:mouse_pos.x, y:mouse_pos.y});
	//selected_item=//TODO: select the most recent point
	redraw();
}

//remove a point from the object
function removePoint() {
	if (selected_item>=0 && selected_item<points.length) {
		points.splice(selected_item, 1);
	}
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
	data_ce = document.getElementById("text_ce");
	data_pov = document.getElementById("text_pov");
	close_shape = document.getElementById("check_closed");
	init();
});