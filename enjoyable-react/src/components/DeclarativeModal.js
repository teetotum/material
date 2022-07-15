import React, { useState } from "react";
import style from "./modal.scss";

const Modal = ({ isOpen, children }) => {
  return isOpen ? <div className={style.modal}>{children}</div> : null;
};

Modal.greetTheUser = () => {
  console.log("Hi User!");
};

const Declarative = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen((x) => !x)} />
      <Modal isOpen={isOpen} />
    </div>
  );
};

export { Declarative };
