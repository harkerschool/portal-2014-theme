var ColorInput = (function($) {

  // define colors here
  // use 6 character hex with uppercase
	var STD_COLORS = [
		{ hex: '#FFFFFF', name: 'white' },
		{ hex: '#F5DEBC', name: 'ivory' },
		{ hex: '#DBB48B', name: 'tan' },
		{ hex: '#F2AE29', name: 'goldenrod' },
		{ hex: '#F1B65A', name: 'buff' },
		{ hex: '#F1E88B', name: 'yellow' },
		{ hex: '#FFE500', name: 'solar yellow' },
		{ hex: '#E75F85', name: 'cherry' },
		{ hex: '#F596C0', name: 'pulsar pink' },
		{ hex: '#E58761', name: 'salmon' },
		{ hex: '#FA9C28', name: 'cosmic orange' },
		{ hex: '#ECB8BA', name: 'pink' },
		{ hex: '#D1204E', name: 'red' },
		{ hex: '#ACD2A9', name: 'green' },
		{ hex: '#009F5C', name: 'gamma green' },
		{ hex: '#A6CE39', name: 'terra green' },
		{ hex: '#C4B5CC', name: 'lilac' },
		{ hex: '#A7D7E3', name: 'blue' },
		{ hex: '#00B9D5', name: 'lunar blue' }
	];

	var CARDSTOCK_COLORS = [
    { hex: '#FFFFFF', name: 'white' },
    { hex: '#FEF3D5', name: 'ivory' },
    { hex: '#FFF697', name: 'yellow' },
    { hex: '#FCD619', name: 'solar yellow' },
    { hex: '#F8931D', name: 'cosmic orange' },
    { hex: '#BBE0CE', name: 'green' },
    { hex: '#A6CE39', name: 'terra green' },
    { hex: '#00A650', name: 'gamma green' },
    { hex: '#00BBD6', name: 'lunar blue' },
    { hex: '#FACCD6', name: 'pink' },
    { hex: '#F596BE', name: 'pulsar pink' },
    { hex: '#D1242A', name: 'red' }
	];

  /**
   * Creates 2d array for color pallete argument in Spectrum
   * @param  {array} colors - an array of colors, see constants above for example
   * @return {array} a 2d array, where each row represents a row in the dropdown palette
   */
  function getColorPallete(colors, numColumns) {
    colors = colors || [];
    numColumns = parseInt(numColumns, 10) || 5;
    
    var pallete = [];
    var row = [];

    colors.forEach(function(color, index) {
      row.push(color.hex);

      if ((index + 1) % numColumns === 0) {
        pallete.push(row);
        row = [];
      }
    });

    if (row.length) {
      pallete.push(row);
    }

    return pallete;
  }

  /**
   * Initializes Spectrum plugin (creates color input)
   * @param  {object} options
   */
  function init(options) {
    var defaults = { 
      selector: '', 
      paperType: 'standard', 
      colors: [],
      numColumns: 5
    };

    var settings = $.extend({}, defaults, options);
    var pallete = {};
    var colors = [];

    if (settings.colors.length) {
      colors = settings.colors;
    } else if (settings.paperType === 'cardstock') {
      colors = CARDSTOCK_COLORS;
    } else {
      colors = STD_COLORS;
    }

    pallete = getColorPallete(colors, settings.numColumns);
    
    $(document).ready(function() {
      var $el = $(settings.selector);

      $el.spectrum({
        showPaletteOnly: true,
        showPalette:true,
        palette: pallete,
        change: function(color) {
          var selectedColor = colors.find(function(currentColor) {
            return currentColor.hex === color.toHexString().toUpperCase();
          });
          var colorName = (selectedColor.hasOwnProperty('name')) ? selectedColor.name : '';

          $el.val(colorName); // update input value
          $el.siblings('.color-name').text('(' + colorName + ')'); // update display text
        }
      });

      $el.siblings('.sp-replacer').after($('<span class="color-name">(color not selected)</span>'));
    });
  }

  return {
    init: init
  };

})(jQuery);

// Array.find polyfill
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}