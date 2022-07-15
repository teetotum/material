/* eslint-disable */
import React from "react";
import { FunctionComponent } from "react";
import { HTMLAttributesFunctionComponent } from "../util/components";
import classnames from "classnames";

interface ButtonProps {
  caption: string;
  onClick: () => void;
}

const Button: HTMLAttributesFunctionComponent<ButtonProps> = ({
  caption,
  onClick,
}) => {
  return <div onClick={onClick}>{caption}</div>;
};

export { Button };
