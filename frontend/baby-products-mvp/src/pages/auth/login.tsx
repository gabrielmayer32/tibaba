import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password, rememberMe);
      window.location.href = "/"; // Redirect to homepage after login
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-header font-bold text-center mb-6 text-primary-pink">
        Login
      </h1>
      <form
        className="max-w-md mx-auto bg-white shadow-soft p-8 rounded-xl"
        onSubmit={handleSubmit}
      >
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-mint"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-mint"
            required
          />
        </div>
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="mr-2"
          />
          <label className="text-gray-700">Stay logged in</label>
        </div>
        {error && (
          <p className="text-red-500 text-center font-medium mb-4">{error}</p>
        )}
        <button className="w-full bg-accent-coral text-black py-2 rounded-xl font-bold hover:bg-accent-deepBlue transition-colors">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
