var newBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //Get lists of sites of interest
        var buildSites = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        var harvestSites = creep.pos.findClosestByPath(FIND_SOURCES);
        var storeSites = creep.room.find(FIND_STRUCTURES, {filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER) && structure.store.getUsedCapacity() > 0});
        var storeSitesNotFull = creep.room.find(FIND_STRUCTURES, {filter: (structure) => (structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity() > 0});

        //figure out what the creeps job should be
        var hasEnergy = creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
        var areStoreSites = storeSites > 0;
        var isHarvesting = creep.memory.harvest

        // here we check if the creep is currently harvesting or collecting energy, once its full, we should stop
        if (isHarvesting && creep.store.getFreeCapacity() == 0) {
            creep.memory.harvest = false;
            isHarvesting = false
        }
        
        // lets actually figure out and do what we need to do

        /* heres how this logic works:
        If (are build sites, has energy, is not harvesting):
            build
        
        if (are build sites, and are storage sites with avaliable energy) implies: could be harvesting (we want to take from storage if possible, its faster), and that we dont have energy
            collect from storage

        if (are build sites) implies: no energy, no storage sites with energy
            harvest

        if (not full storages > 0) implies: no build sites
            if (has energy and not harvesting)
                give energy to storage
            else:
                harvest

        */

        if (buildSites && hasEnergy && !isHarvesting) { // if there are things that need to be built, and the creep has energy, build it
            if (creep.build(buildSites) == ERR_NOT_IN_RANGE) {
                creep.moveTo(buildSites)//, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else if (buildSites && areStoreSites) {
            creep.memory.harvest = true;
            if (creep.withdraw(storeSites, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storeSites)//, {visualizePathStyle: {stroke: '#ffff00'}});
            }
        } else if (buildSites) {
            creep.memory.harvest = true;
            if (creep.harvest(harvestSites) == ERR_NOT_IN_RANGE) {
                creep.moveTo(harvestSites)//, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else if (storeSitesNotFull.length > 0) {
            if (hasEnergy && !isHarvesting) {
                if (creep.transfer(storeSitesNotFull[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storeSitesNotFull[0])//, {visualizePathStyle: {stroke: "##ffaa00"}})
                } 
            } else {
                creep.memory.harvest = true;
                if (creep.harvest(harvestSites) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(harvestSites)//, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
    }
}

module.exports = newBuilder;
