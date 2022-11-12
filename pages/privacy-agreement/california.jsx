import { AgreementLayout } from "../../components/AgreementLayout";
import { PrivacySection } from "../../components/PrivacySection";
import styles from "./california.module.scss";


export default function Terms({}) {
  return (
    <AgreementLayout><>
      <h1>The Gimmicks – California Privacy Agreement</h1>
      <p>
      This policy was last modified on May 3, 2021.
      </p>
      <p>
      This California Privacy Policy (this “California Privacy Policy”) supplements the information contained in the Privacy Policy of Gimmicks  with additional disclosures required by the California Consumer Privacy Act (“CCPA”) and other California privacy laws that apply only to residents of California. Any terms defined in the Privacy Policy or in the CCPA have the same meaning when used in this California Privacy Policy.
      </p>
      <p>
      By using the Site, you agree to the practices described in this California Privacy Policy and any updates posted here from time to time. To make sure you stay informed of all changes, you should check this California Privacy Policy periodically. Updates will be referenced by the “Last Modified” date shown above.      
      </p>
      <h2>Table of Contents</h2>
      <ol className={styles.tableOfContents}>
        <a href="#Definition-of-Personal-Information">
          <li>
            <h3>Definition of Personal Information</h3>
          </li>
        </a>
        <a href="#Notice-of-Collection-of-Personal-Information">
          <li>
            <h3>Notice of Collection of Personal Information</h3>
          </li>
        </a>
        <a href="#Use-and-Disclosure-of-Personal-Information">
          <li>
            <h3>Use and Disclosure of Personal Information</h3>
          </li>
        </a>
        <a href="#Sale-of-Personal-Information">
          <li>
            <h3>Sale of Personal Information</h3>
          </li>
        </a>
        <a href="#Your-California-Consumer-Privacy-Rights">
          <li>
            <h3>Your California Consumer Privacy Rights</h3>
          </li>
        </a>
        <a href="#Exercising-Your-California-Privacy-Rights">
          <li>
            <h3>Exercising Your California Privacy Rights</h3>
          </li>
        </a>
        <a href="#Contact-Us">
          <li>
            <h3>Contact Us</h3>
          </li>
        </a>
      </ol>
      <ol>
        <PrivacySection id={'Definition-of-Personal-Information'}>
          <h3>Definition of Personal Information</h3>
          <p>
          As defined in the CCPA, “Personal Information” means information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or household.
          </p>
        </PrivacySection>
        <PrivacySection id={'Notice-of-Collection-of-Personal-Information'}>
          <h3>Notice of Collection of Personal Information</h3>
          <p>
          We may collect and may have collected in the last 12 months the following categories of Personal Information:
          </p>
          {/* table */}
          <div className={styles.table}>
            <div className={styles.row}>
              <div className={styles.catTile}>
                <h3>Category</h3>
              </div>
              <div className={styles.exTile}>
                <h3>Examples</h3>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.catTile}>
                <p>Identifiers.</p>
              </div>
              <div className={styles.exTile}>
                <p>
                A real name, alias, postal address, unique personal identifier, online identifier, Internet Protocol address, email address, account name, Social Security number, driver’s license number, passport number, or other similar identifiers.
                </p>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.catTile}>
                <p>
                Personal information categories listed in the California Customer Records statute (Cal. Civ. Code § 1798.80(e)).
                </p>
              </div>
              <div className={styles.exTile}>
                <p>
                A name, signature, Social Security number, physical characteristics or description, address, telephone number, passport number, driver’s license or state identification card number, insurance policy number, education, employment, employment history, bank account number, credit card number, debit card number, or any other financial information, medical information, or health insurance information. Some Personal Information included in this category may overlap with other categories.
                </p>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.catTile}>
                <p>
                Commercial information.
                </p>
              </div>
              <div className={styles.exTile}>
                <p>
                Records of personal property, products or services purchased, obtained, or considered, or other purchasing or consuming histories or tendencies.
                </p>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.catTile}>
                <p>
                Online activity; Internet or other electronic network activity information.
                </p>
              </div>
              <div className={styles.exTile}>
                <p>
                Browsing history, search history, and information regarding a consumer’s interaction with a website, application, or advertisement.
                </p>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.catTile}>
                <p>
                Geolocation data.
                </p>
              </div>
              <div className={styles.exTile}>
                <p>
                Physical location or movements.
                </p>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.catTile}>
                <p>
                Inferences drawn from any of the information.
                </p>
              </div>
              <div className={styles.exTile}>
                <p>
                Profile reflecting a consumer’s preferences, characteristics, psychological trends, predispositions, behavior, attitudes, intelligence, abilities, and aptitudes.
                </p>
              </div>
            </div>
          </div>
          <p>
          Please note that the categories and examples listed above are those defined in the CCPA. This does not mean that all examples of that category of Personal Information were in fact collected about every Site visitor, but reflects our good faith belief to the best of our knowledge that some of that information from the applicable category may be and may have been collected.
          </p>
          <p>
          We collect the categories of Personal Information listed above from the following categories of sources:
          </p>
          <ol>
            <li>
            Directly from you when you provide it to us.
            </li>
            <li>
            Indirectly and automatically from your devices. For example, when you visit or interact with the Site.
            </li>
            <li>
            Directly from our parents, affiliates, subsidiaries, and other companies under common control and ownership.
            </li>
            <li>
            Directly from our clients or their agents. For example, from documents that our clients provide to us related to the services for which they engage us.
            </li>
            <li>
            From vendors who provide services to us.
            </li>
            <li>
            From other third parties.  For example, sponsors or event partners in connection with certain ticketed events, social networking providers, and advertising companies. If you do not want us to collect information from social networks, you should review and adjust your privacy settings on those networks as desired before linking or connecting them to the Site.
            </li>
          </ol>
        </PrivacySection>
        <PrivacySection id={'Use-and-Disclosure-of-Personal-Information'}>
          <h3>Use and Disclosure of Personal Information</h3>
          <p>
          We may use and disclose the Personal Information as described in our <a href="/privacy-agreement" target="_blank">Privacy Policy</a>, in Sections 2 and 4, respectively, for business and commercial purposes. Additionally, we may use or disclose and may have used or disclosed in the last 12 months the following categories of Personal Information for business or commercial purposes:
          </p>
          <ol>
            <li>
            Identifiers.
            </li>
            <li>
            Personal information categories listed in the California Customer Records statute (Cal. Civ. Code § 1798.80(e)).
            </li>
            <li>
            Commercial information.
            </li>
            <li>
            Online activity; Internet or other electronic network activity information.
            </li>
            <li>
            Geolocation data.
            </li>
            <li>
            Inferences drawn from any of the information.
            </li>
          </ol>
        </PrivacySection>
        <PrivacySection id={'Sale-of-Personal-Information'}>
          <h3>Sale of Personal Information</h3>
          <p>
          We may sell the Personal Information in connection with certain uses and disclosures as described in our <a href="/privacy-agreement" target="_blank">Privacy Policy</a> in Sections 2 and 4, respectively. We may sell and may have sold in the last 12 months the following categories of Personal Information:
          </p>
          <ol>
            <li>
            Identifiers.
            </li>
            <li>
            Personal information categories listed in the California Customer Records statute (Cal. Civ. Code § 1798.80(e)).
            </li>
            <li>
            Commercial information.
            </li>
            <li>
            Online activity; Internet or other electronic network activity information.
            </li>
            <li>
            Geolocation data.
            </li>
            <li>
            Inferences drawn from any of the information.
            </li>
          </ol>
          <p>
          As defined in the CCPA, “sell” and “sale” mean selling, renting, releasing, disclosing, disseminating, making available, transferring, or otherwise communicating orally, in writing, or by electronic or other means, a consumer’s Personal Information by the business to a third party for valuable consideration. This means that we may have received some kind of benefit in return for sharing Personal Information, but not necessarily a monetary benefit.
          </p>
          <p>
          Please note that the categories listed above are those defined in the CCPA. This does not mean that all examples of that category of Personal Information were in fact sold, but reflects our good faith belief to the best of our knowledge that some of that information from the applicable category may be and may have been shared for value in return.
          </p>
        </PrivacySection>
        <PrivacySection id={'Your-California-Consumer-Privacy-Rights'}>
          <h3>Your California Consumer Privacy Rights</h3>
          <p>
          The CCPA provides residents of California with the following rights regarding their Personal Information:
          </p>
          <p>
          Right to Know About Personal Information Collected or Disclosed
          </p>
          <p>
          You have the right to request, twice in a 12-month period, that we disclose certain information to you about our collection, use, and disclosure of your Personal Information over the last 12 months. Once we receive and confirm a verifiable consumer request from you, we will disclose to you within the time required by the CCPA, the relevant information.
          </p>
          <p>
          Right to Request Deletion of Personal Information
          </p>
          <p>
          You have the right to request that we delete any of your Personal Information that we collected from you and retain, subject to certain exceptions. Once we receive and confirm a verifiable consumer request from you, we will delete (and direct our service providers to delete) your Personal Information from our records within the time required by the CCPA, unless an exception applies.
          </p>
          <p>
          Right to Opt-Out of the Sale of Personal Information
          </p>
          <p>
          You have the right to opt-out of the sale of your Personal Information. Once we receive and confirm a verifiable consumer request from you, we will stop selling your Personal Information. Please submit a request through our <a href="https://forms.gle/9EeUwHBkWx6riHBRA" target="_blank">Do Not Sell web form</a>.
          </p>
          <p>
          Right to Non-Discrimination for the Exercise of a Consumer’s Privacy Rights
          </p>
          <p>
          You have the right not to receive discriminatory treatment by us for the exercise of any your CCPA rights. We will not discriminate against you for exercising any of your CCPA rights.
          </p>
        </PrivacySection>
        <PrivacySection id={'Exercising Your California Privacy Rights'}>
          <h3>Exercising Your California Privacy Rights</h3>
          <p>
          To exercise any of the rights described above, please submit a request by emailing <a href="mailto:fyb@therealgimmicks.com">fyb@therealgimmicks.com</a>. 
          </p>
          <h4>Verification of Requests</h4>
          <p>
          When you submit your request, we will reasonably verify your identity prior to processing your request to access or delete any Personal Information we may hold about you. You must provide sufficient information that allows us to reasonably verify you are the person about whom we collected Personal Information or an authorized representative of that person.
          </p>
          <p>
          We cannot respond to your request or provide you with Personal Information if we cannot verify your identity or authority to make the request and confirm the Personal Information relates to you.
          </p>
          <p>
          Making a request does not require you to create an account with us. We will only use Personal Information provided in a request to verify the requestor’s identity or authority to make the request.
          </p>
          <h4>Making a Request through an Authorized Agent</h4>
          <p>
          You may submit a request through an authorized agent. The agent will need to state that they are acting on your behalf when making the request, have proof of the authority to act on your behalf, and be prepared to provide sufficient Personal Information to enable us to identify you in our records.
          </p>
        </PrivacySection>
        <PrivacySection id={'Contact-Us'}>
          <h3>Contact Us</h3>
          <p>
          To submit a request relating to Your Data Preferences, please email <a href="mailto:fyb@therealgimmicks.com">fyb@therealgimmicks.com</a>. Please note that requests submitted through the form are processed more quickly than requests submitted by email or mail.
          </p>
          <p>
          If you have any questions about this Privacy Policy, please email us <a href="mailto:fyb@therealgimmicks.com">fyb@therealgimmicks.com</a> or write to us at the following address:
          </p>
          <p>
          Gimmicks , LLC<br/>
          Attention: Legal Department; Privacy Policy Inquiry<br/>
          200 Park Ave South, 8th Floor<br/>
          New York, NY 10003<br/>
          </p>
        </PrivacySection>
      </ol>
    </></AgreementLayout>
  )
}