//     dMMMMb  dMMMMMP dMMMMb  dMMMMMP .dMMMb
//    dMP dMP dMP     dMP dMP dMP     dMP" VP
//   dMP dMP dMMMP   dMP dMP dMMMP    VMMMb
//  dMP dMP dMP     dMP dMP dMP     dP .dMP
// dMP dMP dMMMMMP dMP dMP dMMMMMP  VMMMP"

// Not Exactly NES 0.1.2
// by sweatersjpg

let WD;
let D = { W: 400, H: 240, S: 0}
let PAL = [
  '#67676f','#0007aa','#1f00b6','#43008e','#7f0077','#a6003f','#960000','#6f2f00',
  '#433b00','#005f00','#00a62f','#005f4f','#003b7f','#000000','#000000','#000000',
  '#b6b6be','#0057f6','#1737fe','#6f00e2','#ae00c6','#e6007f','#e60700','#ca4f00',
  '#8e7700','#1f9600','#00a62f','#008e67','#007fc2','#000000','#000000','#000000',
  '#fefefe','#27aefe','#5f6ffe','#9e6ffe','#ce4ffe','#fe2fde','#fe6f67','#fe961f',
  '#ceaa00','#6fd600','#00e647','#17e69e','#00cede','#474747','#000000','#000000',
  '#fefefe','#aecefe','#b6befe','#ceaefe','#f69efe','#feaee6','#fec6d6','#f6cfae',
  '#fef6ae','#d6fea6','#96fe96','#9efeee','#6feaf6','#8e8e8e','#000000','#000000'
]
const WHITE = '30';
const BLACK = '3f';
let BC;
let AB = [
  '0','1','2','3','4','5','6','7','8','9','!','"','#','$','%','&',
  "'",'(',')','*','+',',','-','.','/',':',';','<','=','>','?','@',
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p',
  'q','r','s','t','u','v','w','x','y','z','[','~',']','^','_',"'"
]
const FRAMERATE = 30;
let controls = [87, 83, 65, 68, 32, 13];
let ctr = new Array(255);
let P;
let menu;
let Draw;
let img;
let sprtsht_;
let font = new Array(64);
let pb = { paused : true, pressed : false }

function setup() {

  updateSize();
  canvasElement = createCanvas(WD.W,WD.H).elt;
  let context = canvasElement.getContext('2d');
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;

  noCursor();
  frameRate(FRAMERATE);
  resetPixels();

  Draw = new drawing();
  mouse = new mouse();
  menu = new defaultMenu();
  loadNESFont(FNT);

  if (typeof init_ !== 'undefined') init_();

}

function draw() {
  if (pause()) {
    if (typeof menu_ !== 'undefined') menu_();
    else menu.update();
  } else {
    if (typeof draw_ !== 'undefined') draw_();
    mouse.display();
  }
  img.updatePixels();
  DisplayPixels();
  showFrames();
}

//-----------------------



function btn(i) {
  return keyIsDown(controls[i]);
}

function spr(frame, x, y, w, h, d) {
  let sy = floor(floor(frame)/16)*16;
  let sx = (floor(frame)%16)*16;

  let dy = floor(y) * D.S;
  let dx = floor(x) * D.S;

  let sw = 16;
  let sh = 16;
  if(typeof w !== 'undefined') sw = w * 16;
  if(typeof h !== 'undefined') sh = h * 16;

  let dw = sw*D.S;
  let dh = sh*D.S;

  push();

  if(d == true) {
    // translate(WD.W, 0);
    scale(-1.0,1.0);
    dx*=-1;
    dx-= dw;
  }

  image(sprtsht_, dx, dy, dw, dh, sx, sy, sw, sh);

  pop();
}

function put(s, x, y, c) {
  if(typeof x == 'undefined') x = 0;
  if(typeof y == 'undefined') y = 0;
  if(typeof c == 'undefined') c = 63;
  if(typeof c == 'string') c = parseInt(c, 16);
  if(typeof s == 'string') s = s.toLowerCase();
  else s = String(s);

  let dy = 0;
  let dx = 0;
  let sw = 8;
  let dw = sw*D.S;

  for (var i = 0; i < s.length; i++) {
    let ch = charOfAB(s.charAt(i));
    if(s.charAt(i) == ' ') dx += sw;
    if(ch == -1) continue;

    let sy = floor(ch/32)*8;
    let sx = (ch%32)*8;

    if(s.charAt(i) == "~"){
      if(s.charAt(i+1) == 'n') {
        dx=0;
        dy+=sw;
        i += 1;
        continue;
      }
    }

    image(font[c], floor(x+dx)*D.S, floor(y+dy)*D.S, dw, dw, sx, sy, sw, sw);

    dx+=sw;
    if(dx > 400){
      dx = 0;
      dy += sw;
    }
  }

}

function cls(c) {
  resetPixels();
  if(typeof c == 'string') c = parseInt(c, 16);
  background(PAL[c]);
  BC = c;
}

function pget(x, y) {
  clr = getColorAtindex(img, x, y);
  if(alpha(clr) == 0) return BC;
  for (var i = 0; i < PAL.length; i++) {
    if(String(color(PAL[i])) == String(clr)) return i;
  }
}

function pset(x, y, c) {
  if(typeof c == 'string') c = parseInt(c, 16);
  setColorAtIndex(img, x, y, PAL[c]);
}

//-----------------------

function DisplayPixels() {
  image(img, 0, 0, WD.W, WD.H);
}

function resetPixels() {
  img = createImage(D.W, D.H);

  img.loadPixels();

  background(0);

  // for (var i = 0; i < PIXELS.length; i++) {
  //   PIXELS[i] = 0;
  // }
}

function loadSpriteSheet(s) {
  w = sqrt(s.length);
  sprtsht_ = createImage(w, w);
  sprtsht_.loadPixels();

  for (var y = 0; y < w; y++) {
    for (var x = 0; x < w; x++) {
      let i = x + y * w;
      if(s[i] != "##") {
        let c = parseInt(s[i], 16);
        sprtsht_.set(x, y, color(PAL[c]));
      }
    }
  }

  sprtsht_.updatePixels();
}

function loadNESFont(s) {
  let w = 256;
  let h = 16;

  for (var i = 0; i < font.length; i++) {
    font[i] = createImage(256,16);
    font[i].loadPixels();

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        let p = x + y * w;
        if(s[p] == 1) {
          font[i].set(x, y, color(PAL[i]));
        }
      }
    }

    font[i].updatePixels();
  }

}

function charOfAB(ch) {
  return AB.indexOf(ch);
}

function imageIndex(img, x, y) {
  return 4 * (x + y * img.width);
}

function getColorAtindex(img, x, y) {
  let idx = imageIndex(img, x, y);
  let pix = img.pixels;
  let red = pix[idx];
  let green = pix[idx + 1];
  let blue = pix[idx + 2];
  let alpha = pix[idx + 3];
  return color(red, green, blue, alpha);
}

function setColorAtIndex(img, x, y, clr) {
  let idx = imageIndex(img, x, y);

  let pix = img.pixels;
  pix[idx] = red(clr);
  pix[idx + 1] = green(clr);
  pix[idx + 2] = blue(clr);
  pix[idx + 3] = alpha(clr);
}

function defaultMenu() {


  this.update = function() {
    cls('3f');
    put("paused", D.W/2 - 24, D.H/2 - 4, WHITE);
  }
}

function mouse() {
  this.isShown = false;
  this.x = 0;
  this.y = 0;
  this.show = function() { this.isShown = true; }
  this.hide = function() { this.isShown = false; }
  this.display = function() {
    this.x = mouseX/D.S;
    this.y = mouseY/D.S;
    if(this.isShown) {
      Draw.Rect(this.x-1, this.y-1, 2, 2, 63);
      Draw.Rect(this.x, this.y, 0, 0, '30');
    }
  }
}

function showFrames() {
  let x = D.W - 16;
  let y = D.H - 8;
  if(pget(x, y) != 63) clr = BLACK;
  else clr = WHITE;
  put(round(frameRate()), x, y, clr);
}

function pause() {
  if (!pb.pressed & keyIsDown(27)) {
    pb.paused = !pb.paused;
    pb.pressed = true;
  } else if (!keyIsDown(27)) {
    pb.pressed = false;
  }
  return pb.paused;
}

function windowResized() {
  updateSize();
  resizeCanvas(WD.W, WD.H);
}

function updateSize() {
  WD = { W : window.innerWidth-16, H : window.innerHeight-16}
  D.S = (WD.W/D.W);
  let C_ = (WD.H/D.S);
  if (C_ < D.H) {
    D.S = (WD.H/D.H);
  }
  WD.H = D.H*D.S;
  WD.W = D.W*D.S;

}
