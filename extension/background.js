function execute() {
  chrome.tabs.executeScript(null, {
    code: `
      (async function() {
        // Inject prettier only once
        if (!document.documentElement.dataset.hasPrettier) {
          await new Promise((resolve, reject) => {
            var script = document.createElement('script');
            script.src = '${chrome.runtime.getURL('prettier.min.js')}';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
            script.remove();
            document.documentElement.dataset.hasPrettier = true;
          })
        }

        var script = document.createElement('script');
        script.src = '${chrome.runtime.getURL('prettierify.js')}';
        document.head.appendChild(script);
        script.remove();
      })()
      `
  });
}

chrome.browserAction.onClicked.addListener(execute);
chrome.commands.onCommand.addListener(command => {
  if (command === 'prettier') execute();
});
