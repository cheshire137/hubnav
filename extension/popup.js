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
    this.iShortcuts = document.querySelectorAll('.i-shortcut')
    this.pShortcuts = document.querySelectorAll('.p-shortcut')
    this.repoCommands = document.getElementById('repo-commands')
    this.orgCommands = document.getElementById('org-commands')
  }

  executeShortcut(action) {
    if (this.shortcutTimer) {
      clearTimeout(this.shortcutTimer)
    }
    this.shortcutTimer = setTimeout(action, 400)
  }

  openFileFinder() {
    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.highlightShortcut(this.fShortcuts)
        const defaultBranch = options.defaultBranch || 'master'
        this.openTab(this.repoUrl(options.repository, `/find/${defaultBranch}`))
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
    this.openTab('https://github.com/search')
  }

  openTeams() {
    HubnavStorage.load().then(options => {
      if (options.organization && options.organization.length > 0) {
        this.highlightShortcut(this.tShortcuts)
        const org = encodeURIComponent(options.organization)
        this.openTab(`https://github.com/orgs/${org}/teams`)
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

  openIssues() {
    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.highlightShortcut(this.iShortcuts)
        this.openTab(this.repoUrl(options.repository, '/issues'))
      } else {
        this.openRepoSelect()
      }
    })
  }

  openPullRequests() {
    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.highlightShortcut(this.pShortcuts)
        this.openTab(this.repoUrl(options.repository, '/pulls'))
      } else {
        this.openRepoSelect()
      }
    })
  }

  openOptions(hash) {
    this.executeShortcut(() => chrome.tabs.create({ url }))
    this.openTab(`chrome-extension://${chrome.runtime.id}/options.html#${hash}`)
  }

  openTab(url) {
    this.executeShortcut(() => chrome.tabs.create({ url }))
  }

  repoUrl(repo, path) {
    const parts = repo.split('/')
    const owner = encodeURIComponent(parts[0])
    const name = encodeURIComponent(parts[1])
    return `https://github.com/${owner}/${name}${path}`
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
      } else if (event.key === 'i') {
        this.openIssues()
      } else if (event.key === 'p') {
        this.openPullRequests()
      }
    })

    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.repoCommands.style.display = 'block'
      }
      if (options.organization && options.organization.length > 0) {
        this.orgCommands.style.display = 'block'
      }
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
