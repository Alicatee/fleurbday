document.addEventListener('DOMContentLoaded', () => {
    const trailContainer = document.body;
    const mazeCanvasContainer = document.getElementById('maze-canvas-container');
    let isTrailEnabled = true;

    if (mazeCanvasContainer) {
        mazeCanvasContainer.addEventListener('mouseenter', () => {
            isTrailEnabled = false;
        });

        mazeCanvasContainer.addEventListener('mouseleave', () => {
            isTrailEnabled = true;
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (isTrailEnabled) {
            createTrail(e.pageX, e.pageY);
        }
    });

    function createTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        
        trail.innerHTML = '💖'; 

        trailContainer.appendChild(trail);

        setTimeout(() => {
            trail.remove();
        }, 1000);
    }
}); 
