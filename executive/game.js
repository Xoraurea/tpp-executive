/* tpp-executive - executive/game.js 
   Implements helper functions to influence the current game state */

const { updateTooltip } = require("../modFiles/better-maps/tooltip");

{
    const game = {};

    /* Move percentage support from sourceParty to destParty. */
    game.changeStatewidePartyID = (stateId, sourceParty, destParty, percentage) => {
        if(!game.loaded) throw new Error("Not in a loaded game");

        const dummyEvent = {
            district: "state",
            districtID: stateId.toUpperCase(),
            effectOccur: "always",
            effectType: "single",
            fromParty: sourceParty,
            toParty: destParty,
            type: "upPartyDem",
            value: percentage
        };

        runEventEffects(dummyEvent, []);
    };

    /* Trigger the next game turn. */
    game.triggerNextTurn = () => {
        if(!game.loaded) throw new Error("Not in a loaded game");
        runNextTurn();
    };

    const createNewsItem = (title, message, character, week) => {
        if(character && (character.characterType === undefined)) throw new Error("Expecting wrapped CharacterObject, got array");

        const newsItem = {
            title,
            news: message,
            portrait: character.characterArray,
            week
        };

        if(character === undefined || character === null){
            newsItem.portrait = "none";
        }

        if(week === undefined || week === null){
            newsItem.week = weekNum;
        }

        return newsItem;
    }

    game.createCityNews = (title, message, character, week) => {
        if(!game.loaded) throw new Error("Not in a loaded game");
        cityNews.unshift(createNewsItem(title, message, character, week));
    };

    game.createStateNews = (title, message, character, week) => {
        if(!game.loaded) throw new Error("Not in a loaded game");
        stateNews.unshift(createNewsItem(title, message, character, week));
    };

    game.createNationalNews = (title, message, character, week) => {
        if(!game.loaded) throw new Error("Not in a loaded game");
        nationNews.unshift(createNewsItem(title, message, character, week));
    };

    game.createGeneralOfficeMessage = (title, message, character) => {
        if(!game.loaded) throw new Error("Not in a loaded game");
        if(character && (character.characterType === undefined)) throw new Error("Expecting wrapped CharacterObject, got array");

        const msgObject = {
            cat: "event",
            msg: message,
            old: false,
            portType: "none",
            title,
            val: false
        };

        if(character){
            msgObject.portIcon = false;
            msgObject.portType = character.characterType;
            msgObject.portrait = character.characterArray;
        }

        playerMsgEvent.push(msgObject);

        if(openPage === "office" && openOfficePage1 === "summary") officeSummary();
        updateIconInfo();
    };

    /* We want to expose a property so mod developers are aware of whether the player is in a loaded
       game. This is actually very simple to implement – as exiting to the main menu prompts an entire
       reload of the game for some reason, we just need to set true whenever a save is loaded. */
    let gameLoaded = false;

    Executive.functions.registerPostHook("loadFunction", () => {
        gameLoaded = true;
    });

    Object.defineProperty(game, "loaded", {
        get: () => {
            return gameLoaded;
        }
    });

    module.exports = game;

    /* We want to allow mods to register new traits which'll appear in the character customisation
       menu. We need to maintain a list of traits for this. */
    const defaultTraits = ["Amusing", "Angry", "Arrogant", "Authoritarian", "Charismatic", "Corrupt",
        "Dishonest", "Dramatic", "Empathetic", "Ethical", "Foolish", "Friendly", "Happy", "Humble",
        "Incompetent", "Intelligent", "Irrational", "Logical", "Mean", "Narcissistic", "Odd",
        "Optimistic", "Pessimistic", "Religious", "Scandalous", "Simple", "Wise"];

    const customTraits = [];

    game.registerTrait = (traitName) => {
        customTraits.push(traitName);
    };

    Object.defineProperty(game, "traits", {
        get: () => {
            return defaultTraits.concat(customTraits);
        }
    });

    Object.defineProperty(game, "customTraits", {
        get: () => {
            return customTraits.slice();
        }
    });

    /* Now the slightly harder bit, where we have to hook the creation of the trait tab in
       the customisation screen. We won't overwrite the randomisation button yet, as this
       weirdly uses lots of traits which don't actually do anything and aren't accessible. */
    Executive.functions.registerPostHook("customCTraits", (args) => {
        /* The character array is the first argument to the function. We'll use the undocumented
           API feature to wrap a character without specifying a type, as the arguments don't give
           us the same type of character type as other game functions do. */
        const character = Executive.data.characters.wrapCharacter(args[0]);
        const addTraitsBtn = document.getElementById("charNewHistB");

        let traitTimeout = null;
        const traitCallback = () => {
            const newTraitDiv = document.getElementById("charNewTraitDiv");
            if(!newTraitDiv) return;

            customTraits.forEach((custTrait) => {
                const traitButton = document.createElement("button");

                traitButton.setAttribute("class", "charNewTraitB");
                traitButton.textContent = custTrait;

                traitButton.onclick = () => {
                    playClick();
                    character.traits.push(custTrait);

                    /* We have to update the UI. */
                    newTraitDiv.parentElement.parentElement.remove();
                    customCTraits(...args)
                };

                newTraitDiv.appendChild(traitButton);
            });
        };

        addTraitsBtn.addEventListener("click", () => {
            /* To make sure the other listener on the button has finished, we'll add a timeout. */
            if(traitTimeout) clearTimeout(traitTimeout);
            timeout = setTimeout(traitCallback);
        });
    });
};