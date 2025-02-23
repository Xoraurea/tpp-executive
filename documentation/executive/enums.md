# Executive – Enums

Executive defines several enums for use with game data structures and the Executive API.

- [Executive – Enums](#executive--enums)
  - [Executive.enums.characters](#executiveenumscharacters)
    - [ideology](#ideology)
    - [ideologyType](#ideologytype)
  - [Executive.enums.propositions](#executiveenumspropositions)
    - [type](#type)
    - [category](#category)
    - [level](#level)
  - [Internal Enums](#internal-enums)

## Executive.enums.characters

### ideology

- `veryConservative` – The character has a Very Conservative ideology for the given category.
- `conservative` – The character has a Conservative ideology for the given category.
- `libertarian` – The character has a Libertarian ideology for the given category.
- `moderate` – The character has a Moderate ideology for the given category.
- `liberal` – The character has a Liberal ideology for the given category.
- `veryLiberal` – The character has a Very Liberal ideology for the given category.

### ideologyType

- `fiscal` – The character's fiscal ideology.
- `social` – The character's social ideology.

## Executive.enums.propositions

### type

- `trueFalse` – A policy which can either be true or false (e.g. in force or not in force).
- `motion` – A motion which does not change the set of currently enacted policies if passed.

### category

- `crime` – The Crime category in the legislation creation tool.
- `education` – The Education category in the legislation creation tool.
- `elections` – The Elections category in the legislation creation tool.
- `environment` – The Environment category in the legislation creation tool.
- `guns` – The Guns category in the legislation creation tool.
- `health` – The Health category in the legislation creation tool.
- `immigration` – The Immigration category in the legislation creation tool.
- `miscellaneous` – The Miscellaneous category in the legislation creation tool.
- `poverty` – The Poverty category in the legislation creation tool.
- `socialSecurity` – The Social Security category in the legislation creation tool.
- `taxes` – The Taxes category in the legislation creation tool.
- `veterans` – The Veterans category in the legislation creation tool.
- `senateRules` – The Senate Rules category in the legislation creation tool.

### level

- `school` – The school board level of government.
- `city` – The city council/mayoral level of government.
- `state` – The statewide level of government.
- `national` – The national/federal level of government.

## Internal Enums

Executive has two enums which exist largely for internal use. One, `characterArray`, contains child objects corresponding to each type of in-game character, with each child object containing properties representing the index in a CharacterArray for the relevant character property. The other, `characterLength`, defines expected array lengths for characters of a certain type for automatic character type classification. These are not intended for use by modifications and are not detailed here.