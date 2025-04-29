# Executive – Styles API

The `Executive.styles` API allows modifications to integrate CSS stylesheets for their UI elements with the game without having to interact with the DOM. The style-aware form of functions also allows for stylesheets to be swapped whenever the player changes between light and dark mode in-game. All functions taking paths use paths relative to the folder containing the file with the currently executing function. In addition to the child functions, the `registeredStyles` property contains an array with every registered style.

Priority of stylesheets added is dependent upon the order in which they are loaded – the last loaded stylesheet technically holds precedence over those loaded before, but *not* over the game's default stylesheet, which is always considered last. Mod developers are, however, advised not to rely upon this behaviour and to instead design their mods to avoid conflicts between CSS classes for added elements.

- [Executive – Styles API](#executive--styles-api)
  - [Properties](#properties)
    - [currentTheme : string](#currenttheme--string)
  - [Functions](#functions)
    - [registerStyle(stylePath : string)](#registerstylestylepath--string)
    - [registerThemeAwareStyle(lightStylePath : string, darkStylePath : string)](#registerthemeawarestylelightstylepath--string-darkstylepath--string)
    - [registeredStyles : Array\<object\>](#registeredstyles--arrayobject)

## Properties

### currentTheme : string

The `currentTheme` property holds the currently selected game theme. Valid values are `light` and `dark` for the game's light and dark mode respectively.

## Functions

### registerStyle(stylePath : string)

`registerStyle` adds a DOM element linking to a given stylesheet to the game's element tree, thus applying the style for the game. The path passed to `registerStyle` is interpreted as *relative to the directory of the file containing the caller function*. As an example, if `example-mod/common/funcs.js` called `registerStyle` with a `stylePath` of `styles/main.css`, the resulting DOM element would link to the stylesheet stored at `example-mod/common/styles/main.css`.

- `stylePath` : string – The relative path pointing to the stylesheet to be loaded.

### registerThemeAwareStyle(lightStylePath : string, darkStylePath : string)

`registerThemeAwareStyle` adds a DOM element to the game referencing one of two stylesheets, depending upon the current game theme selected by the user. If the user changes themes while playing, the currently loaded stylesheet will swap to the other given when the function was called.

The paths passed to `registerThemeAwareStyle` are interpreted as *relative to the directory of the file containing the caller function*. As an example, if `example-mod/common/funcs.js` called `registerThemeAwareStyle` with a `lightStylePath` of `styles/light.css`, the resulting DOM element would link to the stylesheet stored at `example-mod/common/styles/light.css`.

- `lightStylePath` : string – The relative path pointing to the stylesheet to be used when light mode is enabled.
- `darkStylePath` : string – The relative path pointing to the stylesheet to be used when dark mode is enabled.

### registeredStyles : Array\<object\>

`registeredStyles` is an array of currently registered mod stylesheets, largely intended for internal use. Each entry is an object with the following properties. For non-theme-aware styles, the `light` and `dark` properties are always equal.

- `light` : string – The absolute path to the light mode version of the stylesheet.
- `dark` : string – The absolute path to the dark mode version of the stylesheet.
- `element` : Element – The DOM `<link>` element implementing the stylesheet in the game.