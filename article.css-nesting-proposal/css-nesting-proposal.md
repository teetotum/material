# My thoughts on the css nesting proposal

On Dec 15, 2022 the committee for the css nesting spec [asked](https://webkit.org/blog/13607/help-choose-from-options-for-css-nesting-syntax/) the dev community which variant of proposed syntax they would prefer.

Options 1 and 2 are already out of the race, now options 3, 4, and 5 are up for voting.

I easily throw out option 5. I don't like the idea that I have to declare top-level whether my block contains nested rules or not.
It makes it rather incovenient to change anything later, to add nested rules when I need them I must completely re-write the outer block, and I even must move all the property setters to a separat `& { }` block in that case.
(Reminds me of the hassle it always was when I needed component state in react and had to re-write a function component into a class component.)
I don't see that we win anything from that syntax in exchange for the incovenience.

The remaining options are 3 and 4.

For me the question boils down to: "Do I want the `&` operator to be mandatory for all nested rules, or do I want to be allowed to omit it when possible?"

I fully understand the argument of those who prefer a mandatory `&` operator: "Keep the rules for writing css as simple as possible."
And I think this is a completely reasonable and valid argument. It derives the answer to our current question from a general principle (which I agree with).
I often find myself looking for an underlying principle or maxim that I can adhere to, when trying to make a good and lasting decision.

But I have to weigh it against another argument, also footed on principles I support.

"When designing anything: The existence of a rare use case is not allowed to make the regular case more complicated." Or in other words: The main path must be easy; the rarely used/needed path is allowed to be more complex; even if this means losing symmetry/consistency between the two cases.

Using element type selectors in css is a rare case. Typically those selectors are only used in your `baseline` css (other names are `reset` or `normalise`).

In most projects you can find something like this:

```scss
*,
::before,
::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  // ...
}

ul,
ol {
  // ...
}
```

But all other SCSS/CSS in the project will most likely not contain any element type selectors.
Components or any other unit of re-usable UI blocks generally use class names - which is therefore the regular use case. And they all start with a period.

```scss
.product-card {
  .name {
    // ...
  }

  .price {
    // ...
  }

  .shop-finder {
    // ..
  }
}
```

I think it is easier to work with the css code when I can omit the `&`. I can copy and paste rules from nested to unnested and vice versa without having to add or remove `&`s infront of any copied selector.
I can unnest a whole block by commenting out the first and the last line without changing anything in-between.

Therefore I decided to vote for an optional `&`.
