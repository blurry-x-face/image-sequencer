/*
* Crops an Image on the basis of the ratio provided
*/
module.exports = function ConstrainedCrop(options, UI) {

  var defaults = require('./../../util/getDefaults.js')(require('./info.json'));
  var output;

  function draw(input, callback) {

    var step = this,
      startingX = Number(options.startingX || defaults.startingX),
      startingY = Number(options.startingY || defaults.startingY),
      aspectRatio = (options.aspectRatio || defaults.aspectRatio).split(':'),
      widthRatio = Number(aspectRatio[0]),
      heightRatio = Number(aspectRatio[1]);

    function changePixel(r, g, b, a) {
      return [r, g, b, a];
    }

    function extraManipulation(pixels, setRenderState, generateOutput) {
      setRenderState(false);
      var width = pixels.shape[0],
        height = pixels.shape[1];
      var endX, endY;
      if(((width - startingX) / widthRatio) * heightRatio <= (height - startingY)) {
        endX = width;
        endY = (((width - startingX) / widthRatio) * heightRatio) + startingY;
      }
      else {
        endX = (((height - startingY) / heightRatio) * widthRatio) + startingX;
        endY = height;
      }
      const newPixels = require('../Crop/Crop')(pixels, {'x': startingX, 'y': startingY, 'w': endX - startingX, 'h': endY - startingY}, function() {
      });
      setRenderState(true);
      generateOutput();
      return newPixels;
    }


    function output(image, datauri, mimetype, wasmSuccess) {
      step.output = { src: datauri, format: mimetype, wasmSuccess, useWasm: options.useWasm };
    }
    return require('../_nomodule/PixelManipulation')(input, {
      output: output,
      ui: options.step.ui,
      extraManipulation: extraManipulation,
      format: input.format,
      image: options.image,
      inBrowser: options.inBrowser,
      callback: callback,
      useWasm:options.useWasm,
      changePixel
    });
  }
  return {
    options: options,
    draw: draw,
    output: output,
    UI: UI
  };
};
