# Executive – Game API

The `Executive.game` API implements a range of functions to influence the current state of the loaded game. These include functions implementing functionality exposed by custom events (such as party identification shifts).

- [Executive – Game API](#executive--game-api)
  - [Properties](#properties)
    - [version : number](#version--number)
    - [loaded : boolean](#loaded--boolean)
    - [traits : Array\<string\>](#traits--arraystring)
    - [customTraits : Array\<string\>](#customtraits--arraystring)
    - [customPropositions : Array\<CustomProposition\>](#custompropositions--arraycustomproposition)
  - [Functions](#functions)
    - [triggerNextTurn() : void](#triggernextturn--void)
    - [changeStatewidePartyID(stateId : string, sourceParty : string, destParty : string, percentage : number) : void](#changestatewidepartyidstateid--string-sourceparty--string-destparty--string-percentage--number--void)
    - [createGeneralOfficeMessage(title : string, message : string, *character : CharacterObject*) : void](#creategeneralofficemessagetitle--string-message--string-character--characterobject--void)
    - [createCityNews(title : string, message : string, *character : CharacterObject*, *week : number*) : void](#createcitynewstitle--string-message--string-character--characterobject-week--number--void)
    - [createStateNews(title : string, message : string, *character : CharacterObject*, *week : number*) : void](#createstatenewstitle--string-message--string-character--characterobject-week--number--void)
    - [createNationalNews(title : string, message : string, *character : CharacterObject*, *week : number*) : void](#createnationalnewstitle--string-message--string-character--characterobject-week--number--void)
    - [registerTrait(traitName : string) : void](#registertraittraitname--string--void)
    - [registerProposition(propObject : CustomProposition, propLevel : string, startState : boolean)](#registerpropositionpropobject--customproposition-proplevel--string-startstate--boolean)


## Properties

### version : number

`version` contains the numeric version of The Political Process running.

### loaded : boolean

`loaded` represents whether the player is in a loaded instance of the game – meaning a saved game has been loaded or a new game has been started.

### traits : Array\<string\>

`traits` is an array containing every trait that can be added to a character through the customisation menu, including any custom traits added through Executive by modifications.

### customTraits : Array\<string\>

`customTraits` is an array containing every custom trait added to the game through Executive by modifications.

### customPropositions : Array\<CustomProposition\>

`customPropositions` is an array containing every custom legislation proposition registered through Executive by modifications.

## Functions

### triggerNextTurn() : void

`triggerNextTurn` moves to the next game turn when called in a loaded game, incrementing the week counter and triggering events as appropriate. This function will throw an error if called while no game is loaded.

### changeStatewidePartyID(stateId : string, sourceParty : string, destParty : string, percentage : number) : void

`changeStatewidePartyID` allows mods to adjust the proportion of the electorate in a given state who support a political party, moving support from one party or another. The function moves `percentage` support from `sourceParty` to `destParty` in the state identified by `stateId`. If there are not enough supporters of `sourceParty` in the state, the change will not occur. This function will throw an error if called while no game is loaded.

- `stateId` : string – The two-letter abbreviation of the target state. Can be upper-case or lower-case.
- `sourceParty` : string – The single-letter abbreviation of the targeted source party. Can be `D`, `R` or `I`.
- `destParty` : string – The single-letter abbreviation of the targeted destination party. Can be `D`, `R` or `I`.
- `percentage` : number – The percentage of the electorate who change party identification. Must be between `0` and `1`.

### createGeneralOfficeMessage(title : string, message : string, *character : CharacterObject*) : void

`createGeneralOfficeMessage` will create a message in the Summary tab of the game's Office pane. The created message will appear under the General Messages heading in the All pane, with the title and contents given by `title` and `message`. If `character` is passed, the message will also contain a portrait for the corresponding character. This function will throw an error if called while no game is loaded.

- `title` : string – The title of the message to be created.
- `message` : string – The contents of the message to be created.
- `character` : CharacterObject – *Optional.* The character to be used when adding a portrait to the message.

### createCityNews(title : string, message : string, *character : CharacterObject*, *week : number*) : void

`createCityNews` adds a new news item to the City tab of the game's News pane. The created message will have the title given by `title`, and contents equal to `message`. If `character` is passed, the object passed will be used to add a clickable portrait to the news item. If `week` is passed, the item will be dated with the given week number. This function will throw an error if called while no game is loaded.

- `title` : string – The title of the news item to be created.
- `message` : string – The contents of the news item to be created.
- `character` : CharacterObject – *Optional.* The character to be used when adding a portrait to the news item.
- `week` : number – *Optional.* The week number of the news item to be created.

### createStateNews(title : string, message : string, *character : CharacterObject*, *week : number*) : void

`createStateNews` adds a new news item to the State tab of the game's News pane. The created message will have the title given by `title`, and contents equal to `message`. If `character` is passed, the object passed will be used to add a clickable portrait to the news item. If `week` is passed, the item will be dated with the given week number. This function will throw an error if called while no game is loaded.

- `title` : string – The title of the news item to be created.
- `message` : string – The contents of the news item to be created.
- `character` : CharacterObject – *Optional.* The character to be used when adding a portrait to the news item.
- `week` : number – *Optional.* The week number of the news item to be created.

### createNationalNews(title : string, message : string, *character : CharacterObject*, *week : number*) : void

`createNationalNews` adds a new news item to the Nation tab of the game's News pane. The created message will have the title given by `title`, and contents equal to `message`. If `character` is passed, the object passed will be used to add a clickable portrait to the news item. If `week` is passed, the item will be dated with the given week number. This function will throw an error if called while no game is loaded.

- `title` : string – The title of the news item to be created.
- `message` : string – The contents of the news item to be created.
- `character` : CharacterObject – *Optional.* The character to be used when adding a portrait to the news item.
- `week` : number – *Optional.* The week number of the news item to be created.

### registerTrait(traitName : string) : void

`registerTrait` adds a trait with the name `traitName` to the game, allowing the player to add it to any character via the character customisation screen and in the triggers and effects of any custom event via the Custom Event Tool. These traits will not currently be picked when using the Randomize button or when the game randomly generates characters.

- `traitName` : string – The name of the trait to be added.

### registerProposition(propObject : CustomProposition, propLevel : string, startState : boolean)

`registerProposition` adds a custom legislation proposition as represented by `propObject` to the game, allowing the player to add it to any bills made at the government level represented by `propLevel`. These propositions will currently not be selected by the game when random bills by non-player characters are generated.

- `propObject` : CustomProposition – The proposition to be added to the game.
- `propLevel` : string – The level of government the proposition can be proposed at. Valid values are contained within [`Executive.enums.propositions.level`](./enums.md#level).
- `startState` : boolean – The starting state of the policy the proposition represents for every jurisdiction at the given level of government. *Ignored for propositions with type `Executive.enums.propositions.type.motion`.*