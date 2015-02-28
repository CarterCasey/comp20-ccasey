function init() {
	canvas = document.getElementById('game_canvas');
	ctx = canvas.getContext('2d');

	base_image = new Image();
	base_image.src = "pacman10-hp-sprite.png";

	base_image.onload = function() {
		// Load board
		ctx.drawImage(base_image, 318, 0, 470, 138, 0, 0, 470, 138);
		// Load Ms Pacman
		ctx.drawImage(base_image, 80, 20, 20, 20, 150, 60, 20, 20);
	};
};