import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useAuth } from "../context/AuthContext";

function HirerHistory() {
  const { user } = useAuth(); // Assuming you have authentication context
  const [applications, setApplications] = useState([]);
  const [hirerDetails, setHirerDetails] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const historyRef = collection(
          db,
          "hirers",
          user.uid,
          "laborersApplied"
        );
        const historySnapshot = await getDocs(historyRef);
        const applicationsData = historySnapshot.docs.map((doc) => doc.data());

        setApplications(applicationsData);

        const hirerRef = doc(db, "hirers", user.uid);
        const hirerSnap = await getDoc(hirerRef);
        if (hirerSnap.exists()) {
          setHirerDetails(hirerSnap.data());
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Hirer History</h2>

      {hirerDetails && (
        <div className="mb-6 p-4 bg-gray-100 rounded-md">
          <h3 className="text-xl font-semibold">Hirer Details</h3>
          <p>Name: {hirerDetails.name}</p>
          <p>Contact: {hirerDetails.contact}</p>
          <p>Location: {hirerDetails.location}</p>
        </div>
      )}

      <h3 className="text-xl font-semibold">Laborers Applied</h3>
      {applications.length === 0 ? (
        <p>No laborers applied yet.</p>
      ) : (
        <ul className="list-disc pl-6">
          {applications.map((applicant, index) => (
            <li key={index} className="p-2 bg-white shadow-md rounded-md mb-2">
              <p>Name: {applicant.name}</p>
              <p>UID No: {applicant.uidNo}</p>
              <p>Contact: {applicant.mobileNo}</p>
              <p>Applied As: {applicant.applyingAs}</p>
              <p>Workers: {applicant.numberOfLabourers}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HirerHistory;
