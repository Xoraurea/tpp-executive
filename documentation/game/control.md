# Control Functions

Various large functions control the macro state of the game.

## loadFunction(saveFile : string)

`loadFunction` is the function called by the Load File dialog to begin the process of loading a new game. It calls a number of other functions to load various parts of the save data.

### Arguments

- `saveFile` : string - Refers to the JSON save file to load game data from. Relative to the saveFiles subdirectory in the game's data folder.

### Child Calls

