import React from "react";
import classnames from "classnames";
import style from "./simplebutton.scss";

const modifiers = {
  stretch: style.stretched,
  left: style.leftAligned,
  right: style.rightAligned,
};

// when presenting: we add alignment prop
// and set className={classnames(style.button, modifiers[alignment])}

const Button = ({ caption, onClick }) => (
  <div
    className={style.button}
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(event) => {
      if (!event.defaultPrevented) {
        if (event.key === "Enter") {
          onClick();
          event.preventDefault();
        }
      }
    }}
  >
    {caption}
  </div>
);

Button.greetTheUser = () => {
  console.log("Hi User!");
};

export { Button };
