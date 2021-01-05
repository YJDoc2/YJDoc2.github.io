import React, { Component } from "react"
import { StaticQuery, graphql } from "gatsby"

export default class PhysicsBits extends Component {
  constructor(props) {
    super(props)
    this.state = { rand: Math.random() }
  }
  componentDidMount() {
    this.setState({ rand: Math.random() })
  }
  render() {
    return (
      <StaticQuery
        query={graphql`
          query physicsDataQuery {
            allPhysicsbitsJson {
              nodes {
                links
                quote
              }
            }
          }
        `}
        render={data => {
          let quote =
            data.allPhysicsbitsJson.nodes[
              Math.floor(this.state.rand * data.allPhysicsbitsJson.nodes.length)
            ]
          return (
            <>
              <section>{quote.quote}</section>
              <br></br>
              {quote.links.length > 0 ? (
                <section>
                  To Know a bit more, check :{" "}
                  <ul>
                    {quote.links.map((l, index) => (
                      <li>
                        <a
                          href={l}
                          key={index}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                ""
              )}
            </>
          )
        }}
      />
    )
  }
}
