# What HTML5 can learn from Silverlight

# Don't event.stopPropagation() - instead mark as handled : on event cancellation

# how to handle DOM events while staying sane

# don't stopPropagation()

judging by the questions (and answers) on SO, and judging by the code I see in projects, it seems a mayor cause for headache for many javascript Developers
how to deal with a hierachy of event handlers that subscibed to the same bubbling event on different level in the DOM tree.

# event delegation gone wrong

# a better approach to event delegation

event delegation can be quite painless
https://www.bitovi.com/blog/a-crash-course-in-how-dom-events-work

only wrong answers:
https://stackoverflow.com/questions/1369035/how-do-i-prevent-a-parents-onclick-event-from-firing-when-a-child-anchor-is-cli

https://www.w3.org/TR/DOM-Level-3-Events/#event-flow
https://stackoverflow.com/questions/1687296/what-is-dom-event-delegation

https://docs.microsoft.com/en-us/dotnet/desktop/wpf/advanced/routed-events-overview?view=netframeworkdesktop-4.8
https://www.sitepoint.com/emerging-patterns-javascript-event-handling/
https://stackoverflow.com/a/46986105/1280867

- youtube about navigation, bubbling event discussion in comments:
  https://www.youtube.com/watch?v=cgKUMRPAliw

While I understand that the new navigation event is much better, at 7:08, you should be adding a single click event listener on the window and filter for link clicks, instead of looping through every single link and adding listeners separately. Event delegation is your friend!

2

Jake Archibald
Jake Archibald
1 month ago
Totally agree. This doesn't always work in practice, which is why frameworks like Next give you a link component, just so they can add the events.

8

Leander Berg
Leander Berg
1 month ago
@Jake Archibald just out of curiosity, when would it not work? Is it because having an img or so inside a link would make the image be the e.target or what's going on?

Jake Archibald
Jake Archibald
1 month ago
@Leander Berg it's mostly cases where other event listeners jump in do things like stopping propagation of the event

2

Jake Archibald
Jake Archibald
1 month ago
@Theodoros Antoniou unless someone else also adds a capturing event 😀. The point is, a navigation event like this avoids those issues, and also captures navigations that aren't the result of clicking a link.

1

Hr Gwea
Hr Gwea
1 month ago
@Jake Archibald The first capturing event listener added to the window object cannot be prevented by any other listener. Such a listener will always see all events no matter what.
I call this the "prime listener" and I use it when I need guaranteed access to an event regardless of what any other listener is doing.

- this article gives bad advice regarding event.stopPropagation()
  https://www.freecodecamp.org/news/event-propagation-event-bubbling-event-catching-beginners-guide/

- this is the tweet by Kyle Shevlin that links to the article
  https://twitter.com/kyleshevlin/status/1496154646263390209

  the event.handled flag from WPF corresponds to event.defaultPrevented in HTML5

# HTML5 event handling is broken - here is how to fix it

# proper event handling in HTML5

# prepare to have your mind blown

# why HTML5 event handling is broken

# flawed

stickpunkte:

- show example of dropdown-in-dropdown and (botched) ESC key handling
- those who only know one technology are forced to accept the particular flavor as the real thing
- JS-only devs have a skewed understanding of Events
- Events: an implementation of GOF design pattern, baked into a language feature
- pub/sub
- man kann von anderen UI technologien ein paar gute ideen für HTML5 UIs übernehmen
- event.isHandled and event.markAsHandled
- event.stopPropagatinon() vs preventDefault

```jsx
const isHandled = (e: Event) => e.defaultPrevented;
const isEscape = (e: KeyboardEvent) => e.key === 'Escape';
const isSpace = (e: KeyboardEvent) => e.key === ' ';
const markHandled = (e: Event) => e.preventDefault();

<div
      tabIndex={0}
      className={classnames(style.dropdownList, className)}
      ref={ref}
      onKeyDown={(e: any) => {
        if (!isHandled(e) && isEscape(e)) {
          setIsOpen(false);
          markHandled(e);
        }
        if (!isHandled(e) && isSpace(e)) {
          setIsOpen((_) => !_);
          markHandled(e);
        }
      }}
    >
```

# Hierarchy of concerns - the secret sauce behind good component design

# Hierarchy of concerns - the secret behind good component design

# when is a hook good designed?

# The art of component design

# security theater - quality theater

zum thema CSS-js interop:
https://github.com/css-modules/css-modules/issues/86
https://stackoverflow.com/questions/66119188/how-to-get-scss-variables-into-react
https://mattferderer.com/use-sass-variables-in-typescript-and-javascript
https://stackoverflow.com/questions/57315250/problem-in-accessing-the-scss-variables-in-react-components
https://til.hashrocket.com/posts/sxbrscjuqu-share-scss-variables-with-javascript
