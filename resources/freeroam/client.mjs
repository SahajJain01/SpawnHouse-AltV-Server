import game from 'natives';

game.setPedDefaultComponentVariation(game.playerPedId());

let myped = game.createRandomPed(10, 2, 72);

game.taskGoToEntity(myped,game.getPlayerPed(-1),-1, 0.0, 10.0, 1073741824.0, 0); 

game.setPedCombatMovement(myped,3);
