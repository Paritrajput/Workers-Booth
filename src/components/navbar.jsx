import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { auth } from "../firebase.config";
import { FaRegCircleUser } from "react-icons/fa6";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";


export default function Navbar() {
  const { t } = useTranslation();
  const [user, setUser] = useState();

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

  return (
    <header className="shadow sticky z-50 top-0">
      <nav className="bg-black text-white border-gray-200 sm:px-1 h-24 md:h-auto pt-1 pb-2 sm:py-2">
        <div className="md:flex h-full justify-between items-center mx-auto max-w-screen-2xl py-3">
          <div className="absolute pt-1 md:pt-0 md:relative top-2 md:top-1 left-2 text-2xl font-bold">
            {t("ajivika")}
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
                  {t("home")}
                </NavLink>
              </li>
              {user && (
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `block p-0 md:py-2 md:pr-4 md:pl-3 duration-200 ${
                        isActive ? "text-orange-700" : "text-gray-100"
                      } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                    }
                  >
                    {t("hier")}
                  </NavLink>
                </li>
              )}
              <li>
              {/* <NavLink to="/worker-auth">
                <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
                  Worker History
                </button>
              </NavLink> */}
              <NavLink
                    to="/worker-auth"
                    className={({ isActive }) =>
                      `block p-0 md:py-2 md:pr-4 md:pl-3 duration-200 ${
                        isActive ? "text-orange-700" : "text-gray-100"
                      } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                    }
                  >
                    Workers section
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
                  {t("about")}
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
                  {t("contactUs")}
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="relative flex gap-6">
            <LanguageSwitcher />
            {user ? (
              <div>
                <NavLink
                  className="flex items-center justify-center  mr-5 rounded-full h-10 w-10"
                  to="/my-profile"
                >
                  <FaRegCircleUser className="w-8 h-8" />
                </NavLink>
              </div>
            ) : (
              <a href="/login">
                <button className="border mr-12 border-solid rounded-md h-9 px-3  bg-gray-800">
                  {t("admin")}
                </button>
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
