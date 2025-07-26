document.addEventListener('DOMContentLoaded', () => {
    // --- Enhanced Puzzle Game Logic ---
    const canvas = document.getElementById('puzzle-canvas');
    const ctx = canvas.getContext('2d');
    const shuffleButton = document.getElementById('shuffle-button');
    
    // Modal elements
    const messageBox = document.getElementById('puzzle-complete-modal');
    const messageText = document.getElementById('puzzle-message-text');
    const messageCloseButton = document.getElementById('puzzle-message-close-button');

    const PUZZLE_IMAGE_URL = 'images/cinema.png';
    const ROWS = 4;
    const COLS = 4;

    let puzzleImage = new Image();
    let puzzlePieces = [];
    let pieceWidth, pieceHeight;

    let isDragging = false;
    let draggedPiece = null;
    let offsetX, offsetY;

    function showMessage(message) {
        messageText.textContent = message;
        messageBox.style.display = 'block';
    }

    function hideMessage() {
        messageBox.style.display = 'none';
    }

    function resizeCanvas() {
        const container = document.getElementById('puzzle-container');
        const newSize = container.clientWidth;
        canvas.width = newSize;
        canvas.height = newSize;
        pieceWidth = canvas.width / COLS;
        pieceHeight = canvas.height / ROWS;
        drawPuzzle();
    }

    function initializeAndShuffle() {
        puzzlePieces = [];
        let positions = [];

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                puzzlePieces.push({
                    originalRow: r, originalCol: c,
                    currentRow: r, currentCol: c,
                });
                positions.push({ r, c });
            }
        }

        // Fisher-Yates shuffle
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        puzzlePieces.forEach((piece, index) => {
            piece.currentRow = positions[index].r;
            piece.currentCol = positions[index].c;
        });

        drawPuzzle();
        hideMessage();
    }

    function drawPuzzle() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!puzzleImage.complete || puzzleImage.naturalWidth === 0) {
            ctx.fillStyle = '#FFC0CB';
            ctx.fillRect(0,0,canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = "20px VT323";
            ctx.textAlign = "center";
            ctx.fillText("Loading puzzle...", canvas.width/2, canvas.height/2);
            return;
        }

        puzzlePieces.forEach(piece => {
            if (piece === draggedPiece) return; // Don't draw the dragged piece yet
            const sourceX = piece.originalCol * (puzzleImage.naturalWidth / COLS);
            const sourceY = piece.originalRow * (puzzleImage.naturalHeight / ROWS);
            const sourceWidth = puzzleImage.naturalWidth / COLS;
            const sourceHeight = puzzleImage.naturalHeight / ROWS;
            const destX = piece.currentCol * pieceWidth;
            const destY = piece.currentRow * pieceHeight;

            ctx.drawImage(puzzleImage, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, pieceWidth, pieceHeight);
            ctx.strokeRect(destX, destY, pieceWidth, pieceHeight);
        });

        if (draggedPiece) {
            const sourceX = draggedPiece.originalCol * (puzzleImage.naturalWidth / COLS);
            const sourceY = draggedPiece.originalRow * (puzzleImage.naturalHeight / ROWS);
            const sourceWidth = puzzleImage.naturalWidth / COLS;
            const sourceHeight = puzzleImage.naturalHeight / ROWS;
            
            ctx.globalAlpha = 0.7; // Make it slightly transparent while dragging
            ctx.drawImage(puzzleImage, sourceX, sourceY, sourceWidth, sourceHeight, draggedPiece.drawX, draggedPiece.drawY, pieceWidth, pieceHeight);
            ctx.strokeRect(draggedPiece.drawX, draggedPiece.drawY, pieceWidth, pieceHeight);
            ctx.globalAlpha = 1.0;
        }
    }

    function getPieceAtCoordinates(x, y) {
        const col = Math.floor(x / pieceWidth);
        const row = Math.floor(y / pieceHeight);
        return puzzlePieces.find(p => p.currentRow === row && p.currentCol === col);
    }

    function checkSolved() {
        return puzzlePieces.every(p => p.originalRow === p.currentRow && p.originalCol === p.currentCol);
    }

    function getCanvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function handleStart(e) {
        e.preventDefault();
        const pos = getCanvasPos(e);
        draggedPiece = getPieceAtCoordinates(pos.x, pos.y);
        if (draggedPiece) {
            isDragging = true;
            offsetX = pos.x - (draggedPiece.currentCol * pieceWidth);
            offsetY = pos.y - (draggedPiece.currentRow * pieceHeight);
            draggedPiece.drawX = pos.x - offsetX;
            draggedPiece.drawY = pos.y - offsetY;
        }
    }

    function handleMove(e) {
        if (!isDragging || !draggedPiece) return;
        e.preventDefault();
        const pos = getCanvasPos(e);
        draggedPiece.drawX = pos.x - offsetX;
        draggedPiece.drawY = pos.y - offsetY;
        drawPuzzle();
    }

    function handleEnd(e) {
        if (!isDragging || !draggedPiece) return;
        e.preventDefault();
        isDragging = false;

        const pos = getCanvasPos(e.changedTouches ? e.changedTouches[0] : e);
        const dropCol = Math.floor(pos.x / pieceWidth);
        const dropRow = Math.floor(pos.y / pieceHeight);

        if (dropCol >= 0 && dropCol < COLS && dropRow >= 0 && dropRow < ROWS) {
            const targetPiece = puzzlePieces.find(p => p.currentRow === dropRow && p.currentCol === dropCol);
            if (targetPiece) {
                // Swap positions
                [draggedPiece.currentRow, targetPiece.currentRow] = [targetPiece.currentRow, draggedPiece.currentRow];
                [draggedPiece.currentCol, targetPiece.currentCol] = [targetPiece.currentCol, draggedPiece.currentCol];
            }
        }
        
        draggedPiece = null;
        drawPuzzle();

        if (checkSolved()) {
            showMessage('You solved it! ♡');
        }
    }
    
    puzzleImage.onload = () => {
        ctx.strokeStyle = '#FF69B4';
        resizeCanvas(); // Initial resize
        initializeAndShuffle();
        
        shuffleButton.addEventListener('click', initializeAndShuffle);
        messageCloseButton.addEventListener('click', hideMessage);

        // Mouse events
        canvas.addEventListener('mousedown', handleStart);
        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('mouseup', handleEnd);
        canvas.addEventListener('mouseleave', handleEnd);

        // Touch events
        canvas.addEventListener('touchstart', handleStart, { passive: false });
        canvas.addEventListener('touchmove', handleMove, { passive: false });
        canvas.addEventListener('touchend', handleEnd);
        canvas.addEventListener('touchcancel', handleEnd);

        // Resize event
        window.addEventListener('resize', resizeCanvas);
    };

    puzzleImage.onerror = () => {
        ctx.fillStyle = '#FFC0CB';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = "20px VT323";
        ctx.textAlign = "center";
        ctx.fillText("Oops! Image couldn't load.", canvas.width/2, canvas.height/2);
    };

    puzzleImage.src = PUZZLE_IMAGE_URL;
}); 