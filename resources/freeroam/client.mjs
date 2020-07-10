import game from 'natives';

game.setPedDefaultComponentVariation(game.playerPedId());

game.addRelationshipGroup("rioters");
var myped = game.createRandomPed(10, 2, 72);
game.setPedCombatAttributes(myped, 46, true);
game.setPedRelationshipGroupHash(myped, game.getHashKey("rioters"));
game.setRelationshipBetweenGroups(5, game.getHashKey("rioters"), game.getHashKey("PLAYER"));
game.setRelationshipBetweenGroups(5, game.getHashKey("PLAYER"), game.getHashKey("rioters"));
game.taskGoToEntity(myped,game.getPlayerPed(-1),-1, 1.0, 10.0, 1073741824.0, 0);