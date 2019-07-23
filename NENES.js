//     dMMMMb  dMMMMMP dMMMMb  dMMMMMP .dMMMb
//    dMP dMP dMP     dMP dMP dMP     dMP" VP
//   dMP dMP dMMMP   dMP dMP dMMMP    VMMMb
//  dMP dMP dMP     dMP dMP dMP     dP .dMP
// dMP dMP dMMMMMP dMP dMP dMMMMMP  VMMMP"

// Not Exactly NES
// by sweatersjpg

var canvasElement;
var ctx;
let WD;
let D = { W: 400, H: 240, S: 0}
const FRAMERATE = 30;
const PAL = [
  '#67676f','#0007aa','#1f00b6','#43008e','#7f0077','#a6003f','#960000','#6f2f00',
  '#433b00','#005f00','#00a62f','#005f4f','#003b7f','#000000','#000000','#000000',
  '#b6b6be','#0057f6','#1737fe','#6f00e2','#ae00c6','#e6007f','#e60700','#ca4f00',
  '#8e7700','#1f9600','#00a62f','#008e67','#007fc2','#000000','#000000','#000000',
  '#fefefe','#27aefe','#5f6ffe','#9e6ffe','#ce4ffe','#fe2fde','#fe6f67','#fe961f',
  '#ceaa00','#6fd600','#00e647','#17e69e','#00cede','#474747','#000000','#000000',
  '#fefefe','#aecefe','#b6befe','#ceaefe','#f69efe','#feaee6','#fec6d6','#f6cfae',
  '#fef6ae','#d6fea6','#96fe96','#9efeee','#6feaf6','#8e8e8e','#000000','#000000'
];
let pointer_ = { y : 0, x : 0, c : 63, ox : 0 };
const AlphaB_ = [
  '0','1','2','3','4','5','6','7','8','9','!','"','#','$','%','&',
  "'",'(',')','*','+',',','-','.','/',':',';','<','=','>','?','@',
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p',
  'q','r','s','t','u','v','w','x','y','z','[','~',']','^','_',"'"
];
let defaultControls_ = [[38,87], [40,83], [37,65], [39,68], 32, 13, 27, 9];
let controls_ = defaultControls_;
const btnlist = ['up','down','left','right','a','b','start','select'];
let nplayers = 0;
let player_ = [];
const gamepad = new Gamepad();
let gamepadbtns = [
  new Array(8),
  new Array(8),
  new Array(8),
  new Array(8)
]
let pregamepadbtns = [
  new Array(8),
  new Array(8),
  new Array(8),
  new Array(8)
]
let ctr = new Array(255);
let menu;
let font = new Array(64);
let pause_Button_ = { paused : false, pressed : false }
let layer = [[]];
let currentLayer = 0;
let defaultPalette = ['20','10','00','3d','2d','1d','3f','3f'];
let currentPalette = defaultPalette;
let sprImg = [];
let sprData = [];
let mainFN;

function setup() {
  updateSize();

  canvasElement = createCanvas(WD.W,WD.H).elt;
  ctx = canvasElement.getContext('2d');
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  frameRate(FRAMERATE);
  p5.disableFriendlyErrors = true;
  mouse = new mouse();
  menu = new defaultMenu();
  currentPalette = palset(defaultPalette);
  loadNESFont(FNT);

  setControls(controls_);
  if(typeof draw_ !== 'undefined') setMainFunction(draw_);

  if (typeof init_ !== 'undefined') init_();
}

function draw() {
  if (pause()) {
    if (typeof menu_ !== 'undefined') menu_();
    else menu.update();
  } else {
    mainFN();
  }
  DisplayPixels();
  for (var i = 0; i < gamepadbtns.length; i++) {
    pregamepadbtns[i] = gamepadbtns[i].slice();
  }
}

//-----------------------

function btn(button, p, usePbutton) {
  let i = button;
  if(typeof button === 'string') i = btnlist.indexOf(button);
  if(typeof p === 'undefined') p = 0;
  if(usePbutton) return gamepadbtns[p][i] && !pbtn(i, p);
  return gamepadbtns[p][i];
}

function pbtn(button, p) {
  let i = button;
  if(typeof button === 'string') i = btnlist.indexOf(button);
  if(typeof p === 'undefined') p = 0;
  return pregamepadbtns[p][i];
}

function spr(F, X, Y, SW, SH, DIR, ANG, DW, DH) {
  let swidth = 16
  let sy = floor(floor(F)/swidth)*swidth;
  let sx = (floor(F)%swidth)*swidth;
  SW = SW || 1;
  SH = SH || 1;
  ANG = ANG || 0;
  ANG = floor(ANG)*PI/180;
  let sw = SW * swidth;
  let sh = SH * swidth;
  DW = DW || sw;
  DH = DH || sh;
  let S = DW>DH ? DW:DH;
  let dy = floor(Y-S/2)*D.S;
  let dx = floor(X-S/2)*D.S;
  let dw = S*D.S*2;
  let dh = S*D.S*2;
  let id = genID(palget(), floor(F), DW, DH, ANG, DIR, SW, SH);
  id += 1;
  let index = -1;
  for (var i = 0; i < sprImg.length; i++) {
    if(sprImg[i].id == id) {
      index = i;
      break;
    }
  }
  if(index < 0) {
    let s = 256;
    let data = new Array(DW*DH);
    for (var x = 0; x < DW; x++) {
      for (var y = 0; y < DH; y++) {
        if(DIR) x_=floor(map(x, 0, DW, sw, 0, true));
        else x_=floor(map(x, 0, DW, 0, sw, true));
        y_=floor(map(y, 0, DH, 0, sh, true));
        data[x+y*DW] = sprData[ (sx+x_)+(sy+y_)*s ];
      }
    }
    let img = createImage(S*2,S*2);
    img.loadPixels();
    for (var x = 0; x < S*2; x++) {
      for (var y = 0; y < S*2; y++) {
        let h= S/2, w= S/2;
        let H= -w, V= -h, X0= DW/2-0.5, Y0= DH/2-0.5;
        let A= cos(ANG), B= sin(ANG), C= -sin(ANG), D= cos(ANG);
        x_ = round(A*(x+H-X0) + B*(y+V-Y0) + X0);
        y_ = round(C*(x+H-X0) + D*(y+V-Y0) + Y0);
        if(x_<0||y_<0||y_>=DH||x_>=DW) continue;
        sc = data[x_+y_*DW];
        if(sc == PAL.length+1 || currentPalette[sc] == 64) continue;
        if(typeof sc == 'undefined') continue;
        let clr = color(PAL[currentPalette[sc]]);
        setColorAtIndex(img, x, y, clr);
      }
    }
    img.updatePixels();
    sprImg.push({img:img,id:id});
    index = sprImg.length-1;
  }
  layer[currentLayer].push({img:sprImg[index].img,x:dx,y:dy,w:dw,h:dh,scale:1.0});
}

function put(s, x, y, c) {
  if(typeof x !== 'undefined') pointer_.ox = x;
  x = x || pointer_.x;
  y = y || pointer_.y;
  c = c || pointer_.c;
  if(typeof c == 'string') c = parseInt(c, 16);
  if(typeof s == 'string') s = s.toLowerCase();
  else s = String(s);
  let dy = 0;
  let dx = 0;
  let sw = 8;
  let dw = sw*D.S;
  for (var i = 0; i < s.length; i++) {
    let ch = AlphaB_.indexOf(s.charAt(i));
    if(s.charAt(i) == ' ') dx += sw;
    if(ch == -1) continue;
    let sy = floor(ch/32)*8;
    let sx = (ch%32)*8;
    if(s.charAt(i) == "~"){
      if(s.charAt(i+1) == 'n') {
        dx=0;
        x=pointer_.ox;
        dy+=sw;
        i += 1;
        continue;
      }
    }
    temp = {img:font[c],w:dw,h:dw,sx:sx,sy:sy,sw:sw,sh:sw};
    temp.x = floor(x+dx)*D.S;
    temp.y = floor(y+dy)*D.S;
    layer[currentLayer].push(temp);
    dx+=sw;
    if(dx > 400){
      dx = 0;
      dy += sw;
    }
  }
  pointer_.x = dx + pointer_.ox;
  pointer_.y = dy + y;
  pointer_.c = c;
}

function locate(x, y) {
  pointer_.x = x;
  pointer_.ox = x;
  if(typeof y !== 'undefined') pointer_.y = y;
}

function textc(c) {
  pointer_.c = c;
}

function cls(c) {
  resetPixels();
  if(typeof c == 'string') c = parseInt(c, 16);
  background(PAL[c]);
  pointer_ = { x:0, y:0, c:63 };
}

function palset(p) {
  for (var i = 0; i < p.length; i++) {
    if(typeof p[i] == 'string') p[i] = parseInt(p[i], 16);
  }
  currentPalette = p;
}

function palget() {
  return currentPalette;
}

function lset(n) {
  currentLayer = n;
}

function lget() {
  return currentLayer;
}

function setMainFunction(fn) {
  mainFN = fn;
}

//-----------------------

function genID(p, f, w, h, a, d, r, c) {
  while(a<=0) a += TWO_PI;
  let str = ""+p+""+f+""+w+""+h+""+floor(((a*180/PI)%360)+1)+""+d;
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function setControls(a) {
  controls_ = a;
  gamepad.setCustomMapping('keyboard', {
    'd_pad_up': a[0],
    'd_pad_down': a[1],
    'd_pad_left': a[2],
    'd_pad_right': a[3],
    'button_1': a[4],
    'button_3': a[5],
    'start': a[6],
    'select': a[7]
  });
}

function setNumberOfLayers(n) {
  layer = new Array(n);
}

function setSpriteSheet(s) {
  sprData = s;
}

function DisplayPixels() {
  for (var i = 0; i < layer.length; i++) {
    for (var j = 0; j < layer[i].length; j++) {
      o = layer[i][j];
      push();
      scale(o.scale, 1.0);
      if(typeof o.sx !== 'undefined') image(o.img, o.x, o.y, o.w, o.h, o.sx, o.sy, o.sw, o.sh);
      else image(o.img, o.x, o.y, o.w, o.h);
      pop();
    }
  }
}

function resetPixels() {
  for (var i = 0; i < layer.length; i++) layer[i] = [];
}

function loadNESFont(s) {
  let w = 256;
  let h = 16;

  for (var i = 0; i < font.length; i++) {
    font[i] = createImage(256,16);
    font[i].loadPixels();

    for (var y = 0; y < h; y++)
    for (var x = 0; x < w; x++) {
      let p = x + y * w;
      if(s[p] == 1) font[i].set(x, y, color(PAL[i]));
    }
    font[i].updatePixels();
  }

}

function imageIndex(img, x, y) {
  return 4 * (x + y * img.width);
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
  this.selected = 0;
  this.bp = [false,false,false,false,false,false,false,false];
  this.options = 2;
  this.editing = false;
  this.cbtn = 0;
  this.newbtns = new Array(8);

  this.update = function() {
    cls('3f');
    textc('30');
    put("paused ", 32, D.H/2 - 20);
    put("(press space)");

    if(this.editing && !this.bp['a']) {

      let k = 0;
      if(key >= 'a' && key <= 'z') k = keyCode - 32;
      else k = keyCode;

      if(keyIsPressed && this.cbtn < 6) {
        if(this.newbtns.indexOf(k) == -1) {
          this.newbtns[this.cbtn] = k;
          this.cbtn += 1;
        }
      }

      locate(32, D.H/2 - 4);
      for (var i = 0; i < 6; i++) {
        put(btnlist[i] + " ");
        if(typeof this.newbtns[i] == 'undefined' && i == this.cbtn) {
          put("[press any key]~n");
          continue;
        }
        if(typeof this.newbtns[i] !== 'undefined') put(this.newbtns[i] + "~n");
        else put("~n");
      }

      if(this.cbtn >= 6) {
        this.editing = false;
        this.cbtn = 0;
        this.newbtns[6] = controls_[btnlist.indexOf('start')];
        this.newbtns[7] = controls_[btnlist.indexOf('select')];
        setControls(this.newbtns);
        this.newbtns = new Array(8);
      }

      return 0;
    }

    if( btn('a')) {
      this.bp['a'] = true;
      if(this.selected == 0) pause_Button_.paused = false;
      if(this.selected == 1) this.editing = true;
    } else this.bp['a'] = false;

    if(btn('up')) {
      if(!this.bp['up']) {
        this.selected -= 1;
        this.bp['up'] = true;
      }
    } else this.bp['up'] = false;
    if(btn('down')) {
      if(!this.bp['down']) {
        this.selected += 1;
        this.bp['down'] = true;
      }
    } else this.bp['down'] = false;

    if(this.selected > this.options - 1) this.selected = 0;
    if(this.selected < 0) this.selected = this.options - 1;

    put(">", 24, D.H/2 - 4 + (this.selected * 8));

    locate(32, D.H/2 - 4);
    put("resume~n");
    put("edit controls (keyboard only)");

    textc('3f');
  }
}

function mouse() {
  this.x = 0;
  this.y = 0;
  this.display = function() {
    this.x = floor(mouseX/D.S);
    this.y = floor(mouseY/D.S);
  }
}

function showFrames() {
  let x = D.W - 16;
  let y = D.H - 8;
  put(frameRate(), x, y, '3f');
}

function pause() {
  if (!pause_Button_.pressed & btn(6)) {
    if(!menu.editing) {
      pause_Button_.paused = !pause_Button_.paused;
    }
    pause_Button_.pressed = true;
  } else if (!btn(6)) pause_Button_.pressed = false;
  return pause_Button_.paused;
}

function windowResized() {
  updateSize();
  resizeCanvas(WD.W, WD.H);
}

function updateSize() {
  WD = { W : window.innerWidth, H : window.innerHeight}
  D.S = (WD.W/D.W);
  let C_ = (WD.H/D.S);
  if (C_ < D.H) {
    D.S = (WD.H/D.H);
  }
  WD.H = D.H*D.S;
  WD.W = D.W*D.S;
}

function setButton(n, b, e) {
  e = e || 'keyboard';
  if(e.player = 'keyboard') p = 0;
  else p = player_.indexOf(e.player);
  gamepadbtns[p][n] = b;
}

gamepad.on('connect', e => {
  add(player_, e.index);
  nplayers += 1;
  console.log(`player ${e.index} has connected.`);
});
gamepad.on('disconnect', e => {
  del(player_, e.index);
  nplayers -= 1;
  console.log(`player ${e.index} has disconnected.`);
});
gamepad.on('press'  , 'd_pad_up'   , e => {setButton(0, true, e );});
gamepad.on('release', 'd_pad_up'   , e => {setButton(0, false, e);});
gamepad.on('press'  , 'd_pad_down' , e => {setButton(1, true, e );});
gamepad.on('release', 'd_pad_down' , e => {setButton(1, false, e);});
gamepad.on('press'  , 'd_pad_left' , e => {setButton(2, true, e );});
gamepad.on('release', 'd_pad_left' , e => {setButton(2, false, e);});
gamepad.on('press'  , 'd_pad_right', e => {setButton(3, true, e );});
gamepad.on('release', 'd_pad_right', e => {setButton(3, false, e);});
gamepad.on('press'  , 'button_1'   , e => {setButton(4, true, e );});
gamepad.on('release', 'button_1'   , e => {setButton(4, false, e);});
gamepad.on('press'  , 'button_3'   , e => {setButton(5, true, e );});
gamepad.on('release', 'button_3'   , e => {setButton(5, false, e);});
gamepad.on('press'  , 'start'      , e => {setButton(6, true, e );});
gamepad.on('release', 'start'      , e => {setButton(6, false, e);});
gamepad.on('press'  , 'select'     , e => {setButton(7, true, e );});
gamepad.on('release', 'select'     , e => {setButton(7, false, e);});

let FNT = [
   0,0,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
   0,1,0,0,1,1,0,0,0,0,1,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,0,0,1,1,0,0,0,1,1,0,0,0,1,1,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,1,1,1,0,0,1,1,0,0,0,1,1,0,0,1,1,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,1,1,1,1,1,0,0,
   1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,1,1,0,0,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,0,0,1,0,0,1,1,0,0,0,1,1,0,0,0,1,1,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,1,0,0,1,1,0,0,0,1,1,0,
   1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,1,1,0,1,1,1,1,0,
   1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,1,1,0,1,1,1,1,0,
   0,1,1,0,0,1,0,0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,1,1,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,0,0,1,1,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,1,1,0,1,1,1,0,0,
   0,0,1,1,1,0,0,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,0,0,
   0,0,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,1,1,0,0,0,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
   0,1,1,0,1,1,0,0,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,1,0,1,1,1,0,1,1,1,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,1,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
   1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,1,0,1,1,0,0,1,1,1,1,1,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,
   1,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
   1,1,1,1,1,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,0,0,0,1,1,0,0,0,0,0,0,1,1,0,1,0,1,1,0,1,1,0,1,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,1,1,0,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
   1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,1,1,0,1,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,1,1,1,0,0,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
   1,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,1,1,0,0,0,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,0,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1,0,1,0,1,1,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,
   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
 ]
