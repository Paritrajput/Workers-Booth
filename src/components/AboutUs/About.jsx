import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function About() {
  const { t } = useTranslation();

  return (
    <div className="overflow-y-hidden">
      <section className="bg-gray-100">
        <div className="container mx-auto py-5 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div className="max-w-lg">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                {t("aboutUs")}
              </h2>
              <p className="mt-4 text-gray-600 text-lg">{t("aboutDescription")}</p>
              <div className="mt-8">
                <Link to="/contact" className="text-blue-500 hover:text-blue-600 font-medium">
                  {t("connectWithUs")}
                </Link>
              </div>
            </div>
            <div className="mt-12 md:mt-0">
              <img
                src="https://images.unsplash.com/photo-1531973576160-7125cd663d86"
                alt="About Us"
                className="object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
