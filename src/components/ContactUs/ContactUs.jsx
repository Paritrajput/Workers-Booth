import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ContactUs = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(t("sending"));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus(t("messageSent"));
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus(t("messageFailed"));
      }
    } catch (error) {
      setStatus(t("errorOccurred"));
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-700 text-white md:m-0 m-9 p-6 shadow-md h-[90vh]">
          <h2 className="text-3xl font-bold mb-4">{t("contactUs")}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-white font-semibold mb-2">
                {t("name")}
              </label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block font-semibold mb-2">{t("email")}</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block font-semibold mb-2">{t("message")}</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange}
                className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="5" required></textarea>
            </div>
            <button type="submit" className="w-full bg-red-700 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200">
              {t("sendMessage")}
            </button>
            <p className="text-center mt-4 text-gray-600">{status}</p>
          </form>
        </div>

        <div className="bg-white p-6 m-9 h-fit rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-4">{t("faq")}</h2>
          {t("faqs", { returnObjects: true }).map((faq, index) => (
            <div key={index} className="mb-6 border-b pb-4">
              <button onClick={() => toggleFaq(index)} className="w-full text-left text-lg font-semibold text-black-600 flex justify-between items-center">
                {faq.question} <span className="text-gray-500">{openFaqIndex === index ? "-" : "+"}</span>
              </button>
              {openFaqIndex === index && <p className="mt-2 text-gray-600">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
