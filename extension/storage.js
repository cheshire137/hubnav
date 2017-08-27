class HubnavStorage {
  static load() {
    return new Promise(resolve => {
      if (chrome && chrome.storage && chrome.storage.sync &&
          chrome.storage.sync.get) {
        chrome.storage.sync.get('hubnav', allOptions => {
          resolve(allOptions.hubnav || {})
        })
      } else {
        resolve({})
      }
    })
  }

  static save(options) {
    return new Promise(resolve => {
      if (chrome && chrome.storage && chrome.storage.sync &&
          chrome.storage.sync.set) {
        chrome.storage.sync.set({ hubnav: options }, () => {
          resolve()
        })
      } else {
        resolve()
      }
    })
  }
}

window.HubnavStorage = HubnavStorage
