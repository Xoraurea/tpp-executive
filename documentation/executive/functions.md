# Executive – Functions API

The `Executive.functions` API implements methods to override or hook onto the behaviour of game functions.

- [Executive – Functions API](#executive--functions-api)
  - [Properties](#properties)
  - [Functions](#functions)
    - [registerReplacement(funcName : string, newFunc : function) : boolean](#registerreplacementfuncname--string-newfunc--function--boolean)
    - [registerPreHook(funcName : string, hook : function) : number](#registerprehookfuncname--string-hook--function--number)
    - [registerPostHook(funcName : string, hook : function) : number](#registerposthookfuncname--string-hook--function--number)
    - [deregisterPreHook(funcName : string, hookId : number) : boolean](#deregisterprehookfuncname--string-hookid--number--boolean)
    - [deregisterPostHook(funcName : string, hookId : number) : boolean](#deregisterposthookfuncname--string-hookid--number--boolean)
    - [getOriginalFunction(funcName : string) : function](#getoriginalfunctionfuncname--string--function)

## Properties

This API does not expose any properties to modifications.

## Functions

### registerReplacement(funcName : string, newFunc : function) : boolean

`registerReplacement` allows mods to redefine internal functions while maintaining all hooks registered up to that point. Attempting to redefine a function which has already been redefined by another mod throws an exception to avoid an irreconcilable conflict, while attempting to redefine a non-existent internal function fails silently, returning false. The function returns true if registration is successful.

- `funcName` : string – The name of the internal function as defined in the global environment.
- `newFunc` : function(...) – The replacement function to be called in place of the original, taking the same arguments and returning the same type as the original function.

### registerPreHook(funcName : string, hook : function) : number

`registerPreHook` registers a hook function for an internal game function to be called before the function itself executes. The function returns a number relating to the ID of the registered hook for use in deregistration; if the internal function does not exist, `registerPreHook` fails and returns a -1.

- `funcName` : string – The name of the internal function as defined in the global environment.
- `hook` : function(args, calleeName, hookId) – The function to be called as a hook.
    - `args` : object – The arguments used to call the internal function.
    - `calleeName` : string – The name of the called function.
    - `hookId` : number – The index of the hook.

### registerPostHook(funcName : string, hook : function) : number

`registerPostHook` registers a hook function for an internal game function to be called after the function itself executes. The function returns a number relating to the ID of the registered hook for use in deregistration; if the internal function does not exist, `registerPostHook` fails and returns a -1.

- `funcName` : string – The name of the internal function as defined in the global environment.
- `hook` : function(args, calleeName, hookId) – The function to be called as a hook.
    - `args` : object – The arguments used to call the internal function.
    - `returnVal` : any – The return value of the internal function.
    - `calleeName` : string – The name of the called function.
    - `hookId` : number – The ID of the hook.

### deregisterPreHook(funcName : string, hookId : number) : boolean

`deregisterPreHook` allows a function previously registered as a pre-hook with `registerPreHook` to be deregistered and no longer called. The function returns a boolean relating to the success of the operation; it fails if the internal function does not exist or no hook exists with the given ID.

- `funcName` : string – The name of the internal function as defined in the global environment.
- `hookId` : number – The ID of the hook to deregister.

### deregisterPostHook(funcName : string, hookId : number) : boolean

`deregisterPostHook` allows a function previously registered as a post-hook with `registerPostHook` to be deregistered and no longer called. The function returns a boolean relating to the success of the operation; it fails if the internal function does not exist or no hook exists with the given ID.

- `funcName` : string – The name of the internal function as defined in the global environment.
- `hookId` : number – The ID of the hook to deregister.

### getOriginalFunction(funcName : string) : function

`getOriginalFunction` allows mod code to fetch the reference to the original definition of an internal game function, ignoring invocation of any registered hooks and any registered replacement function. This is intended for use by replacement functions to recycle the game's original behaviour where appropriate.

- `funcName` : string – The name of the internal function as defined in the global environment.