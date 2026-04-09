(function () {
    const images = document.querySelectorAll('[data-zoom-src]');
    if (!images.length) return;

    const zoom = mediumZoom(images, {
        background: 'rgba(0, 0, 0, 0.85)',
        margin: 24,
    });

    function fixZIndex() {
        document.querySelectorAll('.medium-zoom-overlay').forEach(el => { el.style.zIndex = '10000'; });
        document.querySelectorAll('.medium-zoom-image--opened').forEach(el => { el.style.zIndex = '10001'; });
    }

    let observer = null;

    zoom.on('open', () => {
        // 'open' fires before overlay/clone are appended to body — defer to next frame.
        requestAnimationFrame(fixZIndex);

        // Also watch for the async HD clone (data-zoom-src) appended later.
        observer = new MutationObserver(fixZIndex);
        observer.observe(document.body, { childList: true });
    });

    zoom.on('close', () => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    });
}());
