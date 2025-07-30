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
        // Make collision size a bit smaller for easier navigation
        collisionSize: cellSize * 0.4,
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
    let touchIdentifier = null; // Track which touch we're following

    player.image.src = 'images/rilakkuma.png';
    target.image.src = 'images/pinkcute.png';

    function drawMaze() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw maze walls
        ctx.fillStyle = '#fce7f3';
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
        // Use collision size centered within the player sprite
        const offset = (player.size - player.collisionSize) / 2;
        const checkX = x + offset;
        const checkY = y + offset;
        
        // Add a tiny buffer to avoid floating point edge cases
        const buffer = 0.1;
        const corners = [
            {x: checkX + buffer, y: checkY + buffer},
            {x: checkX + player.collisionSize - buffer, y: checkY + buffer},
            {x: checkX + buffer, y: checkY + player.collisionSize - buffer},
            {x: checkX + player.collisionSize - buffer, y: checkY + player.collisionSize - buffer}
        ];

        for (const corner of corners) {
            const col = Math.floor(corner.x / cellSize);
            const row = Math.floor(corner.y / cellSize);

            if (row < 0 || row >= maze.length || col < 0 || col >= maze[0].length) {
                return true;
            }
            if (maze[row][col] === 1) {
                return true;
            }
        }
        return false;
    }

    function isPathClear(startX, startY, endX, endY) {
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If we're not moving, path is clear
        if (distance < 0.1) return true;
        
        // Check multiple points along the path
        const stepSize = 2; // Check every 2 pixels
        const numSteps = Math.ceil(distance / stepSize);

        for (let i = 1; i <= numSteps; i++) {
            const t = i / numSteps;
            const currentX = startX + t * dx;
            const currentY = startY + t * dy;
            if (checkCollision(currentX, currentY)) {
                return false;
            }
        }

        return true;
    }

    // Emergency unstuck function - nudges player to nearest valid position
    function unstuckPlayer() {
        const testPositions = [
            {x: 0, y: 0},        // Current position
            {x: -1, y: 0},       // Left
            {x: 1, y: 0},        // Right
            {x: 0, y: -1},       // Up
            {x: 0, y: 1},        // Down
            {x: -1, y: -1},      // Diagonals
            {x: 1, y: -1},
            {x: -1, y: 1},
            {x: 1, y: 1}
        ];

        for (let radius = 1; radius <= 5; radius++) {
            for (const offset of testPositions) {
                const testX = player.x + offset.x * radius;
                const testY = player.y + offset.y * radius;
                
                if (!checkCollision(testX, testY)) {
                    player.x = testX;
                    player.y = testY;
                    drawMaze();
                    return;
                }
            }
        }
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
            const modal = document.getElementById('puzzle-complete-modal');
            const message = document.getElementById('puzzle-message-text');
            if (modal && message) {
                message.textContent = 'You did it! You reached the heart! 💕';
                modal.style.display = 'block';
            }
            player.x = 0;
            player.y = 0;
            drawMaze();
        }
    }

    function handleStart(clientX, clientY, touchId = null) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        // Make the touch target larger for easier grabbing
        const touchMargin = 15;
        if (mouseX >= player.x - touchMargin && mouseX <= player.x + player.size + touchMargin &&
            mouseY >= player.y - touchMargin && mouseY <= player.y + player.size + touchMargin) {
            isDragging = true;
            dragStartX = mouseX - player.x;
            dragStartY = mouseY - player.y;
            touchIdentifier = touchId;
            
            // Check if player is stuck and unstuck them
            if (checkCollision(player.x, player.y)) {
                unstuckPlayer();
            }
        }
    }

    function handleMove(clientX, clientY) {
        if (!isDragging) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        let targetX = mouseX - dragStartX;
        let targetY = mouseY - dragStartY;

        // Clamp to canvas bounds
        targetX = Math.max(0, Math.min(canvas.width - player.size, targetX));
        targetY = Math.max(0, Math.min(canvas.height - player.size, targetY));
        
        const originalX = player.x;
        const originalY = player.y;

        // Try moving both axes at once first (diagonal movement)
        if (isPathClear(originalX, originalY, targetX, targetY)) {
            player.x = targetX;
            player.y = targetY;
        } else {
            // Try moving along X-axis
            if (isPathClear(originalX, originalY, targetX, originalY)) {
                player.x = targetX;
            } else {
                // Try partial X movement
                const dx = targetX - originalX;
                const steps = 20;
                for (let i = steps; i > 0; i--) {
                    const testX = originalX + (dx * i / steps);
                    if (isPathClear(originalX, originalY, testX, originalY)) {
                        player.x = testX;
                        break;
                    }
                }
            }

            // Try moving along Y-axis from the new X position
            if (isPathClear(player.x, originalY, player.x, targetY)) {
                player.y = targetY;
            } else {
                // Try partial Y movement
                const dy = targetY - originalY;
                const steps = 20;
                for (let i = steps; i > 0; i--) {
                    const testY = originalY + (dy * i / steps);
                    if (isPathClear(player.x, originalY, player.x, testY)) {
                        player.y = testY;
                        break;
                    }
                }
            }
        }
        
        // Round to avoid floating point accumulation issues
        player.x = Math.round(player.x * 100) / 100;
        player.y = Math.round(player.y * 100) / 100;
        
        // Only redraw if the player has moved
        if (Math.abs(player.x - originalX) > 0.01 || Math.abs(player.y - originalY) > 0.01) {
            drawMaze();
            checkWin();
        }
    }

    function handleEnd() {
        isDragging = false;
        touchIdentifier = null;
    }

    // Mouse events
    canvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
    canvas.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY, touch.identifier);
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        // Only track the original touch
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            if (touchIdentifier === null || touch.identifier === touchIdentifier) {
                handleMove(touch.clientX, touch.clientY);
                break;
            }
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        // Check if our tracked touch ended
        let touchEnded = true;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touchIdentifier) {
                touchEnded = false;
                break;
            }
        }
        if (touchEnded) {
            handleEnd();
        }
    });

    canvas.addEventListener('touchcancel', handleEnd);

    // Load images and draw
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
});