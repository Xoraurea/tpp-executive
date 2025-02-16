/* tpp-executive/executive/classes.js
   Common classes used across Executive */

const { type } = require("./enums/propositions");

{
    const customPropositionScope = new WeakMap();

    /* We provide a class as a neater way of defining custom propositions. */
    class CustomProposition {
        title = "Untitled Proposition";
        description = "This is an untitled custom proposition.";
        category = Executive.enums.propositions.category.miscellaneous;
        
        partyImpact = null
        effectSummaries = {};

        /* BindableEvents for stages of the legislative process. */
        onPassage = new Executive.classes.BindableEvent(`ExecutiveOnPropPassage`);
        onFailure = new Executive.classes.BindableEvent(`ExecutiveOnPropFailure`);
        onHouseSuccess = new Executive.classes.BindableEvent(`ExecutiveOnPropHouseSuccess`);
        onSenateSuccess = new Executive.classes.BindableEvent(`ExecutiveOnPropSenateSuccess`);
    
        get id (){
            return customPropositionScope.get(this).internalId;
        }
    
        get type (){
            return customPropositionScope.get(this).internalType;
        }
    
        constructor(propositionId, type){
            /* Create the private scope for the object. */
            customPropositionScope.set(this, {
                internalId: propositionId + "_customLaw",
                internalType: type,
                internalScoreModifiers: []
            });
    
            if(type === Executive.enums.propositions.type.trueFalse){
                this.effectSummaries[true] = "Sets the untitled proposition's corresponding law to true.";
                this.effectSummaries[false] = "Sets the untitled proposition's corresponding law to false.";
            }
        }
    
        get scoreModifiers(){
            const returnArray = [];
            customPropositionScope.get(this).internalScoreModifiers.forEach(scoreMod => {
                returnArray.push(Object.assign({}, scoreMod));
            });
            return returnArray;
        }
    
        addPolicyScoreModifier(policyPosition, targetValue, scoreImpact, matchedExplanation, unmatchedExplanation){
            customPropositionScope.get(this).internalScoreModifiers.push({
                type: "policy",
                policy: policyPosition,
                value: targetValue,
                impact: scoreImpact,
                explanation: matchedExplanation
            });
    
            if(unmatchedExplanation !== undefined){
                if(typeof targetValue !== 'boolean') throw new Error("Cannot add an inverse score modifier for a non-boolean policy position");
                customPropositionScope.get(this).internalScoreModifiers.push({
                    type: "policy",
                    policy: policyPosition,
                    value: !targetValue,
                    impact: -scoreImpact,
                    unmatchedExplanation
                });
            }
        }
    
        addIdeologyScoreModifier(ideologyType, targetValue, scoreImpact, matchedExplanation){
            if(ideologyType !== "fiscalIdeology" && ideologyType !== "socialIdeology") throw new Error("Invalid type of character ideology");
    
            customPropositionScope.get(this).internalScoreModifiers.push({
                type: "ideology",
                ideology: ideologyType,
                value: targetValue,
                impact: scoreImpact,
                explanation: matchedExplanation
            });
        }
    
        addTraitScoreModifier(targetTrait, scoreImpact, matchedExplanation){
            customPropositionScope.get(this).internalScoreModifiers.push({
                type: "trait",
                value: targetTrait,
                impact: scoreImpact,
                explanation: matchedExplanation
            });
        }
    
        addCustomScoreModifier(resolverFunc){
            customPropositionScope.get(this).internalScoreModifiers.push({
                type: "custom",
                resolver: resolverFunc
            });
        }
    }

    const bindableEventScope = new WeakMap();

    /* We want to have events which mods can bind to and which get fired
       by Executive. */
    class BindableEvent {
        constructor(eventName) {
            if(typeof eventName !== "string") throw new Error("Non-string is invalid name for BindableEvent");

            /* Create the private scope for the object. */
            bindableEventScope.set(this, {
                boundFunctions: [],
                name: eventName
            });
        }

        get name(){
            return bindableEventScope.get(this).name;
        }

        fire(...args){
            /* We want an event handler to be able to disconnect itself
               for convenience purposes. */
            const disconnectingFuncs = [];
            const privateScope = bindableEventScope.get(this);

            privateScope.boundFunctions.forEach(boundFunc => {
                const eventObj = {
                    baseEvent: this,
                    deregister: () => {
                        disconnectingFuncs.push(boundFunc);
                    }
                };

                boundFunc(eventObj, ...args);
            });

            /* Now disconnect the functions. */
            disconnectingFuncs.forEach(dcFunc => {
                privateScope.boundFunctions.splice(privateScope.boundFunctions.indexOf(dcFunc), 1);
            });
        }

        /* Register a function to act as an event listener, which will be passed arguments
           by the function firing the event. */
        registerListener(listener){
            const privateScope = bindableEventScope.get(this);
            if(typeof listener !== "function") throw new Error(`Attempted to bind non-function to event ${privateScope.name}`);

            privateScope.boundFunctions.push(listener);
            return {
                deregister: () => {
                    privateScope.boundFunctions.splice(privateScope.boundFunctions.indexOf(listener), 1);
                }
            };
        }

        /* Deregister a previously registered event listener function. */
        deregisterListener(listener){
            const privateScope = bindableEventScope.get(this);
            if(typeof listener !== "function") throw new Error(`Attempted to unbind non-function from event ${privateScope.name}`);

            const funcIndex = privateScope.boundFunctions.indexOf(listener);
            if(privateScope.boundFunctions[funcIndex]){
                privateScope.boundFunctions.splice(funcIndex, 1);
            } else throw new Error(`Attempted to unbind function not bound to event ${privateScope.name}`);
        }
    };

    module.exports = {
        CustomProposition,
        BindableEvent
    };
};