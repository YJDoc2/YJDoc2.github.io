import React, { Component } from "react"
import Seo from "../components/seo"
import Physics from "../components/physics"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal, faCode } from "@fortawesome/free-solid-svg-icons"

import Layout from "../components/layout"
import { graphql } from "gatsby"

export default class ProjectsPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      desc: "",
      lang: "",
      tech: "",
    }
    props.data.allProjectsJson.nodes.forEach(node => {
      node.language.forEach(lang => this.langs.add(lang))
      node.stack.forEach(tech => this.techs.add(tech))
    })

    this.langs = Array.from(this.langs)
    this.techs = Array.from(this.techs)
  }

  techs = new Set()
  langs = new Set()

  handleDescChange = e => {
    this.setState({ ...this.state, desc: e.target.value })
  }
  handleLangChange = e => {
    this.setState({ ...this.state, lang: e.target.value })
  }
  handleTechChange = e => {
    this.setState({ ...this.state, tech: e.target.value })
  }

  filterProjects = data => {
    let ret = data
    if (this.state.lang !== "") {
      ret = ret.filter(node => {
        return node.language.includes(this.state.lang)
      })
    }
    if (this.state.tech !== "") {
      ret = ret.filter(node => {
        return node.stack.includes(this.state.tech)
      })
    }
    if (this.state.desc !== "") {
      ret = ret.filter(node => {
        return node.description
          .toLowerCase()
          .includes(this.state.desc.toLowerCase())
      })
    }
    return ret
  }

  render() {
    let data = this.filterProjects(this.props.data.allProjectsJson.nodes)
    return (
      <Layout>
        <Seo title="Projects" />
        <section className="content">
          <div className="container">
            <div className="subsection">
              <div className="row form-group">
                <div className="col-lg-6 p-1">
                  <input
                    className="form-control"
                    type="text"
                    value={this.state.value}
                    onChange={this.handleDescChange}
                    placeholder="Search by description"
                  />
                </div>
                <div className="col-lg-3 p-1">
                  <select
                    className="form-control"
                    value={this.state.lang}
                    onChange={this.handleLangChange}
                  >
                    <option value="">Any Language</option>
                    {this.langs.map((lang, index) => {
                      return (
                        <option value={lang} key={index}>
                          {lang}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="col-lg-3 p-1">
                  <select
                    className="form-control"
                    value={this.state.tech}
                    onChange={this.handleTechChange}
                  >
                    <option value="">Any Techology</option>
                    {this.techs.map((tech, index) => {
                      return (
                        <option value={tech} key={index}>
                          {tech}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="subsection">
              {data.map((node, index) => (
                <div className="card mb-4 px-5 pb-5" key={index}>
                  <div className="card-body">
                    <div className="card-title">
                      <h3>{node.project}</h3>
                      <h4>
                        <FontAwesomeIcon icon={faTerminal} className="mr-2" />
                        {node.language.reduce((a, b) => {
                          return a + " , " + b
                        })}
                      </h4>
                      <h4>
                        <FontAwesomeIcon icon={faCode} className="mr-2" />
                        {node.stack.length
                          ? node.stack.reduce((a, b) => {
                              return a + " , " + b
                            })
                          : ""}
                      </h4>
                    </div>
                    <div className="card-text">
                      <p>{node.description}</p>
                      {node.links.length > 0 ? "See In More Detail Here :" : ""}
                      <br />
                      <ul>
                        {node.links.map((link, index) => (
                          <li>
                            <a
                              href={link}
                              rel="noreferrer"
                              target="_blank"
                              key={index}
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
              {data.length === 0 ? (
                <div className="card mb-4 px-5 pb-5">
                  <div className="card-body">
                    <div className="card-title">
                      <h3>Nothing Found!</h3>
                    </div>
                    <div className="card-text">
                      Instead, Here's a Physics bit :
                      <Physics />
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </section>
      </Layout>
    )
  }
}

export const query = graphql`
  query ProjectQuery {
    allProjectsJson {
      nodes {
        language
        links
        project
        stack
        description
      }
    }
  }
`
