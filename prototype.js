var tools = ["select_panel", "split"];
var currentTool = tools[1];
var canvas;
var panels;
var borders = [];
var previewDivideLine = new fabric.Line([0, 0, 100, 200], {
  selectable: false, stroke:"#9bf"});


$(document).ready(function(){
canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
canvas.width = 450;
canvas.height = 640;

});

$(document).ready(function(){

  function panel(x, y, w, h) {
    var p = new fabric.Rect({
      left:x + 5,
      top:y + 5,
      width:w - 10,
      height:h - 10,
      fill:'white',
      stroke:'black',
      strokeWeight:1,
      lockMovementX:true,
      lockMovementY:true
    });
    p.corners = {left:x, top:y, right:x+w, bottom:y+h};
    p.t = [];
    p.b = [];
    p.r = [];
    p.l = [];
    return p;
  }

  function resizeL(obj, n) {
    obj.corners.right = n;
    obj.width = obj.corners.right - obj.corners.left - 10;
  }

  function resizeR(obj, n) {
    obj.corners.left = n;
    obj.left = n + 5;
    obj.width = obj.corners.right - obj.corners.left - 10;
  }

  function resizeB(obj, n) {
    obj.corners.top = n;
    obj.top = n + 5;
    obj.height = obj.corners.bottom - obj.corners.top - 10;
  }

  function resizeT(obj, n) {
    obj.corners.bottom = n;
    obj.height = obj.corners.bottom - obj.corners.top - 10;
  }

  function resizeNeighbors(panel) {
    for (var i in panel.l) {
      resizeL(panel.l[i], panel.corners.left);
      for (var j in panel.l[i].r) {
        resizeR(panel.l[i].r[j], panel.l[i].corners.right);
      }
    }
    for (var i in panel.r) {
      resizeR(panel.r[i], panel.corners.right);
      for (var j in panel.r[i].l) {
        resizeL(panel.r[i].l[j], panel.r[i].corners.left);
      }
    }
    for (var i in panel.t) {
      resizeT(panel.t[i], panel.corners.top);
      for (var j in panel.t[i].b) {
        resizeB(panel.t[i].b[j], panel.t[i].corners.bottom);
      }
    }
    for (var i in panel.b) {
      resizeB(panel.b[i], panel.corners.bottom);
      for (var j in panel.b[i].t) {
        resizeT(panel.b[i].t[j], panel.b[i].corners.top);
      }
    }
  }

panel1 = panel(0, 0, 200, 200);
panel2 = panel(200, 0, 250, 200);
panel3 = panel(0, 200, 450, 200);
panel4 = panel(0, 400, 150, 240);
panel5 = panel(150, 400, 150, 240);
panel6 = panel(300, 400, 150, 240);

panel1.r = [panel2];
panel1.b = [panel3];

panel2.l = [panel1];
panel2.b = [panel3];

panel3.t = [panel1, panel2];
panel3.b = [panel4, panel5, panel6];

panel4.t = [panel3];
panel4.r = [panel5];

panel5.t = [panel3];
panel5.l = [panel4];
panel5.r = [panel6];

panel6.t = [panel3];
panel6.l = [panel5];

panels = [panel1, panel2, panel3, panel4, panel5, panel6];
for (var l in panels) {
  canvas.add(panels[l]);
}

  canvas.on('object:scaling', function(e) {
    if (currentTool == "select_panel") {
      e.target.width *= e.target.scaleX;
      e.target.height *= e.target.scaleY;
      e.target.scaleX = 1;
      e.target.scaleY = 1;
      e.target.corners = {
        left: e.target.left - 5,
        right: e.target.left + e.target.width + 5,
        top: e.target.top - 5,
        bottom: e.target.top + e.target.height + 5};
      var leftPanel = e.target.l;
      var rightPanel = e.target.r;
      var topPanel = e.target.t;
      var bottomPanel = e.target.b;
      resizeNeighbors(e.target);
    }
  });


function previewDivideY(obj, y) {
  var midptY = (obj.corners.top + obj.corners.bottom) / 2;
  var coords = {x1: obj.corners.left + 5, 
    y1: y, 
    x2: obj.corners.right - 5,
    y2: y};
  previewDivideLine.set(coords);
  canvas.add(previewDivideLine);
}

function previewDivideX(obj, x) {
  var midptX = (obj.corners.left + obj.corners.right) / 2;
  var coords = {x1: x, 
    y1: obj.corners.top + 5, 
    x2: x,
    y2: obj.corners.bottom - 5};
  previewDivideLine.set(coords);
  canvas.add(previewDivideLine);
}

function divideY(obj, y) {
  var midptY = (obj.corners.top + obj.corners.bottom) / 2;
  var coords = {x1: obj.corners.left + 5, 
    y1: y, 
    x2: obj.corners.right - 5,
    y2: y};
  var leftover = panel(obj.corners.left, y,
    obj.width + 10, obj.corners.bottom - y);
  obj.corners.bottom = y;
  obj.set({height: obj.corners.bottom - obj.corners.top - 10});
  leftover.r = obj.r;
  leftover.l = obj.l;
  leftover.t = [obj];
  leftover.b = obj.b;
  obj.b = [leftover];
  panels.push(leftover);
  canvas.add(leftover);
}


function divideX(obj, x) {
  var midptX = (obj.corners.left + obj.corners.right) / 2;
  var coords = {x1: x, 
    y1: obj.corners.top + 5, 
    x2: x,
    y2: obj.corners.bottom - 5};
  var leftover = panel(x, obj.corners.top,
    obj.corners.right - x, obj.height + 10);
  obj.corners.right = x;
  obj.set({width: obj.corners.right - obj.corners.left - 10});
  leftover.t = obj.t;
  leftover.b = obj.b;
  leftover.l = [obj];
  leftover.r = obj.r;
  obj.r = [leftover];
  panels.push(leftover);
  canvas.add(leftover);
}

  var dir;
  canvas.on('mouse:move', function(options) {
      if (currentTool == "split") {
        for (var i in panels) {
          if (panels[i].containsPoint(new fabric.Point(options.e.x, options.e.y))) {
            if (Math.abs(options.e.movementY) > Math.abs(options.e.movementX)) {
              dir = 'Y';
              previewDivideY(panels[i], options.e.y);
            } else {
              dir = 'X';
              previewDivideX(panels[i], options.e.x);
            }
          }
        }
      }
    });

    canvas.on('object:selected', function(options) {
        console.log(currentTool);
      if (currentTool == "split") {
        console.log(options);
        if (dir == 'Y') {
          divideY(options.target, options.e.y);
        } else {
          divideX(options.target, options.e.x);
        }
      }
    });



function select_tool() {
  for (var p in panels) {
    panels[p].set({selectable: true});
  }
  console.log("select tool");
  canvas.remove(previewDivideLine);
  currentTool = tools[0];
}

function split_tool() {
  for (var p in panels) {
    panels[p].set({selectable: false});
  }
  console.log("split tool");
  currentTool = tools[1];
}

$("#select_tool").click(function() {
  select_tool();
});
$("#split_tool").click(function() {
  split_tool();
});

});
