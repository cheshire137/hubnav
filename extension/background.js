function openOptions(hash) {
  const url = `chrome-extension://${chrome.runtime.id}/options.html#${hash}`
  chrome.tabs.create({ url })
}

function openFileFinder() {
  HubnavStorage.load().then(options => {
    if (options.repository && options.repository.length > 0) {
      const parts = options.repository.split('/')
      const owner = encodeURIComponent(parts[0])
      const name = encodeURIComponent(parts[1])
      const url = `https://github.com/${owner}/${name}/find/master`
      chrome.tabs.create({ url })
    } else {
      openOptions('select-repository')
    }
  })
}

function openGlobalSearch() {
  const url = 'https://github.com/search/'
  chrome.tabs.create({ url })
}

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'select-repository') {
    openOptions('select-repository')
  } else if (command === 'select-organization') {
    openOptions('select-organization')
  } else if (command === 'global-search') {
    openGlobalSearch()
  } else if (command === 'file-finder') {
    openFileFinder()
  } else {
    console.debug('unhandled command:', command)
  }
});
