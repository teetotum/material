title: DOM Event Cancellation
author:
name: Martin Winkler
twitter: "@winkler_12"
url: https://github.com/teetotum
output: dom_event_cancellation_presentation.html
controls: true
progress: false
style: "./presentation.css"

--

# DOM Event Cancellation

<div class="opinion lower-half">
  <h2>
    ...and why we shouln't use .stopPropagation()
  </h2>
</div>

-- vertical-split

<div class="fact">
  <h2>
    Facts
  </h2>
</div>

<div class="opinion">
  <h2>
    Opinion
  </h2>
</div>

-- vertical-split

<div class="fact">
  <h2>
    Facts
  </h2>
</div>

<div class="afaik">
  <ul>
    <li>To the best of my knowledge</li>
    <li>Observation</li>
    <li>Interpretation</li>
    <li>Lacking official sources</li>
  </ul>
</div>

<div class="opinion">
  <h2>
    Opinion
  </h2>
</div>

--
what do we call this scenario? event cancellation?

```pseudo-code
if (Listener-A.ran) omit(Listener-B)
```

<img style="object-fit: contain; height: 460px" src="file:///C:/tinkerspace/react-grid-exploration/src/dom_event_cancellation/dom_scribble_with_listeners.svg" />

--
mdn calls only this _event cancellation_ ...

```js
e.preventDefault();
```

> To cancel an event, call the `preventDefault()` method on the event. This keeps the implementation from executing the default action that is associated with the event. Event listeners that handle multiple kinds of events may want to check `cancelable` before invoking their `preventDefault()` methods.
> [mdn: cancelable](https://developer.mozilla.org/en-US/docs/Web/API/Event/cancelable)

<!-- > Calling `preventDefault()` during any stage of event flow cancels the event, meaning that any default action normally taken by the implementation as a result of the event will not occur.
> You can use `Event.cancelable` to check if the event is cancelable. Calling `preventDefault()` for a non-cancelable event has no effect.
> [mdn: preventDefault](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)

> If invoked when the `cancelable` attribute value is true, and while executing a listener for the _event_ with `passive` set to false, signals to the operation that caused _event_ to be dispatched that it needs to be canceled.
> [spec: preventDefault](https://dom.spec.whatwg.org/#ref-for-dom-event-preventdefault③) -->

--
...but what do we call this then?

```js
e.stopPropagation();
// or
e.stopImmediatePropagation();
```

> When dispatched in a tree, invoking this method prevents _event_ from reaching any objects other than the current object.
> [spec: stopPropagation](https://dom.spec.whatwg.org/#ref-for-dom-event-stoppropagation①)

-- afaik

Observation: From time to time we need a mechanism to control whether an effect is triggered by an event, depending on whether another effect was already triggered by the same event.

In plain words: we need to _cancel_ an event

<!--
distinguish _handled_ and _unhandled_ events. -->

-- afaik

## Proposal: a broader definition / an umbrella term

<b>DOM event cancellation</b> is any mechanism that...

- is triggered by a DOM event, and that...
- prevents an effect from happening, which would otherwise be triggered by the same DOM event

--

So this is event cancellation...

```html
<a href="https://www.example.com/" id="link">click me</a>
```

```js
document
  .getElementById("link")
  .addEventListener("click", (e) => e.preventDefault());
```

--
...and this is event cancellation

```html
<div id="outer">
  <div id="inner">click me</div>
</div>
```

```js
document
  .getElementById("outer")
  .addEventListener("click", (e) => console.log(e));

document
  .getElementById("inner")
  .addEventListener("click", (e) => e.stopPropagation());
```

--

...and this

```html
<div id="outer">
  <div id="inner">click me</div>
</div>
```

```js
document.getElementById("outer").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) console.log(e);
});

document
  .getElementById("inner")
  .addEventListener("click", (e) => console.log(e));
```

--
...and this? (No, not really)

```html
<div id="outer">
  <div id="inner">click me</div>
</div>
```

```js
document
  .getElementById("outer")
  .addEventListener("click", (e) => console.log(e));

document.getElementById("inner").addEventListener("click", (e) => {
  return false;
});
```

--
But this is!

```html
<a href="https://www.example.com/" onclick="return false">click me</a>
```

--
so is this.

```html
<div id="outer">
  <div id="inner">click me</div>
</div>
```

```js
document.getElementById("outer").addEventListener("click", (e) => {
  if (!e.handled) console.log(e);
});

document.getElementById("inner").addEventListener("click", (e) => {
  e.handled = true;
});
```

--

## So when is this useful?

[Example app without event cancellation](file:///C:/tinkerspace/react-grid-exploration/src/dom_event_cancellation/without.html)

[Example app with stopPropagation](file:///C:/tinkerspace/react-grid-exploration/src/dom_event_cancellation/with.html)

-- afaik

## The two 'flavors' of event handlers

- primary effects: the user expects only one primary effect to happen per event
- secondary effects: the user is usually unaware of secondary effects, but they are necessairy and omitting them constitutes a bug

Hypothesis 1: all DOM event effects can be reasonably thought of as falling into one of the two categories

Hypothesis 2: browser default actions are always primary effects in this regard

--

## In our online banking example

- session keep alive: secondary
- closing menu dropdown with clickaway: secondary
- menu button toggling menu dropdown: primary
- sorting columns: primary
- selecting column header: primary
- following a hyperlink: primary

--

so we need a mechanism that ensures only one primary effect runs, but all secondary effects are triggered nonetheless.

we have the choice between two alternative solutions...

--

## alternative 1

--

- 1: using a _handled_ flag in all primary effects; the standard `defaultPrevented` suits that purpose, no need for a non-standard property

```js
.addEventListener("click", (e) => {
  if (e.defaultPrevented) return;

  // process event
  // ...
  // mark handled
  e.preventDefault();
})
```

- 2: secondary effects need no special handling; but must never interfere with `defaultPrevented`

```js
.addEventListener("click", (e) => {
  if (isOutside(e)) closeDropdown();
})
```

--

## alternative 2

--

- 1: all primary effects must use the bubbling phase, and must call stopPropagation and additionally preventDefault

```js
.addEventListener("click", (e) => {
  // process event
  // ...
  // mark handled
  e.stopPropagation();
  e.preventDefault();
})
```

- 2: all secondary effects must use the capturing phase, and must never stopPropagation or preventDefault

```js
.addEventListener("click", (e) => {
  if (isOutside(e)) closeDropdown();
}, { capture: true })
```

--

The two alternatives cannot be mixed

-- smaller-font

advantages of alternative 1:

- we are free to use either capturing or bubbling phase for any of our event handlers and can freely make use of this feature to tweak order of operations
- marking events as _handled_ for primary effects only requires preventDefault and nothing more
- primary effects are handled uniformly - no matter whether they are browser default actions or user-land actions
- more forgiving if used incorrectly: the worst thing that can happen is that more than one primary effect is triggered, but not that secondary effects are prevented by accident

disadvantages:

- primary effects must add a check before any processing code
- can be broken by misbehaving third-party code which uses stopPropagation

-- smaller-font

advantages of alternative 2:

- requires no check in any event handler, just do your thing and then kill off the event

disadvantages:

- requires both stopPropagation and preventDefault to properly cancel primary effects
- forces all secondary effects into the capturing phase
- high risk of inadvertently sabotaging secondary effects
- erroneously stopping propagation in the capturing phase can even kill off secondary effects that have been registered correctly

-- opinion

I strongly favour the preventDefault approach.

I believe we should never use stopPropagation anywhere.

No matter which approach you choose, the selected approach should be explicitly stated in you developer documentation.

And ideally an es-lint rule ensures all event handlers adhere to the chosen pattern.

Each pattern - when followed strictly - guarantees correct event cancellation behavior.

--

both approaches work

[Example app with correct stopPropagation](file:///C:/tinkerspace/react-grid-exploration/src/dom_event_cancellation/with-stopPropagation.html)

[Example app with correct preventDefault](file:///C:/tinkerspace/react-grid-exploration/src/dom_event_cancellation/with-preventDefault.html)

--

## voices from the web

--

> In an ideal world, applications are built out of smaller components that do very little on their own but are highly reusable and combinable. For this to work, the recipe is simple yet very difficult to execute: each component must know nothing about the outside world.
> Therefore if a component needs to use stopPropagation(), it can only be because it knows that something further up the chain will break or that it will put your application into an undesirable state.
> In this case you should be asking yourself whether that is not a symptom of a design issue.
> [stackoverflow](https://stackoverflow.com/questions/54815439/when-is-good-practice-to-use-stoppropagation)

--

Links:

event propagation visualized: https://domevents.dev/

"The Dangers of Stopping Event Propagation": https://css-tricks.com/dangers-stopping-event-propagation/

Inspecting the propagation path: https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath

<!-- https://www.reddit.com/r/javascript/comments/7108dg/comment/dn92ubm/ -->
