import alt from 'alt';

alt.on('playerConnect', (player) => {
  player.spawn(0, 0, 72, 0);
  player.giveWeapon(453432689, 100, false);
  
});
