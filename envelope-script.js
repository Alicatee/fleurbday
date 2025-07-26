document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.y2k-container');
    const envelopes = document.querySelectorAll('.envelope');
    const letterModal = document.getElementById('letter-modal');
    const letterContent = document.getElementById('letter-modal-content');
    const letterCloseButton = document.getElementById('letter-modal-close');
    let currentlyOpenEnvelope = null;

    envelopes.forEach(envelope => {
        envelope.addEventListener('click', () => {
            // If an envelope is already open, do nothing until it's closed
            if (currentlyOpenEnvelope && currentlyOpenEnvelope !== envelope) {
                // Optional: close the other envelope first
                // currentlyOpenEnvelope.classList.remove('open');
                return;
            }

            // Toggle the clicked envelope
            envelope.classList.toggle('open');
            currentlyOpenEnvelope = envelope.classList.contains('open') ? envelope : null;
            
            if (envelope.classList.contains('open')) {
                // It was just opened
                const letterText = envelope.querySelector('.letter').innerHTML;
                letterContent.innerHTML = letterText;

                // Position and show the modal
                const envelopeRect = envelope.getBoundingClientRect();
                letterModal.style.top = `${envelopeRect.top + window.scrollY}px`;
                letterModal.style.left = `${envelopeRect.left + window.scrollX}px`;
                letterModal.style.width = `${envelopeRect.width}px`;
                letterModal.style.height = `${envelopeRect.height}px`;
                
                // Blur the background and show the modal
                mainContainer.classList.add('blurred');
                letterModal.classList.add('show');

            } else {
                // It was just closed from the main page (not modal)
                hideModal();
            }
        });
    });

    letterCloseButton.addEventListener('click', () => {
        if (currentlyOpenEnvelope) {
            hideModal();
            currentlyOpenEnvelope.classList.remove('open');
            currentlyOpenEnvelope = null;
        }
    });
    
    function hideModal() {
        mainContainer.classList.remove('blurred');
        letterModal.classList.remove('show');
    }
}); 