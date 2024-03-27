# using imaginary CSS today - a take on modern css polyfilling

- what are polyfills?
- how do they work?

- what do we polyfill: value, property, selector
- is it watertight? how close do we get to simulating native support?
- simplify by accepting constraints: dynamic vs compile time

- three different approaches: runtime css parsing, compile time css postprocessor, houdini

- see object-fit, css-custom-props, scroll-linked-animations, ::overflow

# research

base framework / boilerplate code for css polyfills by Philip Walton

https://philipwalton.com/articles/the-dark-side-of-polyfilling-css/
https://philipwalton.github.io/polyfill/

parsing CSS into AST with postCSS or lightningCSS
https://twitter.com/devongovett/status/1610683620255043591
https://lightningcss.dev/transforms.html
https://twitter.com/devongovett/status/1612847581805301761

## inspect what others do

css vars polyfill https://github.com/nuxodin/ie11CustomProperties

# about houdini support

https://github.com/WebKit/WebKit/commit/5f26496d558011203cd8796591c3dd0aa4cf154e
https://drafts.css-houdini.org/css-properties-values-api/
