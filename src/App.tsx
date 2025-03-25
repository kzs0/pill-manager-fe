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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">Medication Manager</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Please log in to manage your medications</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">Account Not Approved</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Your account is not approved. Please notify the site owner if you
            believe this is incorrect.
          </p>
          <LogoutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex justify-between items-center mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            Medication Manager
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenPopup}
              className="btn btn-primary"
            >
              Add Medication
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
      </main>
    </div>
  );
}

export default App;
