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
      <title>NENES</title>

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
  setSpriteSheet(/*your sprite sheet data (must be an array)*/);
  
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
spr(frame, x, y, [w], [h], [direction])
```
### Parameters
##### frame: 
  (0-255) which 16x16 tile of the 256-pixel sprite-sheet to be loaded and displayed.
##### x & y: 
  X & Y coordinates for the top left corner of the sprite.
##### w:
  The number of tiles wide that will be displayed, starting from the tile indicated with spriteNumber.
##### h:
  The number of tiles high that will be displayed, starting from the tile indicated with spriteNumber.
##### direction:
  (true: mirrored, false: not mirrored) Whether or not the sprite will be drawn mirrored.

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
(if no colour is provided than it will default to black, and if no coordinates are provided it will print at the end of the last call of put())

## 3. cls()

generally at the beginning of draw_()

```javascript
cls(clr)
```
##### clr:
  the NES colour that the background will clear in (#'s from 0-63 or their hex code eg. 64='3f')

## 4. btn()

```javascript
btn(n, player)
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

# How sprite data is handled

Currently, the sprite data is a 256x256 long array with numbers from 0-9, 9 being transparent, and numbers 0-7 corresponding to palette that is currently set.
Right now I use a seperate .js file to store the sprite data as a global variable, since that much text laggs my editor
Unfortunately at the moment it's really hard for someone else to convert a png image into sprite data, right now I have my own converter but it requires a specific photoshop palette to draw the sprites, and I just drag and drop the files into the converter master file.
I'm working on a more user friendly converter, and hosting that on a realy website to upload png's to.

# To do: displaying and using maps
