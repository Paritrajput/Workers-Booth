import React, { useEffect, useState } from "react";
import HirerHistory from "./hirerHistory";
import { auth, db } from "../firebase.config"; // Import db to access Firestore
import { FaRegCircleUser } from "react-icons/fa6";
import { doc, getDoc } from "firebase/firestore"; // Import to fetch user data
import { useTranslation } from "react-i18next"; // Importing the translation hook

const Myprofile = () => {
  const { t } = useTranslation(); // Hook for language translation
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(""); // State to hold username
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        try {
          // Fetch the username from Firestore
          const userDocRef = doc(db, "hirer", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUsername(userDocSnap.data().name); // Set the username from Firestore
          } else {
            console.log("No such user document!");
          }
        } catch (error) {
          console.error(t("error_fetching_data"), error);
        }
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [t]);

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
    <div>
      <div className="flex items-center justify-between p-10 bg-gray-300">
        <div className="flex items-center gap-4">
          <FaRegCircleUser className="h-12 w-12" height={32} width={32} />
          <p className="text-2xl">{username || t("user")}</p> {/* Display the fetched username */}
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-black hover:bg-red-700 bg-red-600 rounded-2xl"
          >
            {t("logout")}
          </button>
        </div>
      </div>
      <div>
        <HirerHistory />
      </div>
    </div>
  );
};

export default Myprofile;
