/* tpp-executive – executive/game/propositions.js
   Supporting definitions for custom bill propositions */

/* We provide a class as a neater way of defining custom propositions. */
class CustomProposition {
    title = "Untitled Proposition";
    description = "This is an untitled custom proposition.";
    category = Executive.enums.propositions.category.miscellaneous;

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
    }

    #internalScoreModifiers = [];
    get scoreModifiers(){
        const returnArray = [];
        this.#internalScoreModifiers.forEach(scoreMod => {
            returnArray.push(Object.assign({}, scoreMod));
        });
        return returnArray;
    }

    addScoreModifier(policyPosition, targetValue, scoreImpact, matchedExplanation, unmatchedExplanation){
        this.#internalScoreModifiers.push({
            policy: policyPosition,
            value: targetValue,
            impact: scoreImpact,
            explanation: matchedExplanation
        });

        if(unmatchedExplanation !== undefined){
            if(typeof targetValue !== 'boolean') throw new Error("Cannot add an inverse score modifier for a non-boolean policy position");
            this.#internalScoreModifiers.push({
                policy: policyPosition,
                value: !targetValue,
                impact: -scoreImpact,
                unmatchedExplanation
            });
        }
    }
}

module.exports = {
    CustomProposition
};