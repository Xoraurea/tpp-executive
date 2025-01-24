# Executive – Data API

The `Executive.data` API provides various ways for mods to interact with the data structures used internally by The Political Process. The data API is split into three categories – `Executive.data.states` allows mods to access objects representing US states, `Executive.data.characters` allows for easier interaction with the arrays used to represent game characters and `Executive.data.politicians` implements methods and properties to access incumbent politicians at each tier of government.

- [Executive – Data API](#executive--data-api)
  - [Executive.data.states](#executivedatastates)
  - [Executive.data.characters](#executivedatacharacters)
    - [CharacterObject](#characterobject)
      - [CharacterObject Properties](#characterobject-properties)
    - [wrapCharacter(character : CharacterArray, type : string) : CharacterObject](#wrapcharactercharacter--characterarray-type--string--characterobject)
  - [Executive.data.politicians](#executivedatapoliticians)
    - [getStatePoliticians(state : object, *includeLocals : boolean*, *wrapped : boolean*) : Array\<CharacterObject\>](#getstatepoliticiansstate--object-includelocals--boolean-wrapped--boolean--arraycharacterobject)
    - [getStatewidePoliticians(state : object,  *wrapped : boolean*) : Array\<CharacterObject\>](#getstatewidepoliticiansstate--object--wrapped--boolean--arraycharacterobject)

## Executive.data.states

The `Executive.data.states` property contains each of the fifty states as objects. These may be accessed by their abbreviations in lower case – for example, `Executive.data.states.pa` returns the game's object representing Pennsylvania. In addition, every state object is contained within the `Executive.data.states.allStates` array. State objects contain upwards of a thousand uncategorised key-value pairs; as such, they are not documented as part of the Executive project. Mod developers seeking to interact with in-game states or the game's `nationStats`/`cityStats` objects are advised to use Developer Tools to search for relevant properties. Note that not every property can be simply written to for modification – some will reset at the start of the next in-game year.

## Executive.data.characters

The `Executive.data.characters` property contains three members: `Executive.data.characters.wrapCharacter`, `Executive.data.characters.player` and `Executive.data.characters.proteges`. `wrapCharacter` is a function to encapsulate the game's internal array representation of characters with an easier-indexed object representation. `player` may be accessed to get a CharacterObject representing the player's character, while `proteges` provides an array containing objects for each of the player character's protégés. Each protégé object has three child properties.

- `character` : CharacterObject – The wrapped object representing the protégé character.
- `nextElectionId` : string – The next election the character will participate in. Can be `president`, `usSenate`, `usHouse`, `governor`, `stateSenate`, `stateHouse`, `mayor`, `cityCouncil` and `schoolBoard`.
- `districtNumber` : number – The number of the district the character will run in. This is ignored for `president`, `usSenate`, `governor` and `mayor`.

Properties changed in the returned objects will carry through.

### CharacterObject

The Political Process describes every character in the game internally through some form of array; these are referred to in the documentation as CharacterArrays. As the indexes for relevant attributes are undocumented and difficult to reverse-engineer, Executive provides an enum (`Executive.enums.characterArray`) describing the index of given attributes for different character types and implements wrappers to access CharacterArrays as objects. These wrapper objects are referred to as CharacterObjects, and have properties derived from the `characterArray` enum. These properties are listed below, and are annotated with the character type they are available for. The game has at least three known principal character types.

- `candidate`, for characters which can seek office
- `staff`, for characters are active ingame but unable to do so
- `history`, for characters who were previously `candidates` but can no longer seek office

In most cases, mod developers should ignore the underlying array representation and use `Executive.data.characters.wrapCharacter` to access the character's properties. Modifying properties through a CharacterObject will update the corresponding value in the encapsulated CharacterArray. Some child properties of the `policyPositions` property are included within the extendedAttribs element of the CharacterArray, and are thus not included in the enum.

#### CharacterObject Properties

- `gender` (`candidate`/`staff`/`history`) : string – Describes the gender of the character. Can be either `M` or `F`.
- `age` (`candidate`/`staff`/`history`) : number – Describes the age of the character in years since birth.
- `ethnicity` (`candidate`/`staff`/`history`) : string – Describes the character's race/ethnicity.
- `firstName` (`candidate`/`staff`/`history`) : string – Contains the character's first name.
- `lastName` (`candidate`/`staff`/`history`) : string – Contains the character's first name.
- `caucusParty` (`candidate`/`history`) : string – Describes the party the character *caucuses/did caucus* with. Can only be `Democrat` or `Republican`.
- `partyInnerCaucus` (`candidate`/`history`) : string – Describes the in-party caucus the character is a member of. Can be `Progressive Democrats`, `Moderate Democratic Coalition`, `Conservative Democrats`, `Republican Conservative Committee`, `Moderate Republican Caucus` or `Libertarian Caucus`.
- `stateId` (`candidate`/`history`) : string – The upper-case abbrievated name of the character's home state.
- `jobHistory` (`candidate`/`history`) : Array\<object\> – An array of objects representing jobs held by the individual through their life. Each object has three child properties.
    - `title` : string – The human-readable description of the role.
    - `start` : number – The starting year of the role.
    - `end` : number – The final year of the role.
- `jobs` (`candidate`) : object – An object representing jobs currently held by the character with three child properties; `job1`, `job2` and `job3`. Each property contains an object with five child properties.
    - `title` : string – The human-readable description of the role.
    - `responsibilities` : string – The human-readable description of the role's responsibilities.
    - `id` : string – The internal ID for the role.
    - `hours` : number – The number of office hours the role's holder has each turn.
    - `salary` : number – The USD salary received by the role's holder over the course of an in-game year.
- `politicalPoints` (`candidate`) : number – The total political points the character holds.
- `campaignFunds` (`candidate`) : number – The character's current campaign funds.
- `nameRecognition` (`candidate`) : number – The number of individuals currently aware of the character.
- `candidateId` (`candidate`) : number – The ID used internally to refer to and search for a candidate standing for election.
- `policyPositions` (`candidate`) : object – Contains properties describing the character's positions on various policies.
    - `minWage` : boolean – `true` if the character supports increasing the minimum wage.
    - `govAid` : boolean – `true` if the character supports providing government aid to the poor.
    - `basicIncome` : boolean – `true` if the character supports a universal basic income.
    - `lowMain` : string – Represents the character's position on income tax rates for low-income individuals. Can be `Increase`, `Decrease` or `Maintain`.
    - `midMain` : string – Represents the character's position on income tax rates for middle-income individuals. Can be `Increase`, `Decrease` or `Maintain`.
    - `upperMain` : string – Represents the character's position on income tax rates for upper-income individuals. Can be `Increase`, `Decrease` or `Maintain`.
    - `ecoGrowth` : string – Represents the character's position on increased taxation and public expenditure versus lower taxation and spending cuts. Can be `Spend` or `Cut`.
    - `flatTax` : boolean – `true` if the character favours a flat tax over banded income tax.
    - `carbonTax` : boolean – `true` if the character supports a tax on carbon emissions produced by companies.
    - `wealthTax` : boolean – `true` if the character supports a higher rate of taxation for the wealthiest individuals.
    - `gunCheck` : boolean – `true` if the character supports universal background checks when buying guns.
    - `gunControl` : boolean – `true` if the character supports stronger gun control laws.
    - `banHighCap` : boolean – `true` if the character supports a ban on high-capacity clips and magazines for guns.
    - `assaultWeaponBan` : boolean – `true` if the character supports a ban on the sale of assault weapons.
    - `deadlyForce` : boolean – `true` if the character supports stand your ground/deadly force laws.
    - `handGunBan` : boolean – `true` if the character supports a ban on the sale of handguns.
    - `mentalGun` : boolean – `true` if the character supports banning the sale of guns to individuals with mental illnesses.
    - `gunData` : boolean – `true` if the character supports creating a federal database to track gun sales.
    - `concealCarry` : boolean – `true` if the character supports allowing concealed carry in more locations.
    - `teacherGuns` : boolean – `true` if the character supports allowing teachers/staff to carry guns in schools.
    - `decGunWait` : boolean – `true` if the character supports decreasing the required waiting period to purchase a gun.
    - `cCNoPermit` : boolean – `true` if the character supports legalizing concealed carry without a permit.
    - `commColl` : boolean – `true` if the character supports free community college tuition.
    - `preSchool` : boolean – `true` if the character supports universal preschool provision.
    - `teachPay` : boolean – `true` if the character supports increasing pay for public school teachers.
    - `schoolChoice` : boolean – `true` if the character supports the right for parents to use their child's designated public education funding to decide which public or private school they will attend.
    - `freeTuition` : boolean – `true` if the character supports free tuition for public colleges and universities.
    - `citPath` : boolean – `true` if the character supports a path to citizenship for undocumented immigrants.
    - `tightBorder` : boolean – `true` if the character supports tightening security on the border between the United States and Mexico.
    - `childImm` : boolean – `true` if the character supports legal resident status for undocumented immigrants brought to the United States as children.
    - `expandVisas` : boolean – `true` if the character supports expanding the number of short-term visas granted to immigrants with skills required in the United States.
    - `denyCitizen` : boolean – `true` if the character supports the denial of birthright citizenship to children of undocumented immigrants born in the United States.
    - `labelGMO` : boolean – `true` if the character supports compulsory labelling of genetically-modified crops.
    - `fundScience` : boolean – `true` if the character supports increasing funding for science.
    - `deathPenalty` : boolean – `true` if the character supports the *abolition* of the death penalty.
    - `electoralColl` : boolean – `true` if the character supports *abolishing* the Electoral College.
    - `laborUnion` : boolean – `true` if the character supports labor unions.
    - `incGap` : boolean – `true` if the character supports reducing income inequality between rich and poor individuals.
    - `gayMarriage` : boolean – `true` if the character supports legalization of gay marriage.
    - `marBenefit` : boolean – `true` if the character supports same-sex couples receiving the same legal benefits from marriage as heterosexual couples.
    - `recUse` : boolean – `true` if the character supports legalization of cannabis for recreational use.
    - `illegalAbortion` : boolean – `true` if the character supports banning all abortions.
    - `proChoice` : boolean – `true` if the character supports a woman's right to choose to have an abortion.
    - `pregClinic` : boolean – `true` if the character supports defunding reproductive health programs which offer abortions.
    - `cutStamps` : boolean – `true` if the character supports cutting food stamps to reduce the federal budget deficit.
    - `socSecValue` : boolean – `true` if the character supports the federal Social Security program.
    - `transMilServ` : boolean – `true` if the character supports allowing transgender individuals to serve in the military.
    - `moreSolar` : string – Represents the emphasis the character believes should be placed on increasing production of solar energy. Can be `More`, `Less` or `Same`.
    - `moreWind` : string – Represents the emphasis the character believes should be placed on increasing production of wind energy. Can be `More`, `Less` or `Same`.
    - `moreGas` : string – Represents the emphasis the character believes should be placed on increasing production of natural gas energy. Can be `More`, `Less` or `Same`.
    - `moreOil` : string – Represents the emphasis the character believes should be placed on increasing production of oil energy. Can be `More`, `Less` or `Same`.
    - `moreNuclear` : string – Represents the emphasis the character believes should be placed on increasing production of nuclear energy. Can be `More`, `Less` or `Same`.
    - `moreCoal` : string – Represents the emphasis the character believes should be placed on increasing production of coal energy. Can be `More`, `Less` or `Same`.
    - `envGrowth` : string – Represents the character's position on whether environmental protection or economic growth should be prioritised in policy-making. Can be `Env` or `Growth`.
    - `globalWHuman` : string – Represents the character's opinion on global warming and its primary cause. Can be `Human`, `Nature` or `Does Not Exist`.
    - `limitPow` : boolean – `true` if the character supports limiting the amount of greenhouse gases emitted by power plants.
    - `climatePol` : boolean – `true` if the character supports policies to curb global climate change.
    - `conEm` : boolean – `true` if the character supports mandatory controls on emissions of carbon dioxide and other greenhouse gases.
    - `solWind` : boolean – `true` if the character supports increased expenditure on the development of solar and wind technologies.
    - `altFuel` : boolean – `true` if the character supports federal expenditure on developing alternative fuel sources for automobiles.
    - `oilLand` : boolean – `true` if the character supports the use of land owned by the federal government for oil exploration.
    - `autoStand` : boolean – `true` if the character supports increasing emission standards for automobiles.
    - `reduceEm` : boolean – `true` if the character supports policies to reduce US carbon emissions.
    - `greenNewDeal` : boolean – `true` if the character supports a Green New Deal, a proposal to mitigate global warming by investing in renewable energy and energy-efficient infrastructure.
    - `redFossilFuel` : boolean – `true` if the character supports reducing the use of fossil fuels.
    - `mainMil` : string – Represents the character's position on changes to military expenditure. Can be `Increase`, `Decrease` or `Maintain`.
    - `uniHealth` : boolean – `true` if the character supports a universal healthcare system.
    - `expandMedicaid` : boolean – `true` if the character supports expanding the Medicaid program to cover more individuals on low wages.
    - `singlePay` : boolean – `true` if the character supports a single-payer healthcare system.
    - `publicOption` : boolean – `true` if the character supports individuals having the option to opt-in to a public healthcare program.
    - `regDrugPrice` : boolean – `true` if the character supports regulating prescription drug prices.
    - `buyMedicare` : boolean – `true` if the character supports allowing those between the ages of 50 and 64 to purchase Medicare coverage.
    - `denyPreexist` : boolean – `true` if the character supports prohibiting health insurance companies from denying coverage to individuals with pre-existing conditions.
    - `denyPregCov` : boolean – `true` if the character supports prohibiting health insurance companies from denying coverage to individuals who are pregnant.
    - `sickPremium` : boolean – `true` if the character supports prohibiting health insurance companies from charging sick individuals higher premiums than healthy individuals.
    - `prevServCov` : boolean – `true` if the character supports requiring health insurance companies to cover the costs of most preventative services.
    - `limitHealCov` : boolean – `true` if the character supports prohibiting health insurance companies from limiting healthcare coverage provided over an individual's lifetime.
- `extendedAttribs` (`candidate`/`history`/`staff`) : object – An object containing various additional properties for the character.
    - `hairAge` (`candidate`/`history`/`staff`) : boolean – Describes whether the character's hair goes gray as they age.
    - `nE` (`candidate`/`history`) : Array – Contains objects representing notable events in the character's history. Each object has three child properties.
        - `msg` : string – A human-readable description of the event.
        - `y` : number – The year the event occurred in.
        - `w` : number – The number of the week the event happened on.
    - `appr` (`candidate`/`history`) : object – Contains `d`, `r` and `i` properties. Each property contains an object with two child properties.
        - `b` : number – The percentage approval rating amongst the given group of voters within `[0, 100]`.
        - `t` : number – Unknown.
    - `party` (`candidate`/`history`) : string – The party the character is a member of. Can be `Democrat`, `Republican` or `Independent`.
- `characterArray` (`candidate`/`history`/`staff`) : CharacterArray – The underlying CharacterArray represented by the CharacterObject wrapper.
- `characterType` (`candidate`/`history`/`staff`) : string – The type of the character represented by the CharacterObject. Can be `candidate`, `history` or `staff`.

### wrapCharacter(character : CharacterArray, type : string) : CharacterObject

`wrapCharacter` takes an instance of the game's internal CharacterArray form used to represent player and non-player characters in the game and wraps it as an easily accessible CharacterObject. As the length of CharacterArrays and the positions of properties within them vary depending on the type of character, the `type` parameter tells Executive what type character is represented by the CharacterArray.

- `character` : CharacterArray – The game's array representing the given character.
- `type` : string – The type of the character represented by the array. Can be `candidate`, `history` or `staff`.

## Executive.data.politicians

The `Executive.data.politicians` object contains various properties to access incumbent politicians at each tier of government within the currently loaded game. For convenience, `getStatePoliticians` and `getStatewidePoliticians` are functions provided to get an array of elected politicians within a given state.

- `president` : CharacterObject – The incumbent President of the United States.
- `vicePresident` : CharacterObject – The incumbent Vice President of the United States.
- `governors` : object – An object with child properties containing the incumbent governor as a CharacterObject for each of the fifty states. May be indexed with lower-case state abbreviations. (e.g. `Executive.data.politicians.governors.ca`)
- `usSenate` : object – An object with properties containing state objects with CharacterObjects for each US Senator. May be indexed with lower-case state abbreviations. (e.g. `Executive.data.politicians.usSenate.pa`) Each object contains two properties.
    - `senior` : CharacterObject – The senior US Senator from the state represented by the object.
    - `junior` : CharacterObject – The junior US Senator from the state represented by the object.
- `usHouse` : object – An object with properties containing ordered arrays of CharacterObjects representing every state's US House of Representatives delegation. May be indexed with lower-case state abbreviations. (e.g. `Executive.data.politicians.usHouse.ct`)
- `localGovernor` : CharacterObject – The incumbent governor in the player character's home state.
- `localStateSenate` : Array\<CharacterObject\> – An ordered array of characters in the state Senate in the player character's home state.
- `localStateHouse` : Array\<CharacterObject\> – An ordered array of characters in the state House in the player character's home state.
- `localMayor` : CharacterObject – The incumbent mayor in the player character's home city.
- `localCityCouncil` : Array\<CharacterObject\> – An ordered array of characters in the City Council in the player character's home city.
- `localSchoolBoard` : Array\<CharacterObject\> – An ordered array of characters in the School Board in the player character's home city.

### getStatePoliticians(state : object, *includeLocals : boolean*, *wrapped : boolean*) : Array\<CharacterObject\>

`getStatePoliticians` gets every incumbent elected politician within a given state. The function returns an array of wrapped CharacterObjects corresponding to the desired politicians.

- `state` : object – An instance of the game's state objects.
- `includeLocals` : boolean – *Optional.* Determines whether politicians from the state House and Senate are included when `state` refers to the player's home state. Default is `true`.
- `wrapped` : boolean – *Optional.* Determines whether the objects returned are wrapped as CharacterObjects or are left as CharacterArrays. Default is `true`.

### getStatewidePoliticians(state : object,  *wrapped : boolean*) : Array\<CharacterObject\>

`getStatewidePoliticians` gets every statewide incumbent elected politician within a given state. The function returns an array of wrapped CharacterObjects corresponding to the desired politicians.

- `state` : object – An instance of the game's state objects.
- `wrapped` : boolean – *Optional.* Determines whether the objects returned are wrapped as CharacterObjects or are left as CharacterArrays. Default is `true`.