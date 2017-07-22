function openGlobalSearch() {
  const url = 'https://github.com/search/'
  chrome.tabs.create({ url })
}

function openOptions(hash) {
  const url = `chrome-extension://${chrome.runtime.id}/options.html#${hash}`
  chrome.tabs.create({ url })
}

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'select-repository') {
    openOptions('select-repository')
  } else if (command === 'select-organization') {
    openOptions('select-organization')
  } else if (command === 'global-search') {
    openGlobalSearch()
  } else {
    console.debug('unhandled command:', command)
  }
});
