//     dMMMMb  dMMMMMP dMMMMb  dMMMMMP .dMMMb
//    dMP dMP dMP     dMP dMP dMP     dMP" VP
//   dMP dMP dMMMP   dMP dMP dMMMP    VMMMb
//  dMP dMP dMP     dMP dMP dMP     dP .dMP
// dMP dMP dMMMMMP dMP dMP dMMMMMP  VMMMP"

// Not Exactly NES
// by sweatersjpg

var canvasElement;
var ctx;
var cvs;
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
let pointer_ = { y : 0, x : 0, c : 48, ox : 0 };
let defaultControls_ = [87, 83, 65, 68, [82, 32], 69, 27, [9,81]];
let controls_ = defaultControls_;
let controlsP2_ = [38, 40, 37, 39, 13, 222];
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
let fntColours = [48, 63];
let pause_Button_ = { paused : true, pressed : false }
let layer = new Array(2);
let currentLayer = 0;
let defaultPalette = ['20','10','00','3d','2d','1d','3f','3f'];
let currentPalette = defaultPalette;
let sprImg = [];
let sprData = [];
let sprDataID = "";
let drawFN;
let camera = {x:0, y:0}

function setup() {
  updateSize();

  cvs = createCanvas(WD.W,WD.H);
  var x = floor((windowWidth - width) / 2);
  var y = floor((windowHeight - height) / 2);
  cvs.position(x, y);
  canvasElement = cvs.elt;
  ctx = canvasElement.getContext('2d');
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  frameRate(FRAMERATE);
  p5.disableFriendlyErrors = true;
  menu = new defaultMenu();
  currentPalette = palset(defaultPalette);
  loadNESFont(FNT);

  setControls(controls_);

  // drawFN = new Game();

  if (typeof init_ !== 'undefined') init_();

  if(pause_Button_.paused) {
    pause_Button_.backup = sprDataID;
    setSpriteSheet("nenesLogo");
  }

}

function draw() {
  setCamera(0, 0);
  if (pause()) {
    menu.update();
  } else {
    if(drawFN && drawFN.draw) drawFN.draw();
    else if(drawFN) drawFN();
  }
  DisplayPixels();
  for (var i = 0; i < gamepadbtns.length; i++) pregamepadbtns[i] = gamepadbtns[i].slice();
}

//-----------------------

function defaultMenu() {
  this.selected = 0;
  this.bp = [false,false,false,false,false,false,false,false];
  this.options = 2;
  this.editing = false;
  this.cbtn = 0;
  this.newbtns = new Array(8);

  this.update = function() {
    cls('3f');

    palset([48,64,48]);
    spr(0, 32, D.H/2 - 60, 8, 1);
    palset([48,48,64]);
    spr(0, 32, D.H/2 - 44, 8, 1);
    textc('30');
    put("PAUSED ", 32, D.H/2 - 20);
    put("(Press Space)");

    if(!this.editing) {
      if(nplayers) {
        for (var i = 0; i < nplayers; i++) {
          palset([48,64,48]);
          spr(8, 32 + i*24, D.H/2 + 16);
        }
      } else {
        palset([48,48,64]);
        spr(8, 32, D.H/2 + 16);
      }
    }

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
      if(this.selected == 0) {
        pause_Button_.paused = false;
        if(pause_Button_.backup) setSpriteSheet(pause_Button_.backup);
        // drawFN = new Game();
      }
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
    put("RESUME~n");
    put("EDIT CONTROLS (Keyboard Only)");

    textc('3f');
  }
}

function keyPressed() {
  if(controlsP2_.includes(keyCode)) gamepadbtns[1][controlsP2_.indexOf(keyCode)] = true;
}
function keyReleased() {
  if(controlsP2_.includes(keyCode)) gamepadbtns[1][controlsP2_.indexOf(keyCode)] = false;
}

//-----------------------

function btn(button, p) {
  let i = button;
  if(typeof button === 'string') i = btnlist.indexOf(button);
  if(typeof p === 'undefined') p = 0;
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
  let id = genID(palget(), floor(F), DW, DH, ANG, DIR);
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
        if(DIR) x_=Math.floor(map(x, 0, DW, sw-1, 0, true));
        else x_=Math.floor(map(x, 0, DW, 0, sw, true));
        y_=Math.floor(map(y, 0, DH, 0, sh, true));
        data[x+y*DW] = sprData[ (sx+x_)+(sy+y_)*s ];
      }
    }
    let img = createImage(S*2,S*2);
    img.loadPixels();
    for (var x = 0; x < S*2; x++) {
      for (var y = 0; y < S*2; y++) {
        let h= S/2, w= S/2;
        let H= -w, V= -h, X0= DW/2-0.5, Y0= DH/2-0.5;
        let A= Math.cos(ANG), B= Math.sin(ANG), C= -Math.sin(ANG), D= Math.cos(ANG);
        x_ = Math.round(A*(x+H-X0) + B*(y+V-Y0) + X0);
        y_ = Math.round(C*(x+H-X0) + D*(y+V-Y0) + Y0);
        if(x_<0||y_<0||y_>=DH||x_>=DW) continue;
        sc = data[x_+y_*DW];
        if(sc == currentPalette.length || currentPalette[sc] == 64) continue;
        if(typeof sc == 'undefined') continue;
        let clr = color(PAL[currentPalette[sc]]);
        setColorAtIndex(img, x, y, clr);
      }
    }
    img.updatePixels();
    sprImg.push({img:img,id:id});
    index = sprImg.length-1;
  }
  layer[currentLayer].push({
    img:sprImg[index].img,x:dx,y:dy,w:dw,h:dh,scale:1.0,
    camera: Object.assign({}, camera)
  });
}

function put(s, x, y, c) {
  if(typeof x !== 'undefined') pointer_.ox = x;
  x = x || pointer_.x;
  y = y || pointer_.y;
  c = c || pointer_.c;
  if(typeof c == 'string') c = parseInt(c, 16);
  else s = String(s);
  let dy = 0;
  let dx = 0;
  let sw = 8;
  let dw = sw*D.S;
  for (var i = 0; i < s.length; i++) {
    let ch = s.charCodeAt(i) - 32;
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
    temp = {img:font[c],w:dw,h:dw,sx:sx,sy:sy,sw:sw,sh:sw,camera: Object.assign({}, camera)};
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

function textc(c) { pointer_.c = c; }

function cls(c) {
  resetPixels();
  if(typeof c == 'string') c = parseInt(c, 16);
  background(PAL[c]);
  pointer_ = { x:0, y:0, c:63 };
}

function palset(p) {
  for (var i = 0; i < p.length; i++)
  if(typeof p[i] == 'string') p[i] = parseInt(p[i], 16);
  currentPalette = p;
}

function palget() { return currentPalette; }

function lset(n) { currentLayer = n; }

function lget() { return currentLayer; }

function setDrawFunction(fn) { drawFN = fn; }

//-----------------------

function genID(p, f, w, h, a, d) {
  while(a<=0) a += TWO_PI;
  let str = ""+p+""+f+""+w+""+h+""+floor(((a*180/PI)%360)+1)+""+d+""+sprDataID;
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
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
  let data;
  if(typeof s !== 'string') {
    data = s;
    sprDataID += "!";
  } else {
    sprDataID = s;
    data = window[s];
  }
  if(typeof data == 'string') {
    sprData = uncompress(data);
  } else {
    sprData = Object.assign([], data);
  }
}

function uncompress(str) {
  let keyA = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#$';
  let keyB = "!@%^&*()_+={}[]<>,./?|`~:;-¡€™‹›£¢ﬁ∞ﬂ§‡¶°•·ª‚º—±≠«»‘’“”ÆæÚ…¿÷˘≥≤";
  data = [];

  for (var i = 0; i < str.length; i++) {
    let count = 0;
    let color = keyB.indexOf(str.charAt(i));
    if(keyA.includes(str.charAt(i+1))) {
      count += keyA.indexOf(str.charAt(i+1));
      if(keyA.includes(str.charAt(i+2))) {
        count += keyA.indexOf(str.charAt(i+2)) * 64;
        i += 2;
      } else i += 1;
    } else count = 1;
    if(count) data = data.concat(new Array(count).fill(color));
  }
  return data;
}

function compress(data) {
  let keyB = "!@%^&*()_+={}[]<>,./?|`~:;-¡€™‹›£¢ﬁ∞ﬂ§‡¶°•·ª‚º—±≠«»‘’“”ÆæÚ…¿÷˘≥≤";
  let str = "";

  function tob64(n) {
    let keyA = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#$';
    let p1 = keyA.charAt(Math.floor(n/64));
    let p2 = keyA.charAt(n%64);
    if(p1 == '0') return p2;
    else return p2 + p1;
  }

  let char = "start";
  let count = 0;
  for (var i = 0; i < data.length; i++) {
    if(char != keyB.charAt(data[i]) || count == 4095) {
      if(count) {
        str += char + "";
        if(count > 1) str += tob64(count) + "";
      }
      char = keyB.charAt(data[i]);
      count = 0;
    }
    count++;
  }
  str += char + tob64(count);
  return str;
}

function setCamera(x, y) {
  camera.x = x;
  camera.y = y;
}

function DisplayPixels() {
  for (var i = 0; i < layer.length; i++) {
    for (var j = 0; j < layer[i].length; j++) {
      o = layer[i][j];
      push();
      scale(o.scale, 1.0);
      translate(o.camera.x * D.S, o.camera.y * D.S);
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
  let h = 32;
  s = uncompress(s);

  for (var i = 0; i < font.length; i++) {
    if(!fntColours.includes(i)) continue;
    font[i] = createImage(256,32);
    font[i].loadPixels();

    for (var y = 0; y < h; y++)
    for (var x = 0; x < w; x++) {
      let p = x + y * w;
      if(s[p] == 0) font[i].set(x, y, color(PAL[i]));
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

function showFrames() {
  let x = D.W - 16;
  let y = D.H - 8;
  put(frameRate(), x, y, '3f');
}

function pause() {
  if (!pause_Button_.pressed & btn(6)) {
    if(!menu.editing) {
      if(typeof menu_ == 'undefined') {
        if(!pause_Button_.paused) {
          pause_Button_.backup = sprDataID;
          setSpriteSheet("nenesLogo");
        } else {
          if(pause_Button_.backup) setSpriteSheet(pause_Button_.backup);
        }
      }
      pause_Button_.paused = !pause_Button_.paused;
    }
    pause_Button_.pressed = true;
  } else if (!btn(6)) pause_Button_.pressed = false;
  return pause_Button_.paused;
}

function windowResized() {
  updateSize();
  var x = Math.floor((windowWidth - width) / 2);
  var y = Math.floor((windowHeight - height) / 2);
  cvs.position(x, y);
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
  if(e.player == 'keyboard') p = 0;
  else p = player_.indexOf(e.player);
  gamepadbtns[p][n] = b;
}

gamepad.on('connect', e => {
  player_.push(e.index);
  nplayers += 1;
  console.log(`player ${e.index} has connected.`);
});
gamepad.on('disconnect', e => {
  player_.splice(player_.indexOf(e.index), 1);
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
gamepad.on('hold'   , 'stick_axis_left', e => {
  let th = 0.2;
  if(e.value[0] >  th) setButton(3, true, e);
  else setButton(3, false, e);
  if(e.value[0] < -th) setButton(2, true, e);
  else setButton(2, false, e);
  if(e.value[1] >  th) setButton(1, true, e);
  else setButton(1, false, e);
  if(e.value[1] < -th) setButton(0, true, e);
  else setButton(0, false, e);
});
gamepad.on('release', 'stick_axis_left', e => {
  setButton(3, false, e);
  setButton(2, false, e);
  setButton(1, false, e);
  setButton(0, false, e);
});

var FNT = "@b!2@4!2@!2@3!2@!2@4!2@e!3@4!2@8!2@4!2@O!2@3!3@6!2@4!5@3!6@4!3@2!6@4!4@2!7@2!5@3!5@l!2@c!2@6!4@d!4@3!2@!2@3!2@!2@3!5@2!2@3!2@2!2@!2@3!2@7!2@6!2@5!2@2!2@3!2@w!2@3!@2!2@4!3@3!2@3!2@5!2@4!4@2!2@7!2@5!2@3!2@!2@3!2@!2@3!2@3!2@6!2@6!2@e!2@4!2@2!2@c!4@3!2@!2@2!7@!2@6!2@2!2@4!3@3!2@7!2@8!2@5!4@4!2@v!2@3!2@3!2@4!2@7!3@4!2@4!2@!2@2!6@2!2@a!2@2!2@3!2@!2@3!2@3!2@6!2@5!2@5!6@5!2@7!2@c!4@b!2@!2@3!4@6!2@4!3@!2@a!2@8!2@3!e@a!6@c!2@4!2@3!2@4!2@5!4@4!4@2!2@2!2@7!2@!6@5!2@4!5@3!6@h!2@i!2@5!2@e!2@b!7@5!2@4!2@4!2@!3@b!2@8!2@5!4@4!2@t!2@5!2@3!2@4!2@4!4@8!2@!7@6!2@!2@3!2@3!2@4!2@3!2@6!2@i!2@g!2@5!2@f!2@c!2@!2@2!5@4!2@2!2@!2@2!2@c!2@6!2@5!2@2!2@3!2@6!2@e!2@4!2@7!2@2!@5!2@3!3@5!2@3!2@5!2@2!2@3!2@!2@3!2@3!2@4!2@3!2@5!2@4!2@6!2@6!2@4!6@4!2@B!2@!2@4!2@4!2@3!2@2!3@!2@c!2@4!2@n!2@e!2@4!@9!3@4!6@!7@2!5@6!2@3!5@3!5@4!2@5!5@3!4@5!2@6!2@7!2@c!2@7!2@f!2@k1!2@S1!2@C!5@4!3@3!6@4!4@2!5@3!7@!7@3!5@!2@3!2@2!6@4!4@!2@3!2@2!2@5!2@3!2@!2@3!2@2!5@2!6@3!5@2!6@3!4@4!6@!2@3!2@!2@3!2@!2@3!2@!2@3!2@2!2@2!2@!7@2!4@3!2@7!4@6!@c!2@3!2@2!2@!2@2!2@3!2@2!2@2!2@!2@2!2@2!2@6!2@7!2@5!2@3!2@4!2@8!2@!2@2!2@3!2@5!3@!3@!3@2!2@!2@3!2@!2@3!2@!2@3!2@!2@3!2@!2@2!2@5!2@3!2@3!2@!2@3!2@!2@3!2@!3@!3@2!2@2!2@5!3@2!2@6!2@8!2@5!3@b!2@!4@!2@3!2@!2@3!2@!2@6!2@3!2@!2@6!2@6!2@6!2@3!2@4!2@8!2@!2@!2@4!2@5!7@!4@!2@!2@3!2@!2@3!2@!2@3!2@!2@3!2@!2@9!2@3!2@3!2@!2@3!2@!2@!@!2@2!5@3!2@2!2@4!3@3!2@7!2@7!2@4!2@!2@a!2@!4@!2@3!2@!6@2!2@6!2@3!2@!6@2!6@2!2@2!3@!7@4!2@8!2@!4@5!2@5!7@!7@!2@3!2@!2@3!2@!2@3!2@!2@2!3@2!5@5!2@3!2@3!2@!3@!3@!7@3!3@5!4@4!3@4!2@8!2@6!2@3!2@3!2@9!2@!4@!7@!2@3!2@!2@6!2@3!2@!2@6!2@6!2@3!2@!2@3!2@4!2@3!2@3!2@!5@4!2@5!2@!@!2@!2@!4@!2@3!2@!6@2!2@!4@!5@8!2@4!2@3!2@3!2@2!5@2!7@2!5@5!2@4!3@5!2@9!2@5!2@j!2@6!2@3!2@!2@3!2@2!2@2!2@!2@2!2@2!2@6!2@7!2@2!2@!2@3!2@4!2@3!2@3!2@!2@!3@3!2@5!2@3!2@!2@2!3@!2@3!2@!2@6!2@2!2@2!2@!3@2!2@3!2@4!2@3!2@3!2@3!3@3!3@!3@!3@!3@4!2@3!3@6!2@a!2@4!2@k!4@3!2@3!2@!6@4!4@2!5@3!7@!2@8!5@!2@3!2@2!6@2!5@2!2@2!3@2!6@!2@3!2@!2@3!2@2!5@2!2@7!4@!@!2@2!3@2!5@5!2@4!5@5!@4!2@3!2@!2@3!2@4!2@3!7@2!4@9!@2!4@b4!8@2!2@d!2@i!2@d!3@a!2@m!2@8!2@Z!2@T!3@5!2@3!3@6!3@!2@b!2@d!2@i!2@c!2@c!2@8!2@8!2@2!2@8!2@Z!2@S!2@7!2@5!2@4!2@!3@5!@7!2@5!4@3!5@4!5@3!5@3!4@5!2@5!5@2!2@m!2@3!@4!2@4!3@!2@2!5@4!4@3!5@4!5@2!2@!3@3!4@2!6@3!2@2!2@2!2@2!2@2!2@3!2@!2@3!2@!2@2!2@2!6@3!2@7!2@5!2@e!3@c!2@2!2@2!2@2!2@2!2@6!2@2!2@2!2@2!2@2!6@2!2@2!2@2!5@5!2@8!2@2!2@2!@5!2@4!2@!@!2@!2@2!2@2!2@2!2@2!2@2!2@2!2@2!2@2!3@5!@8!2@5!2@2!2@2!2@2!2@2!2@!@!2@2!2@!2@2!2@2!2@5!2@2!3@g!3@b!2@!2@b!2@2!2@2!2@2!2@2!2@6!2@2!2@2!6@4!2@4!2@2!2@2!2@2!2@4!2@8!2@2!2@!@6!2@4!2@!@!2@!2@2!2@2!2@2!2@2!2@2!2@2!2@2!2@2!2@7!4@4!2@5!2@2!2@2!2@2!2@2!2@!@!2@3!3@4!@!2@5!2@5!2@7!2@5!2@c!2@3!2@a!2@2!2@2!2@2!2@2!2@6!2@2!2@2!2@8!2@5!5@2!2@2!2@4!2@8!2@2!5@5!2@4!2@!@!2@!2@2!2@2!2@2!2@2!5@4!5@2!2@a!2@3!2@5!2@2!2@3!@2!@3!2@!@!2@2!2@!2@4!2@5!2@6!2@7!2@5!2@c!2@3!2@b!3@!2@!5@4!5@3!5@3!5@4!2@8!2@2!2@2!2@4!2@4!2@2!2@2!2@2!2@4!2@4!2@!@!2@!2@2!2@3!4@3!2@a!2@2!2@6!5@5!3@4!4@5!2@5!2@!2@2!2@3!2@2!2@5!6@4!3@5!2@3!3@d!7@X!4@k!4@H!2@a!2@W!2@Rw"
var nenesLogo = "^2@7^3@8^@7^@m^2@7^3@8^@7^@m^6@5!9@4^42@3!4%3@8^@3!4%!2@!j%2!2@!4%3@8^@3!4%!2@!j%4^4!f@^a!^V1@3!4%4@b!4%!2@!j%2!2@!4%4@b!4%!2@!j%4^3%4!d@^9!^V1@3!4%4@b!4%!2@!6%f!2@!4%4@b!4%!2@!6%h^2%8!b^8!^W1@3!4%5@a!4%!2@!6%f!2@!4%5@a!4%!2@!6%h^%a!a^8!^W1@2!5%5@9!5%!@!7%f!@!5%5@9!5%!@!7%d!3@!5%7!9%@2!b@3^N1@3!4%7@8!4%!2@!6%f!2@!4%7@8!4%!2@!6%e!3@!5%6!9%2@%^@^@^@^@^@^!^@^N1@3!4%7@8!4%!2@!6%f!2@!4%7@8!4%!2@!6%e!9%4^2@!8%2!@2!@7!@2!@^N1@3!4%8@7!4%!2@!9@b^@3!4%8@7!4%!2@!9@e!7%2^2@3!7%2!^%2!^@^@^!^!^%@^N1@3!4%8@7!4%!2@!9@b^@3!4%8@7!4%!2@!9@e!9@b^3!@2!@2!@!@2!@2!@^N1@3!4%9@6!4%!2@!9@b^@3!4%9@6!4%!2@!9@e!9@b^3@%@^@^5@^2!^@^N1@2!5%9@5!5%!@!9@c^@2!5%9@5!5%!@!9@c^@2!b@8^4@2!b@3^M1@3!4%b@4!4%!2@!k%!@2!4%b@4!4%!2@!k%2@2!f@3^52@3!4%b@4!4%!2@!k%!@2!4%b@4!4%!2@!k%2^@!h%^52@3!4%3^%8@3!4%!2@!k%!@2!4%3^%8@3!4%!2@!k%2^2@!e%4^72%7^%8^3%7^%m^2%7^%8^3%7^%m^4%!9%8^32"
