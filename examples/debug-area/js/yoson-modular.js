//clase with pattern factory with the idea of create modules
var Modular = function(entityBridge){
    this.entityBridge = entityBridge;
    this.moduleInstance = "";
    this.status = "stop";
};

//create a empty context of module
Modular.prototype.create = function(moduleDefinition){
    var moduleInstance = moduleDefinition(this.entityBridge);
    for(var propertyName in moduleInstance){
        var method = moduleInstance[propertyName];
        moduleInstance[propertyName] = this.generateModularDefinition(propertyName, method);
    }
    this.moduleInstance = moduleInstance;
};

//create a definition of module self
Modular.prototype.generateModularDefinition = function(functionName, functionSelf){
    if(typeof functionSelf === "function"){
        return function(){
            try {
                return functionSelf.apply(this, arguments);
            } catch( ex ){
                console.log(functionName + "(): " + ex.message);
            }
        };
    } else {
        return functionSelf;
    }
};

//start a simple module
Modular.prototype.start = function(parameters){
    var params = this.dealParamaterOfModule(parameters);
    this.runInitMethodOfModule(params);
};

Modular.prototype.dealParamaterOfModule = function(parametersOfModule){
    var newParameters = {};
    if(typeof parametersOfModule !== "undefined"){
        newParameters = parametersOfModule;
    }
    return newParameters;
};

Modular.prototype.runInitMethodOfModule = function(parameters){
    var moduleDefinition = this.moduleInstance;
    if(typeof moduleDefinition.init === "function"){
        this.setStatusModule("run");
        moduleDefinition.init(parameters);
    }
};

Modular.prototype.setStatusModule = function(statusName){
    this.status = statusName;
};

Modular.prototype.getStatusModule = function(){
    return this.status;
};
    var ModularManager = function(){

        this.modules = {};
        this.runningModules = {};
        this.entityBridge = {};
        this.alreadyAllModulesBeRunning = null;
    };

    //receive one method for the entity comunicator on modules
    ModularManager.prototype.addMethodToBrigde = function(methodName, methodSelf){
        this.entityBridge[methodName] = methodSelf;
    };

    //adding a module
    ModularManager.prototype.addModule = function(moduleName, moduleDefinition){
        var modules = this.modules;
        if(!this.existsModule(moduleName)){
            modules[moduleName] = new Modular(this.entityBridge);
            modules[moduleName].create(moduleDefinition);
            console.log('this', this.modules);
        }
    };

    //verifying the existence of one module by name
    ModularManager.prototype.existsModule = function(moduleName){
        var founded = false;
        if(this.getModule(moduleName)){
            founded = true;
        }
        return founded;
    };

    //return the module from the collection of modules
    ModularManager.prototype.getModule = function(moduleName){
        console.log('getModule::', this.modules);
        return this.modules[moduleName];
    };

    //running the module
    ModularManager.prototype.runModule = function(moduleName, optionalParameters){
        var module = this.getModule(moduleName);
        console.log('runModule', module);
        if(this.existsModule(moduleName)){
            module.start(optionalParameters);
        }
    };

    //running one list of modules
    ModularManager.prototype.runModules = function(moduleNames){
        //its necesary the parameter moduleNames must be a type Array
        if(moduleNames instanceof Array){
            for(var moduleName in moduleNames){
                this.runModule(moduleNames[moduleNames]);
            }
        }
    };

    ModularManager.prototype.eachModules = function(eachModule){
        for(var moduleName in this.modules){
            eachModule.call(this, moduleName);
        }
    };


    ModularManager.prototype.getTotalModulesRunning = function(){
        var total = 0;
        this.eachModules(function(moduleName){
            if(moduleName.getStatus() === "run"){
                total++;
            }
        });
        return total;
    };

    ModularManager.prototype.getTotalModulesStarted = function(){
        var total = 0;
        this.eachModules(function(moduleName){
            if(moduleName.getStatus() === "start"){
                total++;
            }
        });
        return total + this.getTotalModulesRunning();
    };

    ModularManager.prototype.allModulesRunning = function(onNotFinished, onFinished){
        var that = this;
        if(this.alreadyAllModulesBeRunning){
            onFinished.call(that);
        } else {
            var checkModulesRunning = setInterval(function(){
                if(that.getTotalModulesStarted() > 0){
                    if( that.getTotalModulesStarted() == that.getTotalModulesRunning()){
                        this.alreadyAllModulesBeRunning = true;
                        onFinished.call(that);
                        clearInterval(checkModulesRunning);
                    } else {
                        onNotFinished.call(that);
                    }
                } else {
                    this.alreadyAllModulesBeRunning = true;
                    onFinished.call(that);
                    clearInterval(checkModulesRunning);
                }
            }, 200);
        }
    };
