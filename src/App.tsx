import { useEffect, useState } from "react";
import NewPerscription from "./NewPerscription";
import LoginButton from "./auth/Login";
import DoseCard from "./DoseCard";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./auth/Logout";
import { checkBackend } from "./client";

function App() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [refresh, setRefresh] = useState<number>(0);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const incrementRefresh = () => {
    setIsPopupOpen(false);
    setRefresh((prev) => prev + 1);
  };

  useEffect(() => {
    const check = async () => {
      if (!isAuthenticated) {
        return;
      }

      const tk = await getAccessTokenSilently({
        authorizationParams: {
          audience: `https://kenzo.us.auth0.com/api/v2/`,
          scope: "read:current_user",
        },
      });

      setIsAvailable(await checkBackend(tk));
    };

    check();
  }, [getAccessTokenSilently, isAuthenticated, setIsAvailable]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginButton />
        <div>Please login to continue</div>
      </>
    );
  }

  if (!isAvailable) {
    return (
      <>
        Your account is not approved. Please notify the site owner if you
        believe this is incorrect.
      </>
    );
  }

  return (
    <>
      <LogoutButton />
      <div className="app-header">
        <h3>Medication Manager</h3>
        <button onClick={handleOpenPopup} className="open-popup-button">
          + Add Medication
        </button>
      </div>

      <DoseCard NumberOfDosesToShow={5} Refresh={refresh} />

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button onClick={handleClosePopup} className="close-popup-button">
              X
            </button>
            <NewPerscription RefreshDoses={incrementRefresh} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
