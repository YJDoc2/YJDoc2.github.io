import React from "react"
import Seo from "../components/seo"
import Physics from "../components/physics"
import Layout from "../components/layout"
import { Link } from "gatsby"

const AboutPage = () => (
  <Layout>
    <Seo title="About" />
    <section className="about">
      <div className="container">
        {/* + Title */}
        <div className="row mt-4 justify-content-center">
          <div className="col-lg-7 col-sm-12 my-auto headline">
            <h1>Hello~</h1>
          </div>
        </div>
        {/* - Title */}

        <div className="row my-4 justify-content-center">
          {/* + Card */}
          <div className="col-lg-7 my-auto">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="card-title">
                  <h2>
                    Hi there!
                    <span role="img" aria-label="Happy face">
                      😊
                    </span>
                  </h2>
                  <h3>Hope You're Well</h3>
                </div>

                <div className="card-text">
                  I am Yashodhan, a curious student currently learning Computer
                  engineering. I hope to do something that will connect both, my
                  knowledge of computers and my love of physics. I am am
                  particularly fascinated by Operating Systems, Compilers and
                  Theory of General Relativity.
                </div>
              </div>
            </div>
          </div>
          {/* - Card */}

          {/* Break */}
          <div className="col-lg-6 my-auto mx-auto">
            <br />
          </div>
          {/* Break */}

          {/* + Card */}
          <div className="col-lg-7 my-auto">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="card-title">
                  <h2>More about me</h2>
                  <h3>What's your core</h3>
                </div>

                <div className="card-text">
                  <em>Taking a slide </em> from{" "}
                  <a
                    href="https://www.youtube.com/watch?v=2wZ1pCpJUIM"
                    target="_blank"
                    rel="noreferrer"
                  >
                    this talk
                  </a>{" "}
                  I would say that the core values I try to build in the code I
                  write are :
                  <ul>
                    <li>Maintainability</li>
                    <li>Debuggability</li>
                    <li>Safety</li>
                    <li>Security</li>
                    <li>Simplicity</li>
                  </ul>
                  You can check my projects on my{" "}
                  <a
                    href="https://github.com/YJDoc2"
                    target="_blanck"
                    rel="noreferrer"
                  >
                    Github
                  </a>{" "}
                  or see a short description <Link to="/projects">Here</Link>
                </div>
              </div>
            </div>
          </div>
          {/* - Card */}

          {/* Break */}
          <div className="col-lg-6 my-auto mx-auto">
            <br />
          </div>
          {/* Break */}

          {/* + Card */}
          <div className="col-lg-7 my-auto">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="card-title">
                  <h2>What else I do?</h2>
                  <h3>Some things here and there</h3>
                </div>

                <div className="card-text">
                  I have been a part of a committee from my Collage :{" "}
                  <strong>
                    <a
                      href="https://djunicode.in/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Unicode
                    </a>
                  </strong>
                  . I have contributed in creating few projects, and also have
                  mentored my juniors, helping them learn web development and
                  other technologies.
                  <br />I also write blogs on Dev, you can check them{" "}
                  <a
                    href="http://www.dev.to/yjdoc2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    here.
                  </a>
                  <br />
                </div>
              </div>
            </div>
          </div>
          {/* - Card */}

          {/* Break */}
          <div className="col-lg-6 my-auto mx-auto">
            <br />
          </div>
          {/* Break */}

          {/* + Card */}
          <div className="col-lg-7 my-auto">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="card-title">
                  <h2>Physics!</h2>
                  <h3>It's Amazing</h3>
                </div>

                <div className="card-text">
                  <Physics />
                </div>
              </div>
            </div>
          </div>
          {/* - Card */}
        </div>
      </div>
    </section>
  </Layout>
)
export default AboutPage
