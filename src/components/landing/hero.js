import React from "react"

import Image from "../image"
import Links from "../links"

import { Link } from "gatsby"
import { Link as ScrollLink } from "react-scroll"

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container h-100">
        <div className="row h-100 justify-content-around">
          {/* + Hero section: Left side */}
          <div className="col-lg-5 my-auto">
            <div className="hero-introduction">
              <h1>
                <span className="wave" role="img" aria-label="Hand wave">
                  👋
                </span>
              </h1>
              <h1>Hello, I'm Yashodhan Joshi</h1>
              <p>
                I am Learning about computers,currently interested in Operating
                Systems and System Programming.
                <br />
                Also, I love Physics .
              </p>
              <div>
                <ScrollLink
                  to="content"
                  className="main-button btn btn-primary shadow-sm"
                  smooth={true}
                >
                  Know a bit more
                </ScrollLink>
                {"  "}
                <Link to="projects" className="main-button btn btn-primary">
                  See My Projects
                </Link>
              </div>
            </div>
          </div>
          {/* - Hero section: Left side */}

          {/* + Hero section: Right side */}
          <div className="col-lg-4 my-auto">
            <div className="hero-bio">
              <div className="card shadow-sm mb-5">
                <div className="card-body">
                  <div className="icon">
                    <Image
                      fileName="icon.png"
                      style={{ width: "5rem", height: "5rem" }}
                      alt="Hero Icon"
                    />
                  </div>

                  <h3 className="card-title">@YJDoc2</h3>
                  <h4>
                    <span
                      className="mr-1"
                      role="img"
                      aria-label="pin"
                      alt="pin emoji"
                    >
                      📍
                    </span>
                    India
                    <br />
                  </h4>
                  <p className="card-text">
                    Curious Student Interested in
                    <br />
                    Physics and Computers
                  </p>
                  <Links />
                </div>
              </div>
            </div>
          </div>
          {/* - Hero section: Right side */}
        </div>
      </div>
    </section>
  )
}
