import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router"; // Import useRouter
import { useAuth } from "../../contexts/AuthContext";
import { FaEnvelope, FaBars } from "react-icons/fa";

interface User {
  id: number;
  first_name: string;
  profile_picture: string | null;
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // Access the current route

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Helper function to determine if a link is active
  const isActive = (path: string) => router.pathname === path;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const token = localStorage.getItem("accessToken");
        try {
          const response = await axios.get(`${baseUrl}/users/profile/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setProfile(response.data);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }
    };
    fetchUserProfile();
  }, [user, baseUrl]);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (user) {
        const token = localStorage.getItem("accessToken");
        try {
          const response = await axios.get(`${baseUrl}/users/messages/unread-count/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUnreadMessages(response.data.unread_count);
        } catch (err) {
          console.error("Failed to fetch unread messages count:", err);
        }
      }
    };

    fetchUnreadMessages();

    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [user, baseUrl]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (dropdownOpen || menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownOpen, menuOpen]);

  const handleMessagesClick = async () => {
    setUnreadMessages(0);
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(
        `${baseUrl}/users/messages/mark-read/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch {
      console.error("Failed to mark messages as read.");
    }
  };

  return (
    <nav className="bg-primary-mint text-gray-800 py-4 px-8 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Burger Menu */}
        <div ref={menuRef} className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-800 text-2xl focus:outline-none"
          >
            <FaBars />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
  <div
    className="absolute top-16 left-0 w-full bg-primary-mint shadow-md z-10 md:hidden"
    ref={menuRef}
  >
    <ul className="flex flex-col items-start p-4 space-y-4">
      <li>
        <Link
          href="/"
          className={`text-base ${
            isActive("/") ? "font-bold text-primary-pink" : "hover:text-primary-pink"
          } transition-colors`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent bubbling
            setMenuOpen(false); // Close the menu
          }}
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          href="/products"
          className={`text-base ${
            isActive("/products") ? "font-bold text-primary-pink" : "hover:text-primary-pink"
          } transition-colors`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent bubbling
            setMenuOpen(false); // Close the menu
          }}
        >
          Products for Sale
        </Link>
      </li>
      <li>
        <Link
          href="/products/add"
          className={`text-base ${
            isActive("/products/add") ? "font-bold text-primary-pink" : "hover:text-primary-pink"
          } transition-colors`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent bubbling
            setMenuOpen(false); // Close the menu
          }}
        >
          Sell a Product
        </Link>
      </li>
    </ul>
  </div>
)}


        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-base ${
              isActive("/") ? "font-bold text-primary-pink" : "hover:text-primary-pink"
            } transition-colors`}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={`text-base ${
              isActive("/products") ? "font-bold text-primary-pink" : "hover:text-primary-pink"
            } transition-colors`}
          >
            Products for Sale
          </Link>
          <Link
            href="/products/add"
            className={`text-base ${
              isActive("/products/add") ? "font-bold text-primary-pink" : "hover:text-primary-pink"
            } transition-colors`}
          >
            Sell a Product
          </Link>
        </div>

        {/* User Profile Section */}
        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          {user ? (
            <>
              <Link href="/messages" onClick={handleMessagesClick}>
                <div className="relative cursor-pointer text-gray-800">
                  <FaEnvelope className="text-2xl hover:text-primary-pink transition-colors" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadMessages}
                    </span>
                  )}
                </div>
              </Link>

              <div
                className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden cursor-pointer border-2 border-accent-coral"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {profile?.profile_picture ? (
                  <img
                    src={`${profile.profile_picture}`}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm flex items-center justify-center h-full font-header font-bold">
                    {profile?.first_name?.[0].toUpperCase() || "U"}
                  </span>
                )}
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 mt-16 w-48 bg-white text-gray-700 rounded-xl shadow-lg z-10">
                  <Link
                    href="/products/my-products"
                    className="block px-4 py-2 text-sm hover:bg-primary-mint hover:text-gray-900 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Products
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-primary-mint hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className={`text-base ${
                  isActive("/auth/login") ? "font-bold text-primary-pink" : "hover:text-primary-pink"
                } transition-colors`}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className={`text-base ${
                  isActive("/auth/signup") ? "font-bold text-primary-pink" : "hover:text-primary-pink"
                } transition-colors`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
