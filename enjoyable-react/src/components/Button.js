import React from "react";
import classnames from "classnames";
import { getDataAttributes, getAriaAttributes } from "../util/propFilter";
import style from "./button.scss";

const Button = ({ caption, onClick, outline, large, className, ...rest }) => {
  return (
    <div
      {...getDataAttributes(rest)}
      {...getAriaAttributes(rest)}
      className={classnames(style.button, className, {
        [style.outline]: outline,
        [style.large]: large,
      })}
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
};

Button.Primary = (props) => (
  <Button {...props} className={classnames(props.className, style.primary)} />
);
Button.Secondary = (props) => (
  <Button {...props} className={classnames(props.className, style.secondary)} />
);

export { Button };
