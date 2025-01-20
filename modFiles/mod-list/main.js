/* Mod List – mod-list/main.js
   The main body of the Mod List mod to be loaded first by Executive. */

/* Wrapping everything here in a block is good practice to avoid exposing arbitrary
   globals to other loaded mods. */
{
    const mod = {};

    const createModListItem = (mod) => {
        /* Create an item in the mod list for each mod. */
        const itemDiv = document.createElement("div");
        itemDiv.setAttribute("class", "modListItem");

        const headerDiv = document.createElement("div");
        headerDiv.setAttribute("class", "modListItemHeader");
        itemDiv.appendChild(headerDiv);

        /* Now fill the header. */
        const titleSpan = document.createElement("span");
        titleSpan.setAttribute("class", "modListItemTitle");
        titleSpan.textContent = mod.name;
        headerDiv.appendChild(titleSpan);

        const idVersionSpan = document.createElement("span");
        idVersionSpan.setAttribute("class", "modListVersionId");
        idVersionSpan.textContent = "(" + mod.id + ") (" + mod.version.string + ")";
        headerDiv.appendChild(idVersionSpan);

        /* Now the description and author(s). */
        const authorDiv = document.createElement("div");
        authorDiv.setAttribute("class", "modListItemAuthor");
        authorDiv.textContent = "Created by " + mod.author;
        itemDiv.appendChild(authorDiv);

        const descDiv = document.createElement("div");
        descDiv.setAttribute("class", "modListItemDesc");
        descDiv.textContent = mod.description;
        itemDiv.appendChild(descDiv);

        return itemDiv;
    };

    mod.addModList = () => {
        /* Create the mod list elements. */
        const backDiv = document.createElement("div");
        backDiv.setAttribute("id", "modBackDiv");
        document.body.appendChild(backDiv);

        const mainDiv = document.createElement("div");
        mainDiv.setAttribute("id", "modMainDiv");
        backDiv.appendChild(mainDiv);

        const titleHeader = document.createElement("h2");
        titleHeader.textContent = "Active Mods";
        mainDiv.appendChild(titleHeader);
        mainDiv.appendChild(document.createElement("hr"));

        const closeButton = document.createElement("button");
        closeButton.setAttribute("class", "modListClose");
        closeButton.textContent = "X";

        closeButton.onclick = () => {
            playClick();
            backDiv.remove();
        };

        mainDiv.appendChild(closeButton);

        /* Create the list itself. */
        const listDiv = document.createElement("div");
        listDiv.setAttribute("id", "modListDiv");
        mainDiv.appendChild(listDiv);
        
        /* Now we iterate through the mods. */
        Executive.mods.loaded.forEach(modObject => {
            listDiv.appendChild(createModListItem(modObject));
        });
    };

    mod.init = () => {
        /* Add the Mods button to the menu. */
        Executive.functions.registerPostHook("addIntroMenu", () => {
            const modButton = document.createElement("button");

            modButton.textContent = "Mods";
            modButton.onclick = playClick;
            modButton.addEventListener("click", mod.addModList);

            document.getElementById("mainIntroMenu").appendChild(modButton);
        });

        /* Add the stylesheets for UI components. */
        Executive.styles.registerStyle("styles/general.css");
        Executive.styles.registerThemeAwareStyle("styles/light.css", "styles/dark.css");
    };

    module.exports = mod;
}