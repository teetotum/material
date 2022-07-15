# React Dark Magic - Devour your Children

For most use cases we can write simple idiomatic React code to get the job done. And I assume we all agree that that's the preferred way to write our applications. Sometimes we need to evaluate several approaches before we can settle for the one we deem most fitting. Words like *clean*, *clear*, or *elegant* come to mind.

But what can we do when we exhausted all of the idiomatic approaches without finding a solution? When we are at our wits' end? When we relentlessly racked our brains - Alas! in vain.

Well, then we have to consider the unorthodox solutions, even if our first reaction was repulsion. If you are open minded enough accompany me and let us explore some React dark magic in the following paragraphs.

## Real-life use cases

### When the Parent needs to know if a Child rendered null

Recently user *markdalgleish* posted an interesting question on [Twitter](https://twitter.com/markdalgleish/status/1471007400647790595):

{% twitter 1471007400647790595 %}

> Given the following JSX:
> ```jsx
> <Parent>
>  <Child />
> </Parent>
> ```
> Is there any way for Parent to know if Child rendered null? AFAIK it's not possible, but I'm hoping I'm wrong.

And he's right; with regular idiomatic React the parent can't know or respond to the render output of the child. And the [reply](https://twitter.com/dan_abramov/status/1471152891184525315) from *dan_abramov* and subsequent posts shed some light on why this is not possible. In short: re-rendering of a child should not necessitate re-rendering of the parent.
Why do we need to know whether the child rendered null in the first place? Mark explains:

> I'm wrapping each child in a View that applies spacing between siblings.

...and the spacing needs to be zero when the child produced no visible content.

The situation is peculiar: it is React Native, therefore it can't be solved with CSS wizardry (at least that's what I gather from the replies in the Twitter thread, I have no react-native experience myself). So no `flexbox` or `grid` with a neat [`gap`](https://developer.mozilla.org/en-US/docs/Web/CSS/gap), no `margin-top: 10px` that gets zeroed on the `:first-child`, and no use of `:empty` on the wrapper to erase the margins, as [pseudo-classes are not supported by react-native StyleSheets](https://www.reactnative.guide/8-styling/8.0-intro.html):

> [...] you do not have access to pseudo-classes like :hover, :active, etc.

#### An unorthodox solution

Well, to be blunt, we can just explicitly call the child's render function and inspect the result. And here is an important thing about this outrageous proposal: we can even do so without breaking any written or unwritten contract with the framework. Yes, we can actually write correct code, quite unusual admittedly, but correct.

I will be perfectly honest with you: I only considered function-based components here; class-based components are completely obsolete since [React v16.8](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html), which was released nearly three years ago while I'm writing this. So I think any consideration for class-based components would be a waste of time.

So why do I propose explicitly calling a child's render function from within the parent's render function doesn't break the framework?
Because technically we can consider any valid function-based component also a valid custom hook. That's why!

#### Components are hooks, Strawberries are nuts

What is a custom hook?
- any plain synchronous JavaScript function
- that may have any number of arguments
- that may internally call hooks (a hook is only really a hook if it uses other hooks, but that's not relevant here)
- that may return anything, even jsx elements to be used by the caller

What is a function-based component?
- any plain synchronous JavaScript function
- that accepts a props argument
- that may internally call hooks
- that returns either bool, null, undefined, empty array, single jsx element, or array of jsx elements

So a component is really just a special case of a custom hook. Namely one that returns jsx.
Ergo we can just treat the component as a hook, as long as we adhere to the [rules of hooks](https://reactjs.org/docs/hooks-rules.html) when doing so.
Doing so will fuse the child's content with the parent, and from the perspective of the React framework the child ceases to be recognized as a separate level in the logical component tree. The component boundary between parent and child will be lost.
Which in a way solved the issue *dan_abramov* mentioned: that re-rendering of a child should not necessitate re-rendering of the parent. They are fused together.

Adhering to the rules of hooks forces us to do things a certain way:
- We need to call the render function unconditionally.
- And what would it mean if the child type changes during the life time of our parent? It would mean that we potetially violate the rules of hooks: we cannot know which hooks are called internally, or what number of hooks was called, it is a blackbox. Well, it means the life time of our parent is coupled to the child type: when the child type changes the parent type must be re-defined.

Ok, let's do it!
If we now try to write a wrapper that accepts any arbitrary single child, checks if any content is rendered, and itself returns null if no child content is produced, we could do it thus:

```jsx
// <VanishingWrapper> renders null
// if child component renders no elements.
// usage example:
<VanishingWrapper style={{ margin: '10px' }}>
  <SomeChild foo={bar}>
    <NestedContent />
  </SomeChild>
</VanishingWrapper>
```

```jsx
import React, { useMemo } from 'react';

const VanishingWrapper = ({ style, children }) => {
    let child = {};
    try {
        child = React.Children.only(children);
    } catch (exception) {
        console.warn(
            'VanishingWrapper accepts only one child element'
        );
    }
    const DynamicComponent = useMemo(
        () => createDynamicComponent(child.type),
        [child.type]
    );
    return (
        <DynamicComponent style={style} childProps={child.props} />
    );
};

const createDynamicComponent = (type) => {
    if (typeof type === 'function')
    {
        const useChildContent = type; // treat as a hook
        const DynamicComponent = ({ childProps, ...props }) => {
            const content = useChildContent(childProps);
            return isVisibleContent(content) ? (
                <div {...props}>{content}</div>
            ) : null;
        };
        return DynamicComponent;
    }
    else if (typeof type === 'string')
    {
        const SimpleComponent = ({ childProps, ...props }) => {
            const content = React.createElement(type, childProps);
            return <div {...props}>{content}</div>;
        };
        return SimpleComponent;
    }
    else return () => null;
};

const isVisibleContent = (content) => {
    // content ignored by react and therefore not visible:
    // bool, null, undefined, or empty array
    return !(
        typeof content === 'boolean' ||
        content === null ||
        content === undefined ||
        (Array.isArray(content) && content.length === 0 )
    );
};

export { VanishingWrapper };

```

I tried it out and it worked as expected. In the end it didn't feel that outlandish anymore.
What do you think?

But we can have a quick look at another use case in the next paragraph.


### Replace the top-level node of a third-party component

User *evolon* posted his conundrum on [Stackoverflow](https://stackoverflow.com/questions/66965548/how-to-manipulate-childs-render-output) some time ago. (And it was this question and the answer to it that made me first aware of the existence of this rather unorthodox approach.)
Imagine you need to wrap a third-party component and the resulting DOM structure now has a redundant, undesired node. Assume there are valid and pressing reasons to get rid of this node.

```jsx
<div className="wrapper">
  <ThirdPartyComponent />
</div>
```

yields

```jsx
<div class="wrapper">
  <div>
    <span>...</span>
  </div>
</div>
```

but we need

```jsx
<div class="wrapper">
  <span>...</span>
</div>
```

How do you replace the top-level node when the component stems from a third-party package and thus you cannot just change the implementation? How do you achieve the desired DOM structure?

As in the first use case we can safely treat our third-party component as a custom hook. The same reasoning applies. It is even easier because the type of the child is not dynamic.
We therefore just call the render function as if it was a custom hook, get the nested content and inject it into our own top-level wrapper:

```jsx
import React from 'react';
import {
    ThirdPartyComponent as useThirdPartyContent
} from 'third-party';

const Wrapper = () => {
    const thirdPartyContent = useThirdPartyContent();
    const nestedContent = thirdPartyContent.props.children;
    return (<div className="wrapper">{nestedContent}</div>);
};

export { Wrapper };
```

This solution follows the [answer](https://stackoverflow.com/questions/66965548/how-to-manipulate-childs-render-output#66965670) user *AKX* gave on Stackoverflow. Please be aware of his words of caution if you decide to use this approach. If the implementation of the third-party component changes in the future your wrapper might break.

## Conclusion or TLDR

A child's render function can be called directly and its result can be tampered with to achieve a desired outcome, when all other -- more orthodox / more idiomatic-react -- approaches are impracticable (and exhausted).
Technically a render function can be treated as a custom hook that returns jsx. Rules of hooks apply.
Doing so will fuse the child's content with the parent, and from the perspective of the React framework the child ceases to be recognized as a separate level in the logical component tree.
This approach is technically correct, it is unusual and unexpected though; therefore at least violates the "principle of least surprise". This is probably one of those cases where the code should be accompanied by comments explaining the peculiarities (and a link to this blog article might greatly help the future maintenance developer).

## Just a silly rhyme

probably by Shakespeare

> the scholar and the fool both jeer
> at any boldly new idea
> not written in your wisest books
> yet true that components are hooks
> the scholar laughs and clueless struts
> pretensions rich, not knowing much
> not least that strawberries are nuts
