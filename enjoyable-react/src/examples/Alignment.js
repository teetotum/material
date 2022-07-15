import React from "react";
//import { Button } from '../components/Button';
import { Button } from "../components/SimpleButton";
import style from "./alignment.scss";
import loremipsum from "../util/loremipsum.txt";

const Article = ({ children }) => (
  <div className={style.article}>{children}</div>
);

// when presenting 'flexibility': add alignment={'stretch'} to the hot-topic-button
// later replace it with className={style.hotTopicButton}

// when presenting 'DOM Attributes': add data-test-id={'first-article-cta'} and later add aria-cta to the first button

const Alignment = () => (
  <div className={style.columns}>
    <Article>
      <h2>Lorem Ipsum</h2>
      <p>{loremipsum}</p>
      <Button
        caption={"click me"}
        onClick={() => {
          alert("You clicked");
        }}
      />
    </Article>
    <Article>
      <h2>Lorem Ipsum</h2>
      <h3 className={style.hotTopic}>HOT TOPIC</h3>
      <p>{loremipsum}</p>
      <Button
        caption={"click me"}
        onClick={() => {
          alert("You clicked");
        }}
      />
    </Article>
  </div>
);

export { Alignment };
