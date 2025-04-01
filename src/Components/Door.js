import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import doorImg from "../../Assets/Microsoft-Fluentui-Emoji-Flat-Door-Flat.512.png";

const Door = ({ x = 0, y = 0, width = 100, height = 100 }) => {
  const texture = useLoader(TextureLoader, doorImg);
  return (
    <sprite position={[x + width / 2, height / 2, -y]}>
      <spriteMaterial attach="material" map={texture} />
    </sprite>
  );
};


export default Door;
