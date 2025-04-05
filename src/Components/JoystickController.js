import React, { useEffect, useRef } from "react";
import nipplejs from "nipplejs";

const JoystickController = ({ onMove, onEnd, position = "left" }) => {
  const joystickRef = useRef(null);

  useEffect(() => {
    const options = {
      zone: joystickRef.current,
      mode: "static",
      position: { top: "50%", left: "50%" },
      color: "gold",
    };

    const manager = nipplejs.create(options);

    manager.on("move", (evt, data) => {
      console.log("🕹️ Joystick Moved:", data);
      onMove && onMove({
        x: data.vector.x,
        y: data.vector.y,
      });
    });

    if (onEnd) {
      manager.on("end", onEnd);
    }

    return () => manager.destroy();
  }, [onMove, onEnd]);

  const style = {
    position: "absolute",
    bottom: "30px",
    [position]: "30px",
    width: "100px",
    height: "100px",
    zIndex: 1000,
  };

  return <div ref={joystickRef} style={style}></div>;
};

export default JoystickController;
