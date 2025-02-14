import Map from "./components/map.jsx";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Form from "./components/form.jsx";
import Register from "./components/register.jsx";
import HierForm from "./components/hierForm.jsx";
import React, { useEffect, useState } from "react";
import { auth } from "./firebase.config.js";
import Login from "./components/login.jsx";
import ContactUs from "./components/ContactUs/ContactUs.jsx";
import About from "./components/AboutUs/About.jsx";
import HirerHistory from "./components/hirerHistory.jsx";
import Myprofile from "./components/myProfile.jsx";
import WorkerAuth from "./components/worker-auth.jsx";
import WorkerProfile from "./components/worker-profile.jsx";
// import WorkerAuth from "./components/worker-auth.jsx";
// import WorkerProfile from "./components/worker-profile.jsx";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans antialiased">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<Map />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/contact" element={<ContactUs />} />
          <Route exact path="/form" element={<Form />} />
          <Route exact path="/login" element={user ? <Navigate to="/admin" /> : <Login />} />
          <Route exact path="/register" element={user ? <Navigate to="/admin" /> : <Register />} />
          <Route exact path="/admin" element={<HierForm />} />
          <Route exact path="/my-profile" element={<Myprofile />} />
          <Route exact path="/hirer-history" element={<HirerHistory />} />
          <Route exact path="/worker-auth" element={<WorkerAuth />} />
          <Route path="/worker-profile/:uid" element={<WorkerProfile />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
