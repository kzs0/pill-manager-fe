import { useState } from "react";
import "./App.css";
import DoseCard from "./DoseCard";
import NewPerscription from "./NewPerscription";

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <div className="app-header">
        <h3>Medication Manager</h3>
        <button onClick={handleOpenPopup} className="open-popup-button">
          + Add Medication
        </button>
      </div>

      <DoseCard />

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button onClick={handleClosePopup} className="close-popup-button">
              X
            </button>
            <NewPerscription />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
