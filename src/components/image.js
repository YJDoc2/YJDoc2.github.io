import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

const Image = ({ fileName, alt, className }) => {
  const { allImageSharp } = useStaticQuery(graphql`
    query {
      allImageSharp {
        nodes {
          fluid(maxWidth: 500) {
            originalName
          }
          gatsbyImageData
        }
      }
    }
  `)

  const fluid = allImageSharp.nodes.find(n => n.fluid.originalName === fileName)

  return (
    <figure>
      <GatsbyImage
        image={fluid.gatsbyImageData}
        alt={alt}
        className={className}
      />
    </figure>
  )
}

export default Image
