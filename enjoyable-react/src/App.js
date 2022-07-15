import React from "react";
import style from "./app.scss";
import { Tab } from "./components/Tab";
import { Alignment } from "./examples/Alignment";
import { Stacking } from "./examples/Stacking";
import { Validation } from "./examples/Validation";

// when presenting 'Live coding example: Grid':
/*
  <Grid>
    <Alignment {...Grid.row(1)} {...Grid.column(1)} />
    <Stacking row={3} column={1} />
    <Validation row={1} column={3} />
  </Grid>;
*/

export const App = () => (
  <div className={style.app}>
    <Tab>
      <Tab.Item label={"Alignment"}>
        <Alignment />
      </Tab.Item>
      <Tab.Item label={"Stacking"}>
        <Stacking />
      </Tab.Item>
      <Tab.Item label={"Validation"}>
        <Validation />
      </Tab.Item>
    </Tab>
  </div>
);
