import React from "react";
import { Link } from "react-router-dom";

function About() {
  return (
    <div>
      <section class="bg-gray-100 ">
        <div class="container mx-auto py-5 px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div class="max-w-lg">
              <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                About Us
              </h2>
              <p class="mt-4 text-gray-600 text-lg">
              Team Vibhav is the official departmental team of the Electronics & Communication Engineering Department at NIT Hamirpur, dedicated to contributing to Nimbus, the institute’s annual technical festival. As a team, we cultivate a spirit of innovation, teamwork, and technical excellence, fostering an environment where students can develop and showcase their skills in electronics, robotics, embedded systems, and cutting-edge technologies. At Team Vibhav, we believe in nurturing a deep and genuine commitment toward technological advancements. Our diverse pool of talented students continuously explores new ideas, pushing the boundaries of what is possible. Whether it's designing intelligent automation systems, IoT-based applications, or futuristic electronic projects, we encourage creativity and hands-on learning.
              </p>
              <div class="mt-8">
                <Link
                  to="/contact"
                  class="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Connect with us
                </Link>
              </div>
            </div>
            <div class="mt-12 md:mt-0">
              <img
                src="https://images.unsplash.com/photo-1531973576160-7125cd663d86"
                alt="About Us Image"
                class="object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
