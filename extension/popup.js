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
    this.shortcutsList = document.getElementById('shortcuts-list')
    this.shortcuts = document.querySelectorAll('.shortcut')
    this.shortcutTemplate = document.getElementById('shortcut-template')

    // Active context:
    this.repo = document.getElementById('repository')
    this.user = document.getElementById('user')
    this.org = document.getElementById('organization')
    this.project = document.getElementById('project')
    this.milestone = document.getElementById('milestone')
    this.repoLogo = document.getElementById('repo-logo')
    this.userLogo = document.getElementById('user-logo')
    this.orgLogo = document.getElementById('org-logo')
    this.projectLogo = document.getElementById('project-logo')
    this.milestoneLogo = document.getElementById('milestone-logo')

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
    this.cShortcuts = document.querySelectorAll('.shortcut-c')
    this.nShortcuts = document.querySelectorAll('.shortcut-n')

    // Modifiers:
    this.closedIssueModifiers = document.querySelectorAll('.closed-issues')
    this.newIssue = document.getElementById('new-issue')
    this.mergedPRModifiers = document.querySelectorAll('.merged-pull-requests')
    this.closedPRModifiers = document.querySelectorAll('.closed-pull-requests')
    this.newPullRequest = document.getElementById('new-pull-request')

    // Containers:
    this.repoCommands = document.getElementById('repo-commands')
    this.userCommands = document.getElementById('user-commands')
    this.orgCommands = document.getElementById('org-commands')
    this.projectCommands = document.getElementById('project-commands')
    this.milestoneCommands = document.getElementById('milestone-commands')

    this.welcome = document.getElementById('welcome')
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
        this.highlightShortcuts(this.fShortcuts)
        const defaultBranch = options.defaultBranch || 'master'
        const path = `/find/${defaultBranch}`
        this.openTab(this.repoUrl(options.repository, path, options.githubUrl))
      } else {
        this.openRepoSelect()
      }
    })
  }

  openRepoSelect() {
    this.highlightShortcuts(this.rShortcuts)
    this.openOptions('select-repository')
  }

  openGlobalSearch() {
    this.highlightShortcuts(this.sShortcuts)
    this.openTab('https://github.com/search')
  }

  openTeams() {
    HubnavStorage.load().then(options => {
      if (options.user && options.user.length > 0 && options.userIsOrg) {
        this.highlightShortcuts(this.tShortcuts)
        const org = encodeURIComponent(options.user)
        this.openTab(`https://github.com/orgs/${org}/teams`)
      } else {
        this.openOptions()
      }
    })
  }

  highlightContext(key) {
    const currentHighlights = this.shortcutsList.querySelectorAll('.active-context')
    for (const shortcutEl of currentHighlights) {
      shortcutEl.classList.remove('active-context')
    }
    const newHighlights = this.shortcutsList.querySelectorAll(`.shortcut-${key}`)
    for (const shortcutEl of newHighlights) {
      shortcutEl.classList.add('active-context')
    }
  }

  highlightShortcuts(shortcuts) {
    for (let i = 0; i < shortcuts.length; i++) {
      this.highlightShortcut(shortcuts[i])
    }
  }

  highlightShortcut(shortcut) {
    shortcut.classList.add('highlighted')
    this.highlightModifier(shortcut)
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

  openClosedIssues() {
    HubnavStorage.load().then(options => {
      if (options.active === 'milestone' && options.milestoneName &&
          options.milestoneNumber && options.milestoneRepo) {
        this.openMilestoneClosedIssues(options)
      }
    })
  }

  openNewIssue() {
    HubnavStorage.load().then(options => {
      if (options.active === 'milestone' && options.milestoneName &&
          options.milestoneNumber && options.milestoneRepo) {
        this.openMilestoneNewIssue(options)
      }
    })
  }

  openMilestoneClosedIssues(options) {
    this.highlightShortcuts(this.cShortcuts)
    const number = encodeURIComponent(options.milestoneNumber)
    const path = `/milestone/${number}?closed=1`
    this.openTab(this.repoUrl(options.milestoneRepo, path))
  }

  openMilestoneNewIssue(options) {
    this.highlightShortcuts(this.nShortcuts)
    const number = encodeURIComponent(options.milestoneNumber)
    const path = `/issues/new?milestone=${number}`
    this.openTab(this.repoUrl(options.milestoneRepo, path))
  }

  openIssues() {
    HubnavStorage.load().then(options => {
      if (options.active === 'user' && options.user && options.user.length > 0) {
        this.openUserIssues(options)

      } else if (options.active === 'repository' && options.repository &&
                 options.repository.length > 0) {
        this.openRepoIssues(options)

      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectRepo &&
                 options.projectRepo.length > 0) {
        this.openRepoProjectIssues(options)

      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectOrg &&
                 options.projectOrg.length > 0) {
        this.openOrgProjectIssues(options)

      } else {
        this.openRepoSelect()
      }
    })
  }

  openUserIssues(options) {
    this.highlightShortcuts(this.iShortcuts)
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
  }

  openRepoIssues(options) {
    this.highlightShortcuts(this.iShortcuts)
    let path = '/issues'
    if (this.shiftPressed) { // closed
      path += '?utf8=✓&q=is%3Aissue+is%3Aclosed'
    } else if (this.ctrlPressed) { // new
      path += '/new'
    }
    this.openTab(this.repoUrl(options.repository, path, options.githubUrl))
  }

  openRepoProjectIssues(options) {
    this.highlightShortcuts(this.iShortcuts)
    const args = this.argsForProjectUrl('issues')
    this.openTab(this.repoProjectUrl(options.projectRepo, options.projectNumber, args))
  }

  openOrgProjectIssues(options) {
    this.highlightShortcuts(this.iShortcuts)
    const args = this.argsForProjectUrl('issues')
    this.openTab(this.orgProjectUrl(options.projectOrg, options.projectNumber, args))
  }

  openHomeForContext() {
    HubnavStorage.load().then(options => {
      if (options.active === 'repository' && options.repository && options.repository.length > 0) {
        this.highlightShortcuts(this.vShortcuts)
        this.openTab(this.repoUrl(options.repository, null, options.githubUrl))

      } else if (options.active === 'user' && options.user && options.user.length > 0) {
        this.highlightShortcuts(this.vShortcuts)
        const user = encodeURIComponent(options.user)
        this.openTab(`https://github.com/${user}`)

      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectRepo &&
                 options.projectRepo.length > 0) {
        this.highlightShortcuts(this.vShortcuts)
        this.openTab(this.repoProjectUrl(options.projectRepo, options.projectNumber))

      } else if (options.active === 'milestone' && options.milestoneNumber &&
                 options.milestoneNumber.length > 0 && options.milestoneRepo &&
                 options.milestoneRepo.length > 0) {
        this.highlightShortcuts(this.vShortcuts)
        this.openTab(this.milestoneUrl(options.milestoneRepo, options.milestoneNumber))

      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectOrg &&
                 options.projectOrg.length > 0) {
        this.highlightShortcuts(this.vShortcuts)
        this.openTab(this.orgProjectUrl(options.projectOrg, options.projectNumber))

      } else {
        this.openOptions()
      }
    })
  }

  openPullRequests() {
    HubnavStorage.load().then(options => {
      if (options.active === 'user' && options.user && options.user.length > 0) {
        this.highlightShortcuts(this.pShortcuts)
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
        this.highlightShortcuts(this.pShortcuts)
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
        this.highlightShortcuts(this.pShortcuts)
        const args = this.argsForProjectUrl('pull_requests')
        this.openTab(this.repoProjectUrl(options.projectRepo, options.projectNumber, args))

      } else if (options.active === 'project' && options.projectNumber &&
                 options.projectNumber.length > 0 && options.projectOrg &&
                 options.projectOrg.length > 0) {
        this.highlightShortcuts(this.pShortcuts)
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

  milestoneUrl(repo, rawNumber) {
    const number = encodeURIComponent(rawNumber)
    const path = `/milestone/${number}`
    return this.repoUrl(repo, path)
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
        this.highlightShortcuts(this.mShortcuts)
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
        this.highlightShortcuts(this.rShortcuts)

        if (options.userIsOrg) {
          this.openOrgRepositories(options)
        } else {
          this.openUserRepositories(options)
        }
      }
    })
  }

  openUserRepositories(options) {
    const user = encodeURIComponent(options.user)
    const path = `https://github.com/${user}?tab=repositories`
    this.openTab(path)
  }

  openOrgRepositories(options) {
    const org = encodeURIComponent(options.user)
    const path = `https://github.com/search?s=updated&type=Repositories&q=org%3A${org}`
    this.openTab(path)
  }

  openOptions(hash) {
    let path = `chrome-extension://${chrome.runtime.id}/options.html`
    if (hash && hash.length > 0) {
      path += `#${hash}`
    }
    this.highlightShortcuts(this.oShortcuts)
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

  quickMilestoneSwitch(i) {
    HubnavStorage.load().then(currentOptions => {
      const newOptions = {}
      for (let key in currentOptions) {
        newOptions[key] = currentOptions[key]
      }
      const newMilestoneRepo = currentOptions[`milestoneRepo${i}`]
      const newMilestoneName = currentOptions[`milestoneName${i}`]
      const newMilestoneNumber = currentOptions[`milestoneNumber${i}`]
      if (newMilestoneRepo && newMilestoneRepo.length > 0) {
        newOptions.milestoneRepo = newMilestoneRepo
      }
      if (newMilestoneNumber && newMilestoneNumber.length > 0) {
        newOptions.milestoneNumber = newMilestoneNumber
      }
      if (newMilestoneName && newMilestoneName.length > 0) {
        newOptions.milestoneName = newMilestoneName
      }
      newOptions.active = 'milestone'
      HubnavStorage.save(newOptions).then(() => {
        this.highlightShortcut(this[`shortcuts${i}`])
        this.runAfterDelay(() => {
          this.loadActiveMilestone(newOptions.milestoneRepo, newOptions.milestoneName,
                                   newOptions.milestoneNumber)
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
            this.loadActiveRepoProject(newOptions.projectRepo, newOptions.projectName,
                                       newOptions.projectNumber)
          } else {
            this.loadActiveOrgProject(newOptions.projectOrg, newOptions.projectName,
                                      newOptions.projectNumber)
          }
        })
      })
    })
  }

  quickContextSwitch(i) {
    HubnavStorage.load().then(options => {
      if (options[`repository${i}`]) {
        this.highlightContext(i)
        this.quickRepositorySwitch(i)

      } else if (options[`projectName${i}`]) {
        this.highlightContext(i)
        this.quickProjectSwitch(i)

      } else if (options[`user${i}`]) {
        this.highlightContext(i)
        this.quickUserSwitch(i)

      } else if (options[`milestoneName${i}`]) {
        this.highlightContext(i)
        this.quickMilestoneSwitch(i)
      }
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

  doesContextSupportShortcut(key, context, isUserAnOrg) {
    const isUserContext = context === 'user'
    const isProjectContext = context === 'project'
    const isMilestoneContext = context === 'milestone'
    const isRepoContext = context === 'repository'

    // File finder
    if (key === 'f' && !isRepoContext) {
      return false
    }

    // Teams, Members, Repositories
    if ((key === 't' || key === 'm' || key === 'r') && !isUserContext) {
      return false
    }

    // Teams, Members
    if ((key === 't' || key === 'm') && !isUserAnOrg) {
      return false
    }

    // New issue, Closed issues
    if ((key === 'n' || key === 'c') && !isMilestoneContext) {
      return false
    }

    return true
  }

  executeShortcut(key) {
    if (this.commandSelected) {
      return
    }

    HubnavStorage.load().then(options => {
      if (!this.doesContextSupportShortcut(key, options.active, options.userIsOrg)) {
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

      } else if (key === 'c') {
        this.openClosedIssues()

      } else if (key === 'n') {
        this.openNewIssue()

      } else if (key === 'p' || key === 'π') {
        this.openPullRequests()

      } else if (key === 'v') {
        this.openHomeForContext()

      } else if (key === 'm') {
        this.openOrgMembers()

      } else if (key === 'r') {
        this.openRepositories()

      } else if (SHORTCUTS.indexOf(key) > -1) {
        this.quickContextSwitch(key)

      } else if (key === 'shift') {
        this.shiftPressed = true

      } else if (key === 'control') {
        this.ctrlPressed = true

      } else if (key === 'alt') {
        this.altPressed = true
      }
    })
  }

  toggleCommandsShown(activeContext) {
    this.milestoneCommands.style.display = activeContext === 'milestone' ? 'block' : 'none'
    this.repoCommands.style.display = activeContext === 'repository' ? 'block' : 'none'
    this.userCommands.style.display = activeContext === 'user' ? 'block' : 'none'
    this.projectCommands.style.display = activeContext === 'project' ? 'block' : 'none'
    this.orgCommands.style.display = activeContext === 'organization' ? 'block' : 'none'
  }

  loadActiveOrganization(org) {
    this.toggleCommandsShown('organization')
    this.loadUserLogo(org, this.orgLogo)
    this.org.textContent = org
    this.highlightActiveContext('organization', org)
  }

  loadActiveMilestone(repo, name, number) {
    this.toggleCommandsShown('milestone')
    this.loadRepoLogo(repo, this.milestoneLogo)
    this.milestone.textContent = name
    this.highlightActiveContext('milestone', repo, name, number)
  }

  loadActiveRepoProject(repo, name, number) {
    this.toggleCommandsShown('project')
    this.loadRepoLogo(repo, this.projectLogo)
    this.project.textContent = name
    this.highlightActiveContext('repo-project', repo, name, number)
  }

  loadActiveOrgProject(org, name, number) {
    this.toggleCommandsShown('project')
    this.loadUserLogo(org, this.projectLogo)
    this.project.textContent = name
    this.highlightActiveContext('org-project', org, name, number)
  }

  loadActiveUser(user) {
    this.toggleCommandsShown('user')
    this.loadUserLogo(user, this.userLogo)
    this.user.textContent = user
    this.highlightActiveContext('user', user)
  }

  loadActiveRepository(repo) {
    this.toggleCommandsShown('repository')
    this.loadRepoLogo(repo, this.repoLogo)
    this.repo.textContent = repo
    this.highlightActiveContext('repository', repo)
  }

  highlightActiveContext() {
    const contextParams = arguments
    const context = contextParams[0]

    HubnavStorage.load().then(options => {
      let activeKey = null

      if (context === 'repository') {
        const repo = contextParams[1]
        for (const i of SHORTCUTS) {
          if (options[`repository${i}`] === repo) {
            activeKey = i
            break
          }
        }

      } else if (context === 'user') {
        const user = contextParams[1]
        for (const i of SHORTCUTS) {
          if (options[`user${i}`] === user && !options[`userIsOrg${i}`]) {
            activeKey = i
            break
          }
        }

      } else if (context === 'organization') {
        const org = contextParams[1]
        for (const i of SHORTCUTS) {
          if (options[`user${i}`] === org && options[`userIsOrg${i}`]) {
            activeKey = i
            break
          }
        }

      } else if (context === 'org-project') {
        const org = contextParams[1]
        const name = contextParams[2]
        const number = contextParams[3]
        for (const i of SHORTCUTS) {
          if (options[`projectNumber${i}`] === number &&
              options[`projectName${i}`] === name &&
              options[`projectOrg${i}`] === org) {
            activeKey = i
            break
          }
        }

      } else if (context === 'repo-project') {
        const repo = contextParams[1]
        const name = contextParams[2]
        const number = contextParams[3]
        for (const i of SHORTCUTS) {
          if (options[`projectNumber${i}`] === number &&
              options[`projectName${i}`] === name &&
              options[`projectRepo${i}`] === repo) {
            activeKey = i
            break
          }
        }

      } else if (context === 'milestone') {
        const repo = contextParams[1]
        const name = contextParams[2]
        const number = contextParams[3]
        for (const i of SHORTCUTS) {
          if (options[`milestoneNumber${i}`] === number &&
              options[`milestoneName${i}`] === name &&
              options[`milestoneRepo${i}`] === repo) {
            activeKey = i
            break
          }
        }
      }

      if (typeof activeKey === 'string') {
        this.highlightContext(activeKey)
      }
    })
  }

  addShortcut(i, shortcutContext, populate) {
    const clone = this.shortcutTemplate.content.cloneNode(true)

    const keyEl = clone.querySelector('.shortcut-key')
    keyEl.classList.add(`shortcut-${i}`)
    keyEl.textContent = i
    keyEl.addEventListener('click', e => this.onShortcutClick(e))

    const bodyEl = clone.querySelector('.shortcut-body')
    bodyEl.classList.add(`shortcut-${i}`)
    bodyEl.addEventListener('click', e => this.onShortcutClick(e))

    const logoEl = clone.querySelector('.user-logo')

    const headerEl = clone.querySelector('.shortcut-header')
    headerEl.id = `shortcut-text${i}`

    if (shortcutContext === 'user') {
      clone.querySelector('.user-icon').style.display = 'block'
    } else if (shortcutContext === 'organization') {
      clone.querySelector('.org-icon').style.display = 'block'
    } else if (shortcutContext === 'repository') {
      clone.querySelector('.repo-icon').style.display = 'block'
    } else if (shortcutContext === 'milestone') {
      clone.querySelector('.milestone-icon').style.display = 'block'
    } else if (shortcutContext === 'project') {
      clone.querySelector('.project-icon').style.display = 'block'
    }

    populate(headerEl, logoEl)
    this.shortcutsList.appendChild(clone)
    this[`shortcuts${i}`] = this.shortcutsList.lastElementChild
  }

  setup() {
    document.addEventListener('keydown', event => {
      this.executeShortcut(event.key.toLowerCase())
    })

    for (let i = 0; i < this.shortcuts.length; i++) {
      this.shortcuts[i].addEventListener('click', e => this.onShortcutClick(e))
    }

    HubnavStorage.load().then(options => {
      if (!options.repository && !options.user && !options.projectName &&
          !options.milestoneName) {
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
          this.loadActiveRepoProject(options.projectRepo, options.projectName,
                                     options.projectNumber)

        } else if (options.active === 'milestone' && options.milestoneNumber &&
                   options.milestoneNumber.length > 0 &&
                   options.milestoneRepo && options.milestoneRepo.length > 0 &&
                   options.milestoneName && options.milestoneName.length > 0) {
          this.loadActiveMilestone(options.milestoneRepo, options.milestoneName,
                                   options.milestoneNumber)

        } else if (options.active === 'project' && options.projectNumber &&
                   options.projectNumber.length > 0 &&
                   options.projectOrg && options.projectOrg.length > 0 &&
                   options.projectName && options.projectName.length > 0) {
          this.loadActiveOrgProject(options.projectOrg, options.projectName,
                                    options.projectNumber)
        }

      // No active context:
      } else if (options.repository && options.repository.length > 0) {
        this.loadActiveRepository(options.repository)

      } else if (options.user && options.user.length > 0) {
        if (options.userIsOrg) {
          this.loadActiveOrganization(options.user)
        } else {
          this.loadActiveUser(options.user)
        }

      } else if (options.milestoneNumber && options.milestoneNumber.length > 0 &&
                 options.milestoneRepo && options.milestoneRepo.length > 0 &&
                 options.milestoneName && options.milestoneName.length > 0) {
        this.loadActiveMilestone(options.milestoneRepo, options.milestoneName,
                                 options.milestoneNumber)

      } else if (options.projectNumber && options.projectNumber.length > 0 &&
                 options.projectRepo && options.projectRepo.length > 0 &&
                 options.projectName && options.projectName.length > 0) {
        this.loadActiveRepoProject(options.projectRepo, options.projectName,
                                   options.projectNumber)

      } else if (options.projectNumber && options.projectNumber.length > 0 &&
                 options.projectOrg && options.projectOrg.length > 0 &&
                 options.projectName && options.projectName.length > 0) {
        this.loadActiveRepoProject(options.projectOrg, options.projectName,
                                   options.projectNumber)
      }

      if (typeof options.closedIssues === 'boolean' && !options.closedIssues) {
        for (let i = 0; i < this.closedIssueModifiers.length; i++) {
          this.closedIssueModifiers[i].style.display = 'none'
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
      for (let i of SHORTCUTS) {
        const repo = options[`repository${i}`]
        if (repo && repo.length > 0) {
          contextCount++
          this.addShortcut(i, 'repository', (headerEl, logoEl) => {
            headerEl.textContent = repo
            this.loadRepoLogo(repo, logoEl)
          })
        }

        const milestoneName = options[`milestoneName${i}`]
        if (milestoneName && milestoneName.length > 0) {
          contextCount++
          const repo = options[`milestoneRepo${i}`]
          this.addShortcut(i, 'milestone', (headerEl, logoEl) => {
            headerEl.textContent = milestoneName
            this.loadRepoLogo(repo, logoEl)
          })
        }

        const projectName = options[`projectName${i}`]
        if (projectName && projectName.length > 0) {
          contextCount++
          const repo = options[`projectRepo${i}`]
          const org = options[`projectOrg${i}`]
          this.addShortcut(i, 'project', (headerEl, logoEl) => {
            headerEl.textContent = projectName
            if (repo && repo.length > 0) {
              this.loadRepoLogo(repo, logoEl)
            } else if (org && org.length > 0) {
              this.loadUserLogo(org, logoEl)
            }
          })
        }

        const user = options[`user${i}`]
        if (user && user.length > 0) {
          contextCount++
          const userIsOrg = options[`userIsOrg${i}`]
          this.addShortcut(i, userIsOrg ? 'organization' : 'user', (headerEl, logoEl) => {
            headerEl.textContent = user
            this.loadUserLogo(user, logoEl)
          })
        }
      }

      if (contextCount > 1) {
        this.contextSwitch.style.display = 'block'
      }
    })
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
