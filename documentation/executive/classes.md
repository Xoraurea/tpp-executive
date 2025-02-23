# Executive – Classes

Executive defines various classes for use by mods with API functions. These implement concepts such as custom propositions for player-proposed legislation.

- [Executive – Classes](#executive--classes)
  - [BindableEvent](#bindableevent)
    - [Properties](#properties)
      - [name : string](#name--string)
    - [Methods](#methods)
      - [new BindableEvent(eventName : string) : BindableEvent](#new-bindableeventeventname--string--bindableevent)
      - [fire(...) : void](#fire--void)
      - [registerListener(listener : function) : object](#registerlistenerlistener--function--object)
      - [deregisterListener(listener : function) : void](#deregisterlistenerlistener--function--void)
  - [CustomProposition](#customproposition)
    - [Properties](#properties-1)
      - [title : string](#title--string)
      - [description : string](#description--string)
      - [category : string](#category--string)
      - [effectSummaries : object](#effectsummaries--object)
      - [scoreModifiers : Array\<object\>](#scoremodifiers--arrayobject)
      - [onPassage : BindableEvent(*eventObj*, billProp : object, billObj : object)](#onpassage--bindableeventeventobj-billprop--object-billobj--object)
      - [onFailure : BindableEvent(*eventObj*, billProp : object, billObj : object)](#onfailure--bindableeventeventobj-billprop--object-billobj--object)
      - [onHouseSuccess : BindableEvent(*eventObj*, billProp : object, billObj : object)](#onhousesuccess--bindableeventeventobj-billprop--object-billobj--object)
      - [onSenateSuccess : BindableEvent(*eventObj*, billProp : object, billObj : object)](#onsenatesuccess--bindableeventeventobj-billprop--object-billobj--object)
    - [Methods](#methods-1)
      - [new CustomProposition(propositionId : string, type : number) : CustomProposition](#new-custompropositionpropositionid--string-type--number--customproposition)
      - [addPolicyScoreModifier(policy : string, targetValue : any, scoreImpact : number, matchedExplanation : string, *unmatchedExplanation : string*) : void](#addpolicyscoremodifierpolicy--string-targetvalue--any-scoreimpact--number-matchedexplanation--string-unmatchedexplanation--string--void)
      - [addIdeologyScoreModifier(ideologyType : string, targetValue : string, scoreImpact : number, matchedExplanation : string) : void](#addideologyscoremodifierideologytype--string-targetvalue--string-scoreimpact--number-matchedexplanation--string--void)
      - [addTraitScoreModifier(targetTrait : string, scoreImpact : number, matchedExplanation : string) : void](#addtraitscoremodifiertargettrait--string-scoreimpact--number-matchedexplanation--string--void)
      - [addCustomScoreModifier(resolverFunc : function) : void](#addcustomscoremodifierresolverfunc--function--void)

## BindableEvent

The `BindableEvent` class allows mods to register and deregister listeners for events produced by the game or by Executive. All registered event listeners are called when a function fires the event, passing along arguments provided by the function firing the event.

### Properties

#### name : string

`name` is a read-only property containing the human-readable name passed to the `BindableEvent` constructor at the object's creation.

### Methods

#### new BindableEvent(eventName : string) : BindableEvent

The constructor for `BindableEvent` takes a single argument, `eventName`. This is used both to identify the event when the event object is passed to listeners and for error logs.

#### fire(...) : void

`fire` calls every event listener registered. Event listeners are passed an object containing the event and a deregistration function as the first argument, followed by any other arguments passed by the caller of `fire`.

#### registerListener(listener : function) : object

`registerListener` registers a function, `listener`, as an event listener for the `BindableEvent`, allowing it to be called whenever a function calls `fire`. If a non-function is passed to `listener`, an error will be thrown.

- `listener` : function(eventObj : object, ...) – The function to act as an event listener.

The object returned by `registerListener` has one property.

- `deregister` : function() – Deregisters the event listener from the event.

`eventObj`, passed to `listener`, has two properties.

- `baseEvent` : BindableEvent – The event which signalled the event listener function.
- `deregister` : function() – Deregisters the event listener from the event.

#### deregisterListener(listener : function) : void

`deregisterListener` deregisters a registered event listener function, `listener`, meaning it will no longer be called whenever `fire` is called on the event. If an unregistered function is deregistered or a non-function is passed as `listener`, an error will be thrown.

- `listener` : function(eventObj : object, ...) – A registered event listener to be deregistered.

## CustomProposition

The `CustomProposition` class is used to define custom propositions to be added to pieces of legislation proposed by the player. After being registered with Executive, `CustomProposition`s appear in the game's legislation creation tool and may be voted upon and passed at each tier of government.

### Properties

#### title : string

`title` is a writable property containing the human-readable title given to the proposition to identify it in the game's user interface (e.g. "Electoral College" or "Supplemental Nutrition Assistance Program"). The default value is "Untitled Proposition".

#### description : string

`description` is a writable property containing the human-readable description of the policy that the custom proposition implements. The default value is "This is an untitled custom proposition.".

#### category : string

`category` is a writable property representing the category the custom proposition is placed within in the legislation creation interface. Valid values of `category` are contained within [`Executive.enums.propositions.category`](./enums.md#category); the default value is "Misc".

#### effectSummaries : object

`effectSummaries` is a read-only property containing an object used to create summaries for propositions within laws proposed by characters. The keys and values of the `effectSummaries` object are writable. If part of a bill sets the state of the custom proposition's policy, Executive will index this object with the new value of the policy to fetch a summary. For example, if a bill sets a proposition to `true`, Executive will read `effectSummaries[true]` to find a string containing a summary of the effects of that part of the bill.

If the custom proposition is of type `Executive.enums.propositions.type.motion`, `effectSummaries[true]` is the only value ever accessed by Executive.

#### scoreModifiers : Array\<object\>

`scoreModifiers` is a read-only property containing objects representing the bill support analysis score modifiers added via `addPolicyScoreModifier`, `addIdeologyScoreModifier`, `addTraitScoreModifier` and `addCustomScoreModifier`. Each type of modifier object has different properties.

#### onPassage : BindableEvent(*eventObj*, billProp : object, billObj : object)

`onPassage` is a `BindableEvent` fired by Executive whenever a bill containing the custom proposition passes the final threshold in its legislative journey to become law (e.g. being signed into law by the President on the federal level). The event ID is `ExecutiveOnPropPassage`.

Along with `eventObj`, event listeners for `onPassage` are passed `billProp` and `billObj`.

- `billProp` : object – The game's representation of the line item corresponding to the custom proposition. These objects have, at a minimum, four properties, along with other policy-specific properties.
  - `cat` : string – The proposition category, as contained within [`Executive.enums.propositions.category`](./enums.md#category).
  - `id` : string – The internal ID used to refer to the policy the proposition represents.
  - `policy` : boolean – The state proposed for the policy the proposition corresponds to; for boolean policies, `true` if the bill introduces the policy and `false` if it abolishes it. This is always `true` for line items based on custom propositions with type [`Executive.enums.propositions.type.motion`](./enums.md#type).
  - `title` : string – The human-readable title of the policy, equivalent to the `title` property of a `CustomProposition`.
- `billObj` : object – The game's representation of the overall bill.

#### onFailure : BindableEvent(*eventObj*, billProp : object, billObj : object)

`onFailure` is a `BindableEvent` fired by Executive whenever a bill containing the custom proposition is defeated at any point during its legislative journey. The event ID is `ExecutiveOnPropFailure`.

Along with `eventObj`, event listeners for `onFailure` are passed `billProp` and `billObj`.

- `billProp` : object – The game's representation of the line item corresponding to the custom proposition. These objects have, at a minimum, four properties, along with other policy-specific properties.
  - `cat` : string – The proposition category, as contained within [`Executive.enums.propositions.category`](./enums.md#category).
  - `id` : string – The internal ID used to refer to the policy the proposition represents.
  - `policy` : boolean – The state proposed for the policy the proposition corresponds to; for boolean policies, `true` if the bill introduces the policy and `false` if it abolishes it. This is always `true` for line items based on custom propositions with type [`Executive.enums.propositions.type.motion`](./enums.md#type).
  - `title` : string – The human-readable title of the policy, equivalent to the `title` property of a `CustomProposition`.
- `billObj` : object – The game's representation of the overall bill.

#### onHouseSuccess : BindableEvent(*eventObj*, billProp : object, billObj : object)

`onHouseSuccess` is a `BindableEvent` fired by Executive whenever a bill containing the custom proposition passes the lower house during its legislative journey. The event ID is `ExecutiveOnPropHouseSuccess`.

Along with `eventObj`, event listeners for `onHouseSuccess` are passed `billProp` and `billObj`.

- `billProp` : object – The game's representation of the line item corresponding to the custom proposition. These objects have, at a minimum, four properties, along with other policy-specific properties.
  - `cat` : string – The proposition category, as contained within [`Executive.enums.propositions.category`](./enums.md#category).
  - `id` : string – The internal ID used to refer to the policy the proposition represents.
  - `policy` : boolean – The state proposed for the policy the proposition corresponds to; for boolean policies, `true` if the bill introduces the policy and `false` if it abolishes it. This is always `true` for line items based on custom propositions with type [`Executive.enums.propositions.type.motion`](./enums.md#type).
  - `title` : string – The human-readable title of the policy, equivalent to the `title` property of a `CustomProposition`.
- `billObj` : object – The game's representation of the overall bill.

#### onSenateSuccess : BindableEvent(*eventObj*, billProp : object, billObj : object)

`onSenateSuccess` is a `BindableEvent` fired by Executive whenever a bill containing the custom proposition passes the upper house during its legislative journey. The event ID is `ExecutiveOnPropSenateSuccess`.

Along with `eventObj`, event listeners for `onHouseSuccess` are passed `billProp` and `billObj`.

- `billProp` : object – The game's representation of the line item corresponding to the custom proposition. These objects have, at a minimum, four properties, along with other policy-specific properties.
  - `cat` : string – The proposition category, as contained within [`Executive.enums.propositions.category`](./enums.md#category).
  - `id` : string – The internal ID used to refer to the policy the proposition represents.
  - `policy` : boolean – The state proposed for the policy the proposition corresponds to; for boolean policies, `true` if the bill introduces the policy and `false` if it abolishes it. This is always `true` for line items based on custom propositions with type [`Executive.enums.propositions.type.motion`](./enums.md#type).
  - `title` : string – The human-readable title of the policy, equivalent to the `title` property of a `CustomProposition`.
- `billObj` : object – The game's representation of the overall bill.

### Methods

#### new CustomProposition(propositionId : string, type : number) : CustomProposition

The constructor for `CustomProposition` takes two arguments, `propositionId` and `type`.

- `propositionId` : string – An internal ID to be used by Executive to store the state of the proposition policy at each level of government. To prevent conflicts with base game properties, Executive appends `_customLaw` to the end of `propositionId`'s value to determine the proposition's internal ID; mods seeking to use the ID should reference the `id` property for the true ID.
- `type` : number – Determines the properties of the proposition to be set when added to proposed bills. Valid values are contained within [`Executive.enums.propositions.type`](./enums.md#type).

#### addPolicyScoreModifier(policy : string, targetValue : any, scoreImpact : number, matchedExplanation : string, *unmatchedExplanation : string*) : void

`addPolicyScoreModifier` creates a policy position-based modifier which adjusts the support score any character has for a given bill containing the custom proposition. If a character holds the position specified by `targetValue` on the policy area represented by `policy`, and the bill sets the custom proposition's policy to `true` when it was `false` previously, their support score will be adjusted by `scoreImpact`, with `matchedExplanation` given as the explanation in the line items. If the bill sets the policy to `false` when it was `true` previously, the character's support score will be adjusted by `-scoreImpact`.

If the optional `unmatchedExplanation` argument is passed and `targetValue` is boolean, an inverse score modifier will also be added, equivalent to running `addPolicyScoreModifier(policy, !targetValue, -scoreImpact, unmatchedExplanation)`.

- `policy` : string – The policy area the score modifier targets. A value must be a valid index of [a `CharacterObject`'s `policyPositions` object](./data.md#characterobject-properties).
- `targetValue` : any – The required position for a character to hold on the given policy area. The type must match the policy area given.
- `scoreImpact` : number – The numerical score impact added to the overall bill score.
- `matchedExplanation` : string – The explanation given to the player in the score analysis interface for the score modifier when the character's opinion on the policy area matches the required value.
- `unmatchedExplanation` : string – *Optional.* The inverse explanation given to the player in the score analysis interface when the character's opinion on the policy area does *not* match the required value.

#### addIdeologyScoreModifier(ideologyType : string, targetValue : string, scoreImpact : number, matchedExplanation : string) : void

`addPolicyScoreModifier` creates an ideology-based modifier which adjusts the support score any character has for a given bill containing the custom proposition. If a character holds the ideology specified by `targetValue` for the ideology category represented by `ideologyType`, and the bill sets the custom proposition's policy to `true` when it was `false` previously, their support score will be adjusted by `scoreImpact`, with `matchedExplanation` given as the explanation in the line items. If the bill sets the policy to `false` when it was `true` previously, the character's support score will be adjusted by `-scoreImpact`.

- `ideologyType` : string – The type of ideology the score modifier targets. Valid values are contained within [`Executive.enums.characters.ideologyType`](./enums.md#ideologytype).
- `targetValue` : any – The required ideology for a character to represent on the given type of ideology. Valid values are contained within [`Executive.enums.characters.ideology`](./enums.md#ideology).
- `scoreImpact` : number – The numerical score impact added to the overall bill score.
- `matchedExplanation` : string – The explanation given to the player in the score analysis interface for the score modifier when the character's ideology in the necessary category matches the required value.

#### addTraitScoreModifier(targetTrait : string, scoreImpact : number, matchedExplanation : string) : void

`addTraitScoreModifier` creates a trait-based modifier which adjusts the support score any character has for a given bill containing the custom proposition. If a character has the trait specified by `targetTrait` and the bill sets the custom proposition's policy to `true` when it was `false` previously, their support score will be adjusted by `scoreImpact`, with `matchedExplanation` given as the explanation in the line items. If the bill sets the policy to `false` when it was `true` previously, the character's support score will be adjusted by `-scoreImpact`.

- `targetTrait` : string – The name of the trait required for the character to have.
- `scoreImpact` : number – The numerical score impact added to the overall bill score.
- `matchedExplanation` : string – The explanation given to the player in the score analysis interface for the score modifier when the character has the required trait.

#### addCustomScoreModifier(resolverFunc : function) : void

`addCustomScoreModifier` creates a dynamic modifier which adjusts the support score any character has for a given bill containing the custom proposition. When a bill contains the custom proposition, `resolverFunc` is called with three arguments; `character`, `billProp` and `billLevel`.

- `resolverFunc` : function(character, propObj, billLevel) – The function called to determine the score impact for a given character.
  - `character` : CharacterObject – The character to determine the score impact for.
  - `billProp` : object – The game's representation of the bill item containing the custom proposition. These objects have, at a minimum, four properties, along with other policy-specific properties.
    - `cat` : string – The proposition category, as contained within [`Executive.enums.propositions.category`](./enums.md#category).
    - `id` : string – The internal ID used to refer to the policy the proposition represents.
    - `policy` : boolean – The state proposed for the policy the proposition corresponds to; for boolean policies, `true` if the bill introduces the policy and `false` if it abolishes it. This is always `true` for line items based on custom propositions with type [`Executive.enums.propositions.type.motion`](./enums.md#type).
    - `title` : string – The human-readable title of the policy, equivalent to the `title` property of a `CustomProposition`.
  - `billLevel` : string – The level of government the bill has been proposed at. Valid values are contained within [`Executive.enums.propositions.level`](./enums.md#level).

`resolverFunc` must return either `null` (representing no impact) or an object with the following properties.

- `impact` : number – The impact that the bill item representing the custom proposition has on the bill score.
- `explanation` : string – An explanation for this impact to be given to the player in the score analysis interface.