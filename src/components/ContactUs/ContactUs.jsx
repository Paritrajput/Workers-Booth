import React, { useState } from "react";
import { Link } from "react-router-dom";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null); // State to track the open FAQ

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("Failed to send message.");
      }
    } catch (error) {
      setStatus("Error occurred. Please try again.");
    }
  };

  const faqs = [
    {
      question: "How do I contact support?",
      answer: "You can use the contact form to email us with your query.",
    },
    {
      question: "What is your response time?",
      answer: "We usually respond within 24 hours on business days.",
    },
    {
      question: "Can I schedule a demo?",
      answer:
        "Yes, reach out to us using the contact form or on social media to schedule a demo.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index); // Toggle the clicked FAQ
  };

  return (
    <div className=" bg-gray-100 ">
      {/* <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
        Contact Us & FAQs
      </h1> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Us Section */}
        <div className="bg-gray-700 text-white md:m-0 m-9 p-6 shadow-md h-[90vh]">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-white font-semibold mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block font-semibold mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="5"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-red-700 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Send Message
            </button>
            <p className="text-center mt-4 text-gray-600">{status}</p>
          </form>
          <div className="mt-10 text-center">
            <h3 className="text-xl font-semibold mb-4">Social Handles</h3>
            <div className="flex justify-center space-x-4">
              <Link
                to="https://www.linkedin.com/company/team-vibhav"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="icons-linkedin.svg"
                  alt="LinkedIn"
                  className="w-7 h-7"
                />
              </Link>
              <a
                href="https://www.instagram.com/team_vibhav/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="icons-instagram.svg"
                  alt="Instagram"
                  className="w-7 h-7"
                />
              </a>
              <Link
                to="https://github.com/Team-Vibhav"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="icons-twitter.svg"
                  alt="LinkedIn"
                  className="w-7 h-7"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-6 m-9 h-fit rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, index) => (
            <div key={index} className="mb-6 border-b pb-4">
              <button
                className="w-full text-left text-lg font-semibold text-black-600 flex justify-between items-center"
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                <span className="text-gray-500">
                  {openFaqIndex === index ? "-" : "+"}
                </span>
              </button>
              {openFaqIndex === index && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
