var Mutator = function(table){
	this.table = table; //hold Tabulator object
	this.allowedTypes = ["", "data", "edit", "clipboard"]; //list of muatation types
};

//initialize column mutator
Mutator.prototype.initializeColumn = function(column){
	var self = this,
	match = false,
	config = {};

	this.allowedTypes.forEach(function(type){
		var key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1)),
		mutator;

		if(column.definition[key]){
			mutator = self.lookupMutator(column.definition[key]);

			if(mutator){
				match = true;

				config[key] = {
					mutator:mutator,
					params: column.definition[key + "Params"] || {},
				};
			}
		}
	});

	if(match){
		column.modules.mutate = config;
	}
};

Mutator.prototype.lookupMutator = function(value){
	var mutator = false;

	//set column mutator
	switch(typeof value){
		case "string":
		if(this.mutators[value]){
			mutator = this.mutators[value];
		}else{
			console.warn("Mutator Error - No such mutator found, ignoring: ", value);
		}
		break;

		case "function":
		mutator = value;
		break;
	}

	return mutator;
};

//apply mutator to row
Mutator.prototype.transformRow = function(data, type, update){
	var self = this,
	key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1)),
	value;

	self.table.columnManager.traverse(function(column){
		var mutator;

		if(column.modules.mutate){

			mutator = column.modules.mutate[key] || column.modules.mutate.mutator || false;

			if(mutator){
				value = column.getFieldValue(data);

				if(!update || (update && typeof value !== "undefined")){
					column.setFieldValue(data, mutator.mutator(value, data, type, mutator.params, column.getComponent()));
				}
			}
		}
	});

	return data;
};

//apply mutator to new cell value
Mutator.prototype.transformCell = function(cell, value){
	var mutator = cell.column.modules.mutate.mutatorEdit || cell.column.modules.mutate.mutator || false;

	if(mutator){
		return mutator.mutator(value, cell.row.getData(), "edit", mutator.params, cell.getComponent());
	}else{
		return value;
	}
};

//default mutators
Mutator.prototype.mutators = {};

Tabulator.prototype.registerModule("mutator", Mutator);