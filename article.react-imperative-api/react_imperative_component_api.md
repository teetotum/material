# modal.open() - Imperative Component API in React

Well, here is the gist of this article:
Your custom React components can have an imperative API of your own choosing. And it's even quite simple to implement.
The feature is supported (for function components) by React since v16.8 ([The One With Hooks](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html)) but I have a hunch that knowledge about its existence is not widespread.
But let's start at the beginning.

## declarative vs imperative - props vs ref

React components usually accept a bunch of properties: the `props`.
Those props form the declarative API of the component; and for most use-cases this is perfectly sufficient.

But from time to time we encounter some component or other that can be switched on and off; or has some other kind of triggerable functionality that would fit more naturally in an imperative API.

If we don't know about imperative APIs we are forced to pull its state up into the parent, although we would rather like the component to encapsulate and control its own state.

```jsx
const [isModalOpen, setIsModalOpen] = useState(false);

<button onClick={() => setIsModalOpen(true)}>Open</button>
<Modal isOpen={isModalOpen} />
```

It seems like every `<Modal />` component I have ever seen is built that way.

Let's look for an alternative.

When using an imperative API we would obtain a reference to the component instance, and call any exposed API function on that instance.

```jsx
const modal = useRef();

<button onClick={() => modal.current.open()}>Open</button>
<Modal ref={modal} />
```

But to make this actually work requires the implementation of `<Modal />` to explicitly allow this scenario.
Ever wondered what `forwardRef` and `useImperativeHandle` are good for?

## forwardRef and useImperativeHandle

You cannot just set `ref` on a component like you would on a simple `<div>`. React removes it from the props (same goes for `key` btw), and the implementation of the component would not be able to retrieve it via `props.ref`.
A component can be wrapped with `forwardRef` to allow the `ref` to be tunnelled through; the `ref` would then be available to the implementation as a second argument to the render function (first and usually the only argument to the render function is `props`). So it is a deliberate choice by the component author to allow the usage of `ref`.

```jsx
const Modal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  return isOpen && <div className="modal">{props.children}</div>;
});
```

We can now attach an object to `ref.current` that exposes a curated selection of functions to `open`, `close`, or `toggle` our modal. But we really don't want to create and attach that object every time the modal is rendered. If possible this should only be created once during the lifetime of our modal. And that is exactly what the little known hook `useImperativeHandle` does.

```jsx
const Modal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((_) => !_),
    }),
    []
  );
  return isOpen && <div className="modal">{props.children}</div>;
});
```

That's all we have to do to create and support an imperative API for our component.
We now offer functions for opening and closing the modal, but we can still accept declarative props for things like `headerContent`, `bodyContent`, `footerContent`, and so forth (honestly I would utilize the `children` for anything considered content, but that's not today's topic).

But could we also allow both?

## controlled and uncontrolled

An `<input>` element can be use as both; as a controlled element and as an uncontrolled element; depending on whether the `value` state is managed by the parent or by the child.

Could we implement the modal to allow both usages? We could check whether an `isOpen` state was provided by the parent and treat this as the controlled scenario, and as the uncontrolled scenario otherwise. In the controlled scenario the external state is used to decide how to render; in the uncontrolled scenario the internal state is used.

```jsx
const Modal = forwardRef((props, ref) => {
  const isUncontrolled = props.isOpen === undefined;
  const [isOpen, setIsOpen] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((_) => !_),
    }),
    []
  );
  const showModal =
    (isUncontrolled && isOpen) || (!isUncontrolled && props.isOpen);
  return showModal && <div className="modal">{props.children}</div>;
});
```

## sharing state with the parent

I'm not talking about lifting the state into the parent. I'm talking about managing the state inside the component but allowing the parent read-access. And most importantly: allowing read-access with the added benefit of controlling re-renders when the state changes.

We can decide to publish our internal state together with the API functions as a plain old property on the API object.
The `useImperativeHandle` hook supports a dependency array that allows us to re-create the API object when relevant portions of our internal state change.

```jsx
const Modal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((_) => !_),
      isOpen,
    }),
    [isOpen]
  );
  return isOpen && <div className="modal">{props.children}</div>;
});
```

If the parent of our component utilizes the `useRef` hook, any changes to `ref.current` will not trigger a re-render and the parent might see a stale `isOpen` state.

```jsx
const modal = useRef();

// this info will be stale
{`The modal is ${modal.current?.isOpen ? 'open' : 'closed'}`}
<button onClick={() => modal.current.open()}>Open</button>
<Modal ref={modal} />
```

But the `useImperativeHandle` hook also supports callback-refs (just a function that is assigned to the ref property; the callback is called when the ref changes, and we can store the reference, for example in a useState). The setter function of a `useState` is perfectly fine to be used with a callback-ref, triggering a state change and therefore a re-render whenever the referenced object changes.

```jsx
const [modal, setModal] = useState(null);

// this info will never be stale
{`The modal is ${modal?.isOpen ? 'open' : 'closed'}`}
<button onClick={() => modal.open()}>Open</button>
<Modal ref={setModal} />
```

Notice that when we use a `useState` instead of a `useRef` the access slightly changes: `modal.open()` instead of `modal.current.open()` and `<Modal ref={setModal} />` instead of `<Modal ref={modal} />`.

## Modals, Dropdowns, Accordions, and the World

What types of components would benefit from an imperative API? From the top of my head I would say any component that needs to be able to be toggled between open and closed states; like Modals, Dropdowns, and Accordions.

But also anything with a very complex state (where lifting up the state into the parent is a veritable nightmare).
Imagine a nice re-usable and integratable `<Worldmap />` component, designed to be extendable with custom functionality, and only your imagination is the limit to what you can do. Say it supports an `onClick` with some useful event args like `{ longitude, latitude }` corresponding to your click. Would you want to implement _setting a pin_ where you clicked? Or a context menu that allows you all sorts of things for the clicked location: _finding the nearest airport_, _calculating a route_, or _zooming in_? For extendability and customizability an imperative API would be a boon.

```jsx
<Worldmap
  ref={map}
  onClick={(position /*{ longitude, latitude }*/) =>
    showMenu([
      {
        text: "Set pin",
        action: () => map.current.addMarker(position),
      },
      {
        text: "Find airport",
        action: () => geoService.findAirport(position),
      },
      {
        text: "Show route",
        action: () => geoService.findRoute(position),
      },
      {
        text: "Zoom in",
        action: () => map.current.zoom({ position, zoom: 2.5 }),
      },
    ])
  }
/>
```

I really hope this feature would get more attention. I believe we would see components with better dev experience as a result.
