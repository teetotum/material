run with cleaver
https://www.npmjs.com/package/cleaver
https://github.com/jdan/cleaver

```
cleaver dom-event-cancellation/talk.md
or
cd dom-event-cancellation-revised
cleaver watch talk-revised.md
```

should output dom_event_cancellation_presentation.html into the root folder

<!--
abstract

We use event cancellation whenever we need finer control over which event listeners in the DOM should run and which shouldn't.
If we are unaware of the pitfalls we can cause hard-to-detect bugs that might easily slip through testing and end up in production.
Let's uncover those pitfalls and explore solutions.
-->

outline

- use case: show banking app
- two types of event listeners
- primary and secondary effects
- two approaches
- Pro & Contra
- passive event listeners?
