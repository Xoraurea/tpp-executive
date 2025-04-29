/* tpp-executive - executive.js 
   The main loader script for Executive */

const fs = nw.require("fs");
const path = nw.require("path");

/* Get a list of symbols created by the game. */
const postGlobals = Object.keys(globalThis);
const filteredList = postGlobals.filter(entry => !preGlobals.includes(entry));

const characterEnums = nw.require("executive/enums/character_enums.js");

let Executive = {
    version: {
        major: 0,
        minor: 1,
        revision: 1,
        string: "b0.1.1"
    },
    mods: {
        count: 0,
        loaded: [],
        registry: {}
    },
    enums: {
        characterArray: characterEnums.characterArray,
        characterLength: characterEnums.characterLength,
        characters: characterEnums.characters,
        propositions: nw.require("executive/enums/propositions.js")
    },
    classes: nw.require("executive/classes.js"),
    symbols: {
        functions: filteredList.filter(entry => (typeof globalThis[entry] === "function")),
        vars: filteredList.filter(entry => (typeof globalThis[entry] !== "function"))
    }
};

/* Share Executive between contexts. */
global.Executive = Executive;

console.log("[Executive] Executive for The Political Process (" + Executive.version.string + ")");

/* Now we hook every function that the game adds to the global environment. */
{
    /* We define a bunch of stuff for use when reverse engineering the game's functions.
       This hopefully won't be needed by mod developers when documentation is fleshed out. */
    const dbgInfo = false;

    let baseCallTree = {
        functionSig: null,
        functionArgs: [],
        functionRtn: null,
        parent: null,
        children: []
    };

    let currentWrapLevel = 0;
    let currentNode = baseCallTree;

    /* We maintain internal references to the original internal functions for reference and track their replacements
       and hooks. */
    const originalFuncTable = {};
    const updatedFuncTable = {};
    const funcHookTable = {};

    Executive.functions = {
        registerReplacement: (funcName, newFunc) => {
            /* Registers a stand-in replacement for the original function. */
            if(updatedFuncTable[funcName] !== undefined){
                console.error("[Executive] Conflict: Mod attempted to redefine already redefined function (" + funcName + ")");
                throw new Error("Internal function redefinition conflict");
            }

            if(originalFuncTable[funcName] === undefined){
                console.warn("[Executive] Mod attempted to redefine non-existent internal function (" + funcName + ")");
                return false;
            }

            updatedFuncTable[funcName] = newFunc;
            return true;
        },
        registerPreHook: (funcName, hook) => {
            /* Registers a pre-hook to be called before an internal function executes.
               Returns the index of the hook for later deregistration. */
            if(originalFuncTable[funcName] === undefined){
                console.warn("[Executive] Mod attempted to register pre-hook for non-existent internal function (" + funcName + ")");
                return -1;
            }

            let index = 0;
            while(funcHookTable[funcName].beforeCall[index] !== null 
                && funcHookTable[funcName].beforeCall[index] !== undefined) index++;

            funcHookTable[funcName].beforeCall[index] = hook;
            return index;
        },
        registerPostHook: (funcName, hook) => {
            /* Registers a post-hook to be called after an internal function executes.
               Returns the index of the hook for later deregistration. */
            if(originalFuncTable[funcName] === undefined){
                console.warn("[Executive] Mod attempted to register post-hook for non-existent internal function (" + funcName + ")");
                return;
            }

            let index = 0;
            while(funcHookTable[funcName].afterCall[index] !== null 
                && funcHookTable[funcName].afterCall[index] !== undefined) index++;

            funcHookTable[funcName].afterCall[index] = hook;
            return index;
        },
        deregisterPreHook: (funcName, index) => {
            /* Deregister a previously added pre-hook based on index. */
            if(originalFuncTable[funcName] === undefined){
                console.warn("[Executive] Mod attempted to deregister pre-hook for non-existent internal function (" + funcName + ")");
                return false;
            }

            if(funcHookTable[funcName].beforeCall[index] === null
                || funcHookTable[funcName].beforeCall[index] === undefined) return false;

            funcHookTable[funcName].beforeCall[index] = null;
            return true;
        },
        deregisterPostHook: (funcName, index) => {
            /* Deregister a previously added post-hook based on index. */
            if(originalFuncTable[funcName] === undefined){
                console.warn("[Executive] Mod attempted to deregister post-hook for non-existent internal function (" + funcName + ")");
                return false;
            }

            if(funcHookTable[funcName].afterCall[index] === null
                || funcHookTable[funcName].afterCall[index] === undefined) return false;

            funcHookTable[funcName].afterCall[index] = null;
            return true;
        },
        getOriginalFunction: (funcName) => {
            /* Returns the original copy of any game function, allowing replacement functions to call the original. */
            if(originalFuncTable[funcName] === undefined) throw new Error("Mod attempted to fetch non-existent original game function");

            return originalFuncTable[funcName];
        },
        getFunctionOverwritten: (funcName) => {
            /* Returns true if the function in question has been overwritten by a mod. */
            return (updatedFuncTable[funcName] !== undefined);
        },
        /* Undocumented internal functions. These should be cleared later in this script before mod
           initialisation. */
        createRawPreHook: (funcName, hook) => {
            /* Undocumented internal function cleared upon mod initialisation.
               Creates a pre-hook to be called after the original form of an internal function executes. */
            if(originalFuncTable[funcName] === undefined){
                console.error("[Executive] Executive attempted to create raw pre-hook for non-existent internal function (" + funcName + ")");
                return;
            }

            const baseOriginalFunc = originalFuncTable[funcName];
            originalFuncTable[funcName] = (...args) => {
                hook(args, funcName);
                return baseOriginalFunc(...args);
            }
        },
        createRawPostHook: (funcName, hook) => {
            /* Undocumented internal function cleared upon mod initialisation.
               Creates a post-hook to be called after the original form of an internal function executes. */
            if(originalFuncTable[funcName] === undefined){
                console.error("[Executive] Executive attempted to create raw pre-hook for non-existent internal function (" + funcName + ")");
                return;
            }

            const baseOriginalFunc = originalFuncTable[funcName];
            originalFuncTable[funcName] = (...args) => {
                const rtnVal = baseOriginalFunc(...args);
                hook(args, rtnVal, funcName);
                return rtnVal;
            }
        },
        insertRawReplacement: (funcName, replacement) => {
            /* Undocumented internal function cleared upon mod initialisation.
               Inserts a replacement function in place of the original form of an internal function. Will overwrite
               any raw pre/post-hooks. */
            if(originalFuncTable[funcName] === undefined){
                console.error("[Executive] Executive attempted to insert raw replacement for non-existent internal function (" + funcName + ")");
                return;
            }

            originalFuncTable[funcName] = replacement;
        }
    };

    /* We iterate over every new function defined. */
    filteredList.forEach(entry => {
        const realEntry = globalThis[entry];

        if(typeof realEntry === "function"){
            originalFuncTable[entry] = realEntry;

            funcHookTable[entry] = {
                beforeCall: [],
                afterCall: []
            };

            let wrapper = (...args) => {
                /* Call every pre-hook. */
                for(let hookIndex = 0; hookIndex < funcHookTable[entry].beforeCall.length; hookIndex++){
                    if(funcHookTable[entry].beforeCall[hookIndex] !== null){
                        try {
                            funcHookTable[entry].beforeCall[hookIndex](args, entry, hookIndex);
                        } catch(err) {
                            console.error("[Executive] Pre-hook (ID " + hookIndex.toString() + ") failed on " + entry + " (" + err + ")");
                        };
                    };
                };
                
                /* If a mod has replaced the definition of the function, we should call the replacement instead. */
                let rtnVal = undefined;
                if(updatedFuncTable[entry] !== undefined) rtnVal = updatedFuncTable[entry](...args);
                else rtnVal = originalFuncTable[entry](...args);

                /* Call every post-hook. */
                for(let hookIndex = 0; hookIndex < funcHookTable[entry].afterCall.length; hookIndex++){
                    if(funcHookTable[entry].afterCall[hookIndex] !== null){
                        try {
                            funcHookTable[entry].afterCall[hookIndex](args, rtnVal, entry, hookIndex);
                        } catch(err) {
                            console.error("[Executive] Post-hook (ID " + hookIndex.toString() + ") failed on " + entry + " (" + err + ")");
                        }
                    };
                };

                if(rtnVal !== undefined) return rtnVal;
            };
            
            globalThis[entry] = wrapper;
        };
    });
}

/* Let's add the API for debug functionality. */

Executive.debug = nw.require("executive/debug.js");

/* Mods need to be able to add their own stylesheets for custom UI elements.
   We'll store the loaded stylesheets so that we can load them and reload whenever necessary (i.e. theme changes). */
{
    /* The paths we're passed by mods will be relative to the executing directory. For this to work, we need to
       get a value equivalent to the __dirname global in the caller's context. This requires some messy call
       stack hackery. */
    const getCallerDir = () => {
        /* Code borrowed from https://github.com/detrohutt/caller-dirname/blob/master/src/index.ts,
           in turn using https://github.com/sindresorhus/callsites/blob/master/index.js.
           We can seemingly only get a non-string stack trace by replacing the default Error stack
           trace helper function. */
        const _ = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const callStack = (new Error()).stack;
        Error.prepareStackTrace = _;

        const callerSite = callStack.find(callSite => (callSite.getFileName() !== ""));
        return path.dirname(callerSite.getFileName());
    };

    /* We'll reuse this function to allow mods to get the first part of relative paths. */
    Executive.mods.getRelativePathPrefix = () => {
        const callerDir = getCallerDir();
        return callerDir.substring(__dirname.length + 1);
    };

    /* We also want mods to be able to save data specific to that mod in a cross-compatible
       manner – for this, we use this function to obtain the mod ID and then access part of
       a mod data object. */
    const getModData = (obj, callerDir) => {
        if(obj._executiveModData === undefined) obj._executiveModData = {};

        /* We need to get the mod ID. */
        const reducedMods = Executive.mods.loaded.filter(mod => mod._modPath === callerDir.substring(0, mod._modPath.length));
        if(reducedMods.length === 0) throw new Error("Attempted to access mod data from script outside of mod directory");

        const targetMod = reducedMods[0];
        if(obj._executiveModData[targetMod.id] === undefined) obj._executiveModData[targetMod.id] = {};
        
        return obj._executiveModData[targetMod.id];
    };

    const getGlobalModData = (callerDir) => {
        if(nationStats._executiveGlobalModData === undefined) nationStats._executiveGlobalModData = {};

        /* We need to get the mod ID. */
        const reducedMods = Executive.mods.loaded.filter(mod => mod._modPath === callerDir.substring(0, mod._modPath.length));
        if(reducedMods.length === 0) throw new Error("Attempted to access mod data from script outside of mod directory");

        const targetMod = reducedMods[0];
        if(nationStats._executiveGlobalModData[targetMod.id] === undefined) nationStats._executiveGlobalModData[targetMod.id] = {};
        
        return nationStats._executiveGlobalModData[targetMod.id];
    };

    Executive.mods.getCharacterSaveData = (character) => {
        /* Get the data stored for a CharacterObject for a mod. */
        if(character.characterType === undefined) throw new Error("Expected CharacterObject");
        return getModData(character.extendedAttribs, getCallerDir().substring(__dirname.length + 1) + path.sep);
    };

    Executive.mods.getObjectSaveData = (targetObj) => {
        /* Get the data stored for an object for a mod. */
        if(typeof targetObj !== "object") throw new Error("Expected object");
        return getModData(targetObj, getCallerDir().substring(__dirname.length + 1) + path.sep);
    };

    const themeNode = document.getElementById("cssLink");
    let darkMode = (themeNode.getAttribute("href") === "cssFiles/darkModeCSS.css") ? true : false;

    Executive.styles = {
        registeredStyles: []
    };

    Object.defineProperty(Executive.mods, "saveData", {
        get: () => {
            if(!Executive.game.loaded) throw new Error("Not in a loaded game");
            return getGlobalModData(getCallerDir().substring(__dirname.length + 1) + path.sep);
        }
    });

    Executive.styles.registerStyle = (relativePath) => {
        const stylePath = getCallerDir() + path.sep + relativePath;

        const newStyleElem = document.createElement("link");
        newStyleElem.setAttribute("href", stylePath);
        newStyleElem.setAttribute("rel", "stylesheet");

        document.head.insertBefore(newStyleElem, themeNode);

        Executive.styles.registeredStyles.push({
            light: stylePath,
            dark: stylePath,
            element: newStyleElem
        });
    };

    Executive.styles.registerThemeAwareStyle = (relativeLightPath, relativeDarkPath) => {
        const lightPath = getCallerDir() + path.sep + relativeLightPath;
        const darkPath = getCallerDir() + path.sep + relativeDarkPath;

        const newStyleElem = document.createElement("link");
        newStyleElem.setAttribute("href", darkMode ? darkPath : lightPath);
        newStyleElem.setAttribute("rel", "stylesheet");

        document.head.insertBefore(newStyleElem, themeNode);

        Executive.styles.registeredStyles.push({
            light: lightPath,
            dark: darkPath,
            element: newStyleElem
        });
    };

    let currentTheme = "light";
    Executive.styles.onThemeChange = new Executive.classes.BindableEvent("ExecutiveOnThemeChange");

    /* For theme-aware styles, we need to listen for changes to the game's normal style tag. */
    const styleListener = new MutationObserver((mutations, observer) => {
        let newThemeState = (themeNode.getAttribute("href") === "cssFiles/darkModeCSS.css") ? true : false;

        if(newThemeState !== themeNode){
            currentTheme = newThemeState ? "dark" : "light";

            darkMode = newThemeState;
            Executive.styles.registeredStyles.forEach(style => {
                if(style.light !== style.dark){
                    style.element.setAttribute("href", darkMode ? style.dark : style.light);
                }
            });
            Executive.styles.onThemeChange.fire(darkMode);
        }
    });

    styleListener.observe(themeNode, {attributes: true});

    Object.defineProperty(Executive.styles, "currentTheme", {
        get: () => {return currentTheme;}
    });
};

/* The game has lots of data structures that are in the global environment but aren't neatly 
   named, categorised or indexed. To aid this, we load a custom interface for interacting with
   data structures. */

Executive.data = nw.require("executive/data.js");

/* We want to provide helper functions so that mods can more easily modify the state of the
   game and data structures. These are encapsulated through Executive.game functions. */

Executive.game = nw.require("executive/game.js");

/* We can now begin loading mods!
   First, check the mod folder exists. */
if(!fs.existsSync("modFiles")){
    fs.mkdirSync("modFiles");
}

/* Load mods here. */
{
    const checkVersionSupported = (modReqVersion, otherVer) => {
        if(!otherVer) otherVer = Executive.version;

        if(modReqVersion.major > otherVer.major) return 0;
        if(modReqVersion.major < otherVer.major) return 2;

        if(modReqVersion.minor > otherVer.minor) return 0;
        if(modReqVersion.minor < otherVer.minor) return 2;

        if(modReqVersion.revision > otherVer.revision) return 0;
        if(modReqVersion.revision < otherVer.revision) return 2;

        return 1;
    };

    const loadMod = (modPath, manifest) => {
        if(Executive.mods.registry[manifest.id] !== undefined){
            if(checkVersionSupported(Executive.mods.registry[manifest.id].version, manifest.version) === 0){
                console.warn("[Executive] Attempted to load older version of already loaded mod " + manifest.name + " [" + manifest.id + "]" + " (" + err + ")");
                return;
            } else console.warn("[Executive] Loading newer version of already loaded mod " + manifest.name + " [" + manifest.id + "]" + " (" + err + ")");
        }

        let modExports = null;

        try {
            modExports = require(modPath + "main.js");
        } catch(err) {
            console.error("[Executive] Failed to load mod " + manifest.name + " [" + manifest.id + "]" + " (" + err + ")");
            console.log(err);
            return;
        }

        const modEntry = manifest;
        modEntry.exports = modExports;
        modEntry._modPath = modPath;

        Executive.mods.loaded.push(modEntry);
        Executive.mods.registry[modEntry.id] = modEntry;
        Executive.mods.count++;
    };

    const sourceFiles = fs.readdirSync("modFiles", {
        recursive: false,
        withFileTypes: true
    });

    sourceFiles.forEach(dirEntry => {
        /* Mods should be packaged in folders. */
        if(dirEntry.isDirectory() === true){
            const pathPrefix = "modFiles" + path.sep + dirEntry.name + path.sep;
            try {
                if(fs.existsSync(pathPrefix + "manifest.json") && fs.existsSync(pathPrefix + "main.js")){
                    const manifestText = fs.readFileSync(pathPrefix + "manifest.json", "utf8");
                    const manifestObj = JSON.parse(manifestText);

                    if(manifestObj.description === undefined){
                        manifestObj.description = "No description provided.";
                    }
                    
                    const compatNum = (manifestObj.required_loader_version !== undefined) ? checkVersionSupported(manifestObj.required_loader_version)
                        : 1;
                    if(compatNum === 0){
                        console.warn("[Executive] Unable to load mod " + manifestObj.name + " [" + manifestObj.id + "]; required Executive version too high");
                    } else {
                        loadMod(pathPrefix, manifestObj);
                    }
                }
            } catch(err) {
                console.error("[Executive] Failed to load mod folder " + dirEntry.name + " (" + err + ")");
            }
        }
    });
};

/* Add the version string to the main menu on first load. */
Executive.functions.createRawPostHook("addIntroMenu", () => {
    const versionParagraph = document.getElementById("mainIntroVersionP");

    versionParagraph.appendChild(document.createElement("br"));
    versionParagraph.appendChild(document.createTextNode("Running Executive for The Political Process (" + Executive.version.string + ")"));
    versionParagraph.appendChild(document.createElement("br"));
    versionParagraph.appendChild(document.createTextNode(Executive.mods.count.toLocaleString() + " mod" + (Executive.mods.count === 1 ? "" : "s") + " loaded"));
});

/* Now clean up internal Executive functions. */
Executive.functions.createRawPreHook = undefined;
Executive.functions.createRawPostHook = undefined;
Executive.functions.insertRawReplacement = undefined;

/* Add class definitions to the global environment. */
globalThis.BindableEvent = Executive.classes.BindableEvent;
globalThis.CustomProposition = Executive.classes.CustomProposition;

/* Mods will export init entrypoints. We need to go through and call those. */
Executive.mods.loaded.forEach(modEntry => {
    if(modEntry.exports.init !== undefined && typeof modEntry.exports.init === "function"){
        try {
            modEntry.exports.init();
        } catch(err) {
            console.error("[Executive] Mod " + modEntry.name + " [" + modEntry.id + "] failed to initialise (" + err + ")");
        };
    }
});

console.log("[Executive] Loaded " + Executive.mods.count.toString() + " mod" + ((Executive.mods.count !== 1) ? "s" : "") +".");

/* Once we've finished loading, we delete and reload the intro menu, as we can't hook
   in time to catch the first load. */
while(!document.getElementById("introMenuDiv")){}
document.getElementById("introMenuDiv").remove();
addIntroMenu();