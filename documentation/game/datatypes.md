# The Political Process - Game Datatypes

Several undocumented datatypes are used within the game to represent various concepts.

## CharacterArray

Every character within the game is described via some form of CharacterArray. As stated in the name, these are expressed as JavaScript arrays. As such, the semantics of each element within a CharacterArray are hard to ascertain via reverse engineering. In addition, the length of the array and the position of each value changes depending upon what type of character is being referenced. There are at least three known principal types.

- `candidate`, for characters which can seek office
- `staff`, for characters are active ingame but unable to do so
- `history`, for characters who were previously `candidates` but can no longer seek office

Almost every value's position in the CharacterArray is dependent upon the type of the object. As such, Executive defines enums in `Executive.enums.characterArray` for the use of mod developers which give the indexes of a desired character attribute. These enums are also used by Executive to wrap CharacterArrays into CharacterObjects, a more trivially accessible form. Property identifiers and their meanings are described within `documentation/executive/data.md`.