# Writing an Executive Mod – Getting Started

Now you've set up the nw.js SDK, your mod project folder and your mod's `manifest.json`, we're ready to get started with writing a mod! Let's first write a very simple mod – all it'll do is hide any portraits from the sidebar in the game's Office tab whenever the player opens it. This requires us to use very little of Executive's API.

## Remove the Hello World dialog



## Finding a target function

If we want to modify one of the game's user interfaces, the first step towards this goal is to locate the function which creates that interface. Once we've found a target function, we can register a *hook* – a function which is run whenever that target function is called by the game.

To locate our target function, we need to use Executive's `debug` API. Open the Developer Tools with F11 and run the following line in the JavaScript Console.

```
Executive.debug.logFunctionCalls = true
```