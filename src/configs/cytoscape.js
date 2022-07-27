export const styles = [
  {
    selector: "node",
    style: {
      content: "data(unit_s)",
      "text-opacity": 1,
      "min-zoomed-font-size": 13,
      "text-valign": "bottom",
      "text-halign": "center",
      "font-size": "13px",
      "text-margin-y": "5px",
      "background-color": "#fff",
      "border-width": 1,
      "border-color": "#2980b9",
      width: 25,
      height: 25,
    },
  },
  {
    selector: "node.hover",
    style: {
      content: "data(id)",
      "text-opacity": 1,
      "font-weight": "bold",
      "font-size": "14px",
      "text-background-color": "#fff",
      "text-background-opacity": 1,
      "text-background-shape": "rectangle",
      "text-border-opacity": 1,
      "text-border-width": 4,
      "text-border-color": "#fff",
      "z-index": 9999,
    },
  },
  {
    selector: "edge",
    style: {
      width: 2,
      "target-arrow-shape": "triangle",
      "line-color": "#2980b9",
      "target-arrow-color": "#2980b9",
      "curve-style": "bezier",
    },
  },
  {
    selector: ".best_parent_unit",
    style: {
      width: 5,
      "target-arrow-shape": "triangle",
      "line-color": "#2980b9",
      "target-arrow-color": "#2980b9",
      "curve-style": "bezier",
    },
  },
  {
    selector: ".is_on_main_chain",
    style: {
      "background-color": "#9cc0da",
    },
  },
  {
    selector: ".is_stable",
    style: {
      "border-width": 4,
      "border-style": "solid",
      "border-color": "#2980b9",
    },
  },
  {
    selector: ".active",
    style: {
      "border-color": "#333",
      "border-width": "4",
    },
  },
  {
    selector: ".finalBad",
    style: {
      "background-color": "red",
    },
  },
  {
    selector: ".tempBad",
    style: {
      "background-color": "red",
    },
  },
];
