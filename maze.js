document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('maze-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const cellSize = 40;
    const maze = [
        [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 1, 0]
    ];

    const player = {
        x: 0,
        y: 0,
        size: cellSize * 0.8,
        image: new Image()
    };

    const target = {
        x: canvas.width - cellSize,
        y: canvas.height - cellSize,
        size: cellSize,
        image: new Image()
    };

    let isDragging = false;
    let dragStartX, dragStartY;

    player.image.src = 'images/rilakkuma.png';
    target.image.src = 'images/pinkcute.png';

    function drawMaze() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw maze walls
        ctx.fillStyle = '#fce7f3'; // A light pink for walls
        for (let row = 0; row < maze.length; row++) {
            for (let col = 0; col < maze[row].length; col++) {
                if (maze[row][col] === 1) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
        
        // Draw target and player
        ctx.drawImage(target.image, target.x, target.y, target.size, target.size);
        ctx.drawImage(player.image, player.x, player.y, player.size, player.size);
    }
    
    function checkCollision(x, y) {
        const playerCol = Math.floor((x + player.size / 2) / cellSize);
        const playerRow = Math.floor((y + player.size / 2) / cellSize);

        if (playerRow < 0 || playerRow >= maze.length || playerCol < 0 || playerCol >= maze[0].length) {
            return true; // Out of bounds
        }

        return maze[playerRow][playerCol] === 1;
    }

    function checkWin() {
        const playerCenterX = player.x + player.size / 2;
        const playerCenterY = player.y + player.size / 2;
        const targetCenterX = target.x + target.size / 2;
        const targetCenterY = target.y + target.size / 2;
        
        const dx = playerCenterX - targetCenterX;
        const dy = playerCenterY - targetCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.size / 2 + target.size / 2) {
            // Use the existing puzzle complete modal for the message
            const modal = document.getElementById('puzzle-complete-modal');
            const message = document.getElementById('puzzle-message-text');
            if (modal && message) {
                message.textContent = 'You did it! You reached the heart! 💕';
                modal.style.display = 'block';
            }
             // Reset player position after winning
            player.x = 0;
            player.y = 0;
            drawMaze();
        }
    }

    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (mouseX >= player.x && mouseX <= player.x + player.size &&
            mouseY >= player.y && mouseY <= player.y + player.size) {
            isDragging = true;
            dragStartX = mouseX - player.x;
            dragStartY = mouseY - player.y;
        }
    }

    function handleMouseMove(e) {
        if (!isDragging) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let newX = mouseX - dragStartX;
        let newY = mouseY - dragStartY;

        // Clamp to canvas bounds
        newX = Math.max(0, Math.min(canvas.width - player.size, newX));
        newY = Math.max(0, Math.min(canvas.height - player.size, newY));

        if (!checkCollision(newX, newY)) {
            player.x = newX;
            player.y = newY;
            drawMaze();
            checkWin();
        }
    }

    function handleMouseUp() {
        isDragging = false;
    }

    // Load images and then draw the maze
    let imagesLoaded = 0;
    const totalImages = 2;
    const onImageLoad = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            drawMaze();
        }
    };

    player.image.onload = onImageLoad;
    target.image.onload = onImageLoad;
    
    // Event Listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp); // Stop dragging if mouse leaves canvas

});
