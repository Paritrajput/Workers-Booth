import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { Toaster, toast } from "react-hot-toast";
import { useTranslation } from "react-i18next"; // Import translation hook

const WorkerProfile = () => {
  const { t } = useTranslation(); // Translation hook
  const { uid } = useParams();
  const navigate = useNavigate();
  const [workerHistory, setWorkerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(false);
  const [selectedHirer, setSelectedHirer] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviewModal, setReviewModal] = useState(false);
  const [hirerReviews, setHirerReviews] = useState([]);

  useEffect(() => {
    if (!uid) {
      toast.error(t("invalidUID"));
      navigate("/worker-auth");
      return;
    }

    const fetchWorkerHistory = async () => {
      try {
        const historyRef = collection(db, "workerHistory");
        const historyQuery = query(historyRef, where("uidNo", "==", uid));
        const historySnapshot = await getDocs(historyQuery);

        if (historySnapshot.empty) {
          toast.error(t("noWorkHistory"));
          navigate("/worker-auth");
          return;
        }

        const historyData = await Promise.all(
          historySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const locationRef = doc(db, "location", data.locationID);
            const locationSnap = await getDoc(locationRef);
            const hirerId = locationSnap.exists() ? locationSnap.data().userid : null;
            const locatioName = locationSnap.exists() ? locationSnap.data().loction : null;

            let hirerName = t("unknownHirer");
            let averageRating = "N/A";

            if (hirerId) {
              const hirerRef = doc(db, "hirer", hirerId);
              const hirerSnap = await getDoc(hirerRef);
              if (hirerSnap.exists()) {
                hirerName = hirerSnap.data().name;
              }

              const reviewsQuery = query(collection(db, "hirerReviews"), where("hirerID", "==", hirerId));
              const reviewsSnap = await getDocs(reviewsQuery);
              if (!reviewsSnap.empty) {
                const ratings = reviewsSnap.docs.map((doc) => doc.data().rating);
                averageRating = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
              }
            }

            return {
              ...data,
              hirerId,
              hirerName,
              averageRating,
              locatioName
            };
          })
        );

        setWorkerHistory(historyData);
      } catch (error) {
        console.error("Error fetching worker history:", error);
        toast.error(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerHistory();
  }, [uid, navigate, t]);

  const openRatingModal = (hirerID) => {
    setSelectedHirer(hirerID);
    setRatingModal(true);
  };

  const openReviewModal = async (hirerID) => {
    try {
      const reviewsQuery = query(collection(db, "hirerReviews"), where("hirerID", "==", hirerID));
      const reviewsSnap = await getDocs(reviewsQuery);
      setHirerReviews(reviewsSnap.docs.map(doc => doc.data()));
      setReviewModal(true);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error(t("reviewFetchError"));
    }
  };

  const submitReview = async () => {
    if (rating < 1 || rating > 5 || !review.trim()) {
      toast.error(t("validRatingError"));
      return;
    }

    try {
      await addDoc(collection(db, "hirerReviews"), {
        hirerID: selectedHirer,
        rating,
        review,
        timestamp: new Date(),
      });
      toast.success(t("reviewSubmitted"));
      setRatingModal(false);
      setReview("");
      setRating(0);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(t("reviewSubmitError"));
    }
  };

  if (loading) return <div className="text-center mt-10">{t("loading")}</div>;

  return (
    <div className="container mx-auto p-6 h-[85vh] overflow-y-auto">
      <Toaster />
      <h2 className="text-3xl font-bold text-center mb-6">{t("workerProfile")}</h2>
      {workerHistory.length > 0 && (
        <div className="bg-white shadow-md rounded p-6 mb-6 flex gap-10 items-center">
          <h3 className="text-xl font-semibold">{workerHistory[0].name}</h3>
          <p><strong>{t("uid")}:</strong> {workerHistory[0].uidNo}</p>
          <p><strong>{t("mobile")}:</strong> {workerHistory[0].mobileNo}</p>
        </div>
      )}
      <h3 className="text-2xl font-semibold mb-4">{t("workHistory")}</h3>
      {workerHistory.map((work, index) => (
        <div key={index} className="border-b py-4">
          <p><strong>{t("hirer")}:</strong> {work.hirerName} (⭐ {work.averageRating})</p>
          <p><strong>{t("wages")}:</strong> ₹{work.wages}</p>
          <p><strong>{t("location")}:</strong> {work.locatioName}</p>
        
          <button onClick={() => openRatingModal(work.hirerId)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            {t("rateHirer")}
          </button>
          <button onClick={() => openReviewModal(work.hirerId)} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
            {t("viewReviews")}
          </button>
        </div>
      ))}
      {reviewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold">{t("hirerReviews")}</h3>
            {hirerReviews.length > 0 ? hirerReviews.map((r, i) => (
              <p key={i}><strong>{t("rating")}:</strong> {r.rating} ⭐ - {r.review}</p>
            )) : <p>{t("noReviews")}</p>}
            <button onClick={() => setReviewModal(false)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
              {t("close")}
            </button>
          </div>
        </div>
      )}
          
      {ratingModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold">{t("rateHirer")}</h3>
            <label className="block mt-4">{t("rating")}:</label>
            <input 
              type="number" 
              min="1" max="5" 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))} 
              className="border p-2 w-full" 
            />
            <label className="block mt-4">{t("review")}:</label>
            <textarea 
              value={review} 
              onChange={(e) => setReview(e.target.value)} 
              className="border p-2 w-full" 
            />
            <div className="flex justify-between mt-4">
              <button onClick={submitReview} className="bg-green-500 text-white px-4 py-2 rounded">
                {t("submit")}
              </button>
              <button onClick={() => setRatingModal(false)} className="bg-red-500 text-white px-4 py-2 rounded">
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerProfile;
