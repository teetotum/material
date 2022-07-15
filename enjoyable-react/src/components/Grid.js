import React from "react";

const guid = "bf1b5a20-ec50-4530-8a10-ae78bdc62e74";
const rowProp = `${guid}_row`;
const colProp = `${guid}_column`;

const Grid = ({ children, rows = 2, columns = 2 }) => (
  <div className={`grid-${columns}-${rows}`}>
    {React.Children.map(children, (child) => {
      const row = (child.props && child.props[rowProp]) || 0;
      const column = (child.props && child.props[colProp]) || 0;
      const placement = `cell-${column}-${row}`;
      return <div className={placement}>{child}</div>;
    })}
  </div>
);

Grid.row = (x) => ({ [rowProp]: x });
Grid.column = (x) => ({ [colProp]: x });

export { Grid };
