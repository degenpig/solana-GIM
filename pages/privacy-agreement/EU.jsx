import { AgreementLayout } from "../../components/AgreementLayout";
import { PrivacySection } from "../../components/PrivacySection";
import styles from "./california.module.scss";


export default function Terms({}) {
  return (
    <AgreementLayout><>
      <h1>The Gimmicks – EU Privacy Agreement</h1>
      <p>
      This policy was last modified on May 3, 2021.
      </p>
      <p>
      This EU Privacy Policy (this “EU Privacy Policy”) supplements the information contained in the Privacy Policy of Gimmicks  with additional information relating to your rights under the General Data Protection Regulation (“GDPR”) that apply only to residents of the European Union. Any terms defined in the Privacy Policy or in the GDPR have the same meaning when used in this EU Privacy Policy.
      </p>
      <p>
      By using the Site, you agree to the practices described in this EU Privacy Policy and any updates posted here from time to time. To make sure you stay informed of all changes, you should check this EU Privacy Policy periodically. Updates will be referenced by the “Last Modified” date shown above.
      </p>
      <p>
      We will only collect and process your personal data in accordance with applicable data protection and privacy laws. The data controller for the personal data that you provide or that is collected by Gimmicks  or its affiliates is Gimmicks , LLC, 200 Park Ave South, 8th Floor, New York, New York 10003.
      </p>
      <h2>Table of Contents</h2>
      <ol className={styles.tableOfContents}>
        <a href="#Your-GDPR-Rights">
          <li>
            <h3>Your GDPR Rights </h3>
          </li>
        </a>
        <a href="#Legal-Basis-for-Processing-Personal-Data">
          <li>
            <h3>Legal Basis for Processing Personal Data</h3>
          </li>
        </a>
        <a href="#Cookies-Pixel-Tags-and-Other-Similar-Tracking-Technologies">
          <li>
            <h3>Cookies, Pixel Tags, and Other Similar Tracking Technologies</h3>
          </li>
        </a>
        <a href="#Contact-Us">
          <li>
            <h3>Contact Us</h3>
          </li>
        </a>
      </ol>
      <ol>
        <PrivacySection id={'Your-GDPR-Rights'}>
          <h3>Your GDPR Rights</h3>
          <p>
          The GDPR provides residents of the EU with the following rights regarding their personal data:
          </p>
          <ul>
            <li>
            Right to be informed about the collection and use of your personal data
            </li>
            <li>
            Right to access your personal data
            </li>
            <li>
            Right to have any inaccurate personal data corrected
            </li>
            <li>
            Right to have your personal data erased
            </li>
            <li>
            Right to restrict use of your personal data
            </li>
            <li>
            Right to personal data portability
            </li>
            <li>
            Right to object to the processing of your personal data
            </li>
            <li>
            Right to object to automated decision making
            </li>
          </ul>
          <p>
          To exercise any of these rights, please submit a request by completing this <a href="https://forms.gle/9EeUwHBkWx6riHBRA" target="_blank">form</a>. We will respond to any requests within the time required by the GDPR. After you submit your request, you will be sent a confirmation email and need to click on the link provided to confirm your request. Please note that we may need additional information from you to verify your identity before we process your request.
          </p>
        </PrivacySection>
        <PrivacySection id={'Legal-Basis-for-Processing-Personal-Data'}>
          <h3>Legal Basis for Processing Personal Data</h3>
          <p>
          To the extent you provide us with personal data, we are processing your personal data under one of the following lawful bases:
          </p>
          <ul>
            <li>
            Consent. By opting-in, you consent to permit us to process your personal data for the purposes set forth in our Privacy Policy.  
            </li>
            <li>
            Compliance with Legal Obligations. We may process your personal data in order to comply with certain of our legal obligations.
            </li>
          </ul>
        </PrivacySection>
        <PrivacySection id={'Cookies-Pixel-Tags-and-Other-Similar-Tracking-Technologies'}>
          <h3>Cookies, Pixel Tags, and Other Similar Tracking Technologies</h3>
          <p>
          To the extent required by applicable law, we will obtain your consent before collecting data using cookies, pixel tags, and other similar tracking technologies on the Site. If you have accepted our use of cookies, pixel tags, and other tracking technologies, we will collect your data in accordance with our Privacy Policy based on your affirmative informed consent, which you may withdraw through the methods provided herein. If you have not accepted, then we only collect your personal data based on our legitimate interests. To view additional information about behavioral advertising and manage your preferences, you can do so by visiting <a href="http://www.youronlinechoices.eu/" target="_blank">Your Online Choices</a>.
          </p>
          <ul>
            <li>
            Consent. By opting-in, you consent to permit us to process your personal data for the purposes set forth in our Privacy Policy. 
            </li>
            <li>
            Compliance with Legal Obligations. We may process your personal data in order to comply with certain of our legal obligations.
            </li>
          </ul>
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