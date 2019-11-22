var roleHarvester = require('role.harvester')

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var targetsb = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targetsb.length) {
            creep.memory.building = true;
        } else {
            //creep.say('no jobs');
            fullConts = creep.room.find(FIND_STRUCTURES, {filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER) && structure.store.getUsedCapacity() > 0});
            //dest = creep.room.find(FIND_MY_SPAWNS, {filter: (structure) => (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.store.getFreeCapacity() > 0});
            dest = Game.spawns['Spawn1']
            //console.log(dest)
            if (dest.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    creep.say('collecting from containers')
                    if (creep.withdraw(fullConts[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(fullConts[0])
                    }
                } else {
                    creep.say('putting in soawn')
                    if (creep.transfer(dest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dest)
                    }
                }
            }
            return;
        }
        
		if (creep.memory.collect && creep.store.getFreeCapacity() == 0) {
			creep.memory.collect = false;
			creep.memory.build = true;
			creep.say('build')
		}

	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.building = false;
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_CONTAINER) && 
							structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
				}
			});
			if(targets.length > 0) {
				creep.memory.collect = true;
				creep.memory.harvest = false
				creep.say("Collect")
			} else {
				creep.memory.harvest = true;
				creep.memory.collect = false;
				creep.say('🔄 harvest');
			}
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
			creep.memory.harvest = false;
			creep.memory.collect = false;
			creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targetsb = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targetsb.length) {
                if(creep.build(targetsb[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetsb[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                //creep.say('no jobs');
                //roleHarvester.run(creep);
            }
	    }
	    else if (creep.memory.collect) {
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_CONTAINER) && 
							structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
				}
			});
			if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
			}
		} else {
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleBuilder;
