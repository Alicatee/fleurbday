document.addEventListener('DOMContentLoaded', () => {
    const trailContainer = document.body;

    document.addEventListener('mousemove', (e) => {
        createTrail(e.pageX, e.pageY);
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