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
  const [loaded, setLoaded] = useState<boolean>(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const incrementRefresh = () => {
    setIsPopupOpen(false);
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
      <header className="bg-white shadow-sm dark:bg-gray-700">
        <div className="flex justify-between mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Medication Manager
          </h1>
          <div />
          <div>
            <button
              onClick={handleOpenPopup}
              className="bg-gray-400 shadow-md align-middle hover:bg-gray-600 text-white font-medium rounded-lg text-sm px-4 py-2 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-800"
            >
              Add Medication
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DoseCard
          NumberOfDosesToShow={5}
          Loaded={loaded}
          SetLoaded={setLoaded}
        />

        <NewPerscription
          RefreshDoses={incrementRefresh}
          SetLoaded={setLoaded}
          Open={isPopupOpen}
          SetOpen={setIsPopupOpen}
        />
      </div>
    </>
  );
}

export default App;
