import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase.config";

export default function Navbar() {
  const [user, setUser] = useState();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  return (
    <header className="shadow sticky z-50 top-0">
      <nav className="bg-black text-white border-gray-200 sm:px-1 h-24 md:h-auto pt-1 pb-2 sm:py-2">
        <div className="md:flex h-full justify-between items-center mx-auto max-w-screen-2xl py-3">
          <div className="absolute pt-1 md:pt-0 md:relative top-2 md:top-1 left-2 text-2xl font-bold">
            AJIVIKA
          </div>

          <div className="flex w-full md:w-auto md:justify-between items-end h-full md:items-center">
            <ul className="flex justify-evenly mt-4 w-full items-end md:items-center font-medium gap-2 md:max-ml:gap-1 lg:space-x-8 lg:mt-0">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block p-0 md:py-2 md:pr-4 md:pl-3 duration-200 ${
                      isActive ? "text-orange-700" : "text-gray-100"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                  }
                >
                  Home
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `block p-0 md:py-2 md:pr-4 md:pl-3 duration-200 ${
                      isActive ? "text-orange-700" : "text-gray-100"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                  }
                >
                  About
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `block p-0 md:py-2 md:pr-4 md:pl-3 duration-200 ${
                      isActive ? "text-orange-700" : "text-gray-100"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                  }
                >
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="relative">
            {user ? (
              <div>
                <button
                  className="flex items-center justify-center border mr-12 border-solid rounded-full h-10 w-10 bg-gray-800 text-white"
                  onClick={toggleDropdown}
                >
                  <span className="material-icons">account_circle</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md">
                    <div className="px-4 py-2 font-medium text-gray-800">
                      <p>{user.displayName || "User"}</p>
                      <p>{user.email}</p>
                    </div>
                    <div className="border-t border-gray-300">
                      <NavLink
                        to="/hirer-history"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Hirer's History
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login">
                <button className="border mr-12 border-solid rounded-md h-2/3 px-3 bg-gray-800">
                  Admin
                </button>
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
