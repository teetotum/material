# Beware: Invalid Selectors with SCSS

It is very easy to inadvertently create invalid selector lists when using SCSS; causing the whole rule block to be ignored during runtime.
I found this out the hard way yesterday.
Let's have a look at what I did and what I learned from it.

## Act I - Causing the Problem

I set out to improve our project's _CSS reset rules_ and noticed that after the change some styles did not get applied anymore.
What had happened?
Our existing _CSS reset rules_ are scoped to be only applied to the part of the DOM our app is responsible for, the app root is classed with `.scoped-reset` (hashed during build) so the reset affects only this very element and everything beneath it.
In order to not need to duplicate the reset value assignments they are placed in a _mixin_ (I'm aware that this could be rewritten to remove the need for a mixin, but the code is as it is at the moment).
And some time ago someone added lines to visually hide scrollbars if not explicitly opted-in via special _data attribute_.
This all worked and was probably not touched for a year or even longer.
So before my change it looked like this:

```scss
@mixin reset() {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: none;

  &:not([data-scrollbars="true"]) {
    /* hide scrollbars */
    -ms-overflow-style: none; /* IE, old Edge */
    scrollbar-width: none; /* Firefox */

    /* Chrome, Safari, Opera, Edge */
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.scoped-reset {
  @include reset();

  * {
    @include reset();
  }
}
```

I noticed that `::before` and `::after` elements had been omitted (the [universal selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Universal_selectors) `*` does not select them) and would therefore still have the default `box-sizing` behavior. A minor issue, but I felt the urge to set things right and added them.

```scss
.scoped-reset {
  @include reset();

  *,
  ::before,
  ::after {
    @include reset();
  }
}
```

Imagine my surprise when after this innocuous addition some elements in the app started to show visible scrollbars.
And right enough during runtime the scrollbar-hiding rule block was not applied anymore.

## Act II - Understanding the Problem

Looking at the resulting CSS reveals some selectors that are nonsensical because they could never match anything, but the real trouble with them is that they are invalid; and because they are used in a [selector list](https://developer.mozilla.org/en-US/docs/Web/CSS/Selector_list) the whole rule block is [ignored](https://developer.mozilla.org/en-US/docs/Web/CSS/Selector_list#valid_and_invalid_selector_lists).

```css
.scoped-reset *:not([data-scrollbars="true"]),
.scoped-reset ::before:not([data-scrollbars="true"]),
.scoped-reset ::after:not([data-scrollbars="true"]) {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scoped-reset *:not([data-scrollbars="true"])::-webkit-scrollbar,
.scoped-reset ::before:not([data-scrollbars="true"])::-webkit-scrollbar,
.scoped-reset ::after:not([data-scrollbars="true"])::-webkit-scrollbar {
  display: none;
}
```

What is invalid here are all those selectors that chain additional parts onto pseudo-elements, like `::before:not([data-scrollbars="true"])` or `::before::-webkit-scrollbar` or even `::before.foo`. A bit of googling revealed that others had discovered this also: [stackoverflow](https://stackoverflow.com/questions/27664840/pseudo-class-on-pseudo-element), [some blog](https://blog.shimin.io/pseudo-class-and-pseudo-element-selectors/)

> An invalid selector represents, and therefore matches, nothing. When a selector list contains an invalid selector, the entire style block is ignored, except for the [:is()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is) and [:where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) pseudo-classes that accept [forgiving selector lists](https://developer.mozilla.org/en-US/docs/Web/CSS/Selector_list#forgiving_selector_list).
> [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Selector_list#valid_and_invalid_selector_lists)

When writing CSS by hand there is little danger of chaining any selectors onto pseudo-elements; but using SCSS with mixins can easily produce such selectors without us being aware.

## Act III - Resolving the Problem

I can see two different approaches to solve this.
The first approach is to wrap the problematic selector parts into a forgiving selector.
The second approach is to refactor the code so that invalid complex selectors do not result.
Let's try both.

### Using a Forgiving Selector

Astonishingly it is valid to chain a forgiving selector part onto a pseudo-element, like so: `::before:where(:nonsens)`.
We could guard the _mixin_ therefore such:

```scss
@mixin reset() {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: none;

  &:where(:not([data-scrollbars="true"])) {
    /* Hide scrollbars */
    -ms-overflow-style: none; /* IE, old Edge */
    scrollbar-width: none; /* Firefox */

    /* Chrome, Safari, Opera, Edge */
    &:where(::-webkit-scrollbar) {
      display: none;
    }
  }
}

.scoped-reset {
  @include reset();

  *,
  ::before,
  ::after {
    @include reset();
  }
}
```

The resulting CSS might be ugly but the selector lists are no longer invalid:

<!-- prettier-ignore -->
```css
.scoped-reset *:where(:not([data-scrollbars="true"])),
.scoped-reset ::before:where(:not([data-scrollbars="true"])),
.scoped-reset ::after:where(:not([data-scrollbars="true"])) {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scoped-reset *:where(:not([data-scrollbars="true"])):where(::-webkit-scrollbar),
.scoped-reset ::before:where(:not([data-scrollbars="true"])):where(::-webkit-scrollbar),
.scoped-reset ::after:where(:not([data-scrollbars="true"])):where(::-webkit-scrollbar) {
  display: none;
}
```

It is nice to know that this escape hatch works, but I would probably prefer the second approach: refactor the code to not produce invalid selectors.

### Refactoring the Code

It could be refactored in several differenty ways; one way that seems sensible to me is to split out the scrollbar-hiding rules into a separate _mixin_:

```scss
@mixin reset() {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: none;
}

@mixin hide-scrollbars() {
  &:not([data-scrollbars="true"]) {
    -ms-overflow-style: none; /* IE, old Edge */
    scrollbar-width: none; /* Firefox */

    /* Chrome, Safari, Opera, Edge */
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.scoped-reset {
  @include reset();
  @include hide-scrollbars();

  * {
    @include hide-scrollbars();
  }

  *,
  ::before,
  ::after {
    @include reset();
  }
}
```

This feels right to me.

## End

I learned a great deal through the bug I caused. And I will certainly be more cautious with my mixins in the future. It is good to know that `:is()` and `:where()` can be used as secret weapons in case I run into a similar problem without an obvious path to resolve the issue through refactoring.
