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
    let touchIdentifier = null;

    let movement = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    let animationFrameId = null;

    player.image.src = 'images/rilakkuma.png';
    target.image.src = 'images/pinkcute.png';

    function drawMaze() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fce7f3';
        for (let row = 0; row < maze.length; row++) {
            for (let col = 0; col < maze[row].length; col++) {
                if (maze[row][col] === 1) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
        ctx.drawImage(target.image, target.x, target.y, target.size, target.size);
        ctx.drawImage(player.image, player.x, player.y, player.size, player.size);
    }

    function checkCollision(x, y) {
        const offset = (player.size - player.collisionSize) / 2;
        const checkX = x + offset;
        const checkY = y + offset;
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
            if (row < 0 || row >= maze.length || col < 0 || col >= maze[0].length || maze[row][col] === 1) {
                return true;
            }
        }
        return false;
    }
    
    function isPathClear(startX, startY, endX, endY) {
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.1) return true;
        
        const stepSize = 2; 
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

    function unstuckPlayer() {
        const testPositions = [
            {x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1},
            {x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}
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
            if(animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                Object.keys(movement).forEach(key => movement[key] = false);
            }
            drawMaze();
        }
    }
    
    function gameLoop() {
        const moveAmount = 2.5;
        let dx = 0;
        let dy = 0;

        if (movement.up) dy -= moveAmount;
        if (movement.down) dy += moveAmount;
        if (movement.left) dx -= moveAmount;
        if (movement.right) dx += moveAmount;

        if (dx !== 0 || dy !== 0) {
            let targetX = player.x + dx;
            let targetY = player.y + dy;

            // Wall sliding logic
            if (!isPathClear(player.x, player.y, targetX, targetY)) {
                // Can we move on X?
                if (dx !== 0 && isPathClear(player.x, player.y, targetX, player.y)) {
                    targetY = player.y;
                } 
                // Can we move on Y?
                else if (dy !== 0 && isPathClear(player.x, player.y, player.x, targetY)) {
                    targetX = player.x;
                }
                // Can't move in either preferred direction
                else {
                    targetX = player.x;
                    targetY = player.y;
                }
            }

            player.x = targetX;
            player.y = targetY;

            player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
            player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
            
            drawMaze();
            checkWin();
        }
        
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function startMoving(direction) {
        movement[direction] = true;
        if (!animationFrameId) {
            gameLoop();
        }
    }

    function stopMoving(direction) {
        movement[direction] = false;
        if (Object.values(movement).every(v => !v)) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function handleStart(clientX, clientY, touchId = null) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        const touchMargin = 15;
        if (mouseX >= player.x - touchMargin && mouseX <= player.x + player.size + touchMargin &&
            mouseY >= player.y - touchMargin && mouseY <= player.y + player.size + touchMargin) {
            isDragging = true;
            dragStartX = mouseX - player.x;
            dragStartY = mouseY - player.y;
            touchIdentifier = touchId;
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
        targetX = Math.max(0, Math.min(canvas.width - player.size, targetX));
        targetY = Math.max(0, Math.min(canvas.height - player.size, targetY));
        const originalX = player.x;
        const originalY = player.y;

        if (isPathClear(originalX, originalY, targetX, targetY)) {
            player.x = targetX;
            player.y = targetY;
        } else {
            if (isPathClear(originalX, originalY, targetX, originalY)) {
                player.x = targetX;
            } else {
                const dx = targetX - originalX;
                for (let i = 20; i > 0; i--) {
                    const testX = originalX + (dx * i / 20);
                    if (isPathClear(originalX, originalY, testX, originalY)) {
                        player.x = testX;
                        break;
                    }
                }
            }
            if (isPathClear(player.x, originalY, player.x, targetY)) {
                player.y = targetY;
            } else {
                const dy = targetY - originalY;
                for (let i = 20; i > 0; i--) {
                    const testY = originalY + (dy * i / 20);
                    if (isPathClear(player.x, originalY, player.x, testY)) {
                        player.y = testY;
                        break;
                    }
                }
            }
        }
        player.x = Math.round(player.x * 100) / 100;
        player.y = Math.round(player.y * 100) / 100;
        if (Math.abs(player.x - originalX) > 0.01 || Math.abs(player.y - originalY) > 0.01) {
            drawMaze();
            checkWin();
        }
    }

    function handleEnd() {
        isDragging = false;
        touchIdentifier = null;
    }

    canvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
    canvas.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY, touch.identifier);
        }
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
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
        let touchEnded = true;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touchIdentifier) {
                touchEnded = false;
                break;
            }
        }
        if (touchEnded) handleEnd();
    });
    canvas.addEventListener('touchcancel', handleEnd);

    // Button event listeners
    const buttons = {
        'maze-up': 'up', 'maze-down': 'down', 'maze-left': 'left', 'maze-right': 'right'
    };
    for (const [id, direction] of Object.entries(buttons)) {
        const button = document.getElementById(id);
        button.addEventListener('mousedown', () => startMoving(direction));
        button.addEventListener('mouseup', () => stopMoving(direction));
        button.addEventListener('mouseleave', () => stopMoving(direction));
        button.addEventListener('touchstart', (e) => { e.preventDefault(); startMoving(direction); });
        button.addEventListener('touchend', (e) => { e.preventDefault(); stopMoving(direction); });
        button.addEventListener('touchcancel', (e) => { e.preventDefault(); stopMoving(direction); });
    }

    let imagesLoaded = 0;
    const totalImages = 2;
    const onImageLoad = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) drawMaze();
    };
    player.image.onload = onImageLoad;
    target.image.onload = onImageLoad;
});
