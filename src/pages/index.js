import React from "react"

import Seo from "../components/seo"
import Layout from "../components/layout"
import Hero from "../components/landing/hero"
import Content from "../components/landing/content"

const IndexPage = () => (
  <Layout>
    <Seo title="Home" />
    <Hero />
    <Content />
  </Layout>
)

export default IndexPage
