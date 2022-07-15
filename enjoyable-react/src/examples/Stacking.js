import React, { useState } from "react";
import { DatePicker } from "../components/DatePicker";
import style from "./stacking.scss";

// when presenting 'flexibility': wrap date-picker in <div style={{zIndex: 1, position: 'relative'}}></div>
// later remove it again and set className={style.deliveryDate}

const Stacking = () => {
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");

  return (
    <div className={style.addressData}>
      <p>Please select a delivery date and provide your full address</p>

      <DatePicker caption={"select delivery date"} />

      <label className={style.field}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        Name
      </label>

      <label className={style.field}>
        <input value={street} onChange={(e) => setStreet(e.target.value)} />
        Street and number
      </label>

      <label className={style.field}>
        <input value={postcode} onChange={(e) => setPostcode(e.target.value)} />
        Postcode
      </label>
    </div>
  );
};

export { Stacking };
