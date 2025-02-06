/* tpp-executive - executive/game.js 
   Implements helper functions to influence the current game state */

const { updateTooltip } = require("../modFiles/better-maps/tooltip");
const { CustomProposition } = require("./game/propositions.js");

{
    const game = {
        version: version
    };

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

    const setLoaded = () => {
        gameLoaded = true;
    };

    Executive.functions.createRawPostHook("loadFunction", setLoaded);
    Executive.functions.createRawPostHook("startGameCalc", setLoaded);

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
    Executive.functions.createRawPostHook("customCTraits", (args) => {
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

    /* We also need to add custom traits to the Custom Event Tool. */
    Executive.functions.createRawPostHook("createCustomEvents", (args) => {
        const currentEvent = args[0];
        const editToolsDiv = document.getElementById("custEvEditTools");

        /* Because the custom event creator's organisation is silly, we have to go to lengths
           to actually modify it properly. */
        let currentIndexType = "";
        let currentIndex = 0;
        for(let elementIndex = 0; elementIndex < editToolsDiv.children.length; elementIndex++){
            const currentElem = editToolsDiv.children[elementIndex];

            if(currentElem.tagName === "H2"){
                currentIndexType = currentElem.textContent;
                currentIndex = 0;
            } else if(currentElem.tagName === "DIV" && currentElem.className === "custEvSubDivB"){
                /* We've found either a trigger or an effect. */
                if(currentIndexType === "Event Triggers"){
                    /* Now check whether it's a trait-related trigger. */
                    const targetTrigger = currentEvent.eventTrig[currentIndex];
                    if(targetTrigger.type === "playerTrait" || targetTrigger.type === "playerNotTrait"){
                        /* Add our buttons! */
                        const buttonContainer = currentElem.getElementsByClassName("custEvSubDiv2")[0];

                        customTraits.forEach(traitName => {
                            let isEnabled = targetTrigger.traits.includes(traitName);

                            const traitToggleButton = document.createElement("button");
                            traitToggleButton.setAttribute("class", 
                                (isEnabled) ? "custEvBActive" : "custEvBInactive");
                            traitToggleButton.textContent = traitName;

                            traitToggleButton.onclick = () => {
                                playClick();

                                isEnabled = !isEnabled;

                                if(isEnabled) targetTrigger.traits.push(traitName);
                                if(!isEnabled) targetTrigger.traits.splice(targetTrigger.traits.indexOf(traitName), 1);

                                traitToggleButton.setAttribute("class", 
                                    (isEnabled) ? "custEvBActive" : "custEvBInactive");
                            };

                            buttonContainer.appendChild(traitToggleButton);
                        });
                    } else if(targetTrigger.type === "targetChar"){
                        /* The big 'evaluate character' trigger has more to deal with. We have to
                           handle the case for traits and not having traits. */
                        const applicableChildren = currentElem.getElementsByClassName("custEvSubDiv2");
                        for(let currentChildIndex = 0; currentChildIndex < applicableChildren.length; currentChildIndex++){
                            const currentChild = applicableChildren[currentChildIndex];
                            const currentChildHeader = currentChild.getElementsByTagName("h4")[0];

                            if(currentChildHeader &&
                                (currentChildHeader.textContent === "Character Traits"
                                || currentChildHeader.textContent === "Character Does Not Have Traits")){
                                /* We've found an applicable segment. */
                                const doesHave = (currentChildHeader.textContent === "Character Traits");

                                /* Get the next header so that we add our new buttons in before it. */
                                const bottomHeader = currentChild.getElementsByTagName("h4")[1];
                                const enabledCheckbox = currentChild.getElementsByTagName("input")[0];

                                const buttonArray = [];

                                customTraits.forEach(traitName => {
                                    const targetArray = (doesHave) ? targetTrigger.traits : targetTrigger.notTraits;
                                    let isEnabled = targetArray.includes(traitName);
        
                                    const traitToggleButton = document.createElement("button");
                                    traitToggleButton.setAttribute("class", 
                                        (isEnabled) ? "custEvBActive" : "custEvBInactive");
                                    traitToggleButton.setAttribute("style",
                                        (enabledCheckbox.checked) ? "display: block;" : "display: none;");
                                    traitToggleButton.textContent = traitName;
        
                                    traitToggleButton.onclick = () => {
                                        playClick();
        
                                        isEnabled = !isEnabled;
        
                                        if(isEnabled) targetArray.push(traitName);
                                        if(!isEnabled) targetArray.splice(targetTrigger.traits.indexOf(traitName), 1);
        
                                        traitToggleButton.setAttribute("class", 
                                            (isEnabled) ? "custEvBActive" : "custEvBInactive");
                                    };
                                    
                                    buttonArray.push(traitToggleButton);
                                    currentChild.insertBefore(traitToggleButton, bottomHeader);
                                });

                                /* We need to show/hide the buttons whenever the checkbox is toggled. */
                                enabledCheckbox.addEventListener("click", () => {
                                    const newStyle = (enabledCheckbox.checked) ? "display: block;" : "display: none;";
                                    buttonArray.forEach(btn => btn.setAttribute("style", newStyle));
                                });
                            }
                        }
                    }
                } else if(currentIndexType === "Event Effects"){
                    /* Now check whether it's a trait-related effect. */
                    const targetEffect = currentEvent.effects[currentIndex];
                    if(targetEffect.type === "addPlayerTrait" || targetEffect.type === "removePlayerTrait"
                        || targetEffect.type === "addTraitVars" || targetEffect.type === "removeTraitVars"){
                        /* Add our buttons! */
                        const buttonContainer = currentElem.getElementsByClassName("custEvSubDiv2")[0];

                        customTraits.forEach(traitName => {
                            let isEnabled = targetEffect.traits.includes(traitName);

                            const traitToggleButton = document.createElement("button");
                            traitToggleButton.setAttribute("class", 
                                (isEnabled) ? "custEvBActive" : "custEvBInactive");
                            traitToggleButton.textContent = traitName;

                            traitToggleButton.onclick = () => {
                                playClick();

                                isEnabled = !isEnabled;

                                if(isEnabled) targetEffect.traits.push(traitName);
                                if(!isEnabled) targetEffect.traits.splice(targetEffect.traits.indexOf(traitName), 1);

                                traitToggleButton.setAttribute("class", 
                                    (isEnabled) ? "custEvBActive" : "custEvBInactive");
                            };

                            buttonContainer.appendChild(traitToggleButton);
                        });
                    }
                }
                currentIndex++;
            }
        }
    });

    /* We want to allow mods to define custom propositions for laws. */
    game.CustomProposition = CustomProposition;
    game.customPropositions = {};

    const propositionArrays = {
        city: [],
        state: [],
        nation: []
    };

    Object.keys(propositionArrays).forEach(propLevel => {
        Object.defineProperty(game.customPropositions, propLevel, {
            get: () => {
                const returnArray = [];
                propositionArrays[propLevel].forEach(custProp => {
                    returnArray.push(Object.assign({}, custProp));
                });
                return returnArray;
            }
        });
    });

    /* Support for propositions is not currently included due to breaking bugs. */
    /*game.registerProposition = (propObject, propLevel, startState) => {
        if(!(propObject instanceof CustomProposition)) throw new Error("Attempted to register non-CustomProposition as proposition");
        propositionArrays[propLevel].push(propObject);*/

        /* We also now need to add properties at the applicable government level for
           the proposition. */
        /*switch(propObject.type){
            case Executive.enums.propositions.type.trueFalse:
                if(propLevel === "nation"){
                    nationStats[propObject.id] = startState;
                } else if(propLevel === "state"){
                    Executive.data.states.allStates.forEach(stateObj => {
                        stateObj[propObject.id] = startState;
                    });
                } else if(propLevel === "city"){
                    cityStats[propObject.id] = startState;
                } else throw new Error("Undefined level of government for registered proposition");
                break;
            default:
                throw new Error("Unimplemented type of proposition registered");
                break;
        }
    }*/

    /* We need to map categories to buttons in the legislation editor. */
    const categoryButtonText = {
        "Crime": "Crime",
        "Education": "Education",
        "Elections": "Elect",
        "Environment": "Environment",
        "Guns": "Guns",
        "Health": "Health",
        "Immigration": "Immigration",
        "Miscellaneous": "Misc",
        "Poverty": "Poverty",
        "Social Security": "Social Security",
        "Taxes": "Tax",
        "Veterans": "Veteran",
        "Senate Rules": "senateRules"
    };

    let currentGovLevel = null;

    Executive.functions.createRawPreHook("complexBillMenu", (args) => {
        currentGovLevel = args[0].district;
    });

    /* We need to replace various functions the game uses relating to
       propositions. */
    const originalCheckAllowProposal = Executive.functions.getOriginalFunction("checkAllowProposal");
    Executive.functions.insertRawReplacement("checkAllowProposal", (propId, propObject) => {
        let propArray = propositionArrays[currentGovLevel];

        if(propArray){
            const targetProp = propArray.find(candProp => (candProp.id === propId));
            if(targetProp){
                return true;
            } else return originalCheckAllowProposal(propId, propObject);
        } else return originalCheckAllowProposal(propId, propObject);
    });

    const originalReturnPropDesc = Executive.functions.getOriginalFunction("returnPropDesc");
    Executive.functions.insertRawReplacement("returnPropDesc", (propId, propLevel) => {
        let propArray = null;

        /* TODO: Finish this! */
        switch(propLevel){
            case "usHouse":
                propArray = propositionArrays.nation
                break;
        }

        if(propArray){
            const targetProp = propArray.find(candProp => (candProp.id === propId));
            if(targetProp){
                return targetProp.description;
            } else return originalReturnPropDesc(propId, propLevel);
        } else return originalReturnPropDesc(propId, propLevel);
    });

    /* We need to hook the legislation creation menu to add custom laws.
       Hopefully there'll be a better way to do this in the future. */
    Executive.functions.createRawPostHook("complexBillMenu", (args) => {
        const lawObject = args[0];

        /* First, we don't have access to the actual array of added propositions.
           There's a hacky way to get around this – the game *does* pass this to
           the support analysis UI, so we just fake a click on the button that
           adds this and then immediately remove the added UI. */
        let hookId = null;

        /* We'll temporarily clear the playClick function so the player doesn't
           hear a click. */
        const oldPlayClick = playClick;
        playClick = () => {};

        hookId = Executive.functions.registerPostHook("billSupportMenu", (suppArgs) => {
            Executive.functions.deregisterPostHook("billSupportMenu", hookId);
            playClick = oldPlayClick;

            const supportDiv = document.getElementById("billSupMenuDiv");
            if(supportDiv) supportDiv.remove();

            /* Now we do our extra stuff. */
            const newPropArray = suppArgs[1];
            const addProposalButton = document.getElementById("compBillAddPropB");

            addProposalButton.addEventListener("click", () => {
                /* We can assume the UI is done being made now. */
                const proposalTypeButtons = document.getElementsByClassName("selBillPropCatB");

                for(let buttonIndex = 0; buttonIndex < proposalTypeButtons.length; buttonIndex++){
                    const typeButton = proposalTypeButtons[buttonIndex];
                    const targetCategory = categoryButtonText[typeButton.textContent];
                    if(targetCategory !== undefined){
                        typeButton.addEventListener("click", () => {
                            const containerDiv = document.getElementById("selBillPropInner");

                            /* Add options for every proposition added. */
                            const propositionArray = propositionArrays[lawObject.district];
                            propositionArray.forEach(custProp => {
                                if(custProp.category !== targetCategory) return;

                                const propDiv = document.createElement("div");
                                propDiv.setAttribute("class", "selBillPropDiv");
                                containerDiv.appendChild(propDiv);

                                /* Add the title proposition. */
                                const titleDiv = document.createElement("div")
                                titleDiv.setAttribute("class", "selBillPropTitleD");
                                propDiv.appendChild(titleDiv);

                                const titleH3 = document.createElement("h3");
                                titleH3.setAttribute("class", "selBillPropTitleH3");
                                titleH3.textContent = custProp.title;
                                titleDiv.appendChild(titleH3);

                                /* This is ugly and hacky. */
                                const isActive = eval(lawObject.district + "Stats")[custProp.id];

                                const activeH3 = document.createElement("h3");
                                activeH3.setAttribute("class", `selBillPropActH3${isActive ? "A" : "B"}`);
                                activeH3.textContent = (isActive ? "Active" : "Inactive");
                                titleDiv.appendChild(activeH3);

                                /* Add the description of the proposition. */
                                const descDiv = document.createElement("div");
                                descDiv.setAttribute("class", "selBillPropDescD");
                                propDiv.appendChild(descDiv);

                                const descParagraph = document.createElement("p");
                                descParagraph.setAttribute("class", "selBillPropDescP");
                                descDiv.appendChild(descParagraph);

                                const descriptionSpan = document.createElement("span");
                                descriptionSpan.setAttribute("style", "font-weight:bold");
                                descriptionSpan.textContent = "Description";
                                descParagraph.appendChild(descriptionSpan);

                                descParagraph.appendChild(document.createTextNode(`: ${custProp.description}`));
                                descParagraph.appendChild(document.createElement("br"));

                                const effectsSpan = document.createElement("span");
                                effectsSpan.setAttribute("style", "font-weight:bold");
                                effectsSpan.textContent = "Effects";
                                descParagraph.appendChild(effectsSpan);

                                descParagraph.appendChild(document.createTextNode(`: `));

                                /* Add the select button. */
                                const selectDiv = document.createElement("div");
                                selectDiv.setAttribute("class", "selBillPropSelD");
                                propDiv.appendChild(selectDiv);

                                const selectButton = document.createElement("button");
                                selectButton.setAttribute("class", "selBillPropSelB");
                                selectButton.textContent = "Select";
                                selectDiv.appendChild(selectButton);

                                selectButton.onclick = () => {
                                    /* This is the meat of the whole section. */
                                    playClick();

                                    const newPropElement = {
                                        cat: custProp.category,
                                        id: custProp.id,
                                        policy: isActive,
                                        title: custProp.title
                                    };

                                    newPropArray.push(newPropElement);
                                    document.getElementById("selBillPropMenu").remove();
                                };
                            });
                        });
                    }
                }
            });
        });

        const sidebarDiv = document.getElementById("compBillEffInfoD");
        const supportButton = sidebarDiv.getElementsByClassName("compBillEffB")[0];

        supportButton.click();
    });
};