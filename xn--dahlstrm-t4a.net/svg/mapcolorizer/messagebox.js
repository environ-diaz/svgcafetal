/***
 * Simple messagebox object.
 *
 * @author Erik Dahlström, ed@opera.com, (c) Opera Software ASA, 2008
 *
 * This work is licensed under the Creative Commons Attribution-Share Alike 3.0 license.
 * http://creativecommons.org/licenses/by-sa/3.0/
 *
 * @param before The element to insert the messagebox before
 * @param msg The string to display
 * @param fontsize The fontsize
 */
function MessageBox(before, msg, fontsize) {
  var svgns = "http://www.w3.org/2000/svg";
  var padding = 20;
  var margin = 2;
  var root = null;

  init(before, msg, fontsize);

  function init(before, msg, fontsize) {
    var doc = before.ownerDocument;

    var g = doc.createElementNS(svgns, "svg");
    g.setAttributeNS(null, "style", "width:1px;height:1px;font: " + fontsize + "px Monaco, monospace, sans-serif; text-anchor: middle; fill: white; pointer-events: none; position: absolute; visibility:hidden;");

    var t = doc.createElementNS(svgns, "text");
    t.textContent = msg;

    var r = createSVGRect();

    g.appendChild(r);
    g.appendChild(t);

    root = before.parentNode.insertBefore(g, before);

    var bbox = t.getBBox();
    t.setAttributeNS(null, "x", margin + padding/2 + bbox.width/2)
    t.setAttributeNS(null, "y", margin + padding/2 + parseFloat(fontsize)*0.9);

    r.x.baseVal.value = margin;
    r.y.baseVal.value = margin;
    r.width.baseVal.value = bbox.width+padding;
    r.height.baseVal.value = parseFloat(fontsize)+padding;
    r.rx.baseVal.value = parseFloat(fontsize)*0.85;
    r.setAttributeNS(null, "style", "shape-rendering: geometricPrecision; fill: black; fill-opacity: 0.6; stroke: white; stroke-width: 4px; vector-effect: non-scaling-stroke");

    g.style.width = r.getBBox().width + margin*2;
    g.style.height = r.getBBox().height + margin*2;
  }

  function setText(msg) {
    var t = root.lastChild;
    var r = root.firstChild;

    t.textContent = msg;

    var bbox = t.getBBox();
    t.setAttributeNS(null, "x", margin + padding/2 + bbox.width/2)

    r.width.baseVal.value = bbox.width+padding;

    root.style.width = r.getBBox().width + margin*2;
  }

  function createSVGRect(x,y,w,h) {
    var r = document.createElementNS(svgns, "rect");
    if(!r.x) {
      if(!!x)
        r.setAttributeNS(null, "x", x);
      if(!!y)
        r.setAttributeNS(null, "y", y);
      if(!!w)
        r.setAttributeNS(null, "width", w);
      if(!!h)
        r.setAttributeNS(null, "height", h);
    } else {
      if(!!x)
        r.x.baseVal.value = x;
      if(!!y)
        r.y.baseVal.value = y;
      if(!!w)
        r.width.baseVal.value = w;
      if(!!h)
        r.height.baseVal.value = h;
    }
    return r;
  }

  return {
    show : function(x,y) {
      root.style.visibility = "visible";
      if(root.ownerDocument.documentElement instanceof SVGSVGElement) {
        root.x.baseVal.value = x;
        root.y.baseVal.value = y;
      } else {
        root.style.left = x;
        root.style.top = y;
      }
    },
    hide : function() {
      root.style.visibility = "hidden";
    },
    visible : function() {
      return root.style.visibility != "hidden";
    },
    setText : function(newmsg) {
      setText(newmsg);
    }
  };
}

