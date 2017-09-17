class PopupPage {
  constructor() {
    this.findElements()
    this.shiftPressed = false
    this.ctrlPressed = false
    this.commandSelected = false
    this.altPressed = false
  }

  findElements() {
    // Context switching and shortcuts:
    this.contextSwitch = document.getElementById('context-switch')
    for (let i of REPO_SHORTCUTS) {
      this[`shortcuts${i}`] = document.querySelectorAll(`.shortcut-${i}`)
      this[`repo${i}`] = document.getElementById(`repo${i}`)
      this[`repoLogo${i}`] = document.getElementById(`repo-logo${i}`)
    }
    for (let i of PROJECT_SHORTCUTS) {
      this[`shortcuts${i}`] = document.querySelectorAll(`.shortcut-${i}`)
      this[`project${i}`] = document.getElementById(`project${i}`)
      this[`projectLogo${i}`] = document.getElementById(`project-logo${i}`)
    }
    for (let i of USER_SHORTCUTS) {
      this[`shortcuts${i}`] = document.querySelectorAll(`.shortcut-${i}`)
      this[`user${i}`] = document.getElementById(`user${i}`)
      this[`userLogo${i}`] = document.getElementById(`user-logo${i}`)
    }

    // Active context:
    this.repo = document.getElementById('repository')
    this.user = document.getElementById('user')
    this.org = document.getElementById('organization')
    this.project = document.getElementById('project')
    this.repoLogo = document.getElementById('repo-logo')
    this.userLogo = document.getElementById('user-logo')
    this.orgLogo = document.getElementById('org-logo')
    this.projectLogo = document.getElementById('project-logo')

    // Shortcuts:
    this.fShortcuts = document.querySelectorAll('.shortcut-f')
    this.tShortcuts = document.querySelectorAll('.shortcut-t')
    this.sShortcuts = document.querySelectorAll('.shortcut-s')
    this.rShortcuts = document.querySelectorAll('.shortcut-r')
    this.oShortcuts = document.querySelectorAll('.shortcut-o')
    this.iShortcuts = document.querySelectorAll('.shortcut-i')
    this.pShortcuts = document.querySelectorAll('.shortcut-p')
    this.mShortcuts = document.querySelectorAll('.shortcut-m')
    this.vShortcuts = document.querySelectorAll('.shortcut-v')

    // Modifiers:
    this.closedIssueModifers = document.querySelectorAll('.closed-issues')
    this.newIssue = document.getElementById('new-issue')
    this.mergedPRModifiers = document.querySelectorAll('.merged-pull-requests')
    this.closedPRModifiers = document.querySelectorAll('.closed-pull-requests')
    this.newPullRequest = document.getElementById('new-pull-request')

    // Containers:
    this.repoCommands = document.getElementById('repo-commands')
    this.userCommands = document.getElementById('user-commands')
    this.orgCommands = document.getElementById('org-commands')
    this.projectCommands = document.getElementById('project-commands')

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
      this.altPressed = false
      action()
    }, 400)
  }

  openFileFinder() {
    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.highlightShortcut(this.fShortcuts)
        const defaultBranch = options.defaultBranch || 'master'
        const path = `/find/${defaultBranch}`
        this.openTab(this.repoUrl(options.repository, path, options.githubUrl))
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
      if (options.user && options.user.length > 0 && options.userIsOrg) {
        this.highlightShortcut(this.tShortcuts)
        const org = encodeURIComponent(options.user)
        this.openTab(`https://github.com/orgs/${org}/teams`)
      } else {
        this.openOptions()
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
    if (!this.shiftPressed && !this.ctrlPressed && !this.altPressed) {
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
    } else if (this.altPressed) {
      modifier = parent.querySelector('.alt-modifier')
    }

    if (modifier) {
      modifier.classList.add('highlighted')
    }
  }

  openIssues() {
    HubnavStorage.load().then(options => {
      if (options.active === 'user' && options.user && options.user.length > 0) {
        this.highlightShortcut(this.iShortcuts)
        let params = '?utf8=✓&q=is%3Aissue'
        if (this.shiftPressed) { // closed
          params += '+is%3Aclosed'
        } else { // open
          params += '+is%3Aopen'
        }
        const user = encodeURIComponent(options.user)
        if (options.userIsOrg) { // organization
          params += `+org%3A${user}`
        } else { // user
          params += `+author%3A${user}`
          if (options.scope && options.scope.length > 0) {
            if (options.scope.indexOf('/') > -1) { // repository
              const ownerAndName = options.scope.split('/')
              params += `+repo%3A${ownerAndName[0]}%2F${ownerAndName[1]}`
            } else { // organization
              params += `+org%3A${options.scope}`
            }
          }
        }
        this.openTab(`https://github.com/issues${params}`)

      } else if (options.active === 'repository' && options.repository &&
                 options.repository.length > 0) {
        this.highlightShortcut(this.iShortcuts)
        let path = '/issues'
        if (this.shiftPressed) { // closed
          path += '?utf8=✓&q=is%3Aissue+is%3Aclosed'
        } else if (this.ctrlPressed) { // new
          path += '/new'
        }
        this.openTab(this.repoUrl(options.repository, path, options.githubUrl))

      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectRepo &&
                 options.projectRepo.length > 0) {
        this.highlightShortcut(this.iShortcuts)
        const args = this.argsForProjectUrl('issues')
        this.openTab(this.repoProjectUrl(options.projectRepo, options.projectNumber, args))

      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectOrg &&
                 options.projectOrg.length > 0) {
        this.highlightShortcut(this.iShortcuts)
        const args = this.argsForProjectUrl('issues')
        this.openTab(this.orgProjectUrl(options.projectOrg, options.projectNumber, args))

      } else {
        this.openRepoSelect()
      }
    })
  }

  openHomeForContext() {
    HubnavStorage.load().then(options => {
      if (options.active === 'repository' && options.repository && options.repository.length > 0) {
        this.highlightShortcut(this.vShortcuts)
        this.openTab(this.repoUrl(options.repository, null, options.githubUrl))
      } else if (options.active === 'user' && options.user && options.user.length > 0) {
        this.highlightShortcut(this.vShortcuts)
        const user = encodeURIComponent(options.user)
        this.openTab(`https://github.com/${user}`)
      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectRepo &&
                 options.projectRepo.length > 0) {
        this.highlightShortcut(this.vShortcuts)
        this.openTab(this.repoProjectUrl(options.projectRepo, options.projectNumber))
      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectOrg &&
                 options.projectOrg.length > 0) {
        this.highlightShortcut(this.vShortcuts)
        this.openTab(this.orgProjectUrl(options.projectOrg, options.projectNumber))
      } else {
        this.openOptions()
      }
    })
  }

  openPullRequests() {
    HubnavStorage.load().then(options => {
      if (options.active === 'user' && options.user && options.user.length > 0) {
        this.highlightShortcut(this.pShortcuts)
        const user = encodeURIComponent(options.user)
        let params = '?utf8=✓&q=is%3Apr'
        if (options.userIsOrg) { // organization
          params += `+org%3A${user}`
        } else { // user
          params += `+author%3A${user}`
          if (options.scope && options.scope.length > 0) {
            if (options.scope.indexOf('/') > -1) { // repository
              const ownerAndName = options.scope.split('/')
              params += `+repo%3A${ownerAndName[0]}%2F${ownerAndName[1]}`
            } else { // organization
              params += `+org%3A${options.scope}`
            }
          }
        }
        if (this.shiftPressed) { // merged
          params += '+is%3Amerged'
        } else if (this.ctrlPressed) { // closed, not merged
          params += '+is%3Aclosed+is%3Aunmerged'
        } else { // open
          params += '+is%3Aopen'
        }
        this.openTab(`https://github.com/pulls${params}`)

      } else if (options.active === 'repository' && options.repository &&
                 options.repository.length > 0) {
        this.highlightShortcut(this.pShortcuts)
        let path = '/pulls'
        if (this.shiftPressed) {
          path += '?utf8=✓&q=is%3Apr%20is%3Amerged'
        } else if (this.ctrlPressed) {
          path = '/compare'
        } else if (this.altPressed) {
          path += '?utf8=✓&q=is%3Apr%20is%3Aclosed+is%3Aunmerged'
        }
        this.openTab(this.repoUrl(options.repository, path, options.githubUrl))

      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectRepo &&
                 options.projectRepo.length > 0) {
        this.highlightShortcut(this.pShortcuts)
        const args = this.argsForProjectUrl('pull_requests')
        this.openTab(this.repoProjectUrl(options.projectRepo, options.projectNumber, args))

      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectOrg &&
                 options.projectOrg.length > 0) {
        this.highlightShortcut(this.pShortcuts)
        const args = this.argsForProjectUrl('pull_requests')
        this.openTab(this.orgProjectUrl(options.projectOrg, options.projectNumber, args))

      } else {
        this.openRepoSelect()
      }
    })
  }

  argsForProjectUrl(type) {
    let query = ''
    if (type === 'pull_requests') { // pull requests
      query = 'is%3Apr'
      if (this.shiftPressed) { // merged
        query += '+is%3Amerged'
      } else if (this.ctrlPressed) { // closed, not merged
        query += '+is%3Aclosed+is%3Aunmerged'
      } else {
        query += '+is%3Aopen'
      }
    } else { // issues
      query = 'is%3Aissue'
      if (this.shiftPressed) {
        query += '+is%3Aclosed'
      } else {
        query += '+is%3Aopen'
      }
    }
    return `&card_filter_query=${query}`
  }

  repoProjectUrl(repo, rawNumber, args) {
    const number = encodeURIComponent(rawNumber)
    const path = `/projects/${number}?fullscreen=true${args || ''}`
    return this.repoUrl(repo, path)
  }

  orgProjectUrl(rawOrg, rawNumber, args) {
    const org = encodeURIComponent(rawOrg)
    const number = encodeURIComponent(rawNumber)
    return `https://github.com/orgs/${org}/projects/${number}?fullscreen=true${args || ''}`
  }

  openOrgMembers() {
    HubnavStorage.load().then(options => {
      if (options.user && options.user.length > 0 && options.userIsOrg) {
        this.highlightShortcut(this.mShortcuts)
        const org = encodeURIComponent(options.user)
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
        let path = 'https://github.com/search?s=updated&type=Repositories&q='
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
        newOptions.scope = currentOptions[`userScope${i}`]
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

  quickProjectSwitch(i) {
    HubnavStorage.load().then(currentOptions => {
      const newOptions = {}
      for (let key in currentOptions) {
        newOptions[key] = currentOptions[key]
      }
      const newProjectRepo = currentOptions[`projectRepo${i}`]
      const newProjectOrg = currentOptions[`projectOrg${i}`]
      const newProjectName = currentOptions[`projectName${i}`]
      const newProjectNumber = currentOptions[`projectNumber${i}`]
      if (newProjectRepo && newProjectRepo.length > 0) {
        newOptions.projectRepo = newProjectRepo
        delete newOptions.projectOrg
      }
      if (newProjectOrg && newProjectOrg.length > 0) {
        newOptions.projectOrg = newProjectOrg
        delete newOptions.projectRepo
      }
      if (newProjectNumber && newProjectNumber.length > 0) {
        newOptions.projectNumber = newProjectNumber
      }
      if (newProjectName && newProjectName.length > 0) {
        newOptions.projectName = newProjectName
      }
      newOptions.active = 'project'
      HubnavStorage.save(newOptions).then(() => {
        this.highlightShortcut(this[`shortcuts${i}`])
        this.runAfterDelay(() => {
          if (newOptions.projectRepo && newOptions.projectRepo.length > 0) {
            this.loadActiveRepoProject(newOptions.projectRepo, newOptions.projectName)
          } else {
            this.loadActiveOrgProject(newOptions.projectOrg, newOptions.projectName)
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
      const newGithubUrl = currentOptions[`githubUrl${i}`]
      if (newRepo && newRepo.length > 0) {
        newOptions.repository = newRepo
      }
      if (newDefaultBranch && newDefaultBranch.length > 0) {
        newOptions.defaultBranch = newDefaultBranch
      }
      if (newGithubUrl && newGithubUrl.length > 0) {
        newOptions.githubUrl = newGithubUrl
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

  repoUrl(repo, path, githubUrl) {
    const parts = repo.split('/')
    const owner = encodeURIComponent(parts[0])
    const name = encodeURIComponent(parts[1])
    const baseUrl = (githubUrl || 'https://github.com').replace(/\/+$/, '')
    return `${baseUrl}/${owner}/${name}${path || ''}`
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
    } else if (key === 'p' || key === 'π') {
      this.openPullRequests()
    } else if (key === 'v') {
      this.openHomeForContext()
    } else if (key === 'm') {
      this.openOrgMembers()
    } else if (key === 'r') {
      this.openRepositories()
    } else if (REPO_SHORTCUTS.indexOf(key) > -1) {
      this.quickRepositorySwitch(key)
    } else if (PROJECT_SHORTCUTS.indexOf(key) > -1) {
      this.quickProjectSwitch(key)
    } else if (USER_SHORTCUTS.indexOf(key) > -1) {
      this.quickUserSwitch(key)
    } else if (key === 'shift') {
      this.shiftPressed = true
    } else if (key === 'control') {
      this.ctrlPressed = true
    } else if (key === 'alt') {
      this.altPressed = true
    }
  }

  loadActiveOrganization(org) {
    this.repoCommands.style.display = 'none'
    this.userCommands.style.display = 'none'
    this.projectCommands.style.display = 'none'
    this.orgCommands.style.display = 'block'
    this.loadUserLogo(org, this.orgLogo)
    this.org.textContent = org
  }

  loadActiveRepoProject(repo, name) {
    this.repoCommands.style.display = 'none'
    this.userCommands.style.display = 'none'
    this.projectCommands.style.display = 'block'
    this.orgCommands.style.display = 'none'
    this.loadRepoLogo(repo, this.projectLogo)
    this.project.textContent = name
  }

  loadActiveOrgProject(org, name) {
    this.repoCommands.style.display = 'none'
    this.userCommands.style.display = 'none'
    this.projectCommands.style.display = 'block'
    this.orgCommands.style.display = 'none'
    this.loadUserLogo(org, this.projectLogo)
    this.project.textContent = name
  }

  loadActiveUser(user) {
    this.repoCommands.style.display = 'none'
    this.userCommands.style.display = 'block'
    this.projectCommands.style.display = 'none'
    this.orgCommands.style.display = 'none'
    this.loadUserLogo(user, this.userLogo)
    this.user.textContent = user
  }

  loadActiveRepository(repo) {
    this.repoCommands.style.display = 'block'
    this.userCommands.style.display = 'none'
    this.projectCommands.style.display = 'none'
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
      if (!options.repository && !options.user && !options.projectNumber) {
        this.welcome.style.display = 'block'
      }

      if (options.active && typeof options.active === 'string') {
        if (options.active === 'user' && options.user && options.user.length > 0) {
          if (options.userIsOrg) {
            this.loadActiveOrganization(options.user)
          } else {
            this.loadActiveUser(options.user)
          }
        } else if (options.active === 'repository' && options.repository &&
                   options.repository.length > 0) {
          this.loadActiveRepository(options.repository)
        } else if (options.active === 'project' && options.projectNumber &&
                   options.projectNumber.length > 0 &&
                   options.projectRepo && options.projectRepo.length > 0 &&
                   options.projectName && options.projectName.length > 0) {
          this.loadActiveRepoProject(options.projectRepo, options.projectName)
        } else if (options.active === 'project' && options.projectNumber &&
                   options.projectNumber.length > 0 &&
                   options.projectOrg && options.projectOrg.length > 0 &&
                   options.projectName && options.projectName.length > 0) {
          this.loadActiveOrgProject(options.projectOrg, options.projectName)
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
        } else if (options.projectNumber && options.projectNumber.length > 0 &&
                   options.projectRepo && options.projectRepo.length > 0 &&
                   options.projectName && options.projectName.length > 0) {
          this.loadActiveRepoProject(options.projectRepo, options.projectName)
        } else if (options.projectNumber && options.projectNumber.length > 0 &&
                   options.projectOrg && options.projectOrg.length > 0 &&
                   options.projectName && options.projectName.length > 0) {
          this.loadActiveRepoProject(options.projectOrg, options.projectName)
        }
      }

      if (typeof options.closedIssues === 'boolean' && !options.closedIssues) {
        for (let i = 0; i < this.closedIssueModifers.length; i++) {
          this.closedIssueModifers[i].style.display = 'none'
        }
      }

      if (typeof options.newIssue === 'boolean' && !options.newIssue) {
        this.newIssue.style.display = 'none'
      }

      if (typeof options.mergedPullRequests === 'boolean' && !options.mergedPullRequests) {
        for (let i = 0; i < this.mergedPRModifiers.length; i++) {
          this.mergedPRModifiers[i].style.display = 'none'
        }
      }

      if (typeof options.closedPullRequests === 'boolean' && !options.closedPullRequests) {
        for (let i = 0; i < this.closedPRModifiers.length; i++) {
          this.closedPRModifiers[i].style.display = 'none'
        }
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

      for (let i of PROJECT_SHORTCUTS) {
        const name = options[`projectName${i}`]
        if (name && name.length > 0) {
          contextCount++
          const repo = options[`projectRepo${i}`]
          const org = options[`projectOrg${i}`]
          const projectRefs = document.querySelectorAll(`.shortcut-${i}`)
          for (let j = 0; j < projectRefs.length; j++) {
            projectRefs[j].style.display = 'block'
          }
          this[`project${i}`].textContent = name
          if (repo && repo.length > 0) {
            this.loadRepoLogo(repo, this[`projectLogo${i}`])
          } else if (org && org.length > 0) {
            this.loadUserLogo(org, this[`projectLogo${i}`])
          }
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
    const user = rawRepo.split('/')[0]
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
