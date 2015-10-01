
;;
(function createAndSetTheGlitcherUI(window){

// This *requires* some quirkiness with "use strict" disabled
// "use strict";



// ============================

    // Helper Functions

// ============================


function rgb2Hex(r,g,b) {
// http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function hex2Rgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}


  // Bryce Barill's method: https://www.youtube.com/watch?v=-MCnBvDSoB0
function meanPixel(pixels) {
if (pixels.length === 0) return new Uint8Array(4);
if (pixels.length === 4) return pixels;
var p = new Uint8Array(4);
var r=0,g=0,b=0,a=0;
for (var i = 0; i < pixels.length; i+=4){
  r+=pixels[i];
  g+=pixels[i + 1];
  b+=pixels[i + 2];
  a+=pixels[i + 3];
}
p[0] = (r / (pixels.length / 4)) >>> 0;
p[1] = (r / (pixels.length / 4)) >>> 0;
p[2] = (r / (pixels.length / 4)) >>> 0;
p[3] = (r / (pixels.length / 4)) >>> 0;
return p;
}


// function getSecondImageData () {
//   return new Promise(
//     function(resolve, reject) {
//       try {
//         var secondImage = document.querySelector('#second-file').files[0];
//         var canvaser = document.createElement('canvas');
//         var btx = canvaser.getContext('2d');
//             canvaser.setAttribute('id', 'bablyos');
//         var reader = new FileReader();
//             reader.onload = function(event) {
//               try {
//                 var img2 = new Image();
//                 img2.onload = function() {
//                   canvaser.width = document.querySelector('#ultros').width;
//                   canvaser.height = document.querySelector('#ultros').height;
//                   btx.drawImage(img2,0,0);
//                   var pImgData = btx.getImageData(0, 0, canvaser.width, canvaser.height);
//                   paramsArray = pImgData.data;
//                   resolve(paramsArray);// resolve the promise
//                 }
//                 img2.src = event.target.result;
//               } catch (e) {
//                 alert('could not read file(s)');
//               }
//             }
//             reader.readAsDataURL(secondImage);
//       } catch (e) {
//         window.alert('Something is not right here...');
//         console.log(e);
//         reject(e); // reject the promise
//         return;
//       }
//     })
// }


function finalEffects (chunk, dupBuffer, options) {
  var renderIntent = options.render || 'normal';
  // console.log("rendering with: ", renderIntent);
  switch (renderIntent) {
    case 'normal'     : 
      var i = 0;
      while (i < chunk.length) {
        chunk[++i] = dupBuffer[i];
      }
      break;
    case 'clipped'    :
      var i = 0;
      while (i < chunk.length) {
        chunk[++i] = dupBuffer[i] >= 255 ? chunk[i] : dupBuffer[i] ;
      }
      break;
    case 'notclipped' :
      var i = 0;
      while (i < chunk.length) {
        chunk[++i] = dupBuffer[i] >= 255 ? dupBuffer[i] : chunk[i];
      }
      break;
    case 'mean'       :
      var mean = meanPixel(chunk);
      var i = 0;
      while (i < chunk.length) {
        chunk[++i] = chunk[i] <= (mean[0] + 10 ) && chunk[i] >= (mean[0] - 10) ? chunk[i] : dupBuffer[i]
        chunk[++i] = chunk[i] <= (mean[1] + 10 ) && chunk[i] >= (mean[1] - 10) ? chunk[i] : dupBuffer[i]
        chunk[++i] = chunk[i] <= (mean[2] + 10 ) && chunk[i] >= (mean[2] - 10) ? chunk[i] : dupBuffer[i]
        chunk[i++] = 255
        // chunk[++i] = chunk[i] <= (mean[3] + 10 ) && chunk[i] >= (mean[3] - 10) ? chunk[i] : dupBuffer[i]
      }
      break;
    case 'notmean'    :
      var mean = meanPixel(chunk);
      var i = 0;
      while (i < chunk.length) {
        chunk[++i] = chunk[i] <= (mean[0] + 10 ) && chunk[i] >= (mean[0] - 10) ? dupBuffer[i] : chunk[i];
        chunk[++i] = chunk[i] <= (mean[1] + 10 ) && chunk[i] >= (mean[1] - 10) ? dupBuffer[i] : chunk[i];
        chunk[++i] = chunk[i] <= (mean[2] + 10 ) && chunk[i] >= (mean[2] - 10) ? dupBuffer[i] : chunk[i];
        chunk[i++] = 255
        // chunk[++i] = chunk[i] <= (mean[3] + 10 ) && chunk[i] >= (mean[3] - 10) ? dupBuffer[i] : chunk[i];
      }
      break;
    case 'triangular'  :
      var width = options.size.width;
      var height = options.size.height;
      var half = (width/2); // (width/2)*4
      var halfheight = (height/2); // (height/2)*4
      var step = 0;
      for (var i = 0; i < height; i++) {
          var middle = ((i * width*4) + (half*4)) - 1; // = (i*width*4) + (half*4);
          if (i < halfheight) {

            var start = middle - (i*4); // i*4 for rgba pixels
            var end   = middle + (i*4); // i*4 for rgba pixels
            
          } else {

            var start =  middle  - ((i*4) - ( 1 +(2*step)*4 ) ); // start - amount over the middle
            var end   =  middle  + ((i*4) - ( 1 +(2*step)*4 ) );  // end   - amount over the middle

            step+=1;
          }

        for (var j = 0; j < width; j++) {
          // var index = i * width + j;
          var index = (i*width*4) + (j*4);
          if (index >= start && index <= end) {

            chunk[index + 0] = dupBuffer[index + 0];
            chunk[index + 1] = dupBuffer[index + 1];
            chunk[index + 2] = dupBuffer[index + 2];
            chunk[index + 3] = dupBuffer[index + 3];
              
          } else {
            chunk[index + 0] = chunk[index + 0];
            chunk[index + 1] = chunk[index + 1];
            chunk[index + 2] = chunk[index + 2];
            chunk[index + 3] = chunk[index + 3];

                      

          }
        }
      }
      break;
      case 'triangularinverse'  :
      var width = options.size.width;
      var height = options.size.height;
      var half = (width/2); // (width/2)*4
      var halfheight = (height/2); // (height/2)*4
      var step = 0;
      for (var i = 0; i < height; i++) {
          var middle = ((i * width*4) + (half*4)) - 1; // = (i*width*4) + (half*4);
          if (i < halfheight) {

            var start = middle - (i*4); // i*4 for rgba pixels
            var end   = middle + (i*4); // i*4 for rgba pixels
            
          } else {

            var start =  middle  - ((i*4) - ( 1 +(2*step)*4 ) ); // start - amount over the middle
            var end   =  middle  + ((i*4) - ( 1 +(2*step)*4 ) );  // end   - amount over the middle

            step+=1;
          }

        for (var j = 0; j < width; j++) {
          // var index = i * width + j;
          var index = (i*width*4) + (j*4);
          if (index >= start && index <= end) {
            
            chunk[index + 0] = chunk[index + 0];
            chunk[index + 1] = chunk[index + 1];
            chunk[index + 2] = chunk[index + 2];
            chunk[index + 3] = chunk[index + 3];
              
          } else {
            
            chunk[index + 0] = dupBuffer[index + 0];
            chunk[index + 1] = dupBuffer[index + 1];
            chunk[index + 2] = dupBuffer[index + 2];
            chunk[index + 3] = dupBuffer[index + 3];

          }
        }
      }
      break;
    default: break;

  }
}

// ============================

    // Effects Object

// ============================

var effects = {};
effects.noop = function () {};

effects.clickme = function () {
  alert("Effects don\'t have to do anything but can trigger ui states");
};

effects.cool = function (chunk, opts, paramsArray) {
  
/* 
 * Defensive programming structure to ensure variables are defined
 *
 * The option object contains  parameters passed in via the UI. 
 * - Noise [Boolean] 
 * - Render [String] 
 * - Threshold [Number]
 * - Gamma [Number::Float] 0.0 - 5.0
 * - Size [Object] {height: [Number], width: [Number] }
 * - Color [Object] {r: [Number], g: [Number], b: [Number]}
 * - Swing [Object] {r: [Number], g: [Number], b: [Number] }
 * - Channel [Object] {r: [Boolean], g: [Boolean], b: [Boolean]}
 *
 *
 * Params array is a second image in Uint8Array format
 *
**/


  var opts = opts || {};
  var gamma = opts.gamma || 1;
  var colR = opts.colorR || 200; 
  var colG = opts.colorG || 200;
  var colB = opts.colorB || 200;
  var paramsArray = paramsArray || chunk;

  var len = chunk.length, i = 0;

    while (i < len) {
      if ((chunk[i] + chunk[i+1] + chunk[i+2]) &1) {
        chunk[i++] = (chunk[i]&1) ? chunk[i] ^ chunk[i] * gamma : chunk[i] * gamma; // buzz
        chunk[i++] = (chunk[i]&1) ? chunk[i] ^ chunk[i] * gamma : chunk[i] * gamma; // buzz
        chunk[i++] = (chunk[i]&1) ? chunk[i] ^ chunk[i] * gamma : chunk[i] * gamma; // buzz
        chunk[i++] = 255
      } else {
        chunk[i++] = chunk[i]   * gamma;
        chunk[i++] = chunk[i-1] * gamma;
        chunk[i++] = chunk[i-2] * gamma;
        chunk[i++] = 255
      }
    }



}


effects.inverse = function(data) {

  for (var i = 0, dl = data.length; i < dl; i += 4) {
      data[i]     = 255 - data[i]; // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
}

effects.blendedinverse = function(data, opts) {
  var dupBuffer = new Uint8Array(data.length);
  for (var i = 0, dl = data.length; i < dl; i += 4) {
      data[i]     = 255 - data[i]; // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
  finalEffects(data, dupBuffer, opts);
  dupBuffer = [];
}



effects.smosht = function (chunk, opts, paramsArray) {
  var opts = opts || {};
  var gamma = opts.gamma || 1;
  var offset = opts.offset || 0;
  var colR = opts.colorR || 0x00; 
  var colG = opts.colorG || 0xFF;
  var colB = opts.colorB || 0xFF;
  var h = opts.size.height, w = opts.size.width;
  opts.render = opts.render || 'normal';
  var paramsArray = paramsArray || chunk;

  var length = chunk.length;
  var dupBuffer = new Uint8Array(length); 
  
  for( var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      var index = (i*w*4) + (j*4);
      var rgb = {r: paramsArray[index], g: paramsArray[index+1], b: paramsArray[index+2]};
      var colorvalue = rgb.r + rgb.b + rgb.b;
      
      if (j % (w-1) === 0 ) {
        dupBuffer[index+0] = chunk[index+0]
        dupBuffer[index+1] = chunk[index+1]
        dupBuffer[index+2] = chunk[index+2]
        dupBuffer[index+3] = 255;
        continue;
      }
      if (colorvalue > 100) {
        dupBuffer[index+0] = chunk[index - (19*4)+1] || 255;
        dupBuffer[index+1] = chunk[index + (20*4)+2] || 0;
        dupBuffer[index+2] = chunk[index - (4 *4)+0] || 255;
        dupBuffer[index+3] = 255; 
      } else if (colorvalue > 50){
        dupBuffer[index+0] = chunk[index - (13*4)+2] || 255;
        dupBuffer[index+1] = chunk[index + (15*4)+0] || 255;
        dupBuffer[index+2] = chunk[index + (4 *4)+1] || 0;
        dupBuffer[index+3] = 255; 
      } else {
        dupBuffer[index+0] = chunk[index + (7*4)+2] || 0;
        dupBuffer[index+1] = chunk[index + (4*4)+0] || 255;
        dupBuffer[index+2] = chunk[index - (10 *4)+1] || 255;
        dupBuffer[index+3] = 255; 
      }
    }
  }
  finalEffects(chunk, dupBuffer, opts);
  dupBuffer = [];
}


effects.demoWarhol = function (chunk, opts, paramsArray) {


  var gamma = opts.gamma || 1;
  var x,y;
  var threshold = parseInt(opts.threshold) || 50;
  var paramsArray = paramsArray || chunk;
  opts.values = opts.values || 'white';
  var x = opts.size.height, y = opts.size.width;


function modifiedMeanPixel(pixels) {

if (pixels.length === 0) return new Uint8Array(4);
if (pixels.length === 4) return pixels;

var highs = {count: 0, r:0,g:0,b:0}, 
    mids  = {count: 0, r:0,g:0,b:0}, 
    lows  = {count: 0, r:0,g:0,b:0};

for (var i = 0; i < pixels.length; i+=4){
  var colorvalue = pixels[i] + pixels[i+1] + pixels[i+2]; 
  if (colorvalue > 600) {
    highs.count++;
    highs.r+=pixels[i];
    highs.g+=pixels[i + 1];
    highs.b+=pixels[i + 2];
  } else if (colorvalue > 400) {
    mids.count++;
    mids.r+=pixels[i];
    mids.g+=pixels[i + 1];
    mids.b+=pixels[i + 2];    
  } else {
    lows.count++;
    lows.r+=pixels[i];
    lows.g+=pixels[i + 1];
    lows.b+=pixels[i + 2];    
  }
  
}

  highs.r = (highs.r / highs.count) >>> 0;
  highs.g = (highs.g / highs.count) >>> 0;
  highs.b = (highs.b / highs.count) >>> 0;
  highs.totalvalue = highs.r + highs.g + highs.b;

  mids.r = (mids.r / mids.count) >>> 0;
  mids.g = (mids.g / mids.count) >>> 0;
  mids.b = (mids.b / mids.count) >>> 0;
  mids.totalvalue = mids.r + mids.g + mids.b;

  lows.r = (lows.r / lows.count) >>> 0;
  lows.g = (lows.g / lows.count) >>> 0;
  lows.b = (lows.b / lows.count) >>> 0;
  lows.totalvalue = lows.r + lows.g + lows.b;

  return {
    highs:highs, 
    mids:mids, 
    lows:lows
    };
}


  var pixels = chunk;
  var meanPixels = modifiedMeanPixel(chunk);
  var black =       {r: 6, g: 2, b:0},
      blue =        {r: 20,g: 30,b:184},
      magentaPink = {r:252,g:165,b:243},
      lipstickRed = {r:193,g:0,  b:67};

  for (var i = 0; i < x; i++) {

      for (var j = 0; j < y; j++) {
          
        var index = (i*y*4) + (j*4);

        var curColor = {
          r : paramsArray[index + 0], 
          g : paramsArray[index + 1], 
          b : paramsArray[index + 2]  
        }
        
        var combinedColorValue = curColor.r + curColor.g + curColor.b;
        var finalColor = {};
        
        switch (true) {
          case combinedColorValue >= meanPixels.highs.totalvalue - 10: 
            finalColor = blue;
            break;
          case combinedColorValue >= meanPixels.mids.totalvalue - 10: 
            finalColor = magentaPink;
            break;
          case combinedColorValue > meanPixels.lows.totalvalue - 10: 
            finalColor = lipstickRed;
            break;
          default: finalColor = black; break;
}        

          pixels[index+0] = finalColor.r;
          pixels[index+1] = finalColor.g;
          pixels[index+2] = finalColor.b;
      }
       
  }

  var shift = (y / 50 >>> 0) % 4 > 0 ? (y / 50 >>> 0) - ((y / 50 >>> 0) % 4) : (y / 50 >>> 0);
  for (var i = 0; i < x; i++) {

      for (var j = 0; j < y; j++) {
          
        var index = (i*y*4) + (j*4);

        var curColor = {
          r : paramsArray[index + 0], 
          g : paramsArray[index + 1], 
          b : paramsArray[index + 2]  
        }

        if (curColor.r === black.r && curColor.g === black.g && curColor.b === black.b) {
          // The pixels behind this one is now black
          pixels[index-shift-4] = black.r || pixels[index+0];
          pixels[index-shift-3] = black.g || pixels[index+1];
          pixels[index-shift-2] = black.b || pixels[index+2];
          // This pixel is now the color ahead of it

          pixels[index+0] = pixels[index+4];
          pixels[index+1] = pixels[index+5];
          pixels[index+2] = pixels[index+6];

        } 

      }
       
  }


}

/*

You could store these values in their own array, but has overhead in terms of ram.
You could create a flag array signaling if a value is at a certain threshold but this requires an aditional loop through the array
You could set up a switch case but the over head is in processessing the array

As you can see there are multiple strategies available, I choose the more succint switch case


switch (true) {
  case value > 600: console.log('Greater than 600');break;
  case value > 500: console.log('Greater than 500');break;
  case value > 400: console.log('Greater than 400');break;
  case value > 300: console.log('Greater than 300');break;
  case value > 200: console.log('Greater than 200');break;
  default: console.log('No match');break;
}


*/


effects.moveswing = function(some, opts) {
    var opts = opts || {};
    var gamma = opts.gamma || 1;
    var offset = opts.offset || 0;
    var colR = opts.color.r || 255; 
    var colG = opts.color.g || 255;
    var colB = opts.color.b || 255;

    var pixelArray = [];
    var i = 0;
    var n = 0;
    while (i < some.length) {
    pixelArray[n++] = [ some[i+0], some[i+1], some[i+2], some[i+3] ];
    i += 4;
    }
    var n = 0 + offset;
    pixelArray.forEach(function(value, index, array) {
      if ( (value[0] + value[1] + value[2]) > 100 ) {
        some[n++] = (array[index - 19] && array[index - 19][1]) * gamma || 255;
        some[n++] = (array[index - 19] && array[index - 19][2]) * gamma || 0;
        some[n++] = (array[index - 19] && array[index - 19][0]) * gamma || 255;
        some[n++] = value[3] || 0xFF;
      } else if ( (value[0] + value[1] + value[2]) > 200 )  {
        some[n++] = colR * gamma;
        some[n++] = colG * gamma;
        some[n++] = colB * gamma;
        some[n++] = value[3] || 0xFF;
      } else if ( (value[0] + value[1] + value[2]) < 50 && (value[0] + value[1] + value[2]) > 400  ) {
        some[n++] = (array[index + 13] && array[index + 13][2]) * gamma || 0;
        some[n++] = (array[index + 13] && array[index + 13][0]) * gamma || 255;
        some[n++] = (array[index + 13] && array[index + 13][1]) * gamma || 0;
        some[n++] = value[3] || 0xFF;
       } else if ( (value[0] + value[1] + value[2]) > 50 && (value[0] + value[1] + value[2]) < 250  ) {
        some[n++] = (array[index - 13] && array[index - 13][2]) * gamma || 255;
        some[n++] = (array[index - 13] && array[index - 13][0]) * gamma || 255;
        some[n++] = (array[index - 13] && array[index - 13][1]) * gamma || 0;
        some[n++] = value[3] || 0xFF;
      } else {
        some[n++] = (array[index + 7] && array[index + 7][1]) * gamma  || 0;
        some[n++] = (array[index + 4] && array[index + 4][2]) * gamma  || 255;
        some[n++] = (array[index + 7] && array[index + 7][0]) * gamma  || 255;
        some[n++] = value[3] || 0xFF;
      }
    })
    pixelArray = [];
}


/************************
  
  It is also possible to call your own options object,
  your own created effects, and run them a specified
  number of times to create a variety of presets

************************/

effects.photon = function (chunk, opts) {

    var opts = opts || {};
    var gamma = opts.gamma || 1;
    var offset = opts.offset || 0;
    var colR = opts.color.r || 200; 
    var colG = opts.color.g || 200;
    var colB = opts.color.b || 200;
    var h = opts.size.height, w = opts.size.width;
    opts.render = 'triangular';

    var repeater = 12;
    for (var i = 0; i < repeater; i++){

      effects.moveswing.apply(null, [chunk, opts]);
      effects.smosht.apply(null, [chunk, opts]);

    }
    
}









// ============================

    // Glitcher Class

// ============================

var canvaseffects = {}
function Glitcher (img) {

  this.img = img;
  this.canvaseffects = this.canvaseffects || {};
  this.options = this.options || {};
  this.cx, this.cy; 
  this.sx, this.sy;
  this.ch, this.cw;
  this.cx = 0; this.cy = 0;
  this.cropFactor = 1;
  this.ch = canvas.width; this.cw = canvas.width;
  this.data = null;
  this.canvas = null;
  this.ctx = null;
  this.sData = null;
  this.states = [];
  var that = this


  Object.keys(effects).forEach(function (v,i) {
    that.canvaseffects[v] = function() {
    that.setOptions();

    effects[v](that.data, that.options, that.sData);
    ctx.putImageData( that.imageData, 0, 0, that.cx, that.cy, that.cw, that.ch  );
    that.saveState();
    }
  })
}


Glitcher.prototype.getImageData = function (img) {
  this.cx = 0, this.cy = 0;
  this.canvas = document.getElementById('ultros');
  this.ctx = this.canvas.getContext('2d');
  this.imageData = this.ctx.getImageData(this.cx, this.cy, this.canvas.width, this.canvas.height);
  this.ctx.drawImage(img, 0,0);
  this.data = this.imageData.data;
  this.img = img;

}

Glitcher.prototype.getSecondImageData = function () {
  var that = this;
  try {
    var secondImage = document.querySelector('#second-file').files[0];
    var canvaser = document.createElement('canvas');
    var btx = canvaser.getContext('2d');
        canvaser.setAttribute('id', 'bablyos');
    var reader = new FileReader();
        reader.onload = function(event) {
          try {
            var img2 = new Image();
            img2.onload = function() {
              var canvas = document.querySelector('#ultros');
              canvaser.width = canvas.width;
              canvaser.height = canvas.height;
              btx.drawImage(img2,0,0, img2.width, img2.height, 0, 0, canvas.width, canvas.height);
              var pImgData = btx.getImageData(0, 0, canvaser.width, canvaser.height);
              that.sData = pImgData.data;
              // document.body.appendChild(canvaser);

            }
            img2.src = event.target.result;
          } catch (e) {
            alert('could not read file(s)');
          }
        }
        reader.readAsDataURL(secondImage);
  } catch (e) {
    window.alert('Something is not right here...');
    console.log(e);

    return;
  }
}

Glitcher.prototype.clearSecondImageData = function() {
  document.querySelector('#second-file').value = null;
  this.sData = null;

}


Glitcher.prototype.passDataAlong = function () {
  var that = this;
  this.canvaseffects.data = this.data;
  this.canvaseffects.imageData = this.imageData;
  var canvastwo = document.getElementById('magnos');
  var ctxtwo = canvastwo.getContext('2d');
      ctxtwo.drawImage(this.canvas, 0, 0);
  
}

Glitcher.prototype.setOptions = function () {
  this.options = {
    gamma: 1,
    noise: true,
    values: 'white',
    render: 'normal',
    threshold: 50,
    optionDefaults: false, // new, unused
    patternMap: [0,0,0,0,0], // new, unused
    color: {r: 0, g: 0, b: 0},
    size: {width: canvas.width, height: canvas.height},
    channel: {r: false, g: false, b: false },
    swing: {r: 0, g: 0, b: 0, clip: 150},
  };

  this.options.size =  this.options.size || { width: canvas.width, height: canvas.height } ;
  var color = document.getElementById('color-picker').value;
  this.options.color = hex2Rgb(color);
  this.options.gamma = document.getElementById('lightness').value;
  this.options.noise = document.getElementById('splash-noise').checked === true ? true : false;
  this.options.render = document.getElementById('rendering').value;
  this.options.swing.r = document.getElementById('smosh-r').value;
  this.options.swing.g = document.getElementById('smosh-g').value;
  this.options.swing.b = document.getElementById('smosh-b').value;
  this.options.swing.clip = document.getElementById('smosh-clip').value;
  this.options.channel.r = document.getElementById('red').checked === true ? true : false;
  this.options.channel.g = document.getElementById('green').checked === true ? true : false;
  this.options.channel.b = document.getElementById('blue').checked === true ? true : false;
  this.options.threshold = parseInt(document.getElementById('threshold').value, 10);

};

Glitcher.prototype.runEffect = function() {
  var effectToRun = document.getElementById('effectrunner').value;

  console.log('Running...', effectToRun)
  this.canvaseffects[effectToRun]();

};

Glitcher.prototype.bindToButtons = function () {

  /*

      This will at some point use the Event Deleagtion Pattern

  */

  var runButton = document.getElementById('runbutton');
      runButton.addEventListener('click', this.runEffect.bind(this), false);

  var saveButton = document.getElementById('save');
      saveButton.addEventListener('click', this.saveTheCanvas.bind(this), false);

  var blendedRestoreButton = document.getElementById('blended-restore');
      blendedRestoreButton.addEventListener('click', this.blendedRestore.bind(this), false);
  
  var restoreButton = document.getElementById('restore');
      restoreButton.addEventListener('click', this.revertState.bind(this), false);

  var cropButton = document.getElementById('crop');
      cropButton.addEventListener('click', this.placeCrop.bind(this), false);

  var clearCropButton = document.getElementById('clearcrop')
      clearCropButton.addEventListener('click', this.clearCrop.bind(this), false);

  var setCropButton = document.getElementById('set-crop')
      setCropButton.addEventListener('click', this.setCropAt.bind(this), false);

  var secondImageData = document.querySelector('#second-file');
      secondImageData.addEventListener('change', this.getSecondImageData.bind(this), false);

  var clearSecondImageData = document.querySelector('#second-file-clear');
      clearSecondImageData.addEventListener('change', this.clearSecondImageData.bind(this), false);

}



// Save the image
Glitcher.prototype.saveTheCanvas = function (e){
  
  var that = this;
  this.canvas.toBlob(function(blob) {
    var imgAnchor = document.createElement('a');
        imgAnchor.setAttribute('data-downloaded', 'false');
    var newImg = document.createElement("img");
        newImg.height = that.canvas.height / 8;
        newImg.width  = that.canvas.width / 8;
        newImg.setAttribute('class', 'completed-image')
    var imgMaterial = that.canvas.toDataURL('image/png'),
        url = URL.createObjectURL(blob);
    var newDiv = document.createElement('div');
        newDiv.innerHTML = document.getElementById('history').innerHTML;

    that.anchor = document.getElementById('downloader');
    that.anchor.href = imgMaterial;
        imgAnchor.setAttribute('href', imgMaterial);
        imgAnchor.setAttribute('download', 'pixelsynth'+ new Date().toISOString().slice(17,19) + (Math.random()).toString().slice(2) +'.png');
    var fileName = 'pixelsynth'+ new Date().toISOString().slice(14,19).replace(':', "-" ) + (Math.random()).toString().slice(2) +'.png';
    that.anchor.setAttribute('download', fileName);
    that.anchor.innerText ='Download here now!';


    newImg.src = url;
    imgAnchor.appendChild(newImg);
    imageBar.appendChild(imgAnchor);

    document.body.appendChild(newDiv);
    // We don't revoke access because we allow the user to view and save the image
    // URL.revokeObjectURL(url);
  });
}

/*

// Not fully implemented or tested

Glitcher.prototype.rotateCanvas = function (degree) {
  var degree = degree || 180
  this.canvas = document.getElementById('ultros');
  this.ctx = this.canvas.getContext('2d');
  this.imageData = this.ctx.getImageData(0,0, canvas.width, canvas.height);
  this.cw = canvas.width, this.ch = canvas.height, this.cx = 0, this.cy = 0;
  this.data = this.imageData.data;

  switch (degree) {
       case 90:
            this.cw = canvas.height;
            this.ch = canvas.width;
            this.cy = canvas.height * (-1);
            break;
       case 180:
            this.cx = canvas.width * (-1);
            this.cy = canvas.height * (-1);
            break;
       case 270:
            this.cw = canvas.height;
            this.ch = canvas.width;
            this.cx = canvas.width * (-1);
            break;
  }

  this.ctx.translate(this.cw/2, this.ch/2);
  this.ctx.rotate(degree * Math.PI / 180);
  this.ctx.restore();

  // this.canvas.setAttribute('height', this.ch);
  // this.canvas.setAttribute('width', this.cw);
  // this.ctx.drawImage(this.img, -this.img.width/2, -this.img.width/2);
  // context.drawImage(image,-image.width/2,-image.width/2);
  this.ctx.putImageData(this.imageData, -this.cw/2, -this.cw/2);

}*/


Glitcher.prototype.saveState = function() {

  this.ctx.save();
}

Glitcher.prototype.restoreState = function() {
  this.ctx.restore();

}

Glitcher.prototype.generatePreview = function () {
  var effect = document.getElementById('effectrunner').value
  var canvas = document.getElementById('ultros');
  var ctx = canvas.getContext('2d');
  var canvastwo = document.getElementById('magnos');
  var ctx2 = canvastwo.getContext('2d');
  var c2ImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  this.setOptions();
  effects[effect](c2ImgData.data/*canvastwo data*/, this.options);
  ctx2.putImageData( c2ImgData, 0, 0);


}
Glitcher.prototype.blendedRestore = function () {
  var newCanvas, nCtx, nImgData;
  newCanvas = document.createElement('canvas');
  newCanvas.width = this.img.width;
  newCanvas.height = this.img.height;
  document.body.appendChild(newCanvas);
  nCtx = newCanvas.getContext('2d');
  nCtx.drawImage(this.img, this.cx, this.cy, this.cw, this.ch, this.cx, this.cy, this.cw, this.ch);
  nImgData = nCtx.getImageData(this.cx, this.cy, this.canvas.width, this.canvas.height)
  this.setOptions();
  finalEffects(this.data, nImgData.data, this.options);
  this.saveState();
  ctx.putImageData( this.imageData, 0, 0, this.cx, this.cy, this.cw, this.ch  );
  newCanvas.parentNode.removeChild(newCanvas);  

}

Glitcher.prototype.revertState = function() {
  this.ctx.drawImage(this.img, this.cx, this.cy, this.cw, this.ch, this.cx, this.cy, this.cw, this.ch);
  this.imageData = this.ctx.getImageData(this.cx, this.cy, this.canvas.width, this.canvas.height);
  this.data = this.imageData;
  this.canvaseffects.data = this.data;
  this.canvaseffects.imageData = this.imageData;
  this.canvas = document.getElementById('ultros');
  this.ctx = this.canvas.getContext('2d');
  this.clearCrop();

}





Glitcher.prototype.placeCrop = function () {
  this.canvas = document.getElementById('ultros');
  var that = this;
  function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
  }
  function captureMousePos(e) {
    var x = document.getElementById('slicerx');
    var y = document.getElementById('slicery');
    var mousePos = getMousePos(canvas, e);
        x.value = mousePos.x;
        y.value = mousePos.y;
  }

  function captureMousePos2(e) {
    var h = document.getElementById('slicerh');
    var w = document.getElementById('slicerw');
    var x = document.getElementById('slicerx');
    var y = document.getElementById('slicery');
    var mousePos = getMousePos(canvas, e);
        w.value = mousePos.x - x.value;
        h.value = mousePos.y - y.value;
  }


  this.canvas.addEventListener('mousemove',captureMousePos, false);
  this.canvas.style.cursor = "crosshair";
  this.canvas.addEventListener('click', function removeCaptureMousePos(e) {
    this.canvas = document.getElementById('ultros');
    this.canvas.removeEventListener('mousemove', captureMousePos, false);
    this.canvas.removeEventListener('click', removeCaptureMousePos, false);
    this.canvas.addEventListener('mousemove', captureMousePos2, false);
    this.canvas.addEventListener('click', function removeListeners(e) {
      this.canvas = document.getElementById('ultros');
      this.canvas.removeEventListener('mousemove', captureMousePos2, false);
      this.canvas.removeEventListener('click', removeListeners, false);
      that.setCropAt();
      this.canvas.style.cursor = "default";

    })
  })
}

Glitcher.prototype.setCropAt = function () {

  this.cx = document.getElementById('slicerx').value * this.cropFactor;
  this.cy = document.getElementById('slicery').value * this.cropFactor;
  this.ch = document.getElementById('slicerh').value * this.cropFactor;
  this.cw = document.getElementById('slicerw').value * this.cropFactor;

  if (this.ch === 0 && this.cw === 0) {
    this.ch = this.canvas.height;
    this.cw = this.canvas.width;
  }

}

Glitcher.prototype.clearCrop = function () {

  document.getElementById('slicerx').value = 0;
  document.getElementById('slicery').value = 0;
  document.getElementById('slicerh').value = 0;
  document.getElementById('slicerw').value = 0;

  this.cx = 0;
  this.cy = 0;
  this.ch = this.canvas.height;
  this.cw = this.canvas.width;

  this.imageData = this.ctx.getImageData(this.cx, this.cy, this.canvas.width, this.canvas.height);
  this.data = this.imageData;
  this.canvaseffects.data = this.data;
  this.canvaseffects.imageData = this.imageData;
  this.canvas = document.getElementById('ultros');
  this.ctx = this.canvas.getContext('2d');
  this.data = this.imageData.data;
  
}




// ============================

    // UI Code

// ============================


/*   */

/**  
  *
  *   The UI is generated on load
  *
  *   Because the UI is generated here, 
  *   it avoids the need to bind to
  *   the onload event.
  *
  *
  *
  *
 **/





// FILEREADER
/*
<label>Image File:</label><br/>
<input type="file" id="imageLoader" name="imageLoader"/>
<canvas id="imageCanvas"></canvas>
*/

if (!HTMLCanvasElement.prototype.toBlob) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: function (callback, type, quality) {

    var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
        len = binStr.length,
        arr = new Uint8Array(len);

    for (var i=0; i<len; i++ ) {
     arr[i] = binStr.charCodeAt(i);
    }

    callback( new Blob( [arr], {type: type || 'image/png'} ) );
  }
 });
}


// The Whole Code
var frag = document.createDocumentFragment();
var label = document.createElement('label');
    label.innerText = 'File:';
var fileLoader = document.createElement('input');
    fileLoader.setAttribute('type', 'file');
    fileLoader.setAttribute('id', 'imageLoader');
    fileLoader.setAttribute('name', 'imageLoader');
var anchor = document.createElement('a');
    anchor.setAttribute('id', 'downloader');
    anchor.innerText ='Download here (Not Yet)';
    anchor.setAttribute('download', '');

  // This is the main canvas
var canvasHolder = document.createElement('div');
    canvasHolder.setAttribute('id', 'canvasbound');
var canvasStats = document.createElement('div');
    canvasStats.setAttribute('id', 'stats');
    canvasStats.innerHTML = '<p id="type">Type:</p> \
                             <p id="size">Size:</p>'
var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'ultros');



// ADD Color Picker and color changer
  function addColorsToColorCanvas () {
    var colorCanvas = document.getElementById('artemis');
    var actx = colorCanvas.getContext('2d');
    if (localStorage.colors) {
      var colors = localStorage.colors.split(',');
      var height = 25, width = 25, starterw = 0, starterh = 0;
      var colorLength = colors.length;
      var counter = 0;
      colorCanvas.width = (colorLength * width) / 2;
      colorCanvas.height = height * (Math.ceil(colorLength / 4) ) ;
      colors.forEach(function(v,i) {
        actx.fillStyle = v;
        actx.fillRect(starterw, starterh, height, width);
        starterw += width; //+ Math.floor(width / 4);
        counter++;
        if (counter > 4) {
          counter = 0;
          starterw = 0;
          starterh += height;

        }
      })
    } else {
      localStorage.colors = "['#d0d0d0']";
    } 
  }

  // This is the color palette
  var colorCanvas = document.createElement('canvas');
      colorCanvas.setAttribute('id', 'artemis');
      colorCanvas.addEventListener('click', function getPixelColor(e) {
        var x = e.layerX;
        var y = e.layerY;
        var actx = this.getContext('2d');
        var pixelcolor = actx.getImageData(x, y, 1, 1);
        var pixelData = pixelcolor.data
        document.getElementById('color-picker').value = "#" + rgb2Hex(pixelData[0], pixelData[1], pixelData[2]);

      })

  // Add a second preview canvas for real time updating of effects
  var canvastwo = document.createElement('canvas');
      canvastwo.setAttribute('id', 'magnos');
  var ctxtwo = canvastwo.getContext('2d');
      canvastwo.width = 100;
      canvastwo.height = 100;

    canvasStats.appendChild(colorCanvas);
    canvasStats.appendChild(canvastwo);
    canvasHolder.appendChild(canvasStats);
    canvasHolder.appendChild(canvas);


// This div holds EVERYTHING
var bigdiv = document.createElement('div');
    bigdiv.setAttribute('id', 'bigdiv');

    frag.appendChild(label);
    frag.appendChild(fileLoader);
    frag.appendChild(canvasHolder);
    frag.appendChild(bigdiv);
    bigdiv.appendChild(anchor)


var effectList = Object.keys(effects);


function setUpAllOptions(arr, frag) {
  var select = document.createElement('select');
      select.setAttribute('id', 'effectrunner');
  var runButton = document.createElement('input');
      runButton.setAttribute('value', 'Run');
      runButton.setAttribute('id', 'runbutton');
      runButton.setAttribute('type', 'button');
  for ( var i =0, el = arr.length;i<el;i++ ) {
    var option = document.createElement('option');
        option.value = arr[i];
        option.text = arr[i].slice(0,1).toUpperCase() + arr[i].slice(1);
        select.add(option);
        option = null;
  }
  frag.appendChild(select);
  frag.appendChild(runButton);
}





  setUpAllOptions(effectList, bigdiv);
  var saveButton = document.createElement('input');
      saveButton.setAttribute('value', 'Save It');
      saveButton.setAttribute('id', 'save');
      saveButton.setAttribute('type', 'button');
      bigdiv.appendChild(saveButton);
  // var undoButton = document.createElement('input');
  //     undoButton.setAttribute('value', 'Undo');
  //     undoButton.setAttribute('id', 'undo');
  //     undoButton.setAttribute('type', 'button');
  //     bigdiv.appendChild(undoButton);
  var restoreButton = document.createElement('input');
      restoreButton.setAttribute('value', 'Restore');
      restoreButton.setAttribute('id', 'restore');
      restoreButton.setAttribute('type', 'button');
      bigdiv.appendChild(restoreButton);
  var blendedRestoreButton = document.createElement('input');
      blendedRestoreButton.setAttribute('value', 'Blended Restore');
      blendedRestoreButton.setAttribute('id', 'blended-restore');
      blendedRestoreButton.setAttribute('type', 'button');
      bigdiv.appendChild(blendedRestoreButton);
  // var rotateButton = document.createElement('input');
  //     rotateButton.setAttribute('value', 'Rotate');
  //     rotateButton.setAttribute('id', 'rotate');
  //     rotateButton.setAttribute('type', 'button');
  //     bigdiv.appendChild(rotateButton);







  var colorPicker = document.createElement('input');
      colorPicker.setAttribute('value', '#ffffff');
      colorPicker.setAttribute('id', 'color-picker');
      colorPicker.setAttribute('type', 'color');
      bigdiv.appendChild(colorPicker);
  var addColor = document.createElement('input');
      addColor.setAttribute('value', 'add color');
      addColor.setAttribute('id', 'add-color');
      addColor.setAttribute('type', 'button');
      addColor.addEventListener('click', function() {
        var color = document.getElementById('color-picker');
        var colArray =  localStorage.colors ? localStorage.colors.split(',') : [];
        colArray[colArray.length] = color.value;
        localStorage.colors = colArray; 
        color.value = "#ffffff";
        addColorsToColorCanvas();
      })
      bigdiv.appendChild(addColor)
  var clearColor = document.createElement('input');
      clearColor.setAttribute('value', 'clear color');
      clearColor.setAttribute('id', 'clear-color');
      clearColor.setAttribute('type', 'button');
      clearColor.addEventListener('click', function() {
        var color = document.getElementById('color-picker');
        var colArray = localStorage.colors.split(',');
        var index = colArray.indexOf(color.value);
          if (index > -1) {
            colArray.splice(index, 1);
          } else {
            alert('Not a saved color!');
          }
        localStorage.colors = colArray;
        color.value = "#ffffff";
      })
      bigdiv.appendChild(clearColor)

  var gammaLabel = document.createElement('label');
      gammaLabel.setAttribute('for', 'lightness');
      gammaLabel.setAttribute('id', 'gamma-label');
      gammaLabel.innerText = "Gamma: 0";
  var gammaRange = document.createElement('input');
      gammaRange.setAttribute('value', '1');
      gammaRange.setAttribute('id', 'lightness');
      gammaRange.setAttribute('type', 'range');
      gammaRange.setAttribute('min', '0');
      gammaRange.setAttribute('max', '5');
      gammaRange.setAttribute('step', '0.1');
      gammaRange.addEventListener('change', function updateGammaLabelValue(e) {
        var gammaDisplay = document.getElementById('gamma-label');
        var gammaValue = document.getElementById('lightness').value; 
            gammaDisplay.innerText = "Gamma: " + gammaValue;
      })
      bigdiv.appendChild(gammaLabel);
      bigdiv.appendChild(gammaRange);

  var secondFile = document.createElement('input');
      secondFile.setAttribute('id', 'second-file');
      secondFile.setAttribute('type', 'file');
      bigdiv.appendChild(secondFile);
  var clearSecondFile = document.createElement('input');
      clearSecondFile.setAttribute('id', 'second-file-clear');
      clearSecondFile.setAttribute('type', 'button');
      clearSecondFile.setAttribute('value', 'Clear File');
      bigdiv.appendChild(clearSecondFile);



  // This should add a watcher to the current position on the screen for both x,y
  // This controls the selection
  var cropButton = document.createElement('input');
      cropButton.setAttribute('id', 'crop');
      cropButton.setAttribute('type', 'button');
      cropButton.setAttribute('value', 'crop');
      bigdiv.appendChild(cropButton);
  var slicerx = document.createElement('input');
      slicerx.setAttribute('value', '0');
      slicerx.setAttribute('id', 'slicerx');
      slicerx.setAttribute('type', 'input');
      bigdiv.appendChild(slicerx);
  var slicery = document.createElement('input');
      slicery.setAttribute('value', '0');
      slicery.setAttribute('id', 'slicery');
      slicery.setAttribute('type', 'input');
      bigdiv.appendChild(slicery);
  var slicerh = document.createElement('input');
      slicerh.setAttribute('value', '0');
      slicerh.setAttribute('id', 'slicerh');
      slicerh.setAttribute('type', 'input');
      bigdiv.appendChild(slicerh);
  var slicerw = document.createElement('input');
      slicerw.setAttribute('value', '0');
      slicerw.setAttribute('id', 'slicerw');
      slicerw.setAttribute('type', 'input');
      bigdiv.appendChild(slicerw);
  var setCropButton = document.createElement('input');
      setCropButton.setAttribute('id', 'set-crop');
      setCropButton.setAttribute('type', 'button');
      setCropButton.setAttribute('value', 'set crop');
      bigdiv.appendChild(setCropButton);
  var clearCropButton = document.createElement('input');
      clearCropButton.setAttribute('id', 'clearcrop');
      clearCropButton.setAttribute('type', 'button');
      clearCropButton.setAttribute('value', 'clear crop');
      bigdiv.appendChild(clearCropButton);

  // Currently only works on avg and bish
  var renderSelectArray = ["normal","clipped","notclipped","mean", "notmean","triangular", "triangularinverse"];
  var renderSelect = document.createElement('select');
      renderSelect.setAttribute('id', 'rendering');
      bigdiv.appendChild(renderSelect)
      for (var i = 0; i < renderSelectArray.length; i++) {
        var option = document.createElement("option");
        option.value = renderSelectArray[i];
        option.text = renderSelectArray[i].slice(0,1).toUpperCase() + renderSelectArray[i].slice(1);
        renderSelect.appendChild(option);
      }


  // This controls the Splash effects
  var noiseLabel = document.createElement('label');
      noiseLabel.setAttribute('for', 'splash-noise');
      noiseLabel.innerText = 'Noise';      
  var noiseButton = document.createElement('input');
      noiseButton.setAttribute('id', 'splash-noise');
      noiseButton.setAttribute('type', 'checkbox');
      noiseButton.setAttribute('value', 'noise');
      bigdiv.appendChild(noiseLabel);
      bigdiv.appendChild(noiseButton);




  // This controls the smosh effects
  var channels = ['smosh-r', 'smosh-g', 'smosh-b'];
  var smoshDiv = document.createElement('div');
      smoshDiv.setAttribute('id', 'smosh-div');
      createSmoshRanges(smoshDiv, channels);
  var lockLabel = document.createElement('label');
      lockLabel.setAttribute('for', 'smosh-lock');
      lockLabel.innerText = 'Lock';
  var lockButton = document.createElement('input');
      lockButton.setAttribute('id', 'smosh-lock');
      lockButton.setAttribute('type', 'checkbox');
      lockButton.setAttribute('value', 'lock');
      lockButton.addEventListener('change', function lockSmoshRanges(e) {
          var smoshR = document.getElementById('smosh-r');
          var smoshG = document.getElementById('smosh-g');
          var smoshB = document.getElementById('smosh-b');
        if (e.target.checked) {
            smoshG.disabled = true;
            smoshB.disabled = true;
          function updateOtherValues(e2) {
            smoshG.value = smoshR.value;
            smoshB.value = smoshR.value;
            
          }

          smoshR.addEventListener('change', updateOtherValues );

        } else {

          smoshR.removeEventListener('change', updateOtherValues, false);

          smoshG.disabled = false;
          smoshB.disabled = false;
        }
      })

  var clipLabel = document.createElement('label');
      clipLabel.setAttribute('for', 'smosh-clip');
      clipLabel.innerText = "Clip:";
  var clipInput = document.createElement('input');
      clipInput.setAttribute('id', 'smosh-clip');
      clipInput.setAttribute('type', 'text');

      smoshDiv.appendChild(lockLabel);
      smoshDiv.appendChild(lockButton);
      smoshDiv.appendChild(clipLabel);
      smoshDiv.appendChild(clipInput);
      bigdiv.appendChild(smoshDiv);



    function createSmoshRanges(div, arr) {
      arr.forEach(function(id) {
        var para  = document.createElement('p');
        var label = document.createElement('label');
            label.setAttribute('for', id);
            label.innerText = id + ": ";
        var valueVisual = document.createElement('span');
            valueVisual.innerText = "0";
        var range = document.createElement('input');
            range.setAttribute('value', '0');
            range.setAttribute('id', id);
            range.setAttribute('name', id);
            range.setAttribute('type', 'range');
            range.setAttribute('min', '0');
            range.setAttribute('max', '100');
            range.setAttribute('step', '1');
            range.addEventListener('change', function updateValueVisual(e) {
              valueVisual.innerText = this.value;
              // updatePreviewCanvas()
            })

            para.appendChild(label);
            para.appendChild(valueVisual);
            div.appendChild(para);
            div.appendChild(range);
      })
    }




  function createChannelChecks(div) {
    var channelChecks = ['red', 'green', 'blue'];
    channelChecks.forEach(function (v) {
      var p  = document.createElement('p');
      var label = document.createElement('label');
          label.setAttribute('for', v);
          label.innerText = v + ": ";
      var el = document.createElement('input');
          el.setAttribute('type', 'checkbox');
          el.setAttribute('id', v);
          el.setAttribute('name', v);

          p.appendChild(label);
          div.appendChild(p);
          div.appendChild(el);
    })
  }
  
  var channelDiv = document.createElement('div');
      channelDiv.setAttribute('id', 'channel-div');
      createChannelChecks( channelDiv );
  var thresholdLabel = document.createElement('label');
      thresholdLabel.setAttribute('for', 'threshold');
      thresholdLabel.innerText = "threshold:";
  var threshholdInput = document.createElement('input');
      threshholdInput.setAttribute('id', 'threshold');
      threshholdInput.setAttribute('type', 'text');

      channelDiv.appendChild(thresholdLabel);
      channelDiv.appendChild(threshholdInput);
      bigdiv.appendChild(channelDiv);



  var instaDiv = document.createElement('div');
      instaDiv.setAttribute('id', 'insta-div');
      bigdiv.appendChild(instaDiv);




  document.body.appendChild(frag);
      addColorsToColorCanvas();


// http://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var ctx = canvas.getContext('2d');

function handleImage(e){
  // if (/.*(jpg|jpeg|png|gif)/gi.test(e.target.files[0].name) ){

    var reader = new FileReader();
    reader.onload = function(event){
        // console.log(e, e.target.files[0].name)
      if (/.*(jpg|jpeg|png|gif)/gi.test(e.target.files[0].name) && e.target.files[0].size < 5000000 ){

        try {

          var img = new Image();
          img.onload = function(){
              canvas.width = img.width;
              canvas.height = img.height;
              canvasStats.style.height = img.height;
              canvasStats.style.width = img.width;
              ctx.drawImage(img,0,0);
              if (img.height > 1600 || img.width > 1600) {
                canvas.style.width = Math.ceil(img.width / 4) + "px";
                canvas.style.height = Math.ceil(img.height / 4) + "px";
                canvasStats.style.height = Math.ceil(img.height / 4) + "px";
                canvasStats.style.width = Math.ceil(img.width / 4) + "px";
                glitcher.cropFactor = 4;
              } else if (img.height > 800 || img.width > 800) {
                canvas.style.width = Math.ceil(img.width / 2) + "px";
                canvas.style.height = Math.ceil(img.height / 2) + "px";
                canvasStats.style.height = Math.ceil(img.height / 2) + "px";
                canvasStats.style.width = Math.ceil(img.width / 2) + "px";
                glitcher.cropFactor = 2;
              } else {
                glitcher.cropFactor = 1;
              }

              glitcher.getImageData(this);
              glitcher.passDataAlong(this);
              glitcher.clearCrop();
          }
          img.src = event.target.result;
        } catch (err) {
          alert('There was an arror!', err);
        }
      } else {
        if ( ! /.*(jpg|jpeg|png|gif)/gi.test(e.target.files[0].name) ){
          alert('Not a valid image, needs to be either jpg, jpeg, gif, or png');   
        }
        if (e.target.files[0].size > 5000000) {
          alert('Image greater than 5mbs');
        }
      }
    }
    reader.readAsDataURL(e.target.files[0]);     
}


//  Begin MAGIC

// initialize Glitcher
var glitcher = new Glitcher();
    glitcher.bindToButtons();

// End MAGIC


var frag2 = document.createDocumentFragment();
var h3 = document.createElement('h3');
    h3.innerText = 'Note:';
var unorderedList = document.createElement('ul');
var listItem1 = document.createElement('li');
    listItem1.innerText = "Some of these processes create multiple large ";
var anchor1 = document.createElement('a');
    anchor1.innerText = "Buffers";
    anchor1.target = '_blank';
    anchor1.href = "https://en.wikipedia.org/wiki/Data_buffer";
var listItem2 = document.createElement('li');
    listItem2.innerText = "Suggested image size is roughly ";
var anchor2 = document.createElement('a');
    anchor2.innerText = "1500000 bytes";
    anchor2.target = '_blank';
    anchor2.href = "https://www.google.com/#q=how+many+bytes+in+a+megabyte";
var listItem3 = document.createElement('li');
    listItem3.innerText = "Requires HTML5 ";
var anchor3 = document.createElement('a');
    anchor3.innerText = "Canvas";
    anchor3.target = '_blank';
    anchor3.href = "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API";
var listItem4 = document.createElement('li');
    listItem4.innerText = "This app does not support ";    
var anchor4 = document.createElement('a');
    anchor4.innerText = "Internet Explorer";
    anchor4.target = '_blank';
    anchor4.href = "https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=download%20a%20different%20browser";
    frag.appendChild(h3);
    frag.appendChild(unorderedList);
    unorderedList.appendChild(listItem1);
    listItem1.appendChild(anchor1);
    unorderedList.appendChild(listItem2);
    listItem2.appendChild(anchor2);
    unorderedList.appendChild(listItem3);
    listItem3.appendChild(anchor3);
    unorderedList.appendChild(listItem4);
    listItem4.appendChild(anchor4);

// This is where images will get attached
var imageBar = document.createElement('div');
    imageBar.setAttribute('id', 'image-bar');
var imageBarLabel = document.createElement('p');
    imageBarLabel.innerText = "Your images";
    imageBar.appendChild(imageBarLabel);
    frag.appendChild(imageBar);

    document.body.appendChild(frag);


})(window);

// ============================

    // Description Modal

// ============================


// This is seperate so it can be disabled safely


;(function bootstrapTheModal(window){
  'use strict';
  // if (localStorage && localStorage.pixyl && localStorage.pixyl.shown === true ) return ;
  if ( parseInt(localStorage.getItem('shown'), 10) === 1) return;

  var domRef = window.document;
  var dFrag = domRef.createDocumentFragment();
  var glitchText = [
   "Sometimes a deep sleep comes without dreams",
   "Towards a new philospophy: Artist as filter",
    "The artist's eye is always tracing, like a program, always absorbing bits of data to be processed.",
   "Nearly infinite computing power now exists on demand within the cloud, processing well over 1 million petraflops of data per second. ",
   "The artist makes connections via tacit, illicit, catharcist, or possibly intelligble relationships. It is in this way, the artist is ahead of machine learning, big compute is unable to keep up with the seemingly random process by which a connection can resolve. ",
   "it is by the artist's hand that meaning can be derived from the ever changing and evolving data sources around us.",
   "We must remain keen and sharp to these changes, the zeitgeist of the internet age is the replacement of the human touch with repeateable processes.",
   "Sadly I must confer that through technology, I have in fact found a repeatable pattern to my own work, the paths through darkness always lead me to the same light. I must also confess that I am drawn into these repeatable processees.",
   "I fear that ultimtely in the end, the futility of trying to make anew from what is already new is a task only left for the cleverest of minds. I have become fully vested in the mindshare that the artist, through her/his whim can only create from what is known in their own time and what has come before. And in this way is locked into that time, indefinetely.",
   "The only way for the artist to continue to make work that is relevant after their own mortality, is to have passed down the process, the soul of the artists will always remain in the how the work was made. ",
   "At this point the remaining dilemna in making is the paranoia of having the IP stolen. This is also true of tech, however it should be said that no matter the length of the theft, the true master knows that only they can complete the work as they had already seen it.",
   "All that being said, I seek to become more than my own mortality and to give you the filter by which I create my work. In this way, although we may have never met, you can share in my making process, and see things that you have taken with your lens, through mine.",
   "This is all I wanted to say, the rest is self explanitory",
   "-Jozes"
      ];

  function createHTMLText(text, type) {
    var el = domRef.createElement(type);
        el.setAttribute('class', 'modal-text');
        el.innerText = text;
        return el;
  }

    function addCSSRules(sheet, selector, rules, index) {
      if (!!sheet['insertRule']) {
        sheet.insertRule(selector + "{" + rules + "}", index);
      } else if (!!sheet['addRule']) {
        sheet.addRule(selector, rules, index);
      }
    }

  var sheet = (function(){
    var style = domRef.createElement('style');
        style.appendChild(document.createTextNode(""));
        style.setAttribute('media', 'screen');
        domRef.head.appendChild(style);
        return style.sheet;
    })();



    
    addCSSRules(sheet, "#modal-div", "top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); position: fixed; -webkit-transform-style: preserve-3d; -moz-transform-style: preserve-3d; transform-style: preserve-3d;");
    addCSSRules(sheet, "#text-div", "position: fixed; top: 50%; left: 25%; right: 25%; -webkit-transform: translateY(-50%); -moz-transform: translateY(-50%); -ms-transform: translateY(-50%); -o-transform: translateY(-50%); transform: translateY(-50%); background-color: rgb(255, 255, 255); padding: 1.5em;");
    addCSSRules(sheet, '.hide-modal', "top: 10px; right: 10px; position:fixed;");
    addCSSRules(sheet, '.modal-text', 'text-align:left;' );

  var textDiv = domRef.createElement('div');
      textDiv.setAttribute('id', 'text-div');
  var modalDiv = domRef.createElement('div');
      modalDiv.setAttribute('id','modal-div');
  var anchor = domRef.createElement('a');
      anchor.setAttribute('class', 'hide-modal');
      anchor.setAttribute('href', '#');
      anchor.innerText = "close";
      anchor.addEventListener('click', function hideModal(e){
        var mod = document.getElementById('modal-div');
            mod.parentElement.removeChild(mod);
      })

  var allText = glitchText.map(function(v,i) {
      switch (i) {
        case 0: return createHTMLText(v, 'h1'); break;
        case 1: return createHTMLText(v, 'h2'); break;
        default: return createHTMLText(v, 'p'); break;
        
      }
      })


      textDiv.appendChild(anchor);
      for (var i = 0; i < allText.length; i++) 
        textDiv.appendChild(allText[i]);
      modalDiv.appendChild(textDiv);
      dFrag.appendChild(modalDiv);
      domRef.body.appendChild(dFrag);


      
      localStorage.setItem('shown', 1);

})(window);








