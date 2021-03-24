import game from 'natives';
import alt from 'alt';

const pedModels = [
	"A_M_M_Hillbilly_02",
	"U_M_Y_Zombie_01",
	"u_f_m_corpse_01",
	"a_m_y_vindouche_01",
	"s_m_m_scientist_01",
	"s_m_y_swat_01",
];

const loot = [
	"WEAPON_PISTOL",
	"WEAPON_MG",
	"WEAPON_PUMPSHOTGUN",
	"WEAPON_SNIPERRIFLE",
	"WEAPON_MACHETE",
	"WEAPON_CROWBAR",
	"WEAPON_ASSAULTRIFLE",
	"WEAPON_COMPACTRIFLE",
	"WEAPON_COMBATMG",
	"WEAPON_BAT",
	"WEAPON_HATCHET",
	"WEAPON_CARBINERIFLE",
];

const walkStyles = [
	"move_m@drunk@verydrunk",
	"move_m@drunk@moderatedrunk",
	"move_m@drunk@a",
	"anim_group_move_ballistic",
	"move_lester_CaneUp",
];

const maxZombies = 50;
const maxSpawnRadius = 200;
const minSpawnRadius = 35;
const despawnRadius = 250;

let infected = false;
let hasBeenHit = false;
let hasNotBeenHit = true;
let experienceEarned = false;
let fingerCount = 0;
let zombieCount = 0;
let hitCount = 0;

let players = [];

let peds = [];

let deadPeds = [];

let randomCredits = 0;
let zCredits = 0;
let experience = 0;


game.addRelationshipGroup("zombeez");
game.setRelationshipBetweenGroups(5, game.getHashKey("zombeez"), game.getHashKey("PLAYER"));
game.setRelationshipBetweenGroups(5, game.getHashKey("zombeez"), game.getHashKey("looters"));
game.setRelationshipBetweenGroups(5, game.getHashKey("PLAYER"), game.getHashKey("zombeez"));

alt.setInterval(() => {
    //alt.log(peds.length);
    if(peds.length < maxZombies) {
        let playerPos = game.getEntityCoords(game.getPlayerPed(-1), true);

        let choosenPed = pedModels[Math.floor(Math.random() * pedModels.length)];
        choosenPed = choosenPed.toUpperCase();
        game.requestModel(game.getHashKey(choosenPed));

        // while(!game.hasModelLoaded(game.getHashKey(choosenPed)) || !game.hasCollisionForModelLoaded(game.getHashKey(choosenPed)){
        //     Wait(1);
        // }

        let newX = playerPos.x;
        let newY = playerPos.y;
        let newZ = playerPos.z + 999.0;

        // do {
        //     //Wait(1)
            newX = playerPos.x + Math.floor(Math.random() * (maxSpawnRadius - minSpawnRadius + 1) ) + minSpawnRadius;
            newY = playerPos.y + Math.floor(Math.random() * (maxSpawnRadius - minSpawnRadius + 1) ) + minSpawnRadius;
            newZ = game.getGroundZFor3dCoord(newX+.0,newY+.0,playerPos.z, 1);
            

        //     for(player in pairs(players) do
        //         Wait(1)
        //         playerX, playerY = table.unpack(GetEntityCoords(GetPlayerPed(-1), true))
        //         if newX > playerX - minSpawnDistance and newX < playerX + minSpawnDistance or newY > playerY - minSpawnDistance and newY < playerY + minSpawnDistance then
        //             canSpawn = false
        //             break
        //         else
        //             canSpawn = true
        //         end
        //     end
        // } while(canSpawn);
            
        let ped = game.createPed(4, game.getHashKey(choosenPed), newX, newY, newZ, 0.0, false, true);
        //alt.log('Your Pos ' + playerPos.x + ' ' + playerPos.y + ' ' + playerPos.z);
        //alt.log('Zombie spawned at ' + newX + ' ' + newY + ' ' + newZ);

        game.setPedArmour(ped, 100);
        game.setPedAccuracy(ped, 25);
        game.setPedSeeingRange(ped, 10.0);
        game.setPedHearingRange(ped, 1000.0);

        game.setPedFleeAttributes(ped, 0, 0);
        game.setPedCombatAttributes(ped, 16, 1);
        game.setPedCombatAttributes(ped, 17, 0);
        game.setPedCombatAttributes(ped, 46, 1);
        game.setPedCombatAttributes(ped, 1424, 0);
        game.setPedCombatAttributes(ped, 5, 1);
        game.setPedCombatRange(ped,2);
        game.setPedAlertness(ped,3);
        game.setAmbientVoiceName(ped, "ALIENS");
        game.setPedEnableWeaponBlocking(ped, true);
        game.setPedRelationshipGroupHash(ped, game.getHashKey("zombeez"));
        game.disablePedPainAudio(ped, true);
        game.setPedDiesInWater(ped, false);
        game.setPedDiesWhenInjured(ped, false);
        //PlaceObjectOnGroundProperly(ped)
        game.setPedDiesInstantlyInWater(ped,true);
        game.setPedIsDrunk(ped, true);
        game.setPedConfigFlag(ped,100,1);
        game.applyPedDamagePack(ped,"BigHitByVehicle", 0.0, 9.0);
        game.applyPedDamagePack(ped,"SCR_Dumpster", 0.0, 9.0);
        game.applyPedDamagePack(ped,"SCR_Torture", 0.0, 9.0);
        game.stopPedSpeaking(ped,true);

        let walkStyle = walkStyles[Math.floor(Math.random() * walkStyles.length)];
            
        game.requestAnimSet(walkStyle);
        // while(game.hasAnimSetLoaded(walkStyle)) {
        //     Citizen.Wait(1)
        // }
        
        game.setPedMovementClipset(ped, walkStyle, 1.0);
        game.taskWanderStandard(ped, 1.0, 10);
        let pspeed = Math.random(20,70);
        pspeed = pspeed/10;
        pspeed = pspeed+0.01;
        game.setEntityMaxSpeed(ped, 5.0);

        // if(!game.networkGetEntityIsNetworked(ped)) {
        //     game.networkRegisterEntityAsNetworked(ped);
        // }
        peds.push(ped);
    }

    peds.forEach((ped, index) => {
        if(game.doesEntityExist(ped) == false) {
            peds.splice(index, 1);
        }
        
        let playerPos = game.getEntityCoords(game.getPlayerPed(-1), true);
        let pedPos = game.getEntityCoords(ped, true);
        //Delete far away unlooted dead zombies after 60 seconds
        if(game.isPedDeadOrDying(ped, 1) == 1) {
            deadPeds.push(ped);
            peds.splice(index, 1);
            // if(game.vdist(playerPos.x, playerPos.y, playerPos.z, pedPos.x, pedPos.y, pedPos.z) > 75.0) {
            //     //Set ped as no longer needed for despawning
            //     //local dropChance = math.random(0,100)
            //     //Citizen.Trace("Delete unlooted dead Zombie")
            //     //RemoveBlip(blip)
            //     let model = game.getEntityModel(ped);
            //     game.setEntityAsNoLongerNeeded(ped);
            //     game.setModelAsNoLongerNeeded(model);
            //     //DeleteEntity(ped)
            //     peds.splice(index, 1);
            // }
        }
        game.setPedArmour(ped, 100)
        game.setPedAccuracy(ped, 25)
        game.setPedSeeingRange(ped, 10.0)
        game.setPedHearingRange(ped, 1000.0)

        game.setPedFleeAttributes(ped, 0, 0)
        game.setPedCombatAttributes(ped, 16, 1)
        game.setPedCombatAttributes(ped, 17, 0)
        game.setPedCombatAttributes(ped, 46, 1)
        game.setPedCombatAttributes(ped, 1424, 0)
        game.setPedCombatAttributes(ped, 5, 1)
        game.setPedCombatRange(ped,2)
        game.setAmbientVoiceName(ped, "ALIENS")
        game.setPedEnableWeaponBlocking(ped, true)
        game.setPedRelationshipGroupHash(ped, game.getHashKey("zombeez"))
        game.disablePedPainAudio(ped, true)
        game.setPedDiesInWater(ped, false)
        game.setPedDiesWhenInjured(ped, false)
        
        if(game.vdist(playerPos.x, playerPos.y, playerPos.z, pedPos.x, pedPos.y, pedPos.z) > despawnRadius) {
            //Set ped as no longer needed for despawning
            let model = game.getEntityModel(ped);
            game.setEntityAsNoLongerNeeded(ped);
            game.setModelAsNoLongerNeeded(model);
            //DeleteEntity(ped)
            peds.splice(index, 1);
        }
    });
}, 2000);

alt.setInterval(() => {
    deadPeds.forEach((ped, index) => {
        //Set ped as no longer needed for despawning
        let model = game.getEntityModel(ped);
        game.setEntityAsNoLongerNeeded(ped);
        game.setModelAsNoLongerNeeded(model);
        //DeleteEntity(ped)
        deadPeds.splice(index, 1);
    });
}, 60000);

alt.setInterval(() => {
            //Gets the player infected when a zombie attacks them
            let playerPos = game.getEntityCoords(game.getPlayerPed(-1), true);
            
            let infection = game.decorGetFloat(game.playerPedId(),"infection");
    peds.forEach((ped, index) => {
        let pedPos = game.getEntityCoords(ped, true);
        if (game.vdist(pedPos.x, pedPos.y, pedPos.z, playerPos.x, playerPos.y, playerPos.z) < 2.0) {
            if (game.isPedInMeleeCombat(ped)) {
                if(game.hasEntityBeenDamagedByEntity(game.playerPedId(), ped, 1)) {
                    alt.log('player hit by zombie');
                    hitCount = hitCount + 1;
                    hasBeenHit = true;
                }
            }
        }
            
        if (hitCount > 2) {
            infected = true;
        }
            
        // if(infected == false) {
        //     game.decorSetFloat(game.playerPedId(),"infection", 0);
        // }
            
        // if(infected == true) {
        //     game.decorSetFloat(game.playerPedId(),"infection", infection + 1);
        //     //Citizen.Wait(15000);
        // }
        
        //Finish guard missions Zombie killing
        // if zombieCount > 9 then
        //     killedZombies = true
        //     guardMission = false
        //     ShowNotification("Return to the guard.")
        // end
            
        //Return collected fingers to Jason
        // if fingerCount > 4 then
        //     hasFingers = true
        //     jasonMission = false
        //     ShowNotification("You have all the fingers Jason wants, return them to him.")
        // end
        
        //Increase Zombie Count for Guard Mission
        // if guardMission == true then
        //     if IsPedDeadOrDying(ped, 1) == 1 then
        //         if GetPedSourceOfDeath(ped) == PlayerPedId() then
        //             zombieCount = zombieCount + 1
        //             local model = GetEntityModel(ped)
        //             SetEntityAsNoLongerNeeded(ped)
        //             SetModelAsNoLongerNeeded(model)
        //             table.remove(peds, i)
        //             zombieCountAdd = true
        //         end
        //     end
        //end
    
        
        // -- Makes zombies ragdoll in vehicle
        // if IsPedSittingInAnyVehicle(GetPlayerPed(-1)) then
        //     SetPedCanRagdoll(ped, true)
        // elseif not IsPedSittingInAnyVehicle(GetPlayerPed(-1)) then
        //     SetPedCanRagdoll(ped, false)
        // end
    });

    deadPeds.forEach((ped, index)=> {
        alt.log('dead ped init');
        if (game.isPedDeadOrDying(ped, 1) == 1) {
            if (!game.isPedInAnyVehicle(game.playerPedId(), false)) {
                let pedPos = game.getEntityCoords(ped, true);
                alt.log('inside loot');
                if(game.vdist(playerPos.x, playerPos.y, playerPos.z, pedPos.x, pedPos.y, pedPos.z) < 3.0) {
                    alt.log('can loot');
                    game.displayHelpTextThisFrame("Press E to loot zombie.", true);
                    if(game.isControlJustReleased(1, 51)) { //-- E key
                        if (game.doesEntityExist(game.getPlayerPed(-1))) {
                            game.requestAnimDict("pickup_object");
                            // while not HasAnimDictLoaded("pickup_object") do
                            // Citizen.Wait(1)
                            // end
                            game.taskPlayAnim(game.playerPedId(), "pickup_object", "pickup_low", 8.0, -8, -1, 49, 0, 0, 0, 0);
                            //experience = game.decorGetFloat(game.playerPedId(), "experience");
                            
                            // if jasonMission == true then
                            //     fingerCount = fingerCount + 1
                            //     Citizen.Trace("Finger collected")
                            // end
                                
                            let randomChance = Math.floor(Math.random() * 100) + 1;
                            let randomLoot = loot[Math.floor(Math.random() * pedModels.length)]
                            //game.decorSetFloat(game.playerPedId(), "experience", experience + 10)
                            //Citizen.Wait(2000)
                            alt.log('randomChance');
                            if(randomChance > 0 && randomChance < 20) {
                                game.giveWeaponToPed(game.playerPedId(), randomLoot, 8, true, false)
                                game.showNotification("You found " + randomLoot);
                                alt.log("You found " + randomLoot);
                            }
                            else if(randomChance >= 20 && randomChance < 40) {
                                randomCredits = Math.floor(Math.random() * 15) + 2;
                                zCredits = zCredits + randomCredits;
                                game.showNotification("You found " + randomCredits + " Zombie Credits");
                            }
                            // else if (randomChance >= 40 && randomChance < 60) {
                            //     zBlood = zBlood + 1
                            //     ShowNotification("You found Zombie blood")
                            // }
                            // elseif randomChance >= 60 and randomChance < 80 then
                            //     randomLogs = math.random(1, 5)
                            //     woodLogs = woodLogs + randomLogs
                            //     ShowNotification("You found " ..randomLogs.. " wood logs")
                            else if(randomChance >= 40 && randomChance < 100) {
                                alt.log("You found nothing.");
                                game.showNotification("You found nothing.");
                            }
                            game.clearPedSecondaryTask(game.getPlayerPed(-1));
                            //RemoveBlip(blip)
                            let model = game.getEntityModel(ped);
                            game.setEntityAsNoLongerNeeded(ped);
                            game.setModelAsNoLongerNeeded(model);
                            //DeleteEntity(ped)
                            table.remove(peds, i)
                        }
                    }
                }
            }
        }
    });

},500);