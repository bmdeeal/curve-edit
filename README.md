# curve-edit
curve-edit is a simple editor written in JavaScript to make 2D curves for POV-Ray objects.

I wrote this due to the fact that many of the tools I've seen for POV-Ray are quite old, and a lot of them aren't available anymore or otherwise cannot run on modern systems.

## Usage
Double-click to add a point. The point will be inserted after the selected point, or after the last point if none is selected. You can drag points to move them around. To insert the generated data into your scene, copy the data from the 'POV-Ray list:' text area into a lathe block. The object in POV-Ray will be revolved around the right edge of the curve-edit screen.

You can import and export data in curve-edit format via the 'Raw points:' text area. To load new data, paste it into the text area and click 'Load from textbox'. You currently cannot import data in POV-Ray format, only export it. Data is automatically updated whenever points are modified.

## TODO list
* cubic spline mode
* support for other object types that require a 2D curve (eg, prisms, polygons), including emitting the other information needed
* option to generate a default material
* auto-align mode on export to make object positions more reasonable
