import React from 'react';
import './ExampleGallery.css';

const exampleFloorplans = [
  { id: 1, title: "Modern Bungalow", image: "/Assets/example1.png" },
  { id: 2, title: "Open Concept Ranch", image: "/Assets/example5.png" },
  { id: 3, title: "Classic Colonial", image: "/Assets/example6.png" },
  { id: 4, title: "Compact Studio", image: "/Assets/example7.png" },
  { id: 5, title: "Lakeside Retreat", image: "/Assets/example10.png" }
];

function ExampleGallery() {
  return (
    <div className="gallery-container">
      <h1>Example Floorplans</h1>
      <div className="gallery-grid">
        {exampleFloorplans.map(plan => (
          <div key={plan.id} className="gallery-card">
            <img src={plan.image} alt={plan.title} className="gallery-image" />
            <h3>{plan.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExampleGallery;
