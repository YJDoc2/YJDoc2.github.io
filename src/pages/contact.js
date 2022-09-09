import React from "react"
import Seo from "../components/seo"

import Layout from "../components/layout"
import Links from "../components/links"
import contact from "../images/contact.svg"

const ContactPage = () => (
  <Layout>
    <Seo title="Contact" />
    <section className="contact">
      <div className="container">
        <div className="row mt-4">
          <div className="col-md-8">
            <h1>Contact Details</h1>
            <p>
              Hi! How are you? Thank you for visiting . If you have any
              inquiries or feedback, please don't hesitate to reach out. I am
              available at the following connections :
            </p>
            <Links />
          </div>
          <div className="col-lg-4 my-auto">
            <div className="img-container">
              <img src={contact} alt="Vector of a person sending message" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
)

export default ContactPage
