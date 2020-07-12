import * as alt from 'alt';
import * as chat from 'chat';
import { weaponList } from './weapons.mjs'

const spawnLocation = {
    x: 1070.20,
    y: -711.95,
    z: 58.483
}

alt.on('playerConnect', InitializePlayer);
alt.on('playerDeath', (target) => {
    target.spawn(spawnLocation.x, spawnLocation.y, spawnLocation.z, 2000);
})

function InitializePlayer(player) {
    chat.setupPlayer(player);
    player.model = 'a_m_y_beachvesp_01';
    player.spawn(spawnLocation.x, spawnLocation.y, spawnLocation.z, 0);
    player.giveWeapon(weaponList['pistol'], 30, true);
}

chat.registerCmd('weapon', (player, args) => {
    if(args.length <= 0) {
        chat.send(player, '/weapon [weapon name]');
        return;
    }

    const weaponName = args[0].toLowerCase();

    if(weaponList[weaponName] === undefined) {
        return chat.send(player, 'Invalid weapon');
    }
    
    player.giveWeapon(weaponList[weaponName], 999, true);
    chat.send(player, 'You were given a weapon');
})