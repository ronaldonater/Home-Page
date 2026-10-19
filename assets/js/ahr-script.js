// Only command badges are interactive; inline numeric mode values stay as text.
(() => {
    const status = document.createElement('div');
    status.className = 'copy-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.body.append(status);
    let statusTimeout;

    function announce(message) {
        clearTimeout(statusTimeout);
        status.textContent = message;
        statusTimeout = setTimeout(() => { status.textContent = ''; }, 3000);
    }

    document.querySelectorAll('.command-list li > code').forEach(code => {
        const command = code.textContent.trim();
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'command-copy';
        button.title = 'Click to copy to your clipboard';
        button.setAttribute('aria-label', `Copy command: ${command}`);
        code.replaceWith(button);
        button.append(code);

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(command);
                announce('Command copied!');
            } catch {
                announce('Could not copy. Please select and copy the command manually.');
            }
        });
    });
})();
