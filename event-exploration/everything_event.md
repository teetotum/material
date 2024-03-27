- three different ways to register: inline event handlers, onevent property assignment, event listener methods
- multicast or singlecast?
- returning false? does nothing
- removeEventListener remove-by-pattern doesn't work
- event Phase
- trusted / untrusted events / snthetic
- event delegation
- e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation()
- event cancellation
- valid event audience
- only UI tree, or general Pub/Sub / event bus? https://www.youtube.com/watch?v=fusAJwee7ws

https://stackoverflow.com/questions/18971284/event-preventdefault-vs-return-false-no-jquery

https://stackoverflow.com/questions/5302903/jquery-event-stopimmediatepropagation-vs-return-false/5302939#5302939

https://stackoverflow.com/questions/1357118/event-preventdefault-vs-return-false

https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#inline_event_handlers_%E2%80%94_dont_use_these

https://www.smashingmagazine.com/2013/11/an-introduction-to-dom-events/

https://www.w3.org/TR/DOM-Level-3-Events/#dom-event-architecture

Clicking a Label Element Triggers Click Event on its Associated Form Control
https://codepen.io/impressivewebs/pen/omYVwa?editors=1011

What relationship for key down + up + pressed?
What relationship for mouse down + up => clicked?
What when down and up happen on different elements?
What is the order for elem.onclick and elem.addeventListener?
Can onclick="handle()" access eventArgs?

What happens to a chain of handlers if one throws an exception?

event playground

# intro - who am I

# general event handling

# brilliant life-hack for event handling while stying sane

# bizzare quirks and special cases

Quirks:
Esc key pressed doesnt exist?

label triggers onClick for input. does it bubble?
