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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
    setSidebarOpen(false);
  };

  const incrementRefresh = () => {
    setIsPopupOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex justify-between items-center mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            Medication Manager
          </h1>
          <button 
            onClick={toggleSidebar}
            className="text-gray-700 dark:text-gray-300"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content and sidebar */}
      <div className="flex flex-1 relative">
        {/* Main content */}
        <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Sidebar */}
        <div 
          className={`fixed inset-y-0 right-0 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} w-64 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out z-20 flex flex-col pt-0`}
        >
          <div className="p-4 flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Menu</h2>
              <button 
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleOpenPopup}
              className="btn btn-primary w-full"
            >
              Add Medication
            </button>
            <div className="mt-auto">
              <LogoutButton />
            </div>
          </div>
        </div>
        
        {/* Backdrop for sidebar on mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
            onClick={toggleSidebar}
          ></div>
        )}
      </div>
    </div>
  );
}

export default App;
