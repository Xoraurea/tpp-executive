# Executive – Debug API

The `Executive.debug` API allows mod developers to trace the execution of game functions for the purpose of reverse engineering. Each child property/function controls the logging of information to the developer tools console.

## logFunctionCalls : boolean

The `logFunctionCalls` property controls whether calls to game functions are traced by Executive, with objects containing traces of game functions called and their arguments/return values being logged to the console when the property is set to `true`. The default is `false`.

### TraceObjects

Once a top-level game function finishes executing, a TraceObject is logged to the console. TraceObjects take the following form.

- `functionSig` : string – The name of the function called.
- `functionArgs` : Array – An array of arguments passed to the function.
- `functionRtn` : any – The value returned by the function. `undefined` if nothing is returned.
- `children` : Array<TraceObject> – An array of TraceObjects for every game function called by the function.

## logWrappedObjects : boolean

The `logWrappedObjects` property controls whether objects wrapped by `createLoggerProxy` log accesses in the console. The default is `true`.

## printTraceDuringExecution : boolean

The `printTraceDuringExecution` property controls whether the trace for game functions is logged in human-readable form as the function executes, as well as outputting a trace object at the end. This property only applies if `logWrappedObjects` is `true`. The default is `false`.

## createLoggerProxy(targetObj : object, *name : string*) : object

`createLoggerProxy` allows for any given object to be wrapped in a logger proxy, with any form of access to the logger proxy logged to the console. The function returns the object wrapper, which may be used in place of the original. Any changes to the object's properties through the wrapper are made to the underlying object.

- `targetObj` : object – The object to be wrapped.
- `name` : string – *Optional.* The name used to identify the object in console logs. If not passed, the serialisation of the object is used instead.