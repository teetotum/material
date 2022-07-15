const filter = (prefix) => (props) => Object.fromEntries(Object.entries(props).filter((e) => e[0].startsWith(prefix)));

export const getAriaAttributes = filter("aria-");

export const getDataAttributes = filter("data-");
