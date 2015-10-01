# pixel-manipulator

This is a personal project of mine to apply various effects to images via a web interface.


To modify the effects, add an effects to the effects object like so

        effects.cooleffectname = function(c, o, c2){
         // Do stuff in here...
        }

"c" is a Uint8Array passed from the first file input.
"o" is the options object.
"c2" is a second Uint8Array from the second file input.


