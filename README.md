# NENES.js

NENES is a game engine that I'm developing using p5.js so that I can make little games more easily.
Discalimer this engine is heavily reliant on p5.js which is an amazing library that just makes things easier, check it out here: https://p5js.org/

# How to use NENES

Now. Bare with me, I dont know how to make a real library (yet), but you can sort of use this like one.

To use it, you need to download NENES.js, and p5.js: https://github.com/processing/p5.js/releases/download/0.7.2/p5.min.js
and include them as scripts in your html file.
```html
<html>
  <head>
      <meta charset="UTF-8">
      <title>RGE</title>

      <style type="text/css">
      body {margin:0; padding:0;}
      canvas {display:block;}
      </style>

      <script src="p5.min.js" type="text/javascript"></script>
      <script src="NENES.js" type="text/javascript"></script>
      <script src="program.js" type="text/javascript"></script>
  </head>
</html>
```

Next you need to make a new .js file and call it whatever you want, and also include it in your html file.
(in the example above the file is called "program.js")

To set up your program you need to add a couple of things:
```javascript
function init_() {
  // your code here
}

function draw_() {
  cls('00');
  
  // your code here
}
```
These functions work the exact same as the setUp() and draw() functions in p5.js
(because they are literally inside setUp() and draw() in NENES.js)

# functions

NENES.js has a bunch of really useful functions that make making a retro looking game a lot easier.

## 1. spr()

This is probably the most important function as it is how you draw a sprites to the canvas.
More information about how to create a spritesheet can be found here: *WIP*

##### Syntax
```javascript
spr(frame, x, y, [w], [h], [d])
```
### Parameters
##### frame: 
  the sprite number.
##### x: 
  the x coordinate that the top right corner of the sprite will be placed
##### y: 
  the y coordinate that the top right corner of the sprite will be placed
##### w:
  how many sprites across from the spritesheet should be displayed (optional)
##### h:
  how many sprites down from the spritesheet should be displayed (optional)
##### d:
  weather or not the image is flipped (either true or false) (optional)

## 2. put()

More information about how colours work can be found here: *WIP*

```javascript
put(string, x, y, clr)
```
##### Parameters
  string: what to print on the screen
##### x:
  x coordinate
##### y:
  y coordinate
##### clr: 
  the NES colour that it will print in (#'s from 0-63 or their hex code eg. 64='3f')
(if no colour is provided than it will default to black, and if no coordinates are provided it will print at 0,0 or the end of the last call of put() with no coordinates.)

## 3. cls()

generally at the beginning of draw_()

```javascript
cls(clr)
```
##### clr:
  the NES colour that the background will clear in (#'s from 0-63 or their hex code eg. 64='3f')

## 4. btn()

```javascript
btn(n)
```

btn() returns true if control[n] is pressed; where control is an array of keycodes that you can set in init_()
or use the default configuration:
  0: w 1: s 2: a 3: d 4: space 5: enter

## 5. add() & del()
```javascript
add(array, index) // attaches index to the end of array
del(array, index) // deletes index from array
```

## 6. palset() & palget()
```javascript
palset(palette) // sets the current palette to palette
palget() // returns the current palette
```

a palette is an 8-digit array of numbers which represent NES colours

## 7. lset() & lget & setNumberOfLayers()
Layers are used to draw sprites behind or on top of other sprite 
(for example you'd want your player in the foreground and the map in the background)

```javascript
setNumberOfLayers(n) //called in init_() creates n layers for sprites to be drawn on
                     //the default is 2 layers 0: background 1: foreground
lset(n) // sets the current layer to n
lget() // returns the current layer
```

# To do: displaying and using maps
