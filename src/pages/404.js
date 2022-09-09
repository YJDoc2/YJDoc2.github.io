import React from "react"
import Seo from "../components/seo"

import PhysicsBits from "../components/physics"
import Layout from "../components/layout"
import blankcanvas from "../images/blankcanvas.svg"

const Page404 = () => (
  <Layout>
    <Seo title="Page Not Found" />
    <section className="page404">
      <div className="container">
        <div className="row row-404 mt-4 float-right">
          <div className="img-container">
            <img
              src={blankcanvas}
              height={550}
              width={500}
              alt="Vector of an alien"
            />
          </div>
        </div>
        <div className="row row-404 mt-4 ml-4">
          <h1>Uh-oh.</h1>
          <h2>I haven't Put anything here, Yet.</h2>
          <br />
          <p>Here's a Physics Bit For you Instead :</p>

          <PhysicsBits />
        </div>
      </div>
    </section>
  </Layout>
)

export default Page404
