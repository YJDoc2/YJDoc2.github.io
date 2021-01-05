import React, { Component } from "react"
import { StaticQuery, graphql } from "gatsby"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTerminal,
  faDatabase,
  faBoxOpen,
  faCode,
} from "@fortawesome/free-solid-svg-icons"

export default class Content extends Component {
  render() {
    return (
      <StaticQuery
        query={graphql`
          query projectsQuery {
            allLanguagesJson {
              nodes {
                language
                id
              }
            }
            allFrameworksJson {
              nodes {
                framework
                id
              }
            }
            allDatabasesJson {
              nodes {
                db
                id
              }
            }
            allTechnologiesJson {
              nodes {
                technology
                id
              }
            }
          }
        `}
        render={data => (
          <>
            <section className="content" id="content">
              <div className="container">
                {/* + Technologies subsection */}
                <div className="subsection">
                  <h2 className="mt-5">
                    <span className="dot"></span>What do I{" "}
                    <span className="word">know</span>?
                  </h2>
                  <div className="row">
                    {/*First Column */}
                    <div className="col-lg-6">
                      {/* Languages */}
                      <div className="card">
                        <div className="card-body">
                          <div className="card-title">
                            <h3>Languages</h3>
                          </div>
                          <div className="card-text">
                            {data.allLanguagesJson.nodes.map(
                              ({ language }, index) => (
                                <div className="card-item" key={index}>
                                  <FontAwesomeIcon
                                    icon={faTerminal}
                                    className="mr-2 item-icon"
                                  />{" "}
                                  {language}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Languages */}

                      {/* Databases */}
                      <div className="card">
                        <div className="card-body">
                          <div className="card-title">
                            <h3>Databases</h3>
                          </div>
                          <div className="card-text">
                            {data.allDatabasesJson.nodes.map(
                              ({ db }, index) => (
                                <div className="card-item" key={index}>
                                  <FontAwesomeIcon
                                    icon={faDatabase}
                                    className="mr-2 item-icon"
                                  />{" "}
                                  {db}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Databases */}
                    </div>
                    {/*First Column */}

                    {/* Second Column */}
                    <div className="col-lg-6">
                      {/* Framework */}
                      <div className="card">
                        <div className="card-body">
                          <div className="card-title">
                            <h3>Frameworks</h3>
                          </div>
                          <div className="card-text">
                            {data.allFrameworksJson.nodes.map(
                              ({ framework }, index) => (
                                <div className="card-item" key={index}>
                                  <FontAwesomeIcon
                                    icon={faBoxOpen}
                                    className="mr-2 item-icon"
                                  />{" "}
                                  {framework}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Framework */}

                      {/* Technologies */}
                      <div className="card">
                        <div className="card-body">
                          <div className="card-title">
                            <h3>Technologies</h3>
                          </div>
                          <div className="card-text">
                            {data.allTechnologiesJson.nodes.map(
                              ({ technology }, index) => (
                                <div className="card-item" key={index}>
                                  <FontAwesomeIcon
                                    icon={faCode}
                                    className="mr-2 item-icon"
                                  />{" "}
                                  {technology}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Technologies */}
                    </div>
                    {/* Second Column */}
                  </div>
                </div>
                {/* - Technologies subsection */}
              </div>
            </section>
          </>
        )}
      />
    )
  }
}
