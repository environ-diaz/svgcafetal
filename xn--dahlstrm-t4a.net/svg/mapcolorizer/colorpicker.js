/**
 * Colorpicker and colorspace conversion functions.
 *
 * By Erik Dahlstrom, ed@opera.com, 2008.
 * (c) Opera Software ASA
 *
 * This work is licensed under the Creative Commons Attribution-Share Alike 3.0 license.
 * http://creativecommons.org/licenses/by-sa/3.0/
 *
 * Official site for the script (and further enhancements):
 *   http://github.com/zui/jscolorpicker/tree
 *
 * @param numrows The number of rows in the palette
 * @param numcols The number of columns in the palette
 * @param rdim The length of a side of one of the little palette color rects
 * @param callback The callback function that will be called when a color is selected
 * @param doc The document the colorpicker should be embedded into
 */
function ColorPicker(numrows, numcols, rdim, callback, doc) {
  var svgns = "http://www.w3.org/2000/svg";
  var root = null;
  var anim = null;
  var numrows = numrows;
  var numcols = numcols;
  var rdim = rdim;
  var timerid = null;
  var minoffset = null; // origo
  var maxoffset = null; // maximum offset to keep within viewBox/viewport

  init(numrows,numcols,rdim,callback,doc);

  /**
	 * Takes a triplet of values h=[0..360], s=[0..1] and v=[0..1] and
	 * returns the corresponding rgb color with component values in the range [0..1].
	 */
	function hsv2rgb(h, s, v) {
		// specialcases first
		if (s == 0)
			return [v, v, v];
		else if (v == 0)
			return [0,0,0];

		var h = h / 60.0;
		var i = Math.floor(h);
		var hi = i % 6;
		var f = h - i;
		var p = v * (1 - s);
		var q = v * (1 - s * f);
		var t = v * (1 - s * (1 - f));

		switch(hi) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
			default:
				return [v, p, q];
		}
	}

	/**
	 * Converts hsv -> hsl. The s and l values are in the range [0..1].
	 */
	function hsv2hsl(h,s,v) {
		var ss = s*v;
		var l = (2 - s) * v;
		ss /= (l <= 1) ? l : (2 - l);
		l /= 2;
		return [h,ss,l];
	}

	/**
	 * Converts hsl -> hsv. The s and v values are in the range [0..1].
	 */
	function hsl2hsv(h,s,l) {
		l *= 2;
		s *= (l <= 1) ? l : (2 - l);
		var v = (l + s) / 2;
		var ss = (2 * s) / (l + s);
		return [h,ss,v];
	}

	/**
	 * Make an SVGPoint and return it.
	 */
  function Point(x, y) {
    var point = root.createSVGPoint();
    point.x = x;
    point.y = y;
    return point;
  }

  /**
	 * Make an SVGPoint and return it.
	 */
  function Rect(x, y, w, h) {
    var rect = root.createSVGRect();
    rect.x = x;
    rect.y = y;
    rect.width = w;
    rect.height = h;
    return rect;
  }

	function setSize(embeddingdoc,w,h) {
    if(embeddingdoc.documentElement.getScreenCTM) {
      var matrix = embeddingdoc.documentElement.getScreenCTM();
      var offset = Point(0,0);
      var moffset = Point(window.innerWidth,window.innerHeight);
      if(embeddingdoc.documentElement.hasAttributeNS(null, "viewBox")) {
        var vb = doc.documentElement.viewBox.baseVal;
        offset.x = vb.x;
        offset.y = vb.y;
        moffset.x = vb.width;
        moffset.y = vb.height;
      } else if(embeddingdoc.documentElement.hasAttributeNS(null, "width") &&
                embeddingdoc.documentElement.hasAttributeNS(null, "height")) {
        moffset = Point(embeddingdoc.documentElement.width.baseVal.value,embeddingdoc.documentElement.height.baseVal.value);
      }

      minoffset = offset;

      offset = offset.matrixTransform(matrix);
      matrix = matrix.inverse();

      var box = Rect(offset.x,offset.y,w,h);

      var corners = [];
      var point = Point(box.x, box.y);
      corners.push( point.matrixTransform(matrix) );
      point.x = box.x + box.width;
      point.y = box.y;
      corners.push( point.matrixTransform(matrix) );
      point.x = box.x + box.width;
      point.y = box.y + box.height;
      corners.push( point.matrixTransform(matrix) );
      point.x = box.x;
      point.y = box.y + box.height;
      corners.push( point.matrixTransform(matrix) );
      var max = Point(corners[0].x, corners[0].y);
      var min = Point(corners[0].x, corners[0].y);

      for (var i = 1; i < corners.length; i++) {
        var x = corners[i].x;
        var y = corners[i].y;
        if (x < min.x) {
          min.x = x;
        }
        else if (x > max.x) {
          max.x = x;
        }
        if (y < min.y) {
          min.y = y;
        }
        else if (y > max.y) {
          max.y = y;
        }
      }

      var r = Rect(min.x, min.y, max.x - min.x, max.y - min.y);

      root.setAttributeNS(null, "width", r.width);
      root.setAttributeNS(null, "height", r.height);

      moffset.x -= r.width;
      moffset.y -= r.height;
      maxoffset = moffset;
    } else {
      minoffset = Point(0,0);
      maxoffset = Point(window.innerWidth, window.innerHeight);
      root.setAttributeNS(null, "width", w);
      root.setAttributeNS(null, "height", h);
    }
	}

  function init(numrows, numcols, rdim, callback, doc) {
    root = doc.createElementNS(svgns, "svg");
    setSize(doc, numcols*rdim+3, numrows*rdim+3);

    // position in upper left corner of parenting viewBox (otherwise defaults to 0,0)
    if(doc.documentElement.hasAttributeNS(null, "viewBox")) {
      root.setAttributeNS(null, "x", doc.documentElement.viewBox.baseVal.x);
      root.setAttributeNS(null, "y", doc.documentElement.viewBox.baseVal.y);
    }

    root.setAttributeNS(null, "viewBox", "-1.5 -1.5 " + (numcols*rdim+3) + " " + (numrows*rdim+3));
    var stylestr = "display:none";
    if(doc.documentElement.getScreenCTM) {
       stylestr += "; position: absolute; left: " + minoffset.x + "px; top: " + minoffset.y +"px";
    }
    root.setAttributeNS(null, "style", stylestr);

    // style the color-palette rects
    var style = doc.createElementNS(svgns, "style");
    style.textContent=".cprect {shape-rendering:optimizeSpeed; stroke: black} .cprect:hover {stroke-width:2px; cursor: default;}";
    root.appendChild(style);

    // insert a b&w row at the bottom
    numrows--;

    // create color rects
	  var hue = 0;
		var sat = 0;
		var val = 1;
		var dhue = (360.0 / numcols);
		var midrow = Math.floor(numrows / 2);
		var dsat = 1.0 / midrow;
		var dval = 1.0 / (numrows - midrow);

		for (var row = 0; row < numrows; row++) {
			if (row <= midrow) {
				val = 1;
				sat += dsat;
				if (sat > 1)
					sat = 1;
			} else if (row > midrow) {
				sat = 1;
				val -= dval;
				if (val < 0)
					val = 0;
			}

			for (col = 0; col < numcols; col++) {
	      var r = doc.createElementNS(svgns, "rect");
	      r.x.baseVal.value = col * rdim;
	      r.y.baseVal.value = row * rdim;
	      r.width.baseVal.value = rdim;
	      r.height.baseVal.value = rdim;
	      r.setAttributeNS(null, "class", "cprect");
	      var color = hsv2rgb(hue, sat, val);
	      r.setAttributeNS(null, "fill", "rgb("+color[0]*100+"%,"+color[1]*100+"%,"+color[2]*100+"%)");
	      root.appendChild(r);
				hue += dhue;
			}
			hue = 0;
		}

		// add the black&white row
		var row = numrows;
		var dcolor = 1 / numcols;
		var color = 0;
		for (col = 0; col < numcols; col++) {
	    var r = doc.createElementNS(svgns, "rect");
	    r.x.baseVal.value = col * rdim;
	    r.y.baseVal.value = row * rdim;
	    r.width.baseVal.value = rdim;
	    r.height.baseVal.value = rdim;
	    r.setAttributeNS(null, "class", "cprect");
	    r.setAttributeNS(null, "fill", "rgb("+color*100+"%,"+color*100+"%,"+color*100+"%)");
	    root.appendChild(r);
	    color += dcolor;
		}

    // fade-in effect
    var a = doc.createElementNS(svgns, "animate");
    a.setAttributeNS(null, "attributeName", "opacity");
    a.setAttributeNS(null, "dur", "0.5s");
    a.setAttributeNS(null, "to", "1");
    a.setAttributeNS(null, "from", "0");
    a.setAttributeNS(null, "begin", "indefinite");
    a.setAttributeNS(null, "fill", "freeze");
    anim = root.appendChild(a);

    // add listeners
    root.addEventListener("mouseup", colorSelected, false);
    root.addEventListener("click", colorSelected, false);
    root = doc.documentElement.appendChild(root);
  }

  function colorSelected(evt) {
    hide();
    callback(evt.target.getAttributeNS(null,"fill"));
  }

  function hide() {
    clearTimeout(timerid);
    if(root.style.display != "none") {
      root.style.display = "none";

      // check for declarative animation support
		  if(anim && anim.endElement)
			  anim.endElement();
    }
  }

  return {
    visible : function() {
      return (root.style.display != "none");
    },
    show : function(x,y) {
      if(root.farthestViewportElement) {
        // get the enclosing viewport
        var outermostvp = root.farthestViewportElement || alert("No farthestViewportElement found!");
        var ctm = outermostvp.getScreenCTM();
        var pt = root.createSVGPoint();
        pt.x = x;
        pt.y = y;
        ctm = ctm.inverse();
        pt = pt.matrixTransform(ctm);

        // pt is now in user units in the parenting svg

        var offset = Point(-20,-58); // Offset the picker slightly

        var pos = Point(pt.x+offset.x,pt.y+offset.y);

        if(pos.x > maxoffset.x)
          pos.x = maxoffset.x;
        else if(pos.x < minoffset.x)
          pos.x = minoffset.x;

        if(pos.y > maxoffset.y)
          pos.y = maxoffset.y;
        else if(pos.y < minoffset.y)
          pos.y = minoffset.y;

        root.x.baseVal.value=pos.x;
        root.y.baseVal.value=pos.y;
      } else {
        root.style.left = x;
        root.style.top = y;
      }

      // check for declarative animation support
		  if(anim && anim.beginElement)
			  anim.beginElement();

      root.style.display = "inline";
    },
    startShowTimer : function(x,y,delay) {
      clearTimeout(timerid);
      picker = this;
      timerid = setTimeout(function() { picker.show(x,y); }, delay);
    },
    stopShowTimer : function() {
      clearTimeout(timerid);
    },
    hide : function() {
      return hide();
    },
    hsv2rgb : function(h,s,v) {
      return hsv2rgb(h,s,v);
    },
    hsv2hsl : function(h,s,v) {
      return hsv2hsl(h,s,v);
    },
    hsl2hsv : function(h,s,l) {
      return hsl2hsv(h,s,l);
    }
  };
}