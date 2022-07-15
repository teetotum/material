import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import { useClickOutside } from "../util/useClickOutside";
import style from "./datepicker.scss";

const numberformat = new Intl.NumberFormat("de-DE", {
  minimumIntegerDigits: 2,
});

const supportedDateFormats = {
  ISO_8601: "YYYY-MM-DD",
  German: "DD.MM.YYYY",
  US: "MM/DD/YYYY",
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DATE_EMPTY = {
  isEmpty: true,
  hasValidationError: false,
};

const DATE_VALID = {
  isValid: true,
  hasValidationError: false,
};

const DATE_INVALID = {
  isValid: false,
  hasValidationError: true,
};

const datePattern = /^\d{1,2}\.\d{1,2}\.\d{4}$/;

const raiseValidationChanged = (validationResult, onValidationError) => {
  if (onValidationError) onValidationError(validationResult);
};

const raiseValidationError = (validationResult, onValidationError) => {
  if (!validationResult.hasValidationError) return;

  if (onValidationError) onValidationError(validationResult);
};

const raiseChange = (value, onChange) => {
  if (onChange) onChange(value);
};

// when presenting 'State changes and symmetry':
// rename onValidationError into onValidationChanged
// and use raiseValidationChanged instead of raiseValidationError

// when presenting 'Live coding example: DatePicker.supportedDateFormats':
// add DatePicker.supportedDateFormats = supportedDateFormats;

const DatePicker = ({ onValidationError, onChange, caption, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const root = useRef();
  useClickOutside(root, close);
  const [month, setMonth] = useState(new Date().getMonth());
  const [date, setDate] = useState("");
  const [validationResult, setValidationResult] = useState(DATE_EMPTY);
  const update = (date) => {
    setDate(date);

    if (!date) setValidationResult({ ...DATE_EMPTY });
    else {
      if (datePattern.test(date)) {
        setValidationResult({ ...DATE_VALID });
      } else {
        setValidationResult({ ...DATE_INVALID });
      }
    }
  };

  useEffect(() => raiseChange(date, onChange), [date]);
  useEffect(
    () => raiseValidationError(validationResult, onValidationError),
    [validationResult]
  );

  return (
    <div className={classnames(style.datePicker, className)} ref={root}>
      <input
        className={classnames(style.input)}
        value={date}
        onChange={(e) => update(e.target.value)}
        onClick={close}
      />
      <div className={classnames(style.pickButton)} onClick={open}>
        {caption}
      </div>
      {isOpen && (
        <div className={classnames(style.popup)}>
          <div className={classnames(style.header)}>
            <div className={classnames(style.closeButton)} onClick={close}>
              X
            </div>
          </div>
          <div className={classnames(style.calendar)}>
            {Array.from(Array(31), (_, i) => i + 1).map((day) => (
              <div
                className={classnames(style.day)}
                onClick={() => {
                  update(
                    `${numberformat.format(day)}.${numberformat.format(
                      month + 1
                    )}.2022`
                  );
                  close();
                }}
              >
                {day}
              </div>
            ))}
          </div>
          <div className={classnames(style.footer)}>
            <div
              className={classnames(style.monthButton, style.prev)}
              onClick={() => setMonth(Math.max(0, month - 1))}
            />
            <div className={classnames(style.month)}>{monthNames[month]}</div>
            <div
              className={classnames(style.monthButton, style.next)}
              onClick={() => setMonth(Math.min(11, month + 1))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { DatePicker };
