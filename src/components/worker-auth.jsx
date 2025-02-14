import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase.config"; 
import { toast, Toaster } from "react-hot-toast";

const WorkerAuth = () => {
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!name || !uid || !mobile) {
      toast.error("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      
      // Query worker history for authentication
      const historyRef = collection(db, "workerHistory");
      const q = query(historyRef, where("uidNo", "==", uid), where("mobileNo", "==", mobile));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.success("Authentication Successful!");
        navigate(`/worker-profile/${uid}`);
      } else {
        toast.error("No work history found. Please check your details.");
      }
    } catch (error) {
      console.error("Authentication Error:", error);
      toast.error("Authentication Failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Toaster />
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl text-center font-bold mb-4">Worker Authentication</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Enter UID"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Enter Mobile No."
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
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerAuth;
