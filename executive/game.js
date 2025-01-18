/* tpp-executive - executive/game.js 
   Implements helper functions to influence the current game state */

const { updateTooltip } = require("../modFiles/better-maps/tooltip");

{
    const game = {};

    /* Move percentage support from sourceParty to destParty. */
    game.changeStatewidePartyID = (stateId, sourceParty, destParty, percentage) => {
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
        cityNews.unshift(createNewsItem(title, message, character, week));
    };

    game.createStateNews = (title, message, character, week) => {
        stateNews.unshift(createNewsItem(title, message, character, week));
    };

    game.createNationalNews = (title, message, character, week) => {
        nationNews.unshift(createNewsItem(title, message, character, week));
    };

    game.createGeneralOfficeMessage = (title, message, character) => {
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

    module.exports = game;
};