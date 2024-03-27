# DOM event delegation like a Pro

When an event handler (in this case the dropdown's Esc key handler) handles an event in such a way that it can be considere "dealt with", it should mark the event as "handled" by calling "event.preventDefault()".
Any DOM event handler that is intended to behave in such a way as to distinguish between "unhandled" and "handled" events (in this case the dialog's Esc key handler) should check "event.defaultPrevented" first, and act accordingly.

in this article you will learn how you can let dom event bubble up the tree unhindered / peacefully without destoing functionality / causing bugs inadvertendly in other parts of the tree further up.
You will be fully equipped to handle any future DOM event / event delegation conundrum like a Pro with a clear and clean approach.
I appologise for parts of the text that seem a bit ranty, for I dismay at the current state of affairs that solving DOM evnt delegation is usually done idiotically wrong, and the wrong solution is widespread provided frequently as an answer on stackoverflow (link) and frankly everywhere on the web (link)

I can only attribute it to a severe lack of education (knowing no alternatives)
a lack of experience (not having been bitten by bugs cused by swallowed events)
and the fact that wrong solutions are blared at the poor innocent answer-seeking dev from all directions.
