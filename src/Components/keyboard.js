export default function keyboard({
    onRemove,
    onUndo,
    onRollback,
    onToggleSnap,
    onCopy,
    onPaste,
    onSetAlternateState,
  }) {
    const keydownHandler = (event) => {
      switch (event.keyCode) {
        case 8: // Backspace
        case 46: // Delete
          onRemove && onRemove();
          break;
        case 27: // Escape
          onRollback && onRollback();
          break;
        case 90: // Z
          if (event.ctrlKey || event.metaKey) onUndo && onUndo();
          break;
        case 18: // Alt
          onToggleSnap && onToggleSnap(true);
          break;
        case 67: // C
          if (event.ctrlKey || event.metaKey) onCopy && onCopy();
          break;
        case 86: // V
          if (event.ctrlKey || event.metaKey) onPaste && onPaste();
          break;
        case 17: // Ctrl
          onSetAlternateState && onSetAlternateState(true);
          break;
        default:
          break;
      }
    };
  
    const keyupHandler = (event) => {
      switch (event.keyCode) {
        case 18: // Alt
          onToggleSnap && onToggleSnap(false);
          break;
        case 17: // Ctrl
          onSetAlternateState && onSetAlternateState(false);
          break;
        default:
          break;
      }
    };
  
    window.addEventListener("keydown", keydownHandler);
    window.addEventListener("keyup", keyupHandler);
  
    return () => {
      window.removeEventListener("keydown", keydownHandler);
      window.removeEventListener("keyup", keyupHandler);
    };
  }
  