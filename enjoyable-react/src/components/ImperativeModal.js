import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import style from "./modal.scss";

const Modal = forwardRef(({ children }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((x) => !x),
      isOpen,
    }),
    [isOpen]
  );

  return isOpen ? <div className={style.modal}>{children}</div> : null;
});

const Imperative = () => {
  const modal = useRef(null);

  return (
    <div>
      <button onClick={() => modal.current.open()} />
      <Modal ref={modal} />
    </div>
  );
};

export { Imperative };
