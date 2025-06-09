# What's wrong with useId()? (React and Preact)

TLDR: `useId` will produce duplicated IDs when you have more than one app root. Read on and find out what can be done about it.

## Introduction

Let's start at the beginning: why do we even have a `useId` hook? You can [skip the introduction](#a-discovery-of-trouble) if you are familiar with the hook itself and the reason for its existence.

### DOM IDs in Components

When we need to associate a DOM element with another one, like in the following snippet the `<label>` and the `<input>`, we usually need to set an HTML `id` attribute.

```jsx
<span>Do you want to receive exciting news about all our other products and services?</span>
<input type="checkbox" id="spam-galore" />
<label htmlFor="spam-galore">Yes, please send more spam my way</label>
```

Nesting the `<input>` inside the `<label>` is an alternative way to associate the two elements without using an ID, but this is not always feasible; and there are other element types where nesting is not possible, which is the case in the following snippet with `<input>` and associated `<datalist>`.

```jsx
<input list="preferred-conference-swag" />
<datalist id="preferred-conference-swag">
  <option value="Hoodie"></option>
  <option value="Ballpoint Pen"></option>
  <option value="Fidget Toy"></option>
  <option value="Stickers"></option>
</datalist>
```

A hard-coded ID only works correctly if there is never more than one instance of the component in the DOM.
So for all other cases we need to solve this by generating a dynamic ID; ideally one that stays the same as long as the component instance exists (i.e. as long as it is mounted).
This can be done a hundred different ways and isn't exactly rocket science (see section [Roll your own](#roll-your-own) for inspiration).
So every project sooner or later had its own custom hook implementation to provide dynamic and lifetime-stable IDs.

With release 18.0.0 (March 29, 2022) React introduced the [`useId`](https://react.dev/reference/react/useId) hook.

> `useId` is a new hook for generating unique IDs on both the client and server, while avoiding hydration mismatches.
> (from the [release notes](https://github.com/facebook/react/releases/tag/v18.0.0))

This would make all those custom hooks obsolete and a thing of the past. Or so I thought.

## A Discovery of Trouble

I was using the new hook from time to time without noticing any issues for a while. But a few days ago I ran into a strange bug: a label associated with a checkbox would not correctly toggle the checkbox when clicked. Following a suspicion I quickly verified that the association was working fine on the very first input-and-label pair in my DOM, and discovered that all later pairs used the very same ID; so all the other labels were all associated with the very first checkbox.

My application is not the classical SPA; it's a collection of [_smart components_](https://bradfrost.com/blog/post/the-design-system-ecosystem/#:~:text=Smart%20component%20layer) that can be placed in a regular HTML web page; and each placed component constitutes its own app root. (Aside: A while ago I read somewhere that this is nowadays called _islands_.)
And the same component might be placed multiple times into the same page.

As it turns out, the `useId` hook will produce duplicated IDs when used in a multi root scenario.
And this is an issue for both implementations: React and Preact.
If you are interested to see the bug demonstrated: I created a small [reproduction scenario](https://preactjs.com/repl/?code=aW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAncHJlYWN0JzsKaW1wb3J0IHsgdXNlSWQgfSBmcm9tICdwcmVhY3QvaG9va3MnOwoKY29uc3QgZmlyc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJyk7CmNvbnN0IHNlY29uZCA9IGZpcnN0LmNsb25lTm9kZSgpOwpmaXJzdC5wYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHNlY29uZCk7CgoKZnVuY3Rpb24gQnJva2VuVXNlSWRFeGFtcGxlKCkgewoJY29uc3QgY2hlY2tib3ggPSB1c2VJZCgpOwoKCXJldHVybiAoCgkJPGRpdiBjbGFzcz0iY29udGFpbmVyIj4KCQkJPGlucHV0IGlkPXtjaGVja2JveH0gdHlwZT0iY2hlY2tib3giIC8%2BCgkJCTxsYWJlbCBodG1sRm9yPXtjaGVja2JveH0%2BY2xpY2sgbWUgdG8gdG9nZ2xlIGNoZWNrYm94PC9sYWJlbD4KCQk8L2Rpdj4KCSk7Cn0KCi8vIGhlcmUgaXQgd29ya3MgYSBleHBlY3RlZDogdHdvIGRpZmZlcmVudCBJRHMgYXJlIGNyZWF0ZWQKcmVuZGVyKAo8ZGl2PgogICAgPEJyb2tlblVzZUlkRXhhbXBsZSAvPgogICAgPEJyb2tlblVzZUlkRXhhbXBsZSAvPgo8L2Rpdj4sIGZpcnN0KTsKCi8vIHRoaXMgaXMgYnJva2VuIGJlY2F1c2UgdGhlIGZpcnN0IElEIGlzIHVzZWQgYWdhaW4KcmVuZGVyKDxCcm9rZW5Vc2VJZEV4YW1wbGUgLz4sIHNlY29uZCk7Cg%3D%3D).

## An Attempt at an Explanation

As far as I understand, the requirement to produce the same ID for any given component instance in the virtual DOM when rendered _client-side_ or when rendered _server-side_ bars the `useId` implementation from using any randomness; only the component position in the virtual DOM and/or the calling order (so anything that is stable w.r.t. _client-side_ vs _server-side_ rendering) can be used to generate an ID that is stable but also unique within the same app.

## An Attempt at a Solution

Both the React team and the Preact team are aware of the issue.

### React

React provides a way to resolve the problem manually by [specifying a shared prefix for all generated IDs](https://react.dev/reference/react/useId#specifying-a-shared-prefix-for-all-generated-ids).

> If you render multiple independent React applications on a single page, pass `identifierPrefix` as an option to your `createRoot` or `hydrateRoot` calls. This ensures that the IDs generated by the two different apps never clash because every identifier generated with `useId` will start with the distinct prefix you’ve specified.

```jsx
const root1 = createRoot(document.getElementById("root1"), {
  identifierPrefix: "my-first-app-",
});
root1.render(<App />);

const root2 = createRoot(document.getElementById("root2"), {
  identifierPrefix: "my-second-app-",
});
root2.render(<App />);
```

It is certainly not ideal that the issue has to be resolved manually, but I'm sure given the requirement mentioned earlier that there really isn't any other way without ditching _stable_ between _client-rendered_ and _server-rendered_.

### Preact

The Preact team is aware of the [issue](https://github.com/preactjs/preact/issues/3781), but has not yet mirrored the `identifierPrefix` feature.

Luckily for me the _server-side rendering_ aspect is irrelevant as my components are only ever rendered _client-side_.
So my solution to the problem currently is to just use a custom hook instead of `useId`, to generate dynamic and lifetime-stable IDs and using randomness to my heart's content; see section [Custom Hook with Randomness](#custom-hook-with-randomness) for implementation details.

But what if you are not so lucky? When your setup uses Preact with _client-side_ and _server-sider_ rendering?
In this case I would recommend to emulate the `identifierPrefix` feature until it is provided by Preact out of the box; see section [identifierPrefix in Preact](#identifierprefix-in-preact) for implementation details.

## Roll your own

This section provides code examples for both approaches:

- a custom hook with randomness (client-side-only approach)
- identifierPrefix in Preact (client-side and server-side)

### Custom Hook with Randomness

One implementation of my homebrewn `useStableID` could look like this:

```jsx
import { getRandomID } from "any-random-ID-thing-would-work-here";

const ids = new Map();
export const useStableID = () => {
  const ref = useRef({});
  if (!ids.has(ref.current)) {
    const existingIDs = [...ids.values()];
    let newID;
    do {
      newID = getRandomID();
    } while (existingIDs.includes(newID));
    ids.set(ref.current, newID);
  }
  return ids.get(ref.current);
};
```

You could even use `Math.random()` here because every new ID is checked against the existing IDs to prevent clashes.

```jsx
export const getRandomID = () => `id-${Math.random()}`;
```

Another, shorter implementation using GUIDs could look like this:

```jsx
import { v4 as uuidv4 } from "uuid";

export const useStableID = () => {
  const [id] = useState(() => uuidv4());
  return id;
};
```

Here checking each newly generated ID against the existing IDs can be omitted because GUIDs / UUIDs are unique with sufficient probability (that's really the whole point of them).

### identifierPrefix in Preact

Disclaimer: I haven't tried this out yet; but to the best of my knowledge this should work just as expected.

You can emulate the identifierPrefix feature by wrapping your root in a context provider, passing down a prefix to your patched `useId` hook.

The context:

```jsx
import { createContext } from "preact";

export const IdentifierPrefix = createContext(null);
```

Providing a prefix:

```jsx
import { IdentifierPrefix } from "./identifierPrefixContext";

const root1 = document.getElementById("root1");
render(
  <IdentifierPrefix.Provider value="my-first-app-">
    <App />
  </IdentifierPrefix.Provider>,
  root1
);

const root2 = document.getElementById("root2");
render(
  <IdentifierPrefix.Provider value="my-second-app-">
    <App />
  </IdentifierPrefix.Provider>,
  root2
);
```

The patched `useId` hook:

```jsx
import { useContext } from "preact/hooks";
import { IdentifierPrefix } from "./identifierPrefixContext";

export const usePatchedUseId = () => {
  const identifierPrefix = useContext(IdentifierPrefix);
  const id = useId();
  return `${identifierPrefix}${id}`;
};
```

Using `usePatchedUseId` everywhere instead of `useId` should now solve your problem.
You'll need to provide the same prefix values on the client and on the server.

## Future Updates and Further Reading

I will try to keep this article updated when further information comes to my notice or when there is some progress on the Preact issue.

My initial research also turned up the following links:

- mirroring react's `useId` hook in preact was discussed [here](https://github.com/preactjs/preact/issues/3373)
- the initial preact implementation of the `useId` hook had some issues, which were reported [here](https://github.com/preactjs/preact/issues/3772)
