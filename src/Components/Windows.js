import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import windowImg from "../../Assets/Microsoft-Fluentui-Emoji-Flat-Window-Flat.512.png";

const Window = (props) => {
  const texture = useLoader(TextureLoader, windowImg);

  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
  } = props || {};

  return (
    <sprite position={[x + width / 2, height / 2, -y]}>
      <spriteMaterial attach="material" map={texture} />
    </sprite>
  );
};

export default Window;
