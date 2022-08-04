import { styles } from "../configs/cytoscape";
import { setMaxWidthNodes, fixConflicts } from "../helpers/dag";
import { EventNames } from "../enum/eventEnums";

let _cy,
  nodes,
  edges,
  firstUnit,
  lastUnit,
  phantoms = {},
  phantomsTop = {},
  notStable = [],
  nextPositionUpdates,
  generateOffset = 0,
  newOffset = -116,
  oldOffset,
  activeNode,
  waitGo,
  notLastUnitUp = false,
  notLastUnitDown = true,
  bWaitingForHighlightNode = false,
  isInit = false,
  scrollTopPos = 0,
  bWaitingForNext = false,
  bWaitingForPrev = false,
  queueAnimationPanUp = [],
  animationPlaysPanUp = false,
  bWaitingForNew = false,
  bHaveDelayedNewRequests = false;

let emitHandler = (name, data) => {
  //
};

let clickHandler = (unit) => {
  //
};

export function setEmitHandler(fn) {
  emitHandler = fn;
}

export function setClickHandler(fn) {
  clickHandler = fn;
}

function init(_nodes, _edges) {
  nodes = _nodes;
  edges = _edges;
  firstUnit = nodes[0].rowid;
  lastUnit = nodes[nodes.length - 1].rowid;
  phantoms = {};
  phantomsTop = {};
  notStable = [];
  nextPositionUpdates = null;
  generateOffset = 0;
  newOffset = -116;
  notLastUnitUp = false;
  notLastUnitDown = true;
  activeNode = null;
  waitGo = null;
  createCy();
  generate(_nodes, _edges);
  oldOffset = _cy.getElementById(nodes[0].data.unit).position().y + 66;
  _cy.viewport({ zoom: 1.01 });
  _cy.center(_cy.nodes()[0]);

  // const currHash = "";
  // if (currHash && currHash.length === 45) {
  //   notLastUnitUp = true;
  //   highlightNode(currHash.substring(1));
  // }
  isInit = true;
}

export function setCurrentUnit(unit) {
  notLastUnitUp = true;
  highlightNode(unit);
}

const scroll = document.getElementById("scroll");

window.addEventListener("resize", function () {
  if (_cy) scroll.scrollTop = convertPosPanToPosScroll();
});

function convertPosPanToPosScroll(posY, topPos) {
  if (!posY) posY = _cy.pan("y");
  if (topPos === undefined) topPos = scrollTopPos;
  return scroll.offsetHeight / 2 - topPos - posY;
}

function updListNotStableUnit() {
  if (!_cy) return;
  notStable = [];
  _cy.nodes().forEach(function (node) {
    if (!node.hasClass("is_stable")) {
      notStable.push(node.id());
    }
  });
}

function updateScrollHeigth() {
  const unitTopPos = _cy.getCenterPan(_cy.getElementById(nodes[0].data.unit)).y;
  const unitLowPos = _cy.getCenterPan(_cy.getElementById(nodes[nodes.length - 1].data.unit)).y;
  scrollTopPos = convertPosPanToPosScroll(unitTopPos, 0);
  document.getElementById("scrollBody").style.height =
    convertPosPanToPosScroll(unitLowPos - unitTopPos, 0) + scroll.offsetHeight / 2;
  setTimeout(function () {
    scroll.scrollTop = convertPosPanToPosScroll();
  }, 1);
}

function createEdges() {
  const _edges = { ...edges },
    cyEdges = _cy.edges(),
    cyEdgesLength = cyEdges.length,
    out = [];

  let position,
    classes = "",
    offset = 0,
    offsetTop = 0;

  for (let a = 0, l = cyEdgesLength; a < l; a++) {
    const k = cyEdges[a].source() + "_" + cyEdges[a].target();
    if (_edges[k]) delete _edges[k];
  }
  for (const k in phantoms) {
    _cy.getElementById(k).position("y", generateOffset + 166);
  }
  for (const k in phantomsTop) {
    _cy.getElementById(k).position("y", newOffset - 166);
  }
  for (const k in _edges) {
    if (Object.prototype.hasOwnProperty.call(_edges, k)) {
      classes = "";
      classes += _edges[k].best_parent_unit ? "best_parent_unit" : "";
      if (_cy.getElementById(_edges[k].data.target).length) {
        out.push({ group: "edges", data: _edges[k].data, classes: classes });
      } else {
        position = _cy.getElementById(_edges[k].data.source).position();
        phantoms[_edges[k].data.target] = position.x + offset;
        out.push({
          group: "nodes",
          data: {
            id: _edges[k].data.target,
            unit_s: _edges[k].data.target.substr(0, 7) + "...",
          },
          position: { x: position.x + offset, y: generateOffset + 166 },
        });
        offset += 60;
        out.push({ group: "edges", data: _edges[k].data, classes: classes });
      }
      if (!_cy.getElementById(_edges[k].data.source).length) {
        position = _cy.getElementById(_edges[k].data.target).position();
        phantomsTop[_edges[k].data.source] = position.x + offsetTop;
        out.push({
          group: "nodes",
          data: {
            id: _edges[k].data.source,
            unit_s: _edges[k].data.source.substr(0, 7) + "...",
          },
          position: { x: position.x + offsetTop, y: newOffset - 166 },
        });
        offsetTop += 60;
        out.push({ group: "edges", data: _edges[k].data, classes: classes });
      }
    }
  }
  return out;
}

function createGraph(_nodes, _edges) {
  const graph = new window.dagre.graphlib.Graph({
    multigraph: true,
    compound: true,
  });
  graph.setGraph({});
  graph.setDefaultEdgeLabel(function () {
    return {};
  });
  _nodes.forEach(function (node) {
    graph.setNode(node.data.unit, {
      label: node.data.unit_s,
      width: 32,
      height: 32,
      is_on_main_chain: node.is_on_main_chain,
      is_stable: node.is_stable,
      sequence: node.sequence,
    });
  });
  for (const k in _edges) {
    if (Object.prototype.hasOwnProperty.call(_edges, k)) {
      graph.setEdge(_edges[k].data.source, _edges[k].data.target);
    }
  }
  window.dagre.layout(graph);
  return graph;
}

function generate(_nodes, _edges) {
  let newOffset_x,
    newOffset_y,
    left = Infinity,
    right = -Infinity,
    first = false,
    generateAdd = [],
    _node,
    classes = "",
    pos_iomc;
  const graph = createGraph(_nodes, _edges);
  graph.nodes().forEach(function (unit) {
    _node = graph.node(unit);
    if (_node) {
      if (_node.x < left) left = _node.x;
      if (_node.x > right) right = _node.x;
    }
  });
  graph.nodes().forEach(function (unit) {
    _node = graph.node(unit);
    if (_node) {
      classes = "";
      if (_node.is_on_main_chain) classes += "is_on_main_chain ";
      if (_node.is_stable) classes += "is_stable ";
      if (_node.sequence === "final-bad") classes += "finalBad";
      if (_node.sequence === "temp-bad") classes += "tempBad";
      if (!first) {
        newOffset_x = -_node.x - (right - left) / 2;
        newOffset_y = generateOffset - _node.y + 66;
        first = true;
      }
      if (phantoms[unit] !== undefined) {
        _cy.remove(_cy.getElementById(unit));
        generateAdd.push({
          group: "nodes",
          data: { id: unit, unit_s: _node.label },
          position: { x: phantoms[unit], y: _node.y + newOffset_y },
          classes: classes,
        });
        delete phantoms[unit];
      } else {
        pos_iomc = setMaxWidthNodes(_node.x + newOffset_x);
        if (pos_iomc === 0 && _node.is_on_main_chain === 0) {
          pos_iomc += 40;
        }
        generateAdd.push({
          group: "nodes",
          data: { id: unit, unit_s: _node.label },
          position: { x: pos_iomc, y: _node.y + newOffset_y },
          classes: classes,
        });
      }
    }
  });
  generateAdd = fixConflicts(generateAdd);
  _cy.add(generateAdd);
  generateOffset = _cy.nodes()[_cy.nodes().length - 1].position().y;
  nextPositionUpdates = generateOffset;
  _cy.add(createEdges());
  updListNotStableUnit();
  updateScrollHeigth();
}

export function scrollUp() {
  const ext = _cy.extent();
  if (
    (notLastUnitUp === false &&
      ext.y2 - ext.h / 2 > _cy.getElementById(nodes[0].data.unit).position().y + 20) ||
    (notLastUnitUp === true && ext.y2 - ext.h > _cy.getElementById(nodes[0].data.unit).position().y)
  ) {
    _cy.panBy({ x: 0, y: 25 });
  } else if (notLastUnitUp === true) {
    getPrev();
  }
}

export function scrollDown() {
  _cy.panBy({ x: 0, y: -25 });
}

function cyMouseOver() {
  this.addClass("hover");
}

function cyMouseOut() {
  this.removeClass("hover");
}

function cyClick(evt) {
  clickHandler(evt.cyTarget.id());
}

function cyTap(evt) {
  clickHandler(evt.cyTarget.id());
}

function cyPan() {
  const ext = _cy.extent();
  if (nextPositionUpdates < ext.y2) {
    getNext();
  } else if (
    notLastUnitUp === true &&
    ext.y2 - ext.h < _cy.getElementById(nodes[0].data.unit).position().y
  ) {
    getPrev();
  }
  scroll.scrollTop = convertPosPanToPosScroll();
}

function cyWheel(event) {
  event.preventDefault();
  const deltaY = event.deltaY || -event.deltaY;
  if (deltaY < 0) {
    scrollUp();
  } else if (deltaY > 0) {
    scrollDown();
  }
  scroll.scrollTop = convertPosPanToPosScroll();
}

function createCy() {
  if (_cy) {
    _cy.off("mouseover", "node", cyMouseOver);
    _cy.off("mouseout", "node", cyMouseOut);
    _cy.off("click", "node", cyClick);
    _cy.off("tap", "node", cyTap);
    _cy.off("pan", cyPan);
    _cy.container().removeEventListener("wheel", cyWheel);
  }
  _cy = window.cytoscape({
    container: document.getElementById("cy"),
    boxSelectionEnabled: false,
    autounselectify: true,
    hideEdgesOnViewport: false,
    layout: {
      name: "preset",
    },
    style: styles,
    elements: {
      nodes: [],
      edges: [],
    },
  });
  _cy.on("mouseover", "node", cyMouseOver);
  _cy.on("mouseout", "node", cyMouseOut);
  _cy.on("click", "node", cyClick);
  _cy.on("tap", "node", cyTap);
  _cy.on("pan", cyPan);
  _cy.container().addEventListener("wheel", cyWheel);
}

function setChangesStableUnits(arrStableUnits) {
  if (!arrStableUnits) return;
  let node;
  arrStableUnits.forEach(function (objUnit) {
    node = _cy.getElementById(objUnit.unit);
    if (node) {
      if (!node.hasClass("is_stable")) node.addClass("is_stable");
      if (objUnit.is_on_main_chain === 1 && !node.hasClass("is_on_main_chain")) {
        node.addClass("is_on_main_chain");
      } else if (objUnit.is_on_main_chain === 0 && node.hasClass("is_on_main_chain")) {
        node.removeClass("is_on_main_chain");
      }
    }
    notStable.splice(notStable.indexOf(objUnit.unit), 1);
  });
  updListNotStableUnit();
}

function animationPanUp(distance) {
  if (animationPlaysPanUp) {
    queueAnimationPanUp.push(distance);
  } else {
    if (queueAnimationPanUp.length > 1) {
      distance = queueAnimationPanUp.reduce(function (prev, current) {
        return prev + current;
      });
      queueAnimationPanUp = [];
    }
    _cy.stop();
    animationPlaysPanUp = true;
    _cy.animate(
      {
        pan: {
          x: _cy.pan("x"),
          y: _cy.pan("y") + distance,
        },
      },
      {
        duration: 250,
        complete: function () {
          oldOffset = _cy.getElementById(nodes[0].data.unit).position().y + 66;
          animationPlaysPanUp = false;
          if (queueAnimationPanUp.length) {
            animationPanUp(queueAnimationPanUp[0]);
            queueAnimationPanUp.splice(0, 1);
          }
        },
      }
    );
  }
}

function setNew(_nodes, _edges, newUnits) {
  let newOffset_x,
    newOffset_y,
    min = Infinity,
    max = -Infinity,
    left = Infinity,
    right = -Infinity,
    first = false,
    y,
    generateAdd = [],
    _node,
    classes = "",
    pos_iomc;
  const graph = createGraph(_nodes, _edges);
  graph.nodes().forEach(function (unit) {
    _node = graph.node(unit);
    if (_node) {
      y = _node.y;
      if (y < min) min = y;
      if (y > max) max = y;
      if (_node.x < left) left = _node.x;
      if (_node.x > right) right = _node.x;
    }
  });
  graph.nodes().forEach(function (unit) {
    _node = graph.node(unit);
    if (_node) {
      classes = "";
      if (_node.is_on_main_chain) classes += "is_on_main_chain ";
      if (_node.is_stable) classes += "is_stable ";
      if (_node.sequence === "final-bad") classes += "finalBad";
      if (_node.sequence === "temp-bad") classes += "tempBad";
      if (!first) {
        newOffset_x = -_node.x - (right - left) / 2;
        newOffset_y = newOffset - (max - min) + 66;
        newOffset -= max - min + 66;
        first = true;
        if (newUnits && _cy.extent().y1 < oldOffset) {
          animationPanUp(max + 54);
        }
      }
      if (phantomsTop[unit] !== undefined) {
        _cy.remove(_cy.getElementById(unit));
        generateAdd.push({
          group: "nodes",
          data: { id: unit, unit_s: _node.label },
          position: { x: phantomsTop[unit], y: _node.y + newOffset_y },
          classes: classes,
        });
        delete phantomsTop[unit];
      } else {
        pos_iomc = setMaxWidthNodes(_node.x + newOffset_x);
        if (pos_iomc === 0 && _node.is_on_main_chain === 0) {
          pos_iomc += 40;
        }
        generateAdd.push({
          group: "nodes",
          data: { id: unit, unit_s: _node.label },
          position: { x: pos_iomc, y: _node.y + newOffset_y },
          classes: classes,
        });
      }
    }
  });
  generateAdd = fixConflicts(generateAdd);
  _cy.add(generateAdd);
  _cy.add(createEdges());
  updListNotStableUnit();
  updateScrollHeigth();
}

// set

function getNext() {
  if (!bWaitingForNext && isInit) {
    emitHandler(EventNames.Next, { last: lastUnit, notStable: notStable });
    bWaitingForNext = true;
  }
}

function getPrev() {
  if (!bWaitingForPrev && isInit) {
    emitHandler(EventNames.Prev, { first: firstUnit, notStable: notStable });
    bWaitingForPrev = true;
  }
}

function getHighlightNode(unit) {
  if (!bWaitingForHighlightNode) {
    emitHandler(EventNames.HighlightNode, {
      first: firstUnit,
      last: lastUnit,
      unit: unit,
    });
    bWaitingForHighlightNode = true;
  }
}

export function highlightNode(unit) {
  if (!_cy) createCy();
  if (activeNode) _cy.getElementById(activeNode).removeClass("active");
  const el = _cy.getElementById(unit);
  if (el.length && phantoms[unit] === undefined && phantomsTop[unit] === undefined) {
    const extent = _cy.extent();
    const elPositionY = el.position().y;
    el.addClass("active");
    activeNode = el.id();
    emitHandler(EventNames.Info, { unit: activeNode });
    if (elPositionY < extent.y1 || elPositionY > extent.y2) {
      bWaitingForPrev = true;
      _cy.stop();
      return _cy.animate(
        {
          pan: { x: _cy.pan("x"), y: _cy.getCenterPan(el).y },
          complete: function () {
            bWaitingForPrev = false;
            getPrev();
          },
        },
        {
          duration: 250,
        }
      );
    }

    getPrev();
  } else {
    waitGo = unit;
    getHighlightNode(waitGo);
  }
  return false;
}

export function updDagHandler(data) {
  init(data.nodes, data.edges);
  // if (data.not_found) showInfoMessage($("#infoMessageUnitNotFound").text());
  notLastUnitDown = true;
  if (bWaitingForHighlightNode) bWaitingForHighlightNode = false;
  // testnet = data.testnet;
}

export function nextHandler(data) {
  if (notLastUnitDown) {
    if (bWaitingForHighlightNode) bWaitingForHighlightNode = false;
    nodes = nodes.concat(data.nodes);
    for (const k in data.edges) {
      if (Object.prototype.hasOwnProperty.call(data.edges, k)) {
        edges[k] = data.edges[k];
      }
    }
    lastUnit = nodes[nodes.length - 1].rowid;
    generate(data.nodes, data.edges);
    bWaitingForNext = false;
    if (waitGo) {
      highlightNode(waitGo);
      waitGo = false;
    }
    if (data.nodes.length === 0) {
      notLastUnitDown = false;
    }
    setChangesStableUnits(data.arrStableUnits);
  }
}

export function prevHandler(data) {
  if (bWaitingForHighlightNode) bWaitingForHighlightNode = false;
  if (data.nodes.length) {
    nodes = [].concat(data.nodes, nodes);
    for (const k in data.edges) {
      if (Object.prototype.hasOwnProperty.call(data.edges, k)) {
        edges[k] = data.edges[k];
      }
    }
    firstUnit = data.nodes[0].rowid;
    setNew(data.nodes, data.edges);
  }
  bWaitingForPrev = false;
  if (data.end === true) {
    notLastUnitUp = false;
  }
  if (waitGo) {
    highlightNode(waitGo);
    waitGo = false;
  }
  setChangesStableUnits(data.arrStableUnits);
}

export function deletedHandler(unit) {
  // happens when uncovered non-serial units are deleted
  if (!_cy) return;
  const el = _cy.getElementById(unit);
  if (activeNode === el.id()) activeNode = null;
  nodes = nodes.filter(function (node) {
    return node.data.unit !== unit;
  });
  for (const k in edges) {
    if (k.indexOf(unit) > -1) delete edges[k];
  }
  _cy.remove(el);
  // $("#defaultInfo").show();
  // $("#listInfo").hide();
  // showInfoMessage($("#infoMessageUnitDeleted").text());
}

export function newHandler(data) {
  if (data.nodes.length) {
    nodes = [].concat(data.nodes, nodes);
    for (const k in data.edges) {
      if (Object.prototype.hasOwnProperty.call(data.edges, k)) {
        edges[k] = data.edges[k];
      }
    }
    firstUnit = nodes[0].rowid;
    setNew(data.nodes, data.edges, true);
    if (bHaveDelayedNewRequests) {
      bHaveDelayedNewRequests = false;
      getNew();
    }
    if (data.nodes.length >= 100) {
      notLastUnitUp = true;
    }
  }
  bWaitingForNew = false;
  setChangesStableUnits(data.arrStableUnits);
}

export function getNew() {
  if (notLastUnitUp) return;

  if (!bWaitingForNew) {
    emitHandler(EventNames.New, { unit: firstUnit, notStable: notStable });
    bWaitingForNew = true;
  } else {
    bHaveDelayedNewRequests = true;
  }
}
