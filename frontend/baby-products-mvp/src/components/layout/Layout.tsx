import React from "react";
import { useRouter } from "next/router";
import Navbar from "./Navbar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const showBackButton = router.pathname !== "/" && router.pathname !== "/auth/login"; // Exclude back button on homepage and login page

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 text-white py-4 px-8 shadow">
                <h1 className="container mx-auto text-xl font-bold">tibaba.mu</h1>
            </header>

            {/* Navbar */}
            <Navbar />

            {/* Back Button */}
            {showBackButton && (
  <div className="container mx-auto my-4">
    <button
      onClick={() => router.back()}
      className="text-sm bg-gray-800 text-gray-100 py-2 px-6 rounded-xl shadow-md hover:bg-gray-700 hover:text-white transition-all duration-200"
    >
      &larr; Back
    </button>
  </div>
)}


            {/* Main Content */}
            <main className="flex-grow container mx-auto py-8">{children}</main>

            {/* Footer */}
            <footer className="bg-blue-600 text-white py-4 px-8 mt-8 text-center">
                tibaba.mu App &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
};

export default Layout;
