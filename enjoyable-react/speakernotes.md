# Enjoyable React - Why component API design matters

## Who am I? short introduction

I'm Martin Winkler

- Developer at Avenga Germany GmbH
- My main focus is JavaScript front-ends and the associated ecosystem; and everything React and React component patterns.

- My twitter handle is `@winkler_12`
- My github is [github.com/teetotum](https://github.com/teetotum)
- I publish blog articles on [dev.to/teetotum](https://dev.to/teetotum)

## What do I mean with component API?

All options your component offers to a developer using it form its API.

For most components those options are comprised of the `props` - and that's it
but there are more ways to interact with a component than just via the props
and those other options -if implemented- are also part of the API.

I suspect they are not as well known as the `props`.

## structure of the talk

The first part of the talk deals with the props
the second part deals with those mysterious other ways.
And if we go blazingly fast through part 1 and 2 there is a bonus part 3: Tales of the Unexpected

## Part 1: props

### flexibility: sizing, placement, alignment, margins, z-stacking, border, and padding

- Live coding example: [Button alignment](./src/examples/Alignment.js)
  we try to apply a different alignment to the hot-topic-button, we add an `alignmnet` prop to solve it

- Live coding example: [Stacking context](./src/examples/Stacking.js)
  we assume the date-picker was a third-party component. We can't add a prop to fix the z-stacking issue of the dropdown.
  we could either wrap it in a `<div>` with a `style` or use the hashed classname.
  both options are ugly.
  Conclusion: we can avoid such problems by always supporting a className prop in all our components

#### what I want to mention

- Support className!
- TypeScript users: use HTMLAttributes (see [ButtonTS](./src/components/ButtonTS.js) and [util/components.ts](./src/util/components.ts))
- Solves: sizing, placement, alignment, margins, z-stacking, border, and padding
- What it doesn't solve: custom theming
- Disclaimer: CSS-in-JS
- there is a smaller & faster drop-in replacement for the venerable classnames package: clsx

### DOM Attributes

- Live coding example: Button data-test-id
  we try to apply a `data-test-id` to one of the buttons and witness that it is not propagated into the DOM.
  same with a (made up) `aria-cta`
  Conclusion: spread data-_ and aria-_ attributes from your props onto your root element

#### what I want to mention

- Support data-\* attributes
- (and maybe also aria-\* attributes)
- use a rest property
- or filter the properties (see [src/util/propFilter.js](./src/util/propFilter.js))

### State changes and symmetry

- Live coding example: [Date validation](./src/examples/Validation.js)
  we see that the error state of the validation is only triggered but never goes away.
  Conclusion: a callback for state changes should leave no gaps

#### what I want to mention

If you offer a signal when a certain state has been entered also provide a signal when the state is left

Keep the symmetry: when you signal `DropdownClosed` also signal `DropdownOpened`

## Part 2: mysterious other

## Part 2.1: imperative handle

- Live coding example: Modal
  we look at a declarative implementation and change it from `useState` to `useRef`,
  and from `onClick={() => setIsOpen(true)}` to `onClick={() => modal.current.open()}`
  Conclusion: we do not need to always pull the state up into the parent

#### what I want to mention

We can choose to offer an imperative API for our component that can be accessed via a ref

- can be used in addition to the declarative API (`props`)
- must use `forwardRef`
- and `useImperativeHandle`

## Part 2.2: members

What do I mean with members?

A component is nothing magical or incomprehensible.
It is a plain old javascript function and as such it can have any number and any type of properties.

This opens up endless possibilities for new patterns.
Let's look at some that promise to be useful:

- A pool of allowed values for specific props

- Pre-configured variants of a base component

- Compound Components: Other sub-components that are supposed to be only used in conjunction with your main-component
  (keep in mind: the parent has access to the child's `props` and the child's `type` and can thus check which sub-components are present in the `props.children`)

- Attached Properties: specialized property setters to convey additional data directly attached on child elements
  ([A Concise Pattern for Container-and-Content Elements in React](https://dev.to/teetotum/a-concise-pattern-for-container-and-content-elements-in-react-e2i))

### pool

- Live coding example: DatePicker.supportedDateFormats

### Pre-configured

- Live coding example: Button.Primary and Button.Secondary

### Compound Components

- Live coding example: Tab and Tab.Item

### Attached Properties

- Live coding example: Grid

## Part 3: Tales of the Unexpected

Things you can do in React that are rather surprising and you wouldn't expect to work

### Bogus native elements

inspired by [The coolest, most underrated design pattern in React](https://www.the-guild.dev/blog/coolest-underrated-design-pattern-in-react) (Eytan Manor, 2019)

we can use bogus "native" elements to convey a complex configuration into a reactjs component. That's simultaneously ingenious and appalling!
I wouldn't use this pattern but it is always interesting to know what's possible.
Instead of this pattern you could use Compound Components and have the parent access the props of the child.

```jsx
<ModalFromTheFuture showCloseButton>
  <title>Modal title</title>
  <contents>Modal body text goes here.</contents>
  <dismissButton onClick={close}>Close</dismissButton>
  <actionButton onClick={save}>Save changes</actionButton>
</ModalFromTheFuture>
```

### render function treated as hook

see [React Dark Magic - Devour your Children](https://dev.to/teetotum/react-dark-magic-devour-your-children-4j90) (Martin Winkler, 2021)

The render function of a component can technically be considered to just be a custom hook that returns a jsx element tree.
We can call it like a hook and inspect or modify the result.

```jsx
import React from "react";
import { ThirdPartyComponent as useThirdPartyContent } from "third-party";

const Wrapper = () => {
  const thirdPartyContent = useThirdPartyContent();
  const nestedContent = thirdPartyContent.props.children;
  return <div className="wrapper">{nestedContent}</div>;
};

export { Wrapper };
```

## Ideas for future talks or blog articles

- what are the different possibilities to make a component fully themable / customizable?
- what are the different ways in which JS and CSS can share values (in both directions, during compile time and during runtime) and even to trigger something
- understanding your children: a deep dive into the possibilities of `props.children`: child.type - func vs string, child.props, React.isValidElement(), React.cloneElement()
- Jedi mind tricks: different ways I use to reason about my API design:
  the imaginary API: how would outside-click look if it was supported by the framework? how close to it can I come with my approach?
  design for replacability: how would my API look if I plan to swap my own half-assed module with an opensourced third-party package from google or god
- cleaning up my react code: move code into custom hooks, split large components with internal switch into many small componets
- flushSync explained
