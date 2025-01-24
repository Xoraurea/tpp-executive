# Executive – Mods API

`Executive.mods` catalogues currently loaded mods, while implementing additional mod-relative functions relating to save data and file paths.

- [Executive – Mods API](#executive--mods-api)
  - [Properties](#properties)
    - [count : number](#count--number)
    - [loaded : Array](#loaded--array)
    - [registry : object](#registry--object)
    - [saveData : object](#savedata--object)
  - [Functions](#functions)
    - [getRelativePathPrefix() : string](#getrelativepathprefix--string)
    - [getCharacterSaveData(character : CharacterObject) : object](#getcharactersavedatacharacter--characterobject--object)
    - [getObjectSaveData(targetObj : object) : object](#getobjectsavedatatargetobj--object--object)
  - [ModObject](#modobject)

## Properties

### count : number

`count` describes the number of mods loaded during the game's initialisation. May be any number greater than `0`.

### loaded : Array<ModObject>

`loaded` contains an array with elements representing every mod loaded during the game's initialisation. Elements are `ModObject`s.

### registry : object

`registry` is an object mapping mod IDs to their `ModObject` representation. Every mod has an entry in the registry with a key equal to their mod ID – for example, `test-mod-f6b72e` has a representative `ModObject` within `Executive.mods.registry["test-mod-f6b72e"]`.

### saveData : object

When in a loaded game, `saveData` represents the object containing the mod's save data for that game. The contents of this object will be serialised and saved when the game is saved. Attempting to access this property when a game is not loaded will throw an error. This property must be accessed from a script file located within a subdirectory of modFiles.

## Functions

### getRelativePathPrefix() : string

`getRelativePathPrefix` resolves the beginning of the relative path corresponding to the folder containing the caller function's script file – for example, calling `Executive.mods.getRelativePathPrefix()` from `C:\Program Files (x86)\Steam\steamapps\common\The Political Process\modFiles\test-mod\common\components.js` will return `modFiles\test-mod\common`. This allows mods to load resources relative to scripts in the mod directory.

### getCharacterSaveData(character : CharacterObject) : object

`getCharacterSaveData` returns the object containing the saved mod data for the given character. This character must be passed as a wrapped Executive `CharacterObject` (see [Executive.data](data.md) for explanation). The contents of the returned object will be serialised and saved when the game is saved. Attempting to call this function when a game is not loaded will throw an error. This function must be called from a script file located within a subdirectory of modFiles.

- `character` : CharacterObject – The character to save data to/load data from.

### getObjectSaveData(targetObj : object) : object

`getObjectSaveData` returns the object containing the saved mod data for the given game object. The contents of the returned object *may* be serialised and saved when the game is saved. Attempting to call this function when a game is not loaded will throw an error. This function must be called from a script file located within a subdirectory of modFiles.

**This function must be used with caution.** While global save data accessed through `Executive.mods.saveData` and character save data accessed through `Executive.mods.getCharacterSaveData` will always save and load correctly, `getObjectSaveData` carries no such guarantee that the data will be saved/loaded – developers must verify themselves that the target object in question is saved and loaded by the game in full.

## ModObject

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