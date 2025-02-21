# Executive – Classes

Executive defines various classes for use by mods with API functions. These implement concepts such as custom propositions for player-proposed legislation.

## BindableEvent

The `BindableEvent` class allows mods to register and deregister listeners for events produced by the game or by Executive. All registered event listeners are called when a function fires the event, passing along arguments provided by the function firing the event.

### Methods

#### new BindableEvent(eventName : string) : BindableEvent

The constructor for `BindableEvent` takes a single argument, `eventName`. This is used both to identify the event when the event object is passed to listeners and for error logs.

#### fire(...) : void

`fire` calls every event listener registered. Event listeners are passed an object containing the event and a deregistration function as the first argument, followed by any other arguments passed by the caller of `fire`.

#### registerListener(listener : function) : object

`registerListener` registers a function, `listener`, as an event listener for the `BindableEvent`, allowing it to be called whenever a function calls `fire`. If a non-function is passed to `listener`, an error will be thrown.

- `listener` : function(eventObj : object, ...) – The function to act as an event listener.

The object returned by `registerListener` has one property.

- `deregister` : function() – Deregisters the event listener from the event.

`eventObj`, passed to `listener`, has two properties.

- `baseEvent` : BindableEvent – The event which signalled the event listener function.
- `deregister` : function() – Deregisters the event listener from the event.

#### deregisterListener(listener : function) : void

`deregisterListener` deregisters a registered event listener function, `listener`, meaning it will no longer be called whenever `fire` is called on the event. If an unregistered function is deregistered or a non-function is passed as `listener`, an error will be thrown.

- `listener` : function(eventObj : object, ...) – A registered event listener to be deregistered.

## CustomProposition

