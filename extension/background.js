function openOptions(hash) {
  const url = `chrome-extension://${chrome.runtime.id}/options.html#${hash}`
  chrome.tabs.create({ 'url': url })
}

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'select-repository') {
    openOptions('select-repository')
  } else if (command === 'select-organization') {
    openOptions('select-organization')
  } else {
    console.debug('unhandled command:', command)
  }
});
