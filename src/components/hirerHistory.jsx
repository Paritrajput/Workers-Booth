import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase.config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function HirerHistory() {
  const { t } = useTranslation(); // hook for language translation
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHirerHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          toast.error(t("login_error"));
          setLoading(false);
          return;
        }

        // Fetch Hirer history (job postings)
        const historyRef = collection(
          db,
          "hirer_history",
          user.uid,
          "hireForms"
        );
        const snapshot = await getDocs(historyRef);

        let jobsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort jobs by timestamp (latest first)
        jobsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Fetch applied laborers for each job and location data
        const updatedJobsData = await Promise.all(
          jobsData.map(async (job) => {
            if (!job.locationId) return job; // Skip if no locationId

            // Fetch location data (nal)
            const locationDocRef = doc(db, "location", job.locationId);
            const locationDocSnap = await getDoc(locationDocRef);
            const availablePositions = locationDocSnap.exists()
              ? locationDocSnap.data().nal
              : "N/A";

            // Fetch applied laborers for each job using locationId
            const entriesRef = collection(
              db,
              "filledPosition",
              job.locationId,
              "entries"
            );
            const entriesSnap = await getDocs(entriesRef);

            const laborersApplied = entriesSnap.docs.map((doc) => ({
              labourerName: doc.data().name || "Unknown",
              contact: doc.data().mobileNo || "N/A",
              applyingAs: doc.data().applyingAs || "N/A",
              numberOfLabourers: doc.data().numberOfLabourers || "N/A",
              uidNo: doc.data().uidNo || "N/A",
            }));

            return {
              ...job,
              availablePositions,
              laborersApplied,
            };
          })
        );

        setHistory(updatedJobsData);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error(t("error_loading_history"));
      } finally {
        setLoading(false);
      }
    };

    fetchHirerHistory();
  }, [t]);

  if (loading) return <p>{t("loading")}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{t("hiring_history")}</h2>
      {history.length === 0 ? (
        <p>{t("no_hiring_records")}</p>
      ) : (
        history.map((job) => (
          <div key={job.id} className="border p-4 mb-4 rounded-lg shadow">
            <h3 className="text-lg font-bold">
              {t("labourers_required")}: {job.nal || t("Unknown Location")}
            </h3>
            <p>
              <strong>{t("wages")}:</strong> ₹{job.wages || "N/A"}
            </p>
            <p>
              <strong>{t("vacancies")}:</strong>{" "}
              {job.availablePositions || "N/A"}
            </p>
            <h4 className="text-md font-semibold mt-2">{t("applied_labourers")}:</h4>
            {job.laborersApplied && job.laborersApplied.length > 0 ? (
              <ul className="list-disc pl-5">
                {job.laborersApplied.map((labourer, index) => (
                  <li key={index}>
                    <strong>{labourer.labourerName}</strong> (
                    {labourer.applyingAs}) | Contact:{labourer.contact} | UID:{" "}
                    {labourer.uidNo} | Labourers: {labourer.numberOfLabourers}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("no_labourers_applied")}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
