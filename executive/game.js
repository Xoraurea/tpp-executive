/* tpp-executive - executive/game.js 
   Implements helper functions to influence the current game state */

const { updateTooltip } = require("../modFiles/better-maps/tooltip");

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
    game.onGameLoad = new Executive.classes.BindableEvent("ExecutiveOnGameLoad");
    let gameLoaded = false;

    const setLoaded = () => {
        gameLoaded = true;
        game.onGameLoad.fire();
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
    game.customPropositions = {};

    const propositionArrays = {
        school: [],
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

    game.registerProposition = (propObject, propLevel, startState) => {
        if(!(propObject instanceof Executive.classes.CustomProposition)) throw new Error("Attempted to register non-CustomProposition as proposition");
        if(propositionArrays[propLevel].find(candProp => (candProp.id === propObject.id))) throw new Error(`Attempted to register proposition with conflicting ID (${propObject.id})`)
        
        propObject.startState = startState;
        propositionArrays[propLevel].push(propObject);

        /* We also now need to add properties at the applicable government level for
           the proposition if the game is loaded. */
        if(gameLoaded){
            console.warn(`[Executive] Proposition ${propObject.id} was registered while a game is loaded. This is inadvisable; consider moving proposition registration to the init stage.`);
            switch(propObject.type){
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
        }
    };

    /* We now need to make sure that every proposition has its prerequisite
       property in the stats object for its level of government. */
    game.onGameLoad.registerListener(() => {
        Object.keys(propositionArrays).forEach(propLevel => {
            const targetArray = propositionArrays[propLevel];
            const targetStats = (propLevel === "school") ? schoolBoardStats : eval(`${propLevel}Stats`);

            targetArray.forEach(custProp => {
                if(targetStats[custProp.id] === undefined){
                    targetStats[custProp.id] = custProp.startState;
                }
            });
        });
    });

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
    Executive.functions.insertRawReplacement("checkAllowProposal", (propId, propObjects) => {
        let propArray = propositionArrays[currentGovLevel];

        if(propArray){
            const targetId = /*(propObject.executiveId !== undefined) ? propObject.executiveId :*/ propId;
            const targetProp = propArray.find(candProp => (candProp.id === targetId));
            if(targetProp){
                return true;
            } else if(propId === "stateAbortion") {
                /* We use stateAbortion as a dummy ID, so we need to catch real attempts to add
                   it and make sure they don't collide with our custom propositions. */
                return originalCheckAllowProposal(propId, propObjects.filter(propObj => (propObj.executiveId === undefined)));
            } else return originalCheckAllowProposal(propId, propObjects);
        } else return originalCheckAllowProposal(propId, propObjects);
    });

    const originalReturnPropDesc = Executive.functions.getOriginalFunction("returnPropDesc");
    Executive.functions.insertRawReplacement("returnPropDesc", (propId, propLevel) => {
        let propArray = null;

        /* TODO: Finish this! */
        switch(propLevel){
            case "usHouse", "usSenate":
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

    /* For now, we'll just ignore any custom propositions when the
       player looks at testimony. */
    const originalCalcComplexTestimony = Executive.functions.getOriginalFunction("calcComplexTestimony");
    Executive.functions.insertRawReplacement("calcComplexTestimony", (billObj, propArray) => {
        return originalCalcComplexTestimony(billObj, propArray.filter(propObj => (propArray.executiveId === undefined)));
    });

    /* Create the contents of the proposition widgets seen in the
       legislation menu. */
    const generatePropDivContents = (propDiv, propObj, custProp, propArray) => {
        /* Generate the title row. */
        const topDiv = document.createElement("div");
        topDiv.setAttribute("class", "propMainTopDiv");
        propDiv.appendChild(topDiv);

        const titleHeader = document.createElement("h2");
        titleHeader.setAttribute("class", "propMainH2");
        titleHeader.textContent = propObj.title;
        topDiv.appendChild(titleHeader);

        const removeButton = document.createElement("button");
        removeButton.setAttribute("class", "propMainXB");
        removeButton.textContent = "X";
        topDiv.appendChild(removeButton);

        removeButton.onclick = () => {
            playClick();
            propDiv.remove();
            propArray.splice(propArray.indexOf(propObj), 1);
        };

        const infoButton = document.createElement("button");
        infoButton.setAttribute("class", "propMainInfoB");
        infoButton.setAttribute("title", custProp.description);
        infoButton.textContent = "i";
        topDiv.appendChild(infoButton);

        infoButton.onclick = () => {
            playClick();
            alertFunc(custProp.description);
        };

        /* Generate the policy controls. */
        const innerDiv = document.createElement("div");
        innerDiv.setAttribute("class", "propMainInner");
        propDiv.appendChild(innerDiv);

        const statusDiv = document.createElement("div");
        statusDiv.setAttribute("class", "legisStatusDiv");
        innerDiv.appendChild(statusDiv);

        const trueButton = document.createElement("button");
        trueButton.setAttribute("class", `budgetTrue${propObj.policy ? "Active" : ""}`);
        trueButton.textContent = "True";
        statusDiv.appendChild(trueButton);

        const falseButton = document.createElement("button");
        falseButton.setAttribute("class", `budgetFalse${propObj.policy ? "" : "Active"}`);
        falseButton.textContent = "False";
        statusDiv.appendChild(falseButton);

        const genericStatusButtonClick = (newStatus) => () => {
            playClick();
            propObj.policy = newStatus;
            trueButton.setAttribute("class", `budgetTrue${propObj.policy ? "Active" : ""}`);
            falseButton.setAttribute("class", `budgetFalse${propObj.policy ? "" : "Active"}`);
        };

        trueButton.onclick = genericStatusButtonClick(true);
        falseButton.onclick = genericStatusButtonClick(false);
    };

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

        /* The function called to open the bill support UI varies depending on
           the level of government. */
        const supportMenuFunc = (lawObject.district === "state" || lawObject.district === "nation") ? "billSupportMenu"
            : "billSupportMenuLocal";

        hookId = Executive.functions.registerPostHook(supportMenuFunc, (suppArgs) => {
            Executive.functions.deregisterPostHook(supportMenuFunc, hookId);
            playClick = oldPlayClick;

            const supportDiv = document.getElementById("billSupMenuDiv");
            if(supportDiv) supportDiv.remove();

            /* Now we do our extra stuff. */
            const newPropArray = suppArgs[1];

            /* If our list of propositions already has elements in it, we need
               to fix the UI widgets that have already been added. */
            newPropArray.forEach(propObj => {
                if(propObj.executiveId){
                    const propIndex = newPropArray.indexOf(propObj);
                    const propDiv = document.getElementById(`propMainDiv${propIndex}`);

                    const custProp = propositionArrays[lawObject.district].find(candProp => (candProp.id === propObj.executiveId));

                    /* There'll always be two elements. */
                    propDiv.lastChild.remove();
                    propDiv.lastChild.remove();

                    /* Now add the new contents. */
                    generatePropDivContents(propDiv, propObj, custProp, newPropArray);
                }
            });

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

                                    /* First, check if a proposal with this ID exists. */
                                    for(let i = 0; i < newPropArray.length; i++){
                                        if(newPropArray[i].executiveId){
                                            if(newPropArray[i].executiveId === custProp.id){
                                                alertFunc("This proposal is incompatible with other proposals in the bill. It cannot be added until the incompatible proposals have been removed.");
                                                return;
                                            }
                                        }
                                    }

                                    /* We need to give the law a dummy ID for the legislation UI. We'll
                                       change it when the legislation is submitted. */
                                    const newPropElement = {
                                        cat: custProp.category,
                                        id: "stateAbortion",
                                        executiveId: custProp.id,
                                        policy: isActive,
                                        title: custProp.title
                                    };

                                    const newIndex = newPropArray.push(newPropElement);
                                    const propContainerDiv = document.getElementById("compBillPropMenu");

                                    /* Now create the widget to control the proposition. */
                                    const propMainDiv = document.createElement("div");
                                    propMainDiv.setAttribute("id", `propMainDiv${newIndex}`);
                                    propMainDiv.setAttribute("class", "propMainDiv");
                                    propContainerDiv.appendChild(propMainDiv);

                                    generatePropDivContents(propMainDiv, newPropElement, custProp, newPropArray);

                                    /* Finally, go back to the main menu. */
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

    /* *God*, this is messy. Now we have to overwrite the summary function. */
    const originalCalcComplexSummary = Executive.functions.getOriginalFunction("calcComplexSummary");

    Executive.functions.insertRawReplacement("calcComplexSummary", (billObject, propArray, billLevel) => {
        const summaryArray = originalCalcComplexSummary(billObject, propArray, billLevel);

        /* Swap the true ID back in for the fake one and fix summaries. */
        if(billObject.props){
            for(let i = 0; i < billObject.props.length; i++){
                const propObj = billObject.props[i];
                if(propObj.executiveId) propObj.id = propObj.executiveId;
                
                if(billObject.amendProps && billObject.amendProps[i]){
                    if(billObject.amendProps[i].executiveId) billObject.hProps[i].id = billObject.amendProps[i].executiveId;
                }

                if(billObject.hProps && billObject.hProps[i]){
                    if(billObject.hProps[i].executiveId) billObject.hProps[i].id = billObject.hProps[i].executiveId;
                }

                if(billObject.sProps && billObject.sProps[i]){
                    if(billObject.sProps[i].executiveId) billObject.sProps[i].id = billObject.sProps[i].executiveId;
                }

                if(summaryArray[i]){
                    const summaryObj = summaryArray[i];
                    const custProp = propositionArrays[billObject.district].find(candProp => candProp.id === propObj.id);

                    if(custProp){
                        summaryObj.title = custProp.title;
                        summaryObj.desc = custProp.description;
                        summaryObj.props = custProp.effectSummaries[propObj.policy];
                    }
                }
            }
        }

        return summaryArray;
    });

    /* To allow for our custom propositions to have support scores, we need to
       overwrite the score handling function. */
    const originalBillScoreCalc = Executive.functions.getOriginalFunction("billScoreCalc");

    Executive.functions.insertRawReplacement("billScoreCalc", (billObj, propArray, character, arg3, rtnType, billLevel) => {
        const wrappedChar = Executive.data.characters.wrapCharacter(character, "candidate");

        const rtnItems = [];
        const passAlongProps = [];

        let rtnTotal = 0;

        propArray.forEach(propObj => {
            let targetId = (propObj.executiveId !== undefined) ? propObj.executiveId : propObj.id;
            const custProp = propositionArrays[billLevel].find(candProp => (candProp.id === targetId));

            let targetDistrictStats = null;

            if(billLevel === "school") targetDistrictStats = schoolBoardStats;
            else targetDistrictStats = eval(billLevel + "Stats");

            if(custProp){
                /* Now we evaluate against each score factor and add a return item. */
                if(targetDistrictStats[custProp.id] !== propObj.policy) custProp.scoreModifiers.forEach(scoreModifier => {
                    /* The scores are for the case where the policy is made true. If the policy
                       is made false, people will logically hold the opposite position. */
                    const calcImpact = ((scoreModifier.type !== "custom") ? scoreModifier.impact : 0)
                        * ((propObj.policy) ? 1 : -1);

                    switch(scoreModifier.type){
                        case "policy":
                            const charPolicyPosition = wrappedChar.policyPositions[scoreModifier.policy];
                            if(charPolicyPosition === scoreModifier.value){
                                rtnItems.push({
                                    id: custProp.title,
                                    desc: scoreModifier.explanation,
                                    score: calcImpact
                                });
                                rtnTotal += calcImpact;
                            }
                            break;
                        case "ideology":
                            const charIdeologyPosition = wrappedChar[scoreModifier.ideology];
                            if(charIdeologyPosition === scoreModifier.value){
                                rtnItems.push({
                                    id: custProp.title,
                                    desc: scoreModifier.explanation,
                                    score: calcImpact
                                });
                                rtnTotal += calcImpact;
                            }
                            break;
                        case "trait":
                            if(wrappedChar.traits.includes(scoreModifier.value)){
                                rtnItems.push({
                                    id: custProp.title,
                                    desc: scoreModifier.explanation,
                                    score: calcImpact
                                });
                                rtnTotal += calcImpact;
                            }
                            break;
                        case "custom":
                            const resolverRtn = scoreModifier.resolver(wrappedChar, propObj, billLevel);
                            if(resolverRtn !== null){
                                const resolvedImpact = resolverRtn.impact * ((propObj.policy) ? 1 : -1);
                                rtnItems.push({
                                    id: custProp.title,
                                    desc: resolverRtn.explanation,
                                    score: resolvedImpact
                                });
                                rtnTotal += resolvedImpact;
                            }
                            break;
                    }
                });
            } else passAlongProps.push(propObj);
        });

        const defaultRtn = originalBillScoreCalc(billObj, passAlongProps, character, arg3, rtnType, billLevel);
        
        if(rtnType === "analysis") return rtnItems.concat(defaultRtn);
        else return (rtnTotal + defaultRtn);
    });

    /* We need to ensure that the property for any custom proposition is set
       in the given level of government whenever a law is passed. */
    Executive.functions.registerPostHook("updateComplexBillLaws", (args) => {
        const lawObject = args[0];

        lawObject.amendProps.forEach(lawProp => {
            const custProp = propositionArrays[lawObject.district].find(candProp => candProp.id === lawProp.id);
            if(custProp){
                const districtStats = (lawObject.district === "school") ? schoolBoardStats
                    : eval(`${lawObject.district}Stats`);
                districtStats[lawProp.id] = lawProp.policy;

                /* Now fire the event for the proposition being passed. */
                custProp.onPassage.fire(lawProp, lawObject);
            }
        });
    });

    const getBillActive = (billObject) => {
        /* Every piece of legislation discarded is in an array somewhere,
           so we can just check to see if our bill is still in there. */
        if(schoolBoardBills.indexOf(billObject) !== -1) return true;
        if(cityCouncilBills.indexOf(billObject) !== -1) return true;
        if(stateHouseBills.indexOf(billObject) !== -1) return true;
        if(sHouseActiveBills.indexOf(billObject) !== -1) return true;
        if(stateSenateBills.indexOf(billObject) !== -1) return true;
        if(sSenateActiveBills.indexOf(billObject) !== -1) return true;
        if(houseBills.indexOf(billObject) !== -1) return true;
        if(houseActiveBills.indexOf(billObject) !== -1) return true;
        if(senateBills.indexOf(billObject) !== -1) return true;
        if(senateActiveBills.indexOf(billObject) !== -1) return true;
        return false;
    };

    /* We want to notify a mod if a bill with a custom proposition is passed
       or defeated during the legislative process. This allows for stuff like
       motions to vacate, which would require the bill to be archived after
       passing the House of Representatives. */
    Executive.functions.registerPostHook("complexBillVote", (args) => {
        const lawObject = args[0];

        /* We aren't sure when we'll need to handle the vote conclusion, so
           we'll make a function for it and call when appropriate. */
        const handleVoteConclusion = () => {
            let billActive = getBillActive(lawObject);
            if(billActive){
                /* Go through every proposition and check if it's custom. If it is,
                   fire the appropriate success BindableEvent. */
                if(args[2] === "House" || args[2] === "Senate"){
                    lawObject.amendProps.forEach(lawProp => {
                        const custProp = propositionArrays[lawObject.district].find(candProp => candProp.id === lawProp.id);
                        if(custProp){
                            if(args[2] === "House") custProp.onHouseSuccess.fire(lawProp, lawObject);
                            if(args[3] === "Senate") custProp.onSenateSuccess.fire(lawProp, lawObject);
                        }
                    });
                }
            } else {
                /* Go through every proposition and check if it's custom. If it is,
                   fire the failure BindableEvent. */
                lawObject.amendProps.forEach(lawProp => {
                    const custProp = propositionArrays[lawObject.district].find(candProp => candProp.id === lawProp.id);
                    if(custProp){
                        custProp.onFailure.fire(lawProp, lawObject);
                    }
                });
            }
        };

        /* The important criterion here is the fifth argument - this determines
           whether the player is voting on this law or not. If the player is
           voting, we have to wait for their vote to be taken before checking
           for the final result. */
        if(args[4]){
            /* The player is voting. We need to hook again and wait for their vote. */
            let hookId = null;
            hookId = Executive.functions.registerPostHook("calcComplexAppr", (args2) => {
                if(lawObject === args2[0]){
                    /* Immediately deregister our hook. */
                    Executive.functions.deregisterPostHook("calcComplexAppr", hookId);

                    /* This still isn't late enough for the appropriate arrays to be
                       updated. We now hook one last time. */
                    hookId = Executive.functions.registerPostHook("officePage", () => {
                        Executive.functions.deregisterPostHook("officePage", hookId);
                        handleVoteConclusion();
                    });
                }
            });
        } else {
            /* The player isn't voting. We can handle this immediately. */
            handleVoteConclusion();
        }
    });

    /* Cloture votes are a special case. We need to catch them
       to fire the proposition failure event. */
    Executive.functions.registerPostHook("ussClotureVote", (args) => {
        const lawObject = args[0];
        /* Every piece of legislation under consideration is in billIsolation, so we
           can just check to see if our bill is no longer in there. */
        if(billIsolation.indexOf(lawObject) === -1){
            /* Go through every proposition and check if it's custom. If it is,
               fire the failure BindableEvent. */
            lawObject.amendProps.forEach(lawProp => {
                const custProp = propositionArrays[lawObject.district].find(candProp => candProp.id === lawProp.id);
                if(custProp){
                    custProp.onFailure.fire(lawProp, lawObject);
                }
            });
        }
    });

    /* TODO check: Handle the special case of a presidential
       veto. */
    Executive.functions.registerPostHook("presBillVoteComplex", (args) => {
        const lawObject = args[0];

        /* We need to get their vote. */
        let hookId = null;
        hookId = Executive.functions.registerPostHook("calcComplexAppr", (args2) => {
            if(lawObject === args2[0]){
                /* Immediately deregister our hook. */
                Executive.functions.deregisterPostHook("calcComplexAppr", hookId);

                if(args2[3] === "n"){
                    /* The president vetoed the bill. Fire the failure event for
                       every appropriate custom proposition. */
                    lawObject.amendProps.forEach(lawProp => {
                        const custProp = propositionArrays[lawObject.district].find(candProp => candProp.id === lawProp.id);
                        if(custProp){
                            custProp.onFailure.fire(lawProp, lawObject);
                        }
                    });
                }
            }
        });
    });
};