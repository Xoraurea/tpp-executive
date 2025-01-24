/* tpp-executive - executive/debug.js 
   Implements helper functions and hooks to debug and reverse engineer the game
   As this utilises the game's hook functionality, it must be loaded after the API becomes available */

if(Executive.functions === undefined){
    console.error("[Executive] [Debug] Cannot load debug library without API loaded");
} else {
    const debug = {
        logFunctionCalls: false,
        logWrappedObjects: true,
        printTraceDuringExecution: false
    };

    /* We need to install hooks for exploring function calls. */
    {
        let baseCallTree = {
            functionSig: null,
            functionArgs: [],
            functionRtn: null,
            parent: null,
            children: []
        };
    
        let currentWrapLevel = 0;
        let currentNode = baseCallTree;

        Executive.symbols.functions.forEach(symbol => {
            Executive.functions.registerPreHook(symbol, (args) => {
                if(debug.logFunctionCalls){
                    const tabSpace = "   ".repeat(currentWrapLevel);
                    
                    if(debug.printTraceDuringExecution) {
                        console.log(tabSpace + "Calling " + symbol);

                        for(let i = 0; i < args.length; i++){
                            console.log(tabSpace + " - Argument " + i.toString() + ": " + args[i]);
                        };
                    }

                    const newNode = {
                        functionSig: symbol,
                        functionArgs: args,
                        parent: currentNode,
                        children: []
                    };

                    currentNode.children.push(newNode);
                    currentNode = newNode;

                    currentWrapLevel++;
                };
            });

            Executive.functions.registerPostHook(symbol, (args, rtnVal) => {
                if(debug.logFunctionCalls){
                    const tabSpace = "   ".repeat(currentWrapLevel);
                    currentWrapLevel--;

                    /* With other hooks remaining well-behaved, this should point to the
                       current function's node. */
                    currentNode.functionRtn = rtnVal;

                    currentNode = currentNode.parent;
                    if(currentWrapLevel === 0){
                        console.log(baseCallTree.children[0]);
                        baseCallTree.children = [];
                    };

                    if(rtnVal !== undefined && debug.printTraceDuringExecution) console.log(tabSpace + " - Returning " + rtnVal);
                };
            });
        });
    };

    /* Add the capacity for objects to be wrapped in a logger proxy. */
    debug.createLoggerProxy = (targetObj, name) => {
        /* Add a logger for every child object. */
        Object.keys(targetObj).forEach(childProperty => {
            if(typeof targetObj[childProperty] === "object"){
                debug.createLoggerProxy(targetObj[childProperty]);
            }
        });

        return new Proxy(targetObj, {
            get: (target, property) => {
                if(debug.logWrappedObjects)
                    console.log("[Logger Proxy] Accessed " + property + " in " +
                        ((name !== undefined) ? name : targetObj.toString()));
                return target[property];
            },
            set: (target, property, newVal) => {
                if(debug.logWrappedObjects)
                    console.log("[Logger Proxy] Set " + property + " to " + newVal.toString() + " in " + 
                        ((name !== undefined) ? name : targetObj.toString()));
                target[property] = newVal;
            }
        });
    };

    module.exports = debug;
};