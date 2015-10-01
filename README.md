# pixel-manipulator

This is a personal project of mine to apply various effects to images via a web interface.


To modify the effects, add an effects to the effects object like so:
```javascript
effects.cooleffectname = function(c, o, c2){
 // Do stuff in here...
}```

"c" is a Uint8Array passed from the first file input. 
"o" is the options object.
"c2" is a second Uint8Array from the second file input.

The options object contains  parameters passed in via the UI. 

Name | Type | Extra
--- | --- | ---
 noise | [Boolean] 
 render | [String] 
 threshold | [Number]
 gamma  | [Number::Float] | 0.0 - 5.0
 size | [Object] | {height: [Number], width: [Number] }
 color | [Object] | {r: [Number], g: [Number], b: [Number]}
 swing | [Object] | {r: [Number], g: [Number], b: [Number] }
 channel [Object] | {r: [Boolean], g: [Boolean], b: [Boolean]}

I recommend a structure like so for the effects function

```javascript
var opts = opts || {};
var gamma = opts.gamma || 1;
var colR = opts.colorR || 200; 
var colG = opts.colorG || 200;
var colB = opts.colorB || 200;
var paramsArray = paramsArray || chunk;
```
 
  It is also possible to call your own options object,
  your own created effects, and run them a specified
  number of times to create a variety of presets

```javascript

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

```