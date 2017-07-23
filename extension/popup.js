class PopupPage {
  constructor() {
    this.findElements()
  }

  findElements() {
    this.repoReferences = document.querySelectorAll('.repository')
    this.orgReferences = document.querySelectorAll('.organization')
    this.fShortcuts = document.querySelectorAll('.f-shortcut')
    this.tShortcuts = document.querySelectorAll('.t-shortcut')
    this.sShortcuts = document.querySelectorAll('.s-shortcut')
    this.rShortcuts = document.querySelectorAll('.r-shortcut')
    this.oShortcuts = document.querySelectorAll('.o-shortcut')
  }

  executeShortcut(action) {
    if (this.shortcutTimer) {
      clearTimeout(this.shortcutTimer)
    }
    this.shortcutTimer = setTimeout(action, 400)
  }

  openOptions(hash) {
    const url = `chrome-extension://${chrome.runtime.id}/options.html#${hash}`
    this.executeShortcut(() => chrome.tabs.create({ url }))
  }

  openFileFinder() {
    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.highlightShortcut(this.fShortcuts)
        const parts = options.repository.split('/')
        const owner = encodeURIComponent(parts[0])
        const name = encodeURIComponent(parts[1])
        const url = `https://github.com/${owner}/${name}/find/master`
        this.executeShortcut(() => chrome.tabs.create({ url }))
      } else {
        this.openRepoSelect()
      }
    })
  }

  openRepoSelect() {
    this.highlightShortcut(this.rShortcuts)
    this.openOptions('select-repository')
  }

  openGlobalSearch() {
    this.highlightShortcut(this.sShortcuts)
    const url = 'https://github.com/search/'
    this.executeShortcut(() => chrome.tabs.create({ url }))
  }

  openTeams() {
    HubnavStorage.load().then(options => {
      if (options.organization && options.organization.length > 0) {
        this.highlightShortcut(this.tShortcuts)
        const org = encodeURIComponent(options.organization)
        const url = `https://github.com/orgs/${org}/teams`
        this.executeShortcut(() => chrome.tabs.create({ url }))
      } else {
        this.openOrgSelect()
      }
    })
  }

  highlightShortcut(shortcuts) {
    for (let i = 0; i < shortcuts.length; i++) {
      shortcuts[i].classList.add('highlighted')
    }
  }

  openOrgSelect() {
    this.highlightShortcut(this.oShortcuts)
    this.openOptions('select-organization')
  }

  setup() {
    document.addEventListener('keydown', event => {
      if (event.key === 'f') {
        this.openFileFinder()
      } else if (event.key === 't') {
        this.openTeams()
      } else if (event.key === 's') {
        this.openGlobalSearch()
      } else if (event.key === 'o') {
        this.openOrgSelect()
      } else if (event.key === 'r') {
        this.openRepoSelect()
      }
    })

    HubnavStorage.load().then(options => {
      this.updateRepoReferences(options.repository)
      this.updateOrgReferences(options.organization)
    })
  }

  updateRepoReferences(repo) {
    if (repo && repo.length > 0) {
      for (let i = 0; i < this.repoReferences.length; i++) {
        this.repoReferences[i].textContent = repo
      }
    }
  }

  updateOrgReferences(org) {
    if (org && org.length > 0) {
      for (let i = 0; i < this.orgReferences.length; i++) {
        this.orgReferences[i].textContent = org
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new PopupPage()
  page.setup()
})
