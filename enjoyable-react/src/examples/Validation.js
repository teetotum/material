import React, { useState } from "react";
import classnames from "classnames";
import { DatePicker } from "../components/DatePicker";
import style from "./validation.scss";

// when presenting 'State changes and symmetry':
// clear validation with onChange={date => { setValidationResult(null); setDeliveryDate(date); }}
// later replace onValidationError={setValidationResult}
// with onValidationChanged={setValidationResult}

// when presenting 'Live coding example: DatePicker.supportedDateFormats':
// set dateFormat={DatePicker.supportedDateFormats.German}

const Validation = () => {
  const [validationResult, setValidationResult] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");

  return (
    <div className={classnames(style.form)}>
      <DatePicker
        caption={"pick"}
        onValidationError={setValidationResult}
        onChange={(date) => {
          setDeliveryDate(date);
        }}
      />
      {validationResult?.hasValidationError && (
        <span className={classnames(style.validationError)}>
          Please provide a valid date.
        </span>
      )}
      {!validationResult?.hasValidationError && (
        <span className={classnames(style.message)}>
          You have selected {deliveryDate || "____"} for your delivery.
        </span>
      )}
    </div>
  );
};

export { Validation };
