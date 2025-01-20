# Executive – Application Programming Interface

Executive introduces a basic API to simplify the process of working with the game's internal functions. The API permits internal functions to be redefined or for functions to be registered as hooks before or after a given internal function is called, under the `Executive.functions` object. `Executive.mods` and `Executive.version` store information relating to the loaded modifications and the loader/game version, while `Executive.enums` stores enumerated types for use with internal game and/or API functions and data structures. `Executive.styles` allows mods to add stylesheets for custom UI elements to the game.

**Disclaimer:** Executive is beta software and the API is not considered stable. Modification developers should anticipate the possibility of breaking changes with any update to the loader and/or API.

## Executive.functions

[Executive.functions](functions.md) contains several child functions for handling interoperation with the game's internal functions and mod code. These allow mods to hook onto game functions or replace the functionality of game functions.

### Children

- `registerReplacement(funcName, newFunc)` – Replace a game function.
- `registerPreHook(funcName, hook)` – Hook a function before it executes.
- `registerPostHook(funcName, hook)` – Hook a function after it executes.
- `deregisterPreHook(funcName, hookId)` – Deregister a previously registered pre-hook.
- `deregisterPostHook(funcName, hookId)` – Deregister a previously registered post-hook.
- `getOriginalFunction(funcName)` – Get the original definition of a game function.

## Executive.styles

[Executive.styles](styles.md) exposes two child functions to allow new stylesheets to be registered with the game. In addition, the `registeredStyles` property contains an array with every registered style.

Priority of stylesheets added is dependent upon the order in which they are loaded – the last loaded stylesheet technically holds precedence over those loaded before, but *not* over the game's default stylesheet, which is always considered last. Mod developers are, however, advised not to rely upon this behaviour and to instead design their mods to avoid conflicts between CSS classes for added elements.

### Children

- `registerStyle(stylePath)` – Register a stylesheet at the given path to be used in both light and dark mode.
- `registerThemeAwareStyle(lightStylePath, darkStylePath)` – Register a pair of stylesheets to be used depending on whether the game is in light or dark mode.
- `registeredStyles` – A list of objects containing currently registered stylesheets.

## Executive.mods

`Executive.mods` catalogues currently loaded mods, while implementing additional mod-relative functions relating to save data and file paths.

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