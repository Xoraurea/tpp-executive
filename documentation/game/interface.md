# The Political Process – User Interface

## HTML DOM Elements

The game employs several internal functions which create HTML DOM elements corresponding with certain components of the user interface. This section documents those internal functions, along with the interfaces they create.

### addIntroMenu()

`addIntroMenu` is the function used by the game to generate the main menu. This is called during initialisation and while navigating back to the main menu after opening a sub-menu. It takes no arguments and has no return value, adding a `<div>` with the ID `introMainDiv` to the document body.

#### introMainDiv : <div>

- `mainIntroTitle` : `<div>` – The title at the top of the menu. Contains a single `<p>` tag.
- `mainIntroMenu` : `<div>` – The body of the menu. Contains a `<h2>` header, followed by a `<hr>` and several `<button>`s corresponding with menu actions.
- `mainIntroVersionP` : `<p>` – The version and copyright string in the bottom-right.

## Rendered Elements

The game renders several elements of the user interface through HTML canvases. This section documents the functions used to draw these custom UI elements.

### drawCandidate(character, canvas, type, arg3)

`drawCandidate` is used to render every character portrait seen in the various panes of the game. It takes four arguments.

- `character` : `object` – This is a standard CharacterArray.