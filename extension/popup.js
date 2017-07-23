class PopupPage {
  constructor() {
    this.findElements()
    this.shiftPressed = false
    this.ctrlPressed = false
    this.commandSelected = false
  }

  findElements() {
    for (let i = 1; i <= 4; i++) {
      this[`repo${i}`] = document.getElementById(`repo${i}`)
      this[`repoLogo${i}`] = document.getElementById(`repo-logo${i}`)
    }
    this.repo = document.getElementById('repository')
    this.org = document.getElementById('organization')
    this.fShortcuts = document.querySelectorAll('.shortcut-f')
    this.tShortcuts = document.querySelectorAll('.shortcut-t')
    this.sShortcuts = document.querySelectorAll('.shortcut-s')
    this.rShortcuts = document.querySelectorAll('.shortcut-r')
    this.oShortcuts = document.querySelectorAll('.shortcut-o')
    this.iShortcuts = document.querySelectorAll('.shortcut-i')
    this.pShortcuts = document.querySelectorAll('.shortcut-p')
    this.hShortcuts = document.querySelectorAll('.shortcut-h')
    this.mShortcuts = document.querySelectorAll('.shortcut-m')
    this.shortcuts1 = document.querySelectorAll('.shortcut-1')
    this.shortcuts2 = document.querySelectorAll('.shortcut-2')
    this.shortcuts3 = document.querySelectorAll('.shortcut-3')
    this.shortcuts4 = document.querySelectorAll('.shortcut-4')
    this.repoCommands = document.getElementById('repo-commands')
    this.orgCommands = document.getElementById('org-commands')
    this.orgLogo = document.getElementById('org-logo')
    this.repoLogo = document.getElementById('repo-logo')
    this.shortcuts = document.querySelectorAll('.shortcut')
    this.repoSwitch = document.getElementById('repo-switch')
  }

  runAfterDelay(action) {
    this.commandSelected = true
    if (this.shortcutTimer) {
      clearTimeout(this.shortcutTimer)
    }
    this.shortcutTimer = setTimeout(() => {
      const highlights = document.querySelectorAll('.highlighted')
      for (let i = 0; i < highlights.length; i++) {
        highlights[i].classList.remove('highlighted')
      }
      this.ctrlPressed = false
      this.shiftPressed = false
      this.commandSelected = false
      action()
    }, 400)
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

  openRepository() {
    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.highlightShortcut(this.hShortcuts)
        this.openTab(this.repoUrl(options.repository))
      } else {
        this.openRepoSelect()
      }
    })
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
      this.highlightModifier(shortcuts[i])
    }
  }

  highlightModifier(shortcut) {
    if (!this.shiftPressed && !this.ctrlPressed) {
      return
    }

    const parent = shortcut.parentNode
    if (!parent.classList.contains('with-modifier')) {
      return
    }

    let modifier = null
    if (this.shiftPressed) {
      modifier = parent.querySelector('.shift-modifier')
    } else if (this.ctrlPressed) {
      modifier = parent.querySelector('.ctrl-modifier')
    }

    if (modifier) {
      modifier.classList.add('highlighted')
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
        let path = '/issues'
        if (this.shiftPressed) {
          path += '?q=is%3Aissue+is%3Aclosed'
        } else if (this.ctrlPressed) {
          path += '/new'
        }
        this.openTab(this.repoUrl(options.repository, path))
      } else {
        this.openRepoSelect()
      }
    })
  }

  openPullRequests() {
    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.highlightShortcut(this.pShortcuts)
        let path = '/pulls'
        if (this.shiftPressed) {
          path += '?is%3Apr%20is%3Amerged'
        }
        this.openTab(this.repoUrl(options.repository, path))
      } else {
        this.openRepoSelect()
      }
    })
  }

  openOrgMembers() {
    HubnavStorage.load().then(options => {
      if (options.organization && options.organization.length > 0) {
        this.highlightShortcut(this.mShortcuts)
        const org = encodeURIComponent(options.organization)
        this.openTab(`https://github.com/orgs/${org}/people`)
      } else {
        this.openOrgSelect()
      }
    })
  }

  openOptions(hash) {
    this.runAfterDelay(() => chrome.tabs.create({ url }))
    this.openTab(`chrome-extension://${chrome.runtime.id}/options.html#${hash}`)
  }

  openTab(url) {
    this.runAfterDelay(() => chrome.tabs.create({ url }))
  }

  quickRepositorySwitch(i) {
    HubnavStorage.load().then(currentOptions => {
      const newOptions = {}
      for (let key in currentOptions) {
        newOptions[key] = currentOptions[key]
      }
      const newRepo = currentOptions[`repository${i}`]
      const newDefaultBranch = currentOptions[`defaultBranch${i}`]
      if (newRepo && newRepo.length > 0) {
        newOptions.repository = newRepo
      }
      if (newDefaultBranch && newDefaultBranch.length > 0) {
        newOptions.defaultBranch = newDefaultBranch
      }
      HubnavStorage.save(newOptions).then(() => {
        this.highlightShortcut(this[`shortcuts${i}`])
        this.runAfterDelay(() => this.loadActiveRepository(newOptions.repository))
      })
    })
  }

  onShortcutClick(event) {
    event.preventDefault()
    const keyClass = event.currentTarget.className.split(' ').
      filter(cls => cls.indexOf('shortcut-') === 0)[0]
    if (!keyClass) {
      return
    }
    const key = keyClass.split('shortcut-')[1]
    this.executeShortcut(key)
  }

  repoUrl(repo, path) {
    const parts = repo.split('/')
    const owner = encodeURIComponent(parts[0])
    const name = encodeURIComponent(parts[1])
    return `https://github.com/${owner}/${name}${path || ''}`
  }

  executeShortcut(key) {
    if (this.commandSelected) {
      return
    }
    if (key === 'f') {
      this.openFileFinder()
    } else if (key === 't') {
      this.openTeams()
    } else if (key === 's') {
      this.openGlobalSearch()
    } else if (key === 'o') {
      this.openOrgSelect()
    } else if (key === 'r') {
      this.openRepoSelect()
    } else if (key === 'i') {
      this.openIssues()
    } else if (key === 'p') {
      this.openPullRequests()
    } else if (key === 'h') {
      this.openRepository()
    } else if (key === 'm') {
      this.openOrgMembers()
    } else if (['1', '2', '3', '4'].indexOf(key) > -1) {
      this.quickRepositorySwitch(key)
    } else if (key === 'shift') {
      this.shiftPressed = true
    } else if (key === 'control') {
      this.ctrlPressed = true
    }
  }

  loadActiveRepository(repo) {
    this.repoCommands.style.display = 'block'
    this.loadRepoLogo(repo, this.repoLogo)
    this.repo.textContent = repo
  }

  setup() {
    document.addEventListener('keydown', event => {
      this.executeShortcut(event.key.toLowerCase())
    })

    for (let i = 0; i < this.shortcuts.length; i++) {
      this.shortcuts[i].addEventListener('click', e => this.onShortcutClick(e))
    }

    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.loadActiveRepository(options.repository)
      }

      if (options.organization && options.organization.length > 0) {
        this.orgCommands.style.display = 'block'
        this.loadOrgLogo(options.organization)
        this.org.textContent = options.organization
      }

      let repoCount = 0
      for (let i = 1; i <= 4; i++) {
        const repo = options[`repository${i}`]
        if (repo && repo.length > 0) {
          repoCount++
          const repoRefs = document.querySelectorAll(`.shortcut-${i}`)
          for (let j = 0; j < repoRefs.length; j++) {
            repoRefs[j].style.display = 'block'
          }
          this[`repo${i}`].textContent = repo
          this.loadRepoLogo(repo, this[`repoLogo${i}`])
        }
      }
      if (repoCount > 1) {
        this.repoSwitch.style.display = 'block'
      }
    })
  }

  loadOrgLogo(rawOrg) {
    const org = encodeURIComponent(rawOrg)
    this.orgLogo.src = `https://github.com/${org}.png?size=40`
    this.orgLogo.alt = org
  }

  loadRepoLogo(rawRepo, imgTag) {
    let user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
      user = encodeURIComponent(user)
      imgTag.src = `https://github.com/${user}.png?size=40`
      imgTag.alt = user
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new PopupPage()
  page.setup()
})
