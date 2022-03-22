# curve-edit
curve-edit is a simple editor written in JS to make lathe objects for POV-Ray.

I wrote this due to the fact that many of the tools I've seen for POV-Ray are quite old, and a lot of them aren't available anymore or otherwise cannot run on modern systems.

## Usage
Double-click to add a point. You can drag points to move them around. Copy the data from the 'POV-Ray list:' text area into a lathe block. The object drawn will be revolved around the right edge of the curve-edit screen.

## TODO list
* re-import data for later editing (either with the raw points table that isn't hooked up or by reading the POV-Ray format proper)
* selecting points so they can be deleted
* adding points after the current one and not just the last (might make it so that points are added after the currently selected one?)
* cubic spline display mode? mightn't be hard
* solid curve mode (adds a final point to the output that automatically joins back to the first point)
