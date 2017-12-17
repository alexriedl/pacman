import PacmanGame from './PacmanGame';

const game = new PacmanGame('game-canvas');
document.onkeydown = (event: KeyboardEvent) => game.onkeydown(event);
document.onkeyup = (event: KeyboardEvent) => game.onkeyup(event);
game.start();

function handleGamepadEvents(e: GamepadEvent) {
	const gamepad = e.gamepad;
	if (gamepad.connected) game.addController(gamepad);
	else game.removeController(gamepad);
}
window.addEventListener('gamepadconnected', handleGamepadEvents);
window.addEventListener('gamepaddisconnected', handleGamepadEvents);
