import React, { useState } from 'react';
import './ExampleGallery.css';

import Screenshot1 from '../Assets/Screenshot 2025-04-19 135658.png';
import Screenshot2 from '../Assets/Screenshot 2025-04-19 141154.png';
import Screenshot3 from '../Assets/Screenshot 2025-04-19 142009.png';

const exampleFloorplans = [
  {
    id: 1,
    title: "Modern Open-Plan Bungalow",
    image: Screenshot1,
    description:
      "This design showcases a sleek, single-story layout that emphasizes natural light and open interiors. Large windows, minimal walls, and seamless room transitions make it ideal for modern families or couples who value fluidity and function. The central space merges the kitchen, living, and dining areas into one harmonious flow, while bedrooms are tucked away for privacy. A flat roof and clean exterior lines complete the contemporary aesthetic."
  },
  {
    id: 2,
    title: "Contemporary Minimalist Home",
    image: Screenshot2,
    description:
      "This home embraces a minimalist philosophy with a clean rectangular shape, flat surfaces, and functional design. With fewer internal partitions, the living areas breathe more openly, offering maximum flexibility. Tall vertical walls and wide hallway spacing create a bold, gallery-like feel inside the house. Ideal for small families or singles who appreciate understated elegance and simplicity in form."
  },
  {
    id: 3,
    title: "Open Ranch Concept",
    image: Screenshot3,
    description:
      "Built with space and comfort in mind, this open ranch layout stretches horizontally, offering expansive rooms with effortless transitions. The large communal living space is centrally located, flanked by private rooms and utility areas on either side. It's designed for relaxed, single-level living with easy access to all parts of the home, making it perfect for families, seniors, or those wanting wide, accessible interiors and a cozy, grounded atmosphere."
  }
];

function ExampleGallery() {
  const [modalImage, setModalImage] = useState(null);

  const openModal = (image) => setModalImage(image);
  const closeModal = () => setModalImage(null);

  return (
    <div className="gallery-container">
      <h1>Example Floorplans</h1>
      <div className="gallery-grid">
        {exampleFloorplans.map(plan => (
          <div key={plan.id} className="gallery-card">
            <img
              src={plan.image}
              alt={plan.title}
              className="gallery-image"
              onClick={() => openModal(plan.image)}
            />
            <h3>{plan.title}</h3>
            <p className="gallery-description">{plan.description}</p>
          </div>
        ))}
      </div>

      {modalImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <img src={modalImage} className="modal-image" alt="Full View" />
        </div>
      )}
    </div>
  );
}

export default ExampleGallery;
