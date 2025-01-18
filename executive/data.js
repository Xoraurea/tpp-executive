/* tpp-executive - executive/data.js 
   A neater interface for The Political Process' internal data structures */

{
    const data = {};

    /* First, we make a custom interface for accessing states in the game. */
    const statesObj = {allStates: []};
    const stateAbbrs = ["ak", "al", "ar", "az", "ca", "co", "ct", "dc", "de", "fl", "ga", "hi", "ia", "id", "il",
                        "in", "ks", "ky", "la", "ma", "md", "me", "mi", "mn", "mo", "ms", "mt", "nc", "nd", "ne",
                        "nh", "nj", "nm", "nv", "ny", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut",
                        "va", "vt", "wa", "wi", "wv", "wy"];

    stateAbbrs.forEach(abbr => {
        /* The state object is replaced, rather than updated, whenever a new game loads. As such, we
           can't just maintain a reference to a state's object – we must use proxies to constantly
           use the newest version of the object with the given name. */

        const objName = abbr + "Stats";
        const stateProxy = new Proxy(eval(objName), {
            get: (target, property) => {
                return eval(objName)[property];
            },
            set: (target, property, newVal) => {
                let state = eval(objName);
                eval(objName)[property] = newVal;
                
                /* At the end of the year, changes to certain state metrics will be reset by reading
                   historic data. To provide a relatively intuitive interface to mods, we'll quietly
                   update historic data ourselves. */
                if(property !== "historicData" && eval(objName).historicData[property] !== undefined){
                    eval(objName).historicData[property][eval(objName).historicData[property].length - 1].value = newVal;
                }

                /* Finally, changing state settings in advanced options calls updateVoteFactors. I'm
                   not entirely sure what this does, but we'll do it here just in case it's important. */
                updateVoteFactors(eval(objName), eval(objName));
            }
        });

        statesObj[abbr] = stateProxy;
        statesObj.allStates.push(stateProxy);
    });

    data.states = statesObj;

    /* We'll also provide a function to wrap character objects. */
    const charactersObj = {
        player: {}
    };

    charactersObj.wrapCharacter = (character, type) => {
        if(Executive.enums.characterArray[type] === undefined) throw new Error("Unrecognised character type ("+ type + ")");

        const indexEnum = Executive.enums.characterArray[type];
        const subProxies = {};

        let extendedPolicyKeys = [];

        /* We have one special case to handle; if a candidate character is wrapped, we want all policy positions to be accessible
           under character.policyPositions. There are, however, some positions placed within the extendedAttribs object. In this case,
           we have to do something different in our proxy's handler. */
        if(type === "candidate"){
            /* Some extended attribute keys aren't policies, and we need to exclude these. */
            const nonPolicyKeys = ["appr", "nE", "party", "rel"];
            extendedPolicyKeys = Object.keys(character[indexEnum.extendedAttribs])
                                    .filter(key => !(nonPolicyKeys.includes(key)));
        }
        
        /* First, the enum contains several sub-objects for more refined access (e.g. the policy position subset of character
           attributes). We handle these with individual proxies. */
        Object.keys(indexEnum).forEach(key => {
            if(typeof indexEnum[key] === "object"){
                subProxies[key] = new Proxy(character, {
                    get: (target, property) => {
                        if(key === "policyPositions" && extendedPolicyKeys.includes(property))
                            return target[indexEnum.extendedAttribs][property];
                        if(indexEnum[key][property] !== undefined) return target[indexEnum[key][property]];
                        return target[property];
                    },
                    set: (target, property, newVal) => {
                        if(key === "policyPositions" && extendedPolicyKeys.includes(property))
                            target[indexEnum.extendedAttribs][property] = newVal;
                        else if(indexEnum[key][property] !== undefined) target[indexEnum[key][property]] = newVal;
                        else target[property] = newVal;
                    }
                });
            }
        });

        /* Now we create the root proxy. */
        const charProxy = new Proxy(character, {
            get: (target, property) => {
                if(property === "characterArray") return target;
                if(property === "characterType") return type;
                if(subProxies[property] !== undefined) return subProxies[property];
                if(indexEnum[property] !== undefined) return target[indexEnum[property]];
                return target[property];
            },
            set: (target, property, newVal) => {
                if(subProxies[property] !== undefined) throw new Error("Attempted to set sub-object of character proxy (" + property + ")");
                if(indexEnum[property] !== undefined) target[indexEnum[property]] = newVal;
                else target[property] = newVal;
            }
        });

        return charProxy;
    }

    Object.defineProperty(charactersObj, "player", {
        get: () => {
            return charactersObj.wrapCharacter(player, "candidate");
        }
    });

    const validProtegeElectionIds = ["president", "usSenate", "usHouse", "governor", "stateHouse", "stateSenate", "mayor", "cityCouncil", "schoolBoard"];

    Object.defineProperty(charactersObj, "proteges", {
        get: () => {
            const newArray = [];

            protegeArray.forEach(protegeEntry => {
                newArray.push({
                    character: charactersObj.wrapCharacter(protegeEntry.candidate, "candidate"),
                    get nextElectionId(){
                        return protegeEntry.nextElection
                    },
                    set nextElectionId(newVal){
                        if(!validProtegeElectionIds.includes(newVal)) throw new Error("Attempted to set invalid type of election");
                        protegeEntry.nextElection = newVal
                    },
                    get districtNumber(){
                        return protegeEntry.district
                    },
                    set districtNumber(newVal){
                        protegeEntry.district = newVal
                    },
                });
            });

            return newArray;
        }
    });

    data.characters = charactersObj;

    /* We'd like to have an interface for mods to access incumbent politicians as well. */
    const politiciansObj = {
        get president(){
            return charactersObj.wrapCharacter(usPresident, "candidate");
        },

        get vicePresident(){
            return charactersObj.wrapCharacter(vicePresident, "candidate");
        },

        governors: {},
        usSenate: {},
        usHouse: {},

        get localGovernor(){
            return charactersObj.wrapCharacter(governor, "candidate");
        },

        get localStateHouse(){
            const retArray = stateHouse.slice().map(characterArray => charactersObj.wrapCharacter(characterArray, "candidate"));
            return retArray;
        },

        get localStateSenate(){
            const retArray = stateSenate.slice().map(characterArray => charactersObj.wrapCharacter(characterArray, "candidate"));
            return retArray;
        },

        get localMayor(){
            return charactersObj.wrapCharacter(mayor, "candidate");
        },

        get localCityCouncil(){
            const retArray = cityCouncil.slice().map(characterArray => charactersObj.wrapCharacter(characterArray, "candidate"));
            return retArray;
        },

        get localSchoolBoard(){
            const retArray = schoolBoard.slice().map(characterArray => charactersObj.wrapCharacter(characterArray, "candidate"));
            return retArray;
        }
    };

    /* Now we add entries for each state in the Governors, US Senate and US House categories. */
    stateAbbrs.forEach(stateId => {
        if(stateId === "dc") return;

        Object.defineProperty(politiciansObj.governors, stateId, {
            get: () => {
                return charactersObj.wrapCharacter(allGovernors.filter(
                    gov => (gov[Executive.enums.characterArray.candidate.stateId].toLowerCase() === stateId))[0], "candidate");
            }
        });

        Object.defineProperty(politiciansObj.usHouse, stateId, {
            get: () => {
                const characterArray = usHouse.filter(
                    rep => (rep[Executive.enums.characterArray.candidate.stateId].toLowerCase() === stateId));

                return characterArray.map(character => charactersObj.wrapCharacter(character, "candidate"));
            }
        });

        const senateStateObj = {
            senior: {},
            junior: {}
        };

        Object.defineProperty(senateStateObj, "senior", {
            get: () => {
                const senateCombinedArray = usSenate1Array.concat(usSenate2Array).concat(usSenate3Array);
                const senatorPair = senateCombinedArray.filter(
                    character => character[Executive.enums.characterArray.candidate.stateId].toLowerCase() === stateId);

                const firstSenator = charactersObj.wrapCharacter(senatorPair[0], "candidate");
                const secondSenator = charactersObj.wrapCharacter(senatorPair[1], "candidate");

                let firstSenatorYear = 0;
                for(let i = 0; i < firstSenator.jobHistory.length; i++){
                    const job = firstSenator.jobHistory[i];
                    if(job.title.startsWith("U.S. Senator ")){
                        firstSenatorYear = job.start;
                        break;
                    }
                }

                let secondSenatorYear = 0;
                for(let i = 0; i < secondSenator.jobHistory.length; i++){
                    const job = secondSenator.jobHistory[i];
                    if(job.title.startsWith("U.S. Senator ")){
                        secondSenatorYear = job.start;
                        break;
                    }
                }
                
                return (firstSenatorYear <= secondSenatorYear) ? firstSenator : secondSenator;
            }
        });

        Object.defineProperty(senateStateObj, "junior", {
            get: () => {
                const senateCombinedArray = usSenate1Array.concat(usSenate2Array).concat(usSenate3Array);
                const senatorPair = senateCombinedArray.filter(
                    character => character[Executive.enums.characterArray.candidate.stateId].toLowerCase() === stateId);

                const firstSenator = charactersObj.wrapCharacter(senatorPair[0], "candidate");
                const secondSenator = charactersObj.wrapCharacter(senatorPair[1], "candidate");

                let firstSenatorYear = 0;
                for(let i = 0; i < firstSenator.jobHistory.length; i++){
                    const job = firstSenator.jobHistory[i];
                    if(job.title.startsWith("U.S. Senator ")){
                        firstSenatorYear = job.start;
                        break;
                    }
                }

                let secondSenatorYear = 0;
                for(let i = 0; i < secondSenator.jobHistory.length; i++){
                    const job = secondSenator.jobHistory[i];
                    if(job.title.startsWith("U.S. Senator ")){
                        secondSenatorYear = job.start;
                        break;
                    }
                }
                
                return (firstSenatorYear <= secondSenatorYear) ? secondSenator : firstSenator;
            }
        });

        politiciansObj.usSenate[stateId] = senateStateObj;
    });

    /* We'll provide helper methods for mods which need to get a list of politician characters in a
       state. */
    {
        const getStatePoliticians = (state, nonStatewide, includeLocals, wrapped) => {
            let politicians = [];

            /* First, we do US Senators and the Governor. */
            const usSenGovArrays = [usSenate1Array, usSenate2Array, usSenate3Array, allGovernors];
            usSenGovArrays.forEach(usSenGovArray => {
                usSenGovArray.forEach(usSenGov => {
                    if(usSenGov[Executive.enums.characterArray.candidate.stateId] === state.id){
                        politicians.push(
                            (wrapped === undefined || wrapped === true) ? charactersObj.wrapCharacter(usSenGov, "candidate")
                            : usSenGov);
                    }
                });
            });

            /* Next, we do US House Representatives. This applies if nonStatewide is true and/or
               the state in question only has a single at-large representative. */
            if(nonStatewide === true || state.usHouseDistricts.length === 1){
                usHouse.forEach(usRep => {
                    if(usRep[Executive.enums.characterArray.candidate.stateId] === state.id){
                        politicians.push(
                            (wrapped === undefined || wrapped === true) ? charactersObj.wrapCharacter(usRep, "candidate")
                            : usRep);
                    }
                });
            }

            /* Finally, if includeLocals is set or not passed and we're in the player's home state,
               we also include politicians from the state House and state Senate. */
            if((includeLocals === undefined || includeLocals === true)
                && player[Executive.enums.characterArray.candidate.stateId] === state.id){
                stateHouse.forEach(stateRep => {
                    politicians.push(
                        (wrapped === undefined || wrapped === true) ? charactersObj.wrapCharacter(stateRep, "candidate")
                        : stateRep);
                });
                stateSenate.forEach(stateSenator => {
                    politicians.push(
                        (wrapped === undefined || wrapped === true) ? charactersObj.wrapCharacter(stateSenator, "candidate")
                        : stateSenator);
                });
            }

            return politicians;
        };

        politiciansObj.getStatePoliticians = (state, includeLocals, wrapped) => {
            return getStatePoliticians(state, true, includeLocals, wrapped);
        };

        politiciansObj.getStatewidePoliticians = (state, wrapped) => {
            return getStatePoliticians(state, false, false, wrapped);
        };
    }

    data.politicians = politiciansObj;

    module.exports = data;
};