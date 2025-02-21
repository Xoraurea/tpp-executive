# Writing an Executive Mod – Getting Started

Now you've set up the nw.js SDK, your mod project folder and your mod's `manifest.json`, we're ready to get started with writing a mod! Let's first write a very simple mod – all it'll do is hide any portraits from the sidebar in the game's Office tab whenever the player opens it. This requires us to use very little of Executive's API.

## What's in main.js?

`main.js` is the file Executive loads to execute your mod. Like Node.js modules, the script is executed as a CommonJS module – what Executive gets is what you pass to `module.exports`. All Executive requires is that every mod exports an `init` function in its exports object, which is run at the end of Executive's initialisation stage.

Mods should not run any *non-trivial* (i.e. anything other than declarations and variable initialisations) code at the top-level of the script. The Executive API is not fully initialised until `init` is called and attempting to call Executive or game functions before `init` will lead to errors.

Using the `styles` API, the `init` included in the template mod sets up stylesheets for your mod, located in the `styles` directory. The `registerStyles` call establishes a *general* stylesheet, which you can use for layout and sizing of UI elements. `registerThemeAwareStyles` registers specific stylesheets for the game's light and dark mode, allowing you to adjust the colour of UI elements with the player's selected theme.

The final part uses the game's function for alert dialogs, `alertFunc`, to display a Hello World prompt when the game loads.

## Remove the Hello World dialog

You probably don't want a pop-up every time you open the game, so let's remove the Hello World prompt. Comment out or remove the following line from `init` in `main.js`.

```js
alertFunc("Hello, Executive world!");
```

To see the effects of your change, go to the game's menu and click Exit to Main Menu. This will reload the entire game, and this time you won't have any greeting dialog.

## Finding a target function

If we want to modify one of the game's user interfaces, the first step towards this goal is to locate the function which creates that interface. Once we've found a target function, we can register a *hook* – a function which is run whenever that target function is called by the game.

To locate our target function, we need to use Executive's `debug` API. Open the Developer Tools with F11 and run the following line in the JavaScript Console.

```js
Executive.debug.logFunctionCalls = true
```

Once this property is set, Executive will log traces of calls to The Political Process' internal functions to the Console. You can toggle this at any time while the game is running. To see the effects of this, click the Campaign Mode button in the main menu. Executive will log objects representing the traces of game functions called by the button's event handler. The names of these functions are given by `functionSig`, their arguments are given in the `functionArgs` array and their return values are given by the `functionRtn` value. The child functions called by this function are given in the `children` array.

### Targeting the Office tab

Once you've loaded/started a game, you're ready to look for your target function. Click around the game's tabs a bit – you'll find that each tab calls a specific function to handle the click event. By clicking Office, we can see that the game relies upon the function `officePageClick` to handle the player clicking on the Office tab. However, we can also see `officePageClick` calls two child functions.

As a general principle, the more granular the target function, the better. One of the child functions of `officePageClick` is `officePage`, and this calls `officeSummary` whenever the player has the Summary tab selected. As the Summary tab is the only one with a sidebar, we're going to pick `officeSummary` as our target function.

## Hooking a target function

To achieve our desired effect, we need to in some way make use of our target function. Executive offers two paradigms for modifying the behaviour of game functions, which are each suitable in different contexts.

The first is *function replacement* – replacing the implementation of a game function with a mod's own. Each function can only be replaced once by a single mod – if a mod were allowed to overwrite an overwritten function, it would break guarantees relied upon by the mod which originally replaced the function. We don't need to use such a blunt instrument for a small UI tweak.

The second option, as mentioned previously, is *hooking* – registering a function which is run whenever the target function is called. Executive allows for *pre-hooks*, which run before the target function executes, and *post-hooks*, which run after. As we rely on the game having created the Office Summary UI before we modify it, we'll be registering a *post-hook*.

### Creating our hook function

Hooks are passed a range of arguments, as documented in the [`functions` API](../functions.md). We don't need any of these, however. You can simply create an empty function.

```js
const officeHookFunc = () => {
    /* Hide the portraits from the sidebar when the Office Summary tab is opened. */
}
```

Now you have the task of filling the function up. To do this, we need to look at the UI created in the Summary tab. Right-click the portrait in the Office Summary tab and click the inspect element option. You'll see that the portrait is a HTML `<canvas>` element, given the ID `oSummaryCanvas` by the game. This is incredibly helpful – we now know exactly what to target.

If you're familiar with JavaScript's Document Object Model and HTML/CSS, the next step will be natural; we simply need to select the element by ID and then change its display style to hide it from view. Add the following code to your `officeHookFunc` function.

```js
const portraitCanvas = document.getElementById("oSummaryCanvas");
portraitCanvas.setAttribute("style", "display: none;");
```

We've opted to hide the canvas element instead of simply removing it from the document. This is good practice – you never know what game function might be relying upon a certain UI element existing to execute. Setting `display` to `none` removes it from view and prevents it from affecting UI layout, and therefore achieves everything we'd seek to accomplish by removing it without breaking game code.

### Registering our hook function

With our hook function written, all that's left to do is register it! Go back to `init` and add the following code at the bottom.

```js
/* Register a hook function to hide portraits in the Office Summary pane. */
Executive.functions.registerPostHook("officeSummary", officeHookFunc);
```

This tells Executive to register a post-hook on the game function named `officeSummary`, passing `officeHookFunc` to use as the hook function. You're now ready to test your mod. Once you exit to main menu and open a new game, your hook function will run whenever the Office Summary tab is opened and will hide the portrait. Mission accomplished!

It should be noted that only functions defined in the global scope by The Political Process can be hooked by Executive. The API collects a list of game functions defined at the beginning of initialisation, and relies upon this for the management of hooks.