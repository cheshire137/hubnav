function selectRepository() {
  const url = `chrome-extension://${chrome.runtime.id}/options.html#select-repository`
  chrome.tabs.create({ 'url': url })
}

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'select-repository') {
    selectRepository()
  } else {
    console.debug('unhandled command:', command)
  }
});
