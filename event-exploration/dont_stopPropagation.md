# a clean approach to DOM event cancellation

tldr: don't `.stopPropagation()` - mark _handled_ instead with `.preventDefault()` - check `e.defaultPrevented` on the first line of any well behaved event handler

## motivation

If you have a chain of event handlers on different levels in the DOM acting on the same event type but you only want to execute one of them each time the event fires, you need some form of event cancellation.

A well known real world use-case is the `Esc` key to close an open dropdown, a popup, or a modal dialog.
If we want to close an open dropdown that is contained in an open dialog, we wouldn't expect both to close when we hit `Esc`.

The innermost handler would handle the key and cancel the event.

Many blog articles on the web or answers on stackoverflow will recommend `stopPropagation`.
But I advise against it; as it severely interferes with and breaks a mechanism other parts of the UI rely on: that all bubbling UI events will reach the root (and that -in general- parent elements can observe events originating in child elements).

## who owns the event?

Years ago I authored a small dropdown-menu component for an application maintained by a team of developers. The menu would close if any clicks outside its own visual tree would occur.
Some day the closing behavior got erratic. It turned out that another developer had handled mouse click events in one of his components and had cancelled each handled click with `stopPropagation`.
"Well, my component handled the event already; and therefore no other part of the code needs to know about it." was the reasoning behind it.
This assumption is flawed. The menu component has a valid interest to know of each and every click that occurred anywhere in the UI.
I even suspect that we can never with certainty claim that we absolutely understand how large the _valid audience_ for any event really is, now and in the future of our application. In consequence we should never stop the propagation of bubbling events.
We should rather treat them as shared resources, owned collectively.

## a solution

The DOM is not the only technology that has the concept of bubbling events.
WPF and Silverlight solved it by having a `handled` flag on all event arguments for bubbling events. Propagation cannot be stopped. An event can only be marked as `handled`, and by default event handlers further up the chain will only be invoked for unhandled events; any handler can opt-in to be also invoked for handled events.

Well, we have something quite similar in the DOM: we have the `defaultPrevented` flag. We now only have to ensure our event handlers are well behaved and check the flag before acting on the event.

## a testimonial

I used this approach in several projects and found that it helps in keeping DOM event handling involving cancellation simple and clear.
In scenarios with deep nesting, where event handling is distributed over many different components that need to play nicely together, adhering to the self-imposed rule of honoring `defaultPrevented` and calling `.preventDefault()` has proven effective to avoid bugs like those mentioned earlier (`Esc` key closing more than one element at a time).

## implementation

The approach _per se_ is completely framework agnostic.
When using this approach all event handlers would need to answer two questions:

1. What does it need to handle? Either _only unhandled events_ (which would always check `defaultPrevented` before acting) or _all events_ (which doesn't need to care)

2. After acting on the event, can the event be considered _dealt with_? If this is the case `.preventDefault()` needs to be called.

One example that only cares for unhandled events, and marks them _handled_:

```jsx
<div
  onKeyDown={(e) => {
    if (e.defaultPrevented) return;

    if (e.key === "Escape") {
      close();
      e.preventDefault();
    }
  }}
/>
```

And one that cares for all events, but doesn't change the state of the event:

```jsx
const handleRootClick = (e) => {
  if (!popupRef.contains(e.target)) closePopup();
};
document.addEventListener("click", handleRootClick);
```

## why not capture?

One might propose to use the `capture` phase in the scenario described earlier, where a menu component needs to listen for all click events on the root element.
Well, I used this as a workaround in the past, when misbehaving components are outside my control, e.g. because third-party libs are used.
But I don't consider it a solution to the general event cancellation conundrum. Event handlers in the `capturing` phase could `stopPropagation()` the same way they can interfere in the `bubbling` phase.
