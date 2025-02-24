import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="bg-gray-400 shadow-md align-middle hover:bg-gray-500 text-white font-medium rounded-lg text-sm px-4 py-2 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700"
    >
      Log In
    </button>
  );
};

export default LoginButton;
