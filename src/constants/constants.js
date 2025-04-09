// DEFAULT_MOVE
export const DEFAULT_MOVE = {
    circle: {
      cX: 0,
      cY: 0,
      radiusX: 0,
      radiusY: 0,
    },
    rect: {
      width: 0,
      height: 0,
    },
    path: [],
    options: {
      shape: "line",
      mode: "draw",
      lineWidth: 1,
      lineColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: { r: 0, g: 0, b: 0, a: 0 },
      selection: null,
    },
    id: "",
    img: {
      base64: "",
    },
    timestamp: 0,
  };
  
  // PROJECT_ACTIONS
  export const PROJECT_ACTIONS = {
    NEW_PROJECT: "NEW_PROJECT",
    LOAD_PROJECT: "LOAD_PROJECT",
    SAVE_PROJECT: "SAVE_PROJECT",
    OPEN_CATALOG: "OPEN_CATALOG",
    SELECT_TOOL_EDIT: "SELECT_TOOL_EDIT",
    UNSELECT_ALL: "UNSELECT_ALL",
  };
  
  // VIEWER2D_ACTIONS
  export const VIEWER2D_ACTIONS = {
    SELECT_TOOL_ZOOM_IN: "SELECT_TOOL_ZOOM_IN",
    SELECT_TOOL_ZOOM_OUT: "SELECT_TOOL_ZOOM_OUT",
    SELECT_TOOL_PAN: "SELECT_TOOL_PAN",
    UPDATE_2D_CAMERA: "UPDATE_2D_CAMERA",
  };
  
  // VIEWER3D_ACTIONS
  export const VIEWER3D_ACTIONS = {
    SELECT_TOOL_3D_VIEW: "SELECT_TOOL_3D_VIEW",
    SELECT_TOOL_3D_FIRST_PERSON: "SELECT_TOOL_3D_FIRST_PERSON",
  };
  
  // ITEMS_ACTIONS
  export const ITEMS_ACTIONS = {
    SELECT_TOOL_DRAWING_ITEM: "SELECT_TOOL_DRAWING_ITEM",
    UPDATE_DRAWING_ITEM: "UPDATE_DRAWING_ITEM",
    END_DRAWING_ITEM: "END_DRAWING_ITEM",
  };
  
  // SCENE_ACTIONS
  export const SCENE_ACTIONS = {
    ADD_LAYER: "ADD_LAYER",
    SET_LAYER_PROPERTIES: "SET_LAYER_PROPERTIES",
    SELECT_LAYER: "SELECT_LAYER",
    REMOVE_LAYER: "REMOVE_LAYER",
  };
  
  // MODES
  export const MODES = {
    MODE_IDLE: "MODE_IDLE",
    MODE_2D_ZOOM_IN: "MODE_2D_ZOOM_IN",
    MODE_2D_ZOOM_OUT: "MODE_2D_ZOOM_OUT",
    MODE_3D_VIEW: "MODE_3D_VIEW",
    MODE_DRAWING_LINE: "MODE_DRAWING_LINE",
    MODE_DRAWING_ITEM: "MODE_DRAWING_ITEM",
    MODE_PEN: "MODE_PEN", 
    
  };
  
  // UNITS
  export const UNITS = {
    UNIT_MILLIMETER: "mm",
    UNIT_CENTIMETER: "cm",
    UNIT_METER: "m",
    UNIT_INCH: "in",
    UNIT_FOOT: "ft",
    UNIT_MILE: "mi",
  };
  
  // UNITS_LENGTH
  export const UNITS_LENGTH = ["mm", "cm", "m", "in", "ft", "mi"];
  
  // KEYBOARD_BUTTON_CODE
  export const KEYBOARD_BUTTON_CODE = {
    DELETE: 46,
    BACKSPACE: 8,
    ESC: 27,
    Z: 90,
    ALT: 18,
    C: 67,
    V: 86,
    CTRL: 17,
    ENTER: 13,
    TAB: 9,
  };


  
  
  // EPSILON
  export const EPSILON = 1e-6;
  
  // PAN_LIMIT (Canvas Boundary)
  export const PAN_LIMIT = 2000;
  