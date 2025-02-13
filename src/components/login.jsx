import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../firebase.config";
import { toast, Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

function Login() {
  const { t } = useTranslation(); // Hook for translation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin";
      toast.success(t("toastLoginSuccess")); // Localized toast message
    } catch (error) {
      toast.error(t("toastLoginError"));
    }
  };

  return (
    <div className="flex justify-center mt-20">
      <div className="flex flex-col w-[90vw] sm:w-[60vw] lg:w-[30vw] p-3 rounded-md">
        <Toaster toastOptions={{ duration: 4000 }} position="bottom-center" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-2xl text-center font-bold mb-6">
            {t("loginTitle")}
          </div>
          <div className="mb-3">
            <label className="block mb-1">{t("emailLabel")}</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-gray-500"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">{t("passwordLabel")}</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-gray-500"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-gray-500 text-white rounded-md px-4 py-2 hover:bg-gray-600 transition duration-300"
            >
              {t("submitButton")}
            </button>
          </div>
          <p className="text-center">
            {t("newUserText")}{" "}
            <a href="/register" className="text-blue-600">
              {t("registerHere")}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
