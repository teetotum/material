import React, { useState } from "react";
import classnames from "classnames";
import style from "./tab.scss";

const Tab = ({ children }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const items = [];
  React.Children.forEach(children, (child) => {
    if (child.type === Tab.Item) {
      items.push({
        content: child,
        label: child.props.label || items.length + 1,
      });
    }
  });

  const selectedItem =
    items.length > 0
      ? items[Math.min(Math.max(selectedIndex, 0), items.length - 1)]
      : {};

  return (
    <div>
      <div className={style.selector}>
        {items.map((item, index) => (
          <div
            key={item.label}
            className={classnames(
              style.selectorItem,
              item === selectedItem && style.selected
            )}
            onClick={() => setSelectedIndex(index)}
          >
            {item.label}
          </div>
        ))}
      </div>
      {selectedItem.content}
    </div>
  );
};

Tab.Item = ({ children }) => (
  <div className={style.contentPanel}>{children}</div>
);

export { Tab };
