var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');

/*
How to spawn creep:
Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], "Builder1");

*/

function calculateCostToSpawnBody(body) {
    var cost = 0;
    for (var b in body) {
        if ([CARRY, MOVE].includes(body[b])) {
            cost += 50;
        } else if (body[b] == WORK) {
            cost += 100;
        } else if (body[b] == ATTACK) {
            cost += 80;
        } else if (body[b] == RANGED_ATTACK) {
            cost += 150;
        } else if (body[b] == HEAL) {
            cost += 250;
        } else if (body[b] == CLAIM) {
            cost += 600;
        } else if (body[b] == TOUGH) {
            cost += 10;
        }
    }
}

function spawnNewCreep(name, mem, body=[WORK, CARRY, MOVE]) {
    if (Game.spawns['Spawn1'].store.getUsedCapacity() < calculateCostToSpawnBody(body)) { return }
    var id = 0;
    while (Game.spawns['Spawn1'].spawnCreep(body, name + id, {memory: mem}) == -3) {
        id++;
    }
}

module.exports.loop = function () {
    //console.log('test')
    /*var tower = Game.getObjectById('8a2e9fba758c212166f7e02b');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }*/

    // check if we need to make some new creeps
    var harvesters = 0;
    var builders = 0;
    var upgraders = 0;
    var repairers = 0;
    var creepsOfEach = 2;
    for (var name in Game.creeps) {
        if (Game.creeps[name].memory.role == 'harvester') {
            harvesters++;
        } else if (Game.creeps[name].memory.role == 'builder') {
            builders++;
        } else if (Game.creeps[name].memory.role == 'upgrader') {
            upgraders++;
        } else if (Game.creeps[name].memory.role == 'repairer') {
            repairers++;
        }
    }

    if (harvesters < 3) {
        spawnNewCreep('Harvester', {role: 'harvester'}, [MOVE, WORK, CARRY, CARRY])
    } else if (builders < 2) {
        spawnNewCreep('Builder', {role: 'builder'}, [MOVE, WORK, WORK, CARRY])
    } else if (upgraders < 4) {
        spawnNewCreep('Upgrader', {role: 'upgrader'}, [MOVE, MOVE, WORK, CARRY])
    } else if (repairers < 3) {
        spawnNewCreep('Repairer', {role: 'repairer'}, [MOVE, WORK, CARRY, CARRY])
    }

    // Run creep roles

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (!creep.spawning) {
            if (Memory.enforceRoles && !creep.memory.cantEnforeRoles) {
                creep.say("Enforcing...")
                if (Memory.roleToEnforce == 'harvester') {
                    roleHarvester.run(creep);
                } else if (Memory.roleToEnforce == 'upgrader') {
                    roleUpgrader.run(creep);
                } else if (Memory.roleToEnforce == 'builder') {
                    roleBuilder.run(creep);
                } else if (Memory.roleToEnforce == 'repairer') {
                    roleRepairer.run(creep);
                }
            } else {
                if (creep.memory.role == 'harvester') {
                    roleHarvester.run(creep);
                } else if (creep.memory.role == 'upgrader') {
                    roleUpgrader.run(creep);
                } else if (creep.memory.role == 'builder') {
                    roleBuilder.run(creep);
                } else if (creep.memory.role == 'repairer') {
                    roleRepairer.run(creep);
                }
            }
        }
    }
}
