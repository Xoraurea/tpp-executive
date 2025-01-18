# Executive – Application Programming Interface

Executive introduces a basic API to simplify the process of working with the game's internal functions. The API permits internal functions to be redefined or for functions to be registered as hooks before or after a given internal function is called, under the `Executive.functions` object. `Executive.mods` and `Executive.version` store information relating to the loaded modifications and the loader/game version, while `Executive.enums` stores enumerated types for use with internal game and/or API functions and data structures. `Executive.styles` allows mods to add stylesheets for custom UI elements to the game.

**Disclaimer:** Executive is beta software and the API is not considered stable. Modification developers should anticipate the possibility of breaking changes with any update to the loader and/or API.

## Executive.functions

[Executive.functions](documentation/executive/functions.md) contains several child functions for handling interoperation with the game's internal functions and mod code.

## Executive.styles

`Executive.styles` exposes two child functions to allow new stylesheets to be registered with the game. In addition, the `registeredStyles` property contains an array with every registered style.

Priority of stylesheets is dependent upon the order in which they are loaded – the last loaded stylesheet technically holds precedence over those loaded before, but *not* over the game's default stylesheet, which is always considered last. Mod developers are, however, advised not to rely upon this behaviour and design their mods to avoid conflicts between class names for added elements.

### registerStyle(stylePath : string)

`registerStyle` adds a DOM element linking to a given stylesheet to the game's element tree, thus applying the style for the game. The path passed to `registerStyle` is interpreted as *relative to the directory of the file containing the caller function*. As an example, if `example-mod/common/funcs.js` called `registerStyle` with a `stylePath` of `styles/main.css`, the resulting DOM element would link to the stylesheet stored at `example-mod/common/styles/main.css`.

- `stylePath` : string – The relative path pointing to the stylesheet to be loaded.

### registerThemeAwareStyle(lightStylePath : string, darkStylePath : string)

`registerThemeAwareStyle` adds a DOM element to the game referencing one of two stylesheets, depending upon the current game theme selected by the user. If the user changes themes while playing, the currently loaded stylesheet will swap to the other given when the function was called.

The paths passed to `registerThemeAwareStyle` are interpreted as *relative to the directory of the file containing the caller function*. As an example, if `example-mod/common/funcs.js` called `registerThemeAwareStyle` with a `lightStylePath` of `styles/light.css`, the resulting DOM element would link to the stylesheet stored at `example-mod/common/styles/light.css`.

- `lightStylePath` : string – The relative path pointing to the stylesheet to be used when light mode is enabled.
- `darkStylePath` : string – The relative path pointing to the stylesheet to be used when dark mode is enabled.

### registeredStyles

`registeredStyles` is an array of currently registered mod stylesheets, largely intended for internal use. Each entry is an object with the following properties. For non-theme-aware styles, the `light` and `dark` properties are always equal.

- `light` : string – The absolute path to the light mode version of the stylesheet.
- `dark` : string – The absolute path to the dark mode version of the stylesheet.
- `element` : Element – The DOM `<link>` element implementing the stylesheet in the game.

## Executive.mods

`Executive.mods` catalogues currently loaded mods.

- `Executive.mods.count` : number – Describes the number of mods loaded during the game's initialisation.
- `Executive.mods.loaded` : *ModObject* – An array containing every mod loaded.
- `Executive.mods.registry` : object – An object mapping mod IDs to their object representation.

### ModObject

Mods are described internally by their `ModObject`. The child properties are largely the same as the mod's manifest file.

- `id` : string – A unique string identifier for the mod.
- `name` : string – A human-readable name for the mod for use in any UI element.
- `description` : string – A description of the mod's purpose.
- `author` : string – The name(s) of the author(s).
- `version` : object – The semantic version of the mod.
    - `major` : number – The major component.
    - `minor` : number – The minor component.
    - `revision` : number – The revision component.
    - `string` : string – A human-readable representation of the version.
- `required_loader_version` : object – The version of Executive required for the mod to function.
    - `major` : number – The major component.
    - `minor` : number – The minor component.
    - `revision` : number – The revision component.

## Executive.version

The `Executive.version` object describes the version of Executive running.

- `Executive.version.major` : number – The major component of the semantic version.
- `Executive.version.minor` : number – The minor component of the semantic version.
- `Executive.version.revision` : number – The revision component of the semantic version.
- `Executive.version.string` : string – A human-readable representation of the version.
- `Executive.version.gameVersion` : number – The version of The Political Process running.

## Executive.enums

*Under construction.*

## Executive.data.states

*Under construction.*

## Executive.data.characters

*Under construction.*

## Executive.debug

*Under construction.*