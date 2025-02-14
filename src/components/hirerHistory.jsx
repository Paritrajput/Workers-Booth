import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase.config";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaStar, FaTimes } from "react-icons/fa"; // Import icons

export default function HirerHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workerRatings, setWorkerRatings] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
 
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [workerReviews, setWorkerReviews] = useState([]);

  useEffect(() => {
    const fetchHirerHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          toast.error(t("login_error"));
          setLoading(false);
          return;
        }

        const historyRef = collection(db, "hirer_history", user.uid, "hireForms");
        const snapshot = await getDocs(historyRef);

        let jobsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        jobsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const updatedJobsData = await Promise.all(
          jobsData.map(async (job) => {
            if (!job.locationId) return job;

            const locationDocRef = doc(db, "location", job.locationId);
            const locationDocSnap = await getDoc(locationDocRef);
            const availablePositions = locationDocSnap.exists()
              ? locationDocSnap.data().nal
              : "N/A";

            const entriesRef = collection(db, "filledPosition", job.locationId, "entries");
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

  const fetchWorkerRatings = async (workerId) => {
    try {
      const ratingQuery = await getDocs(collection(db, "workerRatings"));
      const ratings = ratingQuery.docs
        .filter((doc) => doc.data().workerId === workerId)
        .map((doc) => doc.data());

      const totalRatings = ratings.reduce((acc, rating) => acc + rating.rating, 0);
      const averageRating = ratings.length > 0 ? totalRatings / ratings.length : 0;

      setWorkerRatings((prevRatings) => ({
        ...prevRatings,
        [workerId]: { average: averageRating, count: ratings.length },
      }));
    } catch (error) {
      console.error("Error fetching worker ratings:", error);
    }
  };

  useEffect(() => {
    history.forEach((job) => {
      job.laborersApplied.forEach((labourer) => {
        fetchWorkerRatings(labourer.uidNo);
      });
    });
  }, [history]);

  const handleRatingSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error(t("invalid_rating"));
      return;
    }

    const user = auth.currentUser;
    if (!user || !selectedWorker) {
      toast.error(t("login_error"));
      return;
    }

    const ratingData = {
      workerId: selectedWorker,
      hirerId: user.uid,
      rating,
      review,
      timestamp: new Date(),
    };

    try {
      await addDoc(collection(db, "workerRatings"), ratingData);
      toast.success(t("rating_submitted"));
      setRating(0);
      setReview("");
      setShowModal(false);
      fetchWorkerRatings(selectedWorker);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(t("rating_submission_failed"));
    }
  };
  const fetchWorkerReviews = async (workerId) => {
    try {
      const ratingQuery = await getDocs(collection(db, "workerRatings"));
      const reviews = ratingQuery.docs
        .filter((doc) => doc.data().workerId === workerId)
        .map((doc) => doc.data());
      setWorkerReviews(reviews);
      setShowReviewsModal(true);
    } catch (error) {
      console.error("Error fetching worker reviews:", error);
    }
  };

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
            <p><strong>{t("wages")}:</strong> ₹{job.wages || "N/A"}</p>
            <p><strong>{t("vacancies")}:</strong> {job.availablePositions || "N/A"}</p>
            <h4 className="text-md font-semibold mt-2">{t("applied_labourers")}:</h4>
            {job.laborersApplied.length > 0 ? (
              <ol className="list-item pl-5 ">
                {job.laborersApplied.map((labourer,index) => (
                  <li key={labourer.uidNo} index={index} className="flex items-center gap-1 py-1 ">
                    <strong>{index+1}. </strong>
                  
                    <strong>{labourer.labourerName}</strong> ({labourer.applyingAs}) |
                    <strong>Contact:</strong> {labourer.contact} |
                    <strong>UID:</strong> {labourer.uidNo} |
                    <strong> Labourers:</strong> {labourer.numberOfLabourers} |
                   
                  
                    <p>{t("worker_rating")}: 
                      {" "} {workerRatings[labourer.uidNo]?.average.toFixed(1) || "N/A"} ⭐ 
                      ({workerRatings[labourer.uidNo]?.count || 0} {t("ratings")})
                    </p>

                    <button 
                      className="bg-gray-900 text-white px-2 py-0 rounded ml-5"
                      onClick={() => { setSelectedWorker(labourer.uidNo); setShowModal(true); }}
                    >
                      {t("Rate Worker")}
                    </button>
                    <button className="bg-blue-500 text-white px-2 py-0 rounded" onClick={() => fetchWorkerReviews(labourer.uidNo)}>{t("View Reviews")}</button>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{t("no_labourers_applied")}</p>
            )}
          </div>
        ))
      )}

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg relative w-96">
            <button className="absolute top-2 right-2 text-red-500" onClick={() => setShowModal(false)}>
              <FaTimes size={20} />
            </button>
            <h3 className="text-lg font-bold">{t("rate_worker")}</h3>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((num) => (
                <FaStar
                  key={num}
                  className={`cursor-pointer ${num <= rating ? "text-yellow-500" : "text-gray-400"}`}
                  onClick={() => setRating(num)}
                />
              ))}
            </div>
            <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder={t("write_review")} className="w-full p-2 mt-2 border rounded" />
            <button className="bg-green-500 text-white px-3 py-1 mt-3 rounded" onClick={handleRatingSubmit}>
              {t("submit")}
            </button>
          </div>
        </div>
      )}
      {showReviewsModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg relative w-96">
            <button className="absolute top-2 right-2 text-red-500" onClick={() => setShowReviewsModal(false)}><FaTimes size={20} /></button>
            <h3 className="text-lg font-bold">{t("worker_reviews")}</h3>
            {workerReviews.length > 0 ? (
              workerReviews.map((review, index) => (
                <p key={index}>{review.review} - {review.rating} ⭐</p>
              ))
            ) : (
              <p>{t("no_reviews")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
