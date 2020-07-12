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

const maxZombies = 1;
const maxSpawnRadius = 2;
const minSpawnRadius = 2;
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


game.addRelationshipGroup("zombeez");
game.setRelationshipBetweenGroups(5, game.getHashKey("zombeez"), game.getHashKey("PLAYER"));
game.setRelationshipBetweenGroups(5, game.getHashKey("zombeez"), game.getHashKey("looters"));
game.setRelationshipBetweenGroups(5, game.getHashKey("PLAYER"), game.getHashKey("zombeez"));

alt.setInterval(() => {
    alt.log(peds.length);
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
        alt.log('Your Pos ' + playerPos.x + ' ' + playerPos.y + ' ' + playerPos.z);
        alt.log('Zombie spawned at ' + newX + ' ' + newY + ' ' + newZ);

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

// alt.setInterval(() => {
//     peds.forEach((ped, index) => {
//         //Gets the player infected when a zombie attacks them
//         playerX, playerY, playerZ = table.unpack(GetEntityCoords(GetPlayerPed(-1), true))
//         pedX, pedY, pedZ = table.unpack(GetEntityCoords(ped, true))
//         infection = DecorGetFloat(PlayerPedId(),"infection")
//         if(Vdist(pedX, pedY, pedZ, playerX, playerY, playerZ) < 2.0)then
//             if IsPedInMeleeCombat(ped) then
//                 if HasEntityBeenDamagedByEntity(PlayerPedId(), ped, 1) then
//                     Citizen.Trace("Player has been hit by zombie.")
//                     hitCount = hitCount + 1
//                     hasBeenHit = true
//                 end
//             end
//         end
            
//         if hitCount > 2 then
//             infected = true
//         end
            
//         if infected == false then
//             DecorSetFloat(PlayerPedId(),"infection", 0)
//         end
            
//         if infected == true then
//             DecorSetFloat(PlayerPedId(),"infection", infection + 1)
//             Citizen.Wait(15000)
//         end
        
//         -- Finish guard missions Zombie killing
//         if zombieCount > 9 then
//             killedZombies = true
//             guardMission = false
//             ShowNotification("Return to the guard.")
//         end
            
//         -- Return collected fingers to Jason
//         if fingerCount > 4 then
//             hasFingers = true
//             jasonMission = false
//             ShowNotification("You have all the fingers Jason wants, return them to him.")
//         end
        
//         -- Increase Zombie Count for Guard Mission
//         if guardMission == true then
//             if IsPedDeadOrDying(ped, 1) == 1 then
//                 if GetPedSourceOfDeath(ped) == PlayerPedId() then
//                     zombieCount = zombieCount + 1
//                     local model = GetEntityModel(ped)
//                     SetEntityAsNoLongerNeeded(ped)
//                     SetModelAsNoLongerNeeded(model)
//                     table.remove(peds, i)
//                     zombieCountAdd = true
//                 end
//             end
//         end
        
//         if IsPedDeadOrDying(ped, 1) == 1 then
//             playerX, playerY, playerZ = table.unpack(GetEntityCoords(GetPlayerPed(-1), true))
//             pedX, pedY, pedZ = table.unpack(GetEntityCoords(ped, true))	
//             if not IsPedInAnyVehicle(PlayerPedId(), false) then
//                 if(Vdist(playerX, playerY, playerZ, pedX, pedY, pedZ) < 3.0)then
//                     DisplayHelpText("Press ~INPUT_CONTEXT~ to loot zombie.")
//                     if IsControlJustReleased(1, 51) then -- E key
//                         if DoesEntityExist(GetPlayerPed(-1)) then
//                             RequestAnimDict("pickup_object")
//                             while not HasAnimDictLoaded("pickup_object") do
//                             Citizen.Wait(1)
//                             end
//                             TaskPlayAnim(PlayerPedId(), "pickup_object", "pickup_low", 8.0, -8, -1, 49, 0, 0, 0, 0)
//                             experience = DecorGetFloat(PlayerPedId(), "experience")
                            
//                             if jasonMission == true then
//                                 fingerCount = fingerCount + 1
//                                 Citizen.Trace("Finger collected")
//                             end
                                
//                             randomChance = math.random(1, 100)
//                             randomLoot = loot[math.random(1, #loot)]
//                             DecorSetFloat(PlayerPedId(), "experience", experience + 10)
//                             Citizen.Wait(2000)
//                             if randomChance > 0 and randomChance < 20 then
//                                 GiveWeaponToPed(PlayerPedId(), randomLoot, 8, true, false)
//                                 ShowNotification("You found " .. randomLoot)
//                             elseif randomChance >= 20 and randomChance < 40 then
//                                 randomCredits = math.random(2, 15)
//                                 zCredits = zCredits + randomCredits
//                                 ShowNotification("You found " .. randomCredits.. " Zombie Credits")
//                             elseif randomChance >= 40 and randomChance < 60 then
//                                 zBlood = zBlood + 1
//                                 ShowNotification("You found Zombie blood")
//                             elseif randomChance >= 60 and randomChance < 80 then
//                                 randomLogs = math.random(1, 5)
//                                 woodLogs = woodLogs + randomLogs
//                                 ShowNotification("You found " ..randomLogs.. " wood logs")
//                             elseif randomChance >= 80 and randomChance < 100 then
//                                 ShowNotification("You found nothing.")
//                             end
//                             ClearPedSecondaryTask(GetPlayerPed(-1))
//                             --RemoveBlip(blip)
//                             local model = GetEntityModel(ped)
//                             SetEntityAsNoLongerNeeded(ped)
//                             SetModelAsNoLongerNeeded(model)
//                             --DeleteEntity(ped)
//                             table.remove(peds, i)
//                         end
//                     end
//                 end
//             end
//         end
        
//         -- Makes zombies ragdoll in vehicle
//         if IsPedSittingInAnyVehicle(GetPlayerPed(-1)) then
//             SetPedCanRagdoll(ped, true)
//         elseif not IsPedSittingInAnyVehicle(GetPlayerPed(-1)) then
//             SetPedCanRagdoll(ped, false)
//         end
//     })

// });