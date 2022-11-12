import { useContext } from "react";
import styles from "./ReportModal.module.scss";
import { WikiContext } from './../../hooks/wiki-context';
import { useForm } from "react-hook-form";
import { useForm as useFormSpree, ValidationError } from '@formspree/react';

export const ReportModal = ({reportName, reportID, reportLink}) => {
  const {toggleReportModal} = useContext(WikiContext);
  const { register, formState:{ errors }, watch} = useForm();
  const options = { data: {
    reportID :reportID, 
    reportLink: reportLink
    }
  }
  const [state, handleSubmit] = useFormSpree("xnqwzrgl", options);

  return (
    <div className={styles.reportModal} >
      <div className={styles.reportModalBackground} onClick={() => toggleReportModal()}/>
      <div className={styles.reportModalTile}>
        <div className={styles.reportModalContent}>
        {!state.succeeded ? (
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1>Report Form For {reportName}</h1>
            <label>Additional Details</label>
            <textarea id="report-details" name="report-details" {...register("Report Details")} />
            <input className={styles.submit} type="submit" value="Submit Report"/>
          </form>
        ) : (
          <p>your report has been submitted</p>
        )}
        </div>
      </div>
    </div>
  )
}