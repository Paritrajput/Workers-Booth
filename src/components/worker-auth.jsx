import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase.config"; 
import { toast, Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const WorkerAuth = () => {
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { t, i18n } = useTranslation(); // Hook for translation

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!name || !uid || !mobile) {
      toast.error(t("allFieldsRequired")); // Use translation here
      return;
    }

    try {
      setLoading(true);
      
      // Query worker history for authentication
      const historyRef = collection(db, "workerHistory");
      const q = query(historyRef, where("uidNo", "==", uid), where("mobileNo", "==", mobile));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.success(t("authSuccess"));
        navigate(`/worker-profile/${uid}`);
      } else {
        toast.error(t("noHistoryFound"));
      }
    } catch (error) {
      console.error("Authentication Error:", error);
      toast.error(t("authFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Toaster />
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl text-center font-bold mb-4">{t("workerAuth")}</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="text"
            placeholder={t("enterName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            placeholder={t("enterUID")}
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            placeholder={t("enterMobile")}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? t("authenticating") : t("authenticate")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerAuth;
