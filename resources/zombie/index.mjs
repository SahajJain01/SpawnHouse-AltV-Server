import alt from 'alt';

alt.on('playerConnect', (player) => {
  player.spawn(200, 200, 72, 0);
});