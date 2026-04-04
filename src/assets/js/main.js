document.addEventListener('DOMContentLoaded', () => {
  const codeBlocks = document.querySelectorAll('pre');

  codeBlocks.forEach((block) => {
    const code = block.querySelector('code');
    if (!code) return;

    // Wrap pre in a container so the copy button stays fixed
    // outside the scrollable area
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';

    wrapper.appendChild(copyButton);

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(code.innerText).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      }, (err) => {
        console.error('Failed to copy text: ', err);
        copyButton.textContent = 'Error';
         setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
    });
  });
});
