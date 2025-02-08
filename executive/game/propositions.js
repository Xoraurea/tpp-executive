/* tpp-executive – executive/game/propositions.js
   Supporting definitions for custom bill propositions */

/* We provide a class as a neater way of defining custom propositions. */
class CustomProposition {
    title = "Untitled Proposition";
    description = "This is an untitled custom proposition.";
    category = Executive.enums.propositions.category.miscellaneous;

    effectSummaries = {};

    #internalId;
    get id (){
        return this.#internalId;
    }

    #internalType;
    get type (){
        return this.#internalType;
    }

    constructor(propositionId, type){
        this.#internalId = propositionId + "_customLaw";
        this.#internalType = type;

        if(type === Executive.enums.propositions.type.trueFalse){
            this.effectSummaries[true] = "Sets the untitled proposition to true.";
            this.effectSummaries[false] = "Sets the untitled proposition to false.";
        }
    }

    #internalScoreModifiers = [];
    get scoreModifiers(){
        const returnArray = [];
        this.#internalScoreModifiers.forEach(scoreMod => {
            returnArray.push(Object.assign({}, scoreMod));
        });
        return returnArray;
    }

    addPolicyScoreModifier(policyPosition, targetValue, scoreImpact, matchedExplanation, unmatchedExplanation){
        this.#internalScoreModifiers.push({
            type: "policy",
            policy: policyPosition,
            value: targetValue,
            impact: scoreImpact,
            explanation: matchedExplanation
        });

        if(unmatchedExplanation !== undefined){
            if(typeof targetValue !== 'boolean') throw new Error("Cannot add an inverse score modifier for a non-boolean policy position");
            this.#internalScoreModifiers.push({
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

        this.#internalScoreModifiers.push({
            type: "ideology",
            ideology: ideologyType,
            value: targetValue,
            impact: scoreImpact,
            explanation: matchedExplanation
        });
    }

    addTraitScoreModifier(targetTrait, scoreImpact, matchedExplanation){
        this.#internalScoreModifiers.push({
            type: "trait",
            value: targetTrait,
            impact: scoreImpact,
            explanation: matchedExplanation
        });
    }

    addCustomScoreModifier(resolverFunc){
        this.#internalScoreModifiers.push({
            type: "custom",
            resolver: resolverFunc
        });
    }
}

module.exports = {
    CustomProposition
};