/* tpp-executive/executive/classes.js
   Common classes used across Executive */

{
    const customPropositionScope = new WeakMap();

    /* We provide a class as a neater way of defining custom propositions. */
    class CustomProposition {
        title = "Untitled Proposition";
        description = "This is an untitled custom proposition.";
        category = Executive.enums.propositions.category.miscellaneous;
        
        partyImpact = null;
    
        effectSummaries = {};
    
        get id (){
            return customPropositionScope.get(this).internalId;
        }
    
        get type (){
            return customPropositionScope.get(this).internalType;
        }
    
        constructor(propositionId, type){
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

    module.exports = {
        CustomProposition
    };
};