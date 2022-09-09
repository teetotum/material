# Satan's Pissbucket - A React Anti Pattern and its Remedy

`#advanced #react #anti-pattern #refactoring`

Everyone who writes code regularly will sometimes produce suboptimal results. Lack of sleep, naive assumptions about the platform, being oblivious of the existence of a crucial feature, or for one of a hundred other reasons. I am fully aware that I have certainly done so in the past, and that others had to clean up after me.

Recently I encountered a remarkably ugly pattern in a react project I am involved in. In this article I will discuss 1.) the pattern, 2.) why I think it is an anti pattern, and 3.) how I will go about replacing it with something else.

This article is not intended to deride the developer who implemented it. It is meant to be educational, entertaining, and maybe a bit cathartic - because this time I will be the one who has to clean it up.

## the pattern

Let's first share it without any prior explanation. So you can re-experience what I encountered in our source code lurking around a bend.

```jsx
<CreateProductCollectionDialog productID={id}>
  {(openCreateProductCollection) => (
    <AddToProductCollectionDialog
      productID={id}
      openCreateProductCollectionDialog={openCreateProductCollection}
    >
      {(openAddToProductCollection) => (
        <EditProductCollectionDialog productID={id}>
          {(openEditProductCollection) => (
            <ProductItemMenu>
              <Button onClick={openCreateProductCollection}>
                {"Start new product collection"}
              </Button>
              <Button onClick={openAddToProductCollection}>
                {"Add to product collection"}
              </Button>
              <Button onClick={openEditProductCollection}>
                {"Edit product collection"}
              </Button>
            </ProductItemMenu>
          )}
        </EditProductCollectionDialog>
      )}
    </AddToProductCollectionDialog>
  )}
</CreateProductCollectionDialog>
```

The code snippet is _not_ embellished. I could have added the `<EditProductItemDialog>` and `<DeleteProductItemDialog>` to the nesting for dramatic effect, but those two dialogs were implemented later, thankfully breaking with the nested pattern and using a differen approach (more of that later).

So what is it supposed to do?
Why are there three dialogs nested inside each other?
Why are the buttons that are supposed to open those dialogs nested inside there at the deepest point?
Why is each nested child dialog wrapped in a function?

Imagine some product info is displayed on some admin UI, a menu offers different actions to change or interact with the displayed product:

- create a new collection and add as first item,
- add it to some existing collection,
- if the item is currently part of one or more collections, edit those collections

Each of those actions will open its own dialog which contains the corresponding form.
The menu entries will need to have a callback to open their respective dialog.
So what each of those dialog components is doing is that it sets up its own required infrastructure:

- it has a boolean state to control whether the dialog is open
  ```jsx
  const [isOpen, setIsOpen] = useState(false);
  ```
- it has some markup to conditionally render the actual popup into the DOM
  ```jsx
  <>
    {isOpen && (
      <Popup>
        <EditProductForm productID={productID} />
      </Popup>
    )}
  </>
  ```
- it is mounted as part of the logical component tree (so the state persists and doesn't vanish when the actual popup closes)
- it requires the `children` prop to be a function, and will call it, providing the callback to open the dialog as the only function parameter
  ```jsx
  <>{children(() => setIsOpen(true))}</>
  ```
- it will unconditionally render the children into the DOM, and is prepared to render the actual dialog popup into the DOM depending on the `isOpen` state

This pattern actually works as intended, and _if this was the only way to supply a callback from one component to another_ it would be acceptable - by necessity. That's probably the reasoning the original author followed.

And notice that the `<AddToProductCollectionDialog>` even has access to the `openCreateProductCollection` callback and can therefore trigger the `<CreateProductCollectionDialog>` if needed.

Here is one (severely abridged) implementation as a working example for the interested reader (you can skip this if you understood the gist of it from the small bullet point list above):

```jsx
import React, { useState, FC, ReactNode } from "react";
import { CreateProductCollectionForm } from "./ProductCollectionForms";
import { Popup } from "./Popup";
import { ID } from "./productAPI";

interface Props {
  productID: ID;
  children: (openDialog: () => void) => ReactNode;
}

export const CreateProductCollectionDialog: FC<Props> = ({
  productID,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {children(() => setIsOpen(true))}
      {isOpen && (
        <Popup onClose={() => setIsOpen(false)}>
          <CreateProductCollectionForm productID={productID} />
        </Popup>
      )}
    </>
  );
};
```

So in the end the whole fantastic cascade of nested dialog components will render the product item menu into the DOM, with its buttons wired up to their corresponding "hidden" dialog infrastructure, ready to be called.

```jsx
<ProductItemMenu>
  <Button onClick={openCreateProductCollection}>
    {"Start new product collection"}
  </Button>
  <Button onClick={openAddToProductCollection}>
    {"Add to product collection"}
  </Button>
  <Button onClick={openEditProductCollection}>
    {"Edit product collection"}
  </Button>
</ProductItemMenu>
```

I could even admire it, if the pattern wasn't so ridiculously cumbersome.

## what's wrong with it?

Let's keep this short:

- it is needlessly complicated
- the nesting is confusing
- it does not scale well
- the callback is only available to children
- the nesting order seems relevant, even when it isn't
- it forces the use of a wrapper function around the children
- it seemingly interferes with the layout: imagine `ProductItemMenu` needs to be a flexbox child to be positioned correctly. So wrapping it seems problematic and forces the next developer to unravel the whole nesting chain to find out that -after all- it's still a flexbox child in the resulting DOM.

And finally: there is a much simpler solution.

## A Remedy

This whole mess started with the necessity to supply a callback from one component to another.
What would you do if you needed a callback to set `focus()` to an `<input>`? Simple, you would use a `ref`.

Well, you can do the same thing with any of your custom components. It needs to be wrapped with `forwardRef` so the `ref` doesn't get lost ([doc](https://reactjs.org/docs/react-api.html#reactforwardref)).
I wrote an [article](https://github.com/teetotum/material/blob/master/article.react-imperative-api/react_imperative_component_api.md) covering that feature.
Internally the forwarded `ref` is then wired to an object (with `useImperativeHandle` [doc](https://reactjs.org/docs/hooks-reference.html#useimperativehandle)); to which you can add any callback you can think of; thereby providing access to change state.

An improved dialog could be implemented thus:

```jsx
import { useState, forwardRef, useImperativeHandle } from "react";
import type { ForwardedRef, ReactNode } from "react";
import { Popup } from "./Popup";

export interface DialogProps {
  children?: ReactNode;
}

export interface DialogAPI {
  open: () => void;
  close: () => void;
}

export const Dialog = forwardRef(
  ({ children }: DialogProps, ref: ForwardedRef<DialogAPI>) => {
    const [isOpen, setIsOpen] = useState(false);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    useImperativeHandle(ref, (): DialogAPI => ({ open, close }), []);

    return isOpen && <Popup onClose={close}>{children}</Popup>;
  }
);
```

It would be used thus:

```jsx
import { Dialog, DialogAPI } from './Dialog';

// ...

const dialog = useRef<DialogAPI>();

<>
  <Button onClick={() => dialog.current.open()}>
    {"Edit product"}
  </Button>
  <Dialog ref={dialog}>
    <ProductForm
      productID={id}
      onSubmitSuccess={() => dialog.current.close()}
      onCancel={() => dialog.current.close()}
    />
  </Dialog>
</>
```

Now the button, the edit form, and the dialog could all be moved into one combined component `<EditProduct productID={id} />`, easily allowing to add this functionality to different places in the UI with one line of code, complete with the whole dialog popup infrastructure.

Let's see how the code section I showed you in the beginning would look when we change the dialog pattern to the new one.

```jsx
<ProductItemMenu>
  <CreateProductCollection productID={id} />
  <AddToProductCollection productID={id} />
  <EditProductCollection productID={id} />
</ProductItemMenu>
```

The nesting is gone and the dialog infrastructure moved into the specialized buttons.

Remember that the `<AddToProductCollectionDialog>` must have the possibility to trigger the `<CreateProductCollectionDialog>` if needed?
This is even easier now since it can just import `<CreateProductCollection>` and render it somewhere in its form.

To me this is much clearer. The nesting is gone. The unholy entanglement is resolved. Each part of the functionality is clearly separated. New functionality can be added without interfering with the other parts, or the necessity to understand each and every of the existing dialogs and edit forms.
