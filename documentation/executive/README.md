# Executive – Application Programming Interface

Executive introduces a basic API to simplify the process of working with the game's internal functions. The API permits internal functions to be redefined or for functions to be registered as hooks before or after a given internal function is called, under the `Executive.functions` object. `Executive.mods` and `Executive.version` store information relating to the loaded modifications and the loader/game version, while `Executive.enums` stores enumerated types for use with internal game and/or API functions and data structures. `Executive.styles` allows mods to add stylesheets for custom UI elements to the game.

**Disclaimer:** Executive is beta software and the API is not considered stable. Modification developers should anticipate the possibility of breaking changes with any update to the loader and/or API.

- [Executive – Application Programming Interface](#executive--application-programming-interface)
  - [Executive.functions](#executivefunctions)
    - [Children](#children)
  - [Executive.styles](#executivestyles)
    - [Children](#children-1)
  - [Executive.game](#executivegame)
    - [Children](#children-2)
  - [Executive.data](#executivedata)
  - [Executive.mods](#executivemods)
    - [ModObject](#modobject)
  - [Executive.version](#executiveversion)
  - [Executive.enums](#executiveenums)
  - [Executive.debug](#executivedebug)
    - [Children](#children-3)


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
- `registeredStyles` : Array\<object\> – A list of objects containing currently registered stylesheets.

## Executive.game

[Executive.game](game.md) exposes child functions to influence the current state of the loaded game. These include functions implementing functionality exposed by custom events (such as party identification shifts).

### Children

- `loaded` : boolean – Represents whether the player has loaded a save/started a new game.
- `traits` : Array\<string\> – An array of user-selectable traits for customisation.
- `customTraits` : Array\<string\> – An array containing every trait added by modifications through Executive.
- `triggerNextTurn()` – Trigger the next in-game turn.
- `changeStatewidePartyID(stateId, sourceParty, destParty, percentage)` – Move a percentage amount of voters identifying with one party to a different party in the given state.
- `createGeneralOfficeMessage(title, message, character)` – Create a message in the Summary tab of the Office pane.
- `createCityNews(title, message, character, week)` – Create a city-wide news item in the News pane.
- `createStateNews(title, message, character, week)` – Create a state-wide news item in the News pane.
- `createNationalNews(title, message, character, week)` – Create a nationwide news item in the News pane.

## Executive.data

[Executive.data](data.md) provides methods for mods to interact with the data structures used internally by the game. The data API is split into three categories – `Executive.data.states` allows mods to access objects representing US states, `Executive.data.characters` allows for easier interaction with the arrays used to represent game characters and `Executive.data.politicians` implements methods and properties to access incumbent politicians at each tier of in-game government.

## Executive.mods

[Executive.mods](mods.md) catalogues currently loaded mods, while implementing additional mod-relative functions relating to save data and file paths.

- `count` : number – Describes the number of mods loaded during the game's initialisation.
- `loaded` : *ModObject* – An array containing every mod loaded.
- `registry` : object – An object mapping mod IDs to their object representation.
- `saveData` : object – Save data for the current game.
- `getCharacterSaveData(character)` – Get the object containing mod save data for a given character.
- `getObjectSaveData(targetObj)` – Get the object containing mod save data for a game object. *Not recommended for use.*

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

- `major` : number – The major component of the semantic version.
- `minor` : number – The minor component of the semantic version.
- `revision` : number – The revision component of the semantic version.
- `string` : string – A human-readable representation of the version.
- `gameVersion` : number – The version of The Political Process running.

## Executive.enums

`Executive.enums` contains enums for use when working with game objects. The sole child, `characterArray`, contains child objects corresponding to each type of in-game character, with each child object containing properties representing the index in a CharacterArray for the relevant character property. This enum largely exists for internal use.

## Executive.debug

[Executive.debug](debug.md) allows mod developers to trace the execution of game functions for the purpose of reverse engineering.

### Children

- `logFunctionCalls` : boolean – Determines whether traces of function calls are logged to the developer tools console.
- `logWrappedObjects` : boolean – Determines whether accesses for logger objects are logged to the developer tools console.
- `printTraceDuringExecution` : boolean – Determines whether a running log of called functions is logged to the developer tools console.
- `createLoggerProxy(targetObj, name)` – Creates a proxy for a given object which logs accesses to and from the inner object to the developer tools console.