class HubnavStorage {
  static load() {
    return new Promise(resolve => {
      chrome.storage.sync.get('hubnav', allOptions => {
        resolve(allOptions.hubnav || {})
      })
    })
  }

  static save(options) {
    return new Promise(resolve => {
      chrome.storage.sync.set({ hubnav: options }, () => {
        resolve()
      })
    })
  }
}

window.HubnavStorage = HubnavStorage
