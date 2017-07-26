class PopupPage {
  constructor() {
    this.findElements()
    this.shiftPressed = false
    this.ctrlPressed = false
    this.commandSelected = false
  }

  findElements() {
    // Context switching:
    this.contextSwitch = document.getElementById('context-switch')
    for (let i of REPO_SHORTCUTS) {
      this[`repo${i}`] = document.getElementById(`repo${i}`)
      this[`repoLogo${i}`] = document.getElementById(`repo-logo${i}`)
    }
    for (let i of USER_SHORTCUTS) {
      this[`user${i}`] = document.getElementById(`user${i}`)
      this[`userLogo${i}`] = document.getElementById(`user-logo${i}`)
    }

    // Active context:
    this.repo = document.getElementById('repository')
    this.user = document.getElementById('user')
    this.org = document.getElementById('organization')
    this.repoLogo = document.getElementById('repo-logo')
    this.userLogo = document.getElementById('user-logo')
    this.orgLogo = document.getElementById('org-logo')

    // Shortcuts:
    this.fShortcuts = document.querySelectorAll('.shortcut-f')
    this.tShortcuts = document.querySelectorAll('.shortcut-t')
    this.sShortcuts = document.querySelectorAll('.shortcut-s')
    this.rShortcuts = document.querySelectorAll('.shortcut-r')
    this.oShortcuts = document.querySelectorAll('.shortcut-o')
    this.iShortcuts = document.querySelectorAll('.shortcut-i')
    this.pShortcuts = document.querySelectorAll('.shortcut-p')
    this.hShortcuts = document.querySelectorAll('.shortcut-h')
    this.mShortcuts = document.querySelectorAll('.shortcut-m')
    this.uShortcuts = document.querySelectorAll('.shortcut-u')
    this.shortcuts1 = document.querySelectorAll('.shortcut-1')
    this.shortcuts2 = document.querySelectorAll('.shortcut-2')
    this.shortcuts3 = document.querySelectorAll('.shortcut-3')
    this.shortcuts4 = document.querySelectorAll('.shortcut-4')
    this.shortcuts8 = document.querySelectorAll('.shortcut-8')
    this.shortcuts9 = document.querySelectorAll('.shortcut-9')
    this.shortcuts0 = document.querySelectorAll('.shortcut-0')

    // Modifiers:
    this.closedIssues = document.getElementById('closed-issues')
    this.newIssue = document.getElementById('new-issue')
    this.repoMergedPullRequests = document.getElementById('repo-merged-pull-requests')
    this.userMergedPullRequests = document.getElementById('user-merged-pull-requests')
    this.userClosedPullRequests = document.getElementById('user-closed-pull-requests')
    this.orgMergedPullRequests = document.getElementById('org-merged-pull-requests')
    this.orgClosedPullRequests = document.getElementById('org-closed-pull-requests')
    this.newPullRequest = document.getElementById('new-pull-request')

    // Containers:
    this.repoCommands = document.getElementById('repo-commands')
    this.userCommands = document.getElementById('user-commands')
    this.orgCommands = document.getElementById('org-commands')

    this.welcome = document.getElementById('welcome')
    this.shortcuts = document.querySelectorAll('.shortcut')
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

  openUserProfile() {
    HubnavStorage.load().then(options => {
      if (options.user && options.user.length > 0) {
        this.highlightShortcut(this.uShortcuts)
        const user = encodeURIComponent(options.user)
        this.openTab(`https://github.com/${user}`)
      } else {
        this.openOptions()
      }
    })
  }

  openPullRequests() {
    HubnavStorage.load().then(options => {
      if (options.active === 'user' && options.user && options.user.length > 0) {
        this.highlightShortcut(this.pShortcuts)
        let state = 'is%3Aopen'
        if (this.shiftPressed) { // merged
          state = 'is%3Amerged'
        } else if (this.ctrlPressed) { // closed, not merged
          state = 'is%3Aclosed+is%3Aunmerged'
        }
        let params = `?s=updated&type=Issues&q=is%3Apr+${state}`
        const user = encodeURIComponent(options.user)
        if (options.userIsOrg) {
          params += `+org%3A${user}`
        } else {
          params += `+author%3A${user}`
        }
        this.openTab(`https://github.com/search${params}`)
      } else if (options.repository && options.repository.length > 0) {
        this.highlightShortcut(this.pShortcuts)
        let path = '/pulls'
        if (this.shiftPressed) {
          path += '?is%3Apr%20is%3Amerged'
        } else if (this.ctrlPressed) {
          path = '/compare'
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
        this.openOptions()
      }
    })
  }

  openRepositories() {
    HubnavStorage.load().then(options => {
      if (options.user && options.user.length > 0) {
        this.highlightShortcut(this.rShortcuts)
        const user = encodeURIComponent(options.user)
        let path = 'https://github.com/search?type=Repositories&q='
        if (options.userIsOrg) {
          path += `org%3A${user}`
        } else {
          path += `user%3A${user}`
        }
        this.openTab(path)
      } else {
        this.openOptions()
      }
    })
  }

  openOptions(hash) {
    let path = `chrome-extension://${chrome.runtime.id}/options.html`
    if (hash && hash.length > 0) {
      path += `#${hash}`
    }
    this.highlightShortcut(this.oShortcuts)
    this.openTab(path)
  }

  openTab(url) {
    this.runAfterDelay(() => chrome.tabs.create({ url }))
  }

  quickUserSwitch(i) {
    HubnavStorage.load().then(currentOptions => {
      const newOptions = {}
      for (let key in currentOptions) {
        newOptions[key] = currentOptions[key]
      }

      const newUser = currentOptions[`user${i}`]
      if (newUser && newUser.length > 0) {
        newOptions.user = newUser
        newOptions.userIsOrg = currentOptions[`userIsOrg${i}`]
      }
      newOptions.active = 'user'

      HubnavStorage.save(newOptions).then(() => {
        this.highlightShortcut(this[`shortcuts${i}`])
        this.runAfterDelay(() => {
          if (newOptions.userIsOrg) {
            this.loadActiveOrganization(newOptions.user)
          } else {
            this.loadActiveUser(newOptions.user)
          }
        })
      })
    })
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
      newOptions.active = 'repository'
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
      this.openOptions()
    } else if (key === 'i') {
      this.openIssues()
    } else if (key === 'p') {
      this.openPullRequests()
    } else if (key === 'u') {
      this.openUserProfile()
    } else if (key === 'h') {
      this.openRepository()
    } else if (key === 'm') {
      this.openOrgMembers()
    } else if (key === 'r') {
      this.openRepositories()
    } else if (REPO_SHORTCUTS.indexOf(key) > -1) {
      this.quickRepositorySwitch(key)
    } else if (USER_SHORTCUTS.indexOf(key) > -1) {
      this.quickUserSwitch(key)
    } else if (key === 'shift') {
      this.shiftPressed = true
    } else if (key === 'control') {
      this.ctrlPressed = true
    }
  }

  loadActiveOrganization(org) {
    this.repoCommands.style.display = 'none'
    this.userCommands.style.display = 'none'
    this.orgCommands.style.display = 'block'
    this.loadUserLogo(org, this.orgLogo)
    this.org.textContent = org
  }

  loadActiveUser(user) {
    this.repoCommands.style.display = 'none'
    this.userCommands.style.display = 'block'
    this.orgCommands.style.display = 'none'
    this.loadUserLogo(user, this.userLogo)
    this.user.textContent = user
  }

  loadActiveRepository(repo) {
    this.repoCommands.style.display = 'block'
    this.userCommands.style.display = 'none'
    this.orgCommands.style.display = 'none'
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
      if (!options.repository && !options.user) {
        this.welcome.style.display = 'block'
      }

      if (options.active && typeof options.active === 'string') {
        if (options.active === 'user' && options.user && options.user.length > 0) {
          if (options.userIsOrg) {
            this.loadActiveOrganization(options.user)
          } else {
            this.loadActiveUser(options.user)
          }
        } else if (options.active === 'repository' && options.repository && options.repository.length > 0) {
          this.loadActiveRepository(options.repository)
        }
      } else { // no active context
        if (options.repository && options.repository.length > 0) {
          this.loadActiveRepository(options.repository)
        } else if (options.user && options.user.length > 0) {
          if (options.userIsOrg) {
            this.loadActiveOrganization(options.user)
          } else {
            this.loadActiveUser(options.user)
          }
        }
      }

      if (typeof options.closedIssues === 'boolean' && !options.closedIssues) {
        this.closedIssues.style.display = 'none'
      }

      if (typeof options.newIssue === 'boolean' && !options.newIssue) {
        this.newIssue.style.display = 'none'
      }

      if (typeof options.mergedPullRequests === 'boolean' && !options.mergedPullRequests) {
        this.repoMergedPullRequests.style.display = 'none'
        this.userMergedPullRequests.style.display = 'none'
        this.orgMergedPullRequests.style.display = 'none'
      }

      if (typeof options.closedPullRequests === 'boolean' && !options.closedPullRequests) {
        this.userClosedPullRequests.style.display = 'none'
        this.orgClosedPullRequests.style.display = 'none'
      }

      if (typeof options.newPullRequest === 'boolean' && !options.newPullRequest) {
        this.newPullRequest.style.display = 'none'
      }

      let contextCount = 0
      for (let i of REPO_SHORTCUTS) {
        const repo = options[`repository${i}`]
        if (repo && repo.length > 0) {
          contextCount++
          const repoRefs = document.querySelectorAll(`.shortcut-${i}`)
          for (let j = 0; j < repoRefs.length; j++) {
            repoRefs[j].style.display = 'block'
          }
          this[`repo${i}`].textContent = repo
          this.loadRepoLogo(repo, this[`repoLogo${i}`])
        }
      }

      for (let i of USER_SHORTCUTS) {
        const user = options[`user${i}`]
        if (user && user.length > 0) {
          contextCount++
          const userRefs = document.querySelectorAll(`.shortcut-${i}`)
          for (let j = 0; j < userRefs.length; j++) {
            userRefs[j].style.display = 'block'
          }
          this[`user${i}`].textContent = user
          this.loadUserLogo(user, this[`userLogo${i}`])
        }
      }

      if (contextCount > 1) {
        this.contextSwitch.style.display = 'block'
      }
    })
  }

  loadOrgLogo(rawOrg) {
    this.loadUserLogo(rawOrg, this.orgLogo)
  }

  loadRepoLogo(rawRepo, imgTag) {
    let user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
      this.loadUserLogo(user, imgTag)
    }
  }

  loadUserLogo(rawUser, imgTag) {
    const user = encodeURIComponent(rawUser)
    imgTag.src = `https://github.com/${user}.png?size=36`
    imgTag.alt = user
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new PopupPage()
  page.setup()
})
