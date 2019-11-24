// this just 'imports' the other scripts

// Creep Scripts
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleDefender = require('role.defender');

// Tower Scripts
var towerGeneral = require('tower.general');

// this is a function to calculate the cost to spawn a body
// i could probably simplify this, but i dont feel like it yet.
// if i was going to i would use a dict (or object in js, im used to python, so i call {this:thing} a dict)
function calculateCostToSpawnBody(body) {
    var cost = 0; // this variable stores the cost between the below loop iterations
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
    return cost; // returns the cost
}

//this function spawns a new creep
// i made a function that wraps Game.spawns[].spawnCreep() because that takes forever to type out
function spawnNewCreep(name, mem, body=[WORK, CARRY, MOVE], spawnLocation="Spawn1") {
    if (Game.spawns[spawnLocation].store.getUsedCapacity() > calculateCostToSpawnBody(body)) { // here we use the above function to see if we have enough energy to spawn the creep
        console.log('too expensive!');
        return; // returning nothing just breaks out of the function
    } else {
        var id = 0; // the id isnt really an id, it just gets added to the name which, and name + id is the id of the creep
        while (Game.spawns[spawnLocation].spawnCreep(body, name + id, {memory: mem}) == -3) {
            id++; // the above line attempts to spawn a creep, and the spawnCreep() method returns -3 if it couldnt spawn because of duplicate ids
            // so if there is a dupe, we just have to add 1 to id and try again
        }
    }
}

module.exports.loop = function () {
    //console.log('test')
    var tower = Game.getObjectById("9d458fcf08c8823");
    towerGeneral.run(tower)

    var creepTypes = { // here we store data we need about each creep type
        "defender": {
            "count": 0,
            "max": 1,
            "body": [MOVE, MOVE, ATTACK],
            "name": "Defender"
        },
        "repairer": { // this is the role.memory name of the creep
            "count": 0, // this should always be 0 in the script, this is changed by the script to count how many there are
            "max": 3, // this is how many the script should automatically spawn
            "body": [MOVE, MOVE, WORK, CARRY], // this is the body the script should spawn creeps of this type with, all creeps should have at least 1 MOVE, but the rest depends on its job
            "name": "Repairer" // this is the name it spawns creeps with. actually is does "Name0" with 0 being a count so its unique
        },
        "upgrader": {
            "count": 0,
            "max": 2,
            "body": [MOVE, WORK, WORK, CARRY],
            "name": "Upgrader"
        },
        "builder": {
            "count": 0,
            "max": 4,
            "body": [MOVE, WORK, WORK, CARRY],
            "name": "Builder"
        },
        "harvester": {
            "count": 0,
            "max": 3,
            "body": [MOVE, WORK, CARRY, CARRY],
            "name": "Harvester"
        }
    }

    // this counts how many creeps of each type we have
    for (var name in Game.creeps) {
        creepTypes[Game.creeps[name].memory.role]['count']++;
    }

    for (var type in creepTypes) { // loops all creeps
        if (creepTypes[type]['count'] < creepTypes[type]['max']) { // if count < max: spawn new creep
            spawnNewCreep(creepTypes[type]['name'], {role: type}, creepTypes[type]['body']) // actually spawn the creep
        }
    }

    // Run creep roles
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (!creep.spawning) { // we dont want to tell the creep to do something while its spawning
            if (Memory.enforceRoles && !creep.memory.cantEnforeRoles) { // if we are forcing roles in an emergency, we have to make sure the creep can enforce roles
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
                } else if (creep.memory.role == 'defender') {
                    roleDefender.run(creep);
                }
            }
        }
    }
}
