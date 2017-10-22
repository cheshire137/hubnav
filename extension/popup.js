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
    this.team = document.getElementById('team')
    this.milestone = document.getElementById('milestone')
    this.repoLogo = document.getElementById('repo-logo')
    this.userLogo = document.getElementById('user-logo')
    this.orgLogo = document.getElementById('org-logo')
    this.teamOrgLogo = document.getElementById('team-org-logo')
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
    this.teamCommands = document.getElementById('team-commands')

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
      if (isPresent(options.repository)) {
        this.highlightShortcuts(this.fShortcuts)
        const defaultBranch = options.defaultBranch || 'master'
        this.openTab(new GitHubUrl(options.githubUrl).fileFinder(options.repository, defaultBranch))
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
    this.openTab(new GitHubUrl().search())
  }

  openTeams() {
    HubnavStorage.load().then(options => {
      if (isPresent(options.user) && options.userIsOrg) {
        this.highlightShortcuts(this.tShortcuts)
        this.openTab(new GitHubUrl().teams(options.user))
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
      if (options.active === 'user' && isPresent(options.user)) {
        this.openUserIssues(options)

      } else if (options.active === 'repository' && isPresent(options.repository)) {
        this.openRepoIssues(options)

      } else if (options.active === 'project' && isPresent(options.projectNumber) &&
                 isPresent(options.projectRepo)) {
        this.openRepoProjectIssues(options)

      } else if (options.active === 'project' && isPresent(options.projectNumber) &&
                 isPresent(options.projectOrg)) {
        this.openOrgProjectIssues(options)

      } else {
        this.openRepoSelect()
      }
    })
  }

  openUserIssues(options) {
    this.highlightShortcuts(this.iShortcuts)
    const urlOpts = { closed: this.shiftPressed }
    if (options.userIsOrg) {
      urlOpts.organization = options.user
    } else {
      urlOpts.user = options.user
      if (isPresent(options.scope)) {
        if (options.scope.indexOf('/') > -1) {
          urlOpts.repository = options.scope
        } else {
          urlOpts.organization = options.scope
        }
      }
    }
    this.openTab(new GitHubUrl().issues(urlOpts))
  }

  openRepoIssues(options) {
    this.highlightShortcuts(this.iShortcuts)
    const urlOpts = { closed: this.shiftPressed, new: this.ctrlPressed }
    const urlHelper = new GitHubUrl(options.githubUrl)
    this.openTab(urlHelper.repositoryIssues(options.repository, urlOpts))
  }

  openRepoProjectPullRequests(options) {
    this.highlightShortcuts(this.pShortcuts)
    const repo = options.projectRepo
    const number = options.projectNumber
    const urlOpts = { merged: this.shiftPressed, closed: this.ctrlPressed }
    this.openTab(new GitHubUrl().repositoryProjectPullRequests(repo, number, urlOpts))
  }

  openRepoProjectHome(options) {
    this.highlightShortcuts(this.vShortcuts)
    this.openTab(new GitHubUrl().repositoryProject(options.projectRepo, options.projectNumber))
  }

  openRepoProjectIssues(options) {
    this.highlightShortcuts(this.iShortcuts)
    const urlOpts = { closed: this.shiftPressed }
    const repo = options.projectRepo
    const number = options.projectNumber
    this.openTab(new GitHubUrl().repositoryProjectIssues(repo, number, urlOpts))
  }

  openOrgProjectPullRequests(options) {
    this.highlightShortcuts(this.pShortcuts)
    const urlOpts = { merged: this.shiftPressed, closed: this.ctrlPressed }
    const org = options.projectOrg
    const number = options.projectNumber
    this.openTab(new GitHubUrl().organizationProjectPullRequests(org, number, urlOpts))
  }

  openOrgProjectIssues(options) {
    this.highlightShortcuts(this.iShortcuts)
    const org = options.projectOrg
    const number = options.projectNumber
    const urlOpts = { closed: this.shiftPressed }
    this.openTab(new GitHubUrl().organizationProjectIssues(org, number, urlOpts))
  }

  openHomeForContext() {
    HubnavStorage.load().then(options => {
      if (options.active === 'repository' && isPresent(options.repository)) {
        this.highlightShortcuts(this.vShortcuts)
        this.openTab(new GitHubUrl(options.githubUrl).repository(options.repository))

      } else if (options.active === 'user' && isPresent(options.user)) {
        this.highlightShortcuts(this.vShortcuts)
        this.openTab(new GitHubUrl().profile(options.user))

      } else if (options.active === 'project' && isPresent(options.projectNumber) &&
                 isPresent(options.projectRepo)) {
        this.openRepoProjectHome(options)

      } else if (options.active === 'milestone' && isPresent(options.milestoneNumber) &&
                 isPresent(options.milestoneRepo)) {
        this.highlightShortcuts(this.vShortcuts)
        this.openTab(this.milestoneUrl(options.milestoneRepo, options.milestoneNumber))

      } else if (options.active === 'team' && isPresent(options.teamName) &&
                 isPresent(options.teamOrg)) {
        this.highlightShortcuts(this.vShortcuts)
        this.openTab(new GitHubUrl().team(options.teamOrg, options.teamName))

      } else if (options.active === 'project' && isPresent(options.projectNumber) &&
                 isPresent(options.projectOrg)) {
        this.highlightShortcuts(this.vShortcuts)
        const urlHelper = new GitHubUrl()
        this.openTab(urlHelper.organizationProject(options.projectOrg, options.projectNumber))

      } else {
        this.openOptions()
      }
    })
  }

  openPullRequests() {
    HubnavStorage.load().then(options => {
      if (options.active === 'user' && isPresent(options.user)) {
        this.highlightShortcuts(this.pShortcuts)
        const user = encodeURIComponent(options.user)
        let params = '?utf8=✓&q=is%3Apr'
        if (options.userIsOrg) { // organization
          params += `+org%3A${user}`
        } else { // user
          params += `+author%3A${user}`
          if (isPresent(options.scope)) {
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

      } else if (options.active === 'repository' && isPresent(options.repository)) {
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

      } else if (options.active === 'project' && isPresent(options.projectNumber) &&
                 isPresent(options.projectRepo)) {
        this.openRepoProjectPullRequests(options)

      } else if (options.active === 'project' && isPresent(options.projectNumber) &&
                 isPresent(options.projectOrg)) {
        this.openOrgProjectPullRequests(options)

      } else {
        this.openRepoSelect()
      }
    })
  }

  milestoneUrl(repo, rawNumber) {
    const number = encodeURIComponent(rawNumber)
    const path = `/milestone/${number}`
    return this.repoUrl(repo, path)
  }

  openOrgMembers() {
    HubnavStorage.load().then(options => {
      if (isPresent(options.user) && options.userIsOrg) {
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
      if (options.active === 'user' && isPresent(options.user)) {
        this.highlightShortcuts(this.rShortcuts)

        if (options.userIsOrg) {
          this.openOrgRepositories(options)
        } else {
          this.openUserRepositories(options)
        }

      } else if (isPresent(options.teamName) && isPresent(options.teamOrg)) {
        this.highlightShortcuts(this.rShortcuts)
        this.openTeamRepositories(options)
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

  openTeamRepositories(options) {
    const org = encodeURIComponent(options.teamOrg)
    const name = encodeURIComponent(options.teamName)
    const path = `https://github.com/orgs/${org}/teams/${name}/repositories`
    this.openTab(path)
  }

  openOptions(hash) {
    let path = `chrome-extension://${chrome.runtime.id}/options.html`
    if (isPresent(hash)) {
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
      for (const key in currentOptions) {
        newOptions[key] = currentOptions[key]
      }

      const newUser = currentOptions[`user${i}`]
      if (isPresent(newUser)) {
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

  quickTeamSwitch(i) {
    HubnavStorage.load().then(currentOptions => {
      const newOptions = {}
      for (const key in currentOptions) {
        newOptions[key] = currentOptions[key]
      }
      const newTeamOrg = currentOptions[`teamOrg${i}`]
      const newTeamName = currentOptions[`teamName${i}`]
      if (isPresent(newTeamOrg)) {
        newOptions.teamOrg = newTeamOrg
      }
      if (isPresent(newTeamName)) {
        newOptions.teamName = newTeamName
      }
      newOptions.active = 'team'
      HubnavStorage.save(newOptions).then(() => {
        this.highlightShortcut(this[`shortcuts${i}`])
        this.runAfterDelay(() => {
          this.loadActiveTeam(newOptions.teamOrg, newOptions.teamName)
        })
      })
    })
  }

  quickMilestoneSwitch(i) {
    HubnavStorage.load().then(currentOptions => {
      const newOptions = {}
      for (const key in currentOptions) {
        newOptions[key] = currentOptions[key]
      }
      const newMilestoneRepo = currentOptions[`milestoneRepo${i}`]
      const newMilestoneName = currentOptions[`milestoneName${i}`]
      const newMilestoneNumber = currentOptions[`milestoneNumber${i}`]
      if (isPresent(newMilestoneRepo)) {
        newOptions.milestoneRepo = newMilestoneRepo
      }
      if (isPresent(newMilestoneNumber)) {
        newOptions.milestoneNumber = newMilestoneNumber
      }
      if (isPresent(newMilestoneName)) {
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
      for (const key in currentOptions) {
        newOptions[key] = currentOptions[key]
      }
      const newProjectRepo = currentOptions[`projectRepo${i}`]
      const newProjectOrg = currentOptions[`projectOrg${i}`]
      const newProjectName = currentOptions[`projectName${i}`]
      const newProjectNumber = currentOptions[`projectNumber${i}`]
      if (isPresent(newProjectRepo)) {
        newOptions.projectRepo = newProjectRepo
        delete newOptions.projectOrg
      }
      if (isPresent(newProjectOrg)) {
        newOptions.projectOrg = newProjectOrg
        delete newOptions.projectRepo
      }
      if (isPresent(newProjectNumber)) {
        newOptions.projectNumber = newProjectNumber
      }
      if (isPresent(newProjectName)) {
        newOptions.projectName = newProjectName
      }
      newOptions.active = 'project'
      HubnavStorage.save(newOptions).then(() => {
        this.highlightShortcut(this[`shortcuts${i}`])
        this.runAfterDelay(() => {
          if (isPresent(newOptions.projectRepo)) {
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

      } else if (options[`teamName${i}`]) {
        this.highlightContext(i)
        this.quickTeamSwitch(i)
      }
    })
  }

  quickRepositorySwitch(i) {
    HubnavStorage.load().then(currentOptions => {
      const newOptions = {}
      for (const key in currentOptions) {
        newOptions[key] = currentOptions[key]
      }
      const newRepo = currentOptions[`repository${i}`]
      const newDefaultBranch = currentOptions[`defaultBranch${i}`]
      const newGithubUrl = currentOptions[`githubUrl${i}`]
      if (isPresent(newRepo)) {
        newOptions.repository = newRepo
      }
      if (isPresent(newDefaultBranch)) {
        newOptions.defaultBranch = newDefaultBranch
      }
      if (isPresent(newGithubUrl)) {
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
    const isMilestoneContext = context === 'milestone'
    const isRepoContext = context === 'repository'
    const isTeamContext = context === 'team'

    // File finder
    if (key === 'f' && !isRepoContext) {
      return false
    }

    // Teams, Members
    if ((key === 't' || key === 'm') && !isUserContext) {
      return false
    }

    // Repositories
    if (key === 'r' && !(isUserContext || isTeamContext)) {
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
    this.teamCommands.style.display = activeContext === 'team' ? 'block' : 'none'
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

  loadActiveTeam(org, name) {
    this.toggleCommandsShown('team')
    this.loadUserLogo(org, this.teamOrgLogo)
    this.team.textContent = name
    this.highlightActiveContext('team', org, name)
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

  highlightActiveContext(context, ...contextParams) {
    HubnavStorage.load().then(options => {
      let activeKey = null

      if (context === 'repository') {
        const repo = contextParams[0]
        for (const i of SHORTCUTS) {
          if (options[`repository${i}`] === repo) {
            activeKey = i
            break
          }
        }

      } else if (context === 'team') {
        const org = contextParams[0]
        const name = contextParams[1]
        for (const i of SHORTCUTS) {
          if (options[`teamName${i}`] === name && options[`teamOrg${i}`] === org) {
            activeKey = i
            break
          }
        }

      } else if (context === 'user') {
        const user = contextParams[0]
        for (const i of SHORTCUTS) {
          if (options[`user${i}`] === user && !options[`userIsOrg${i}`]) {
            activeKey = i
            break
          }
        }

      } else if (context === 'organization') {
        const org = contextParams[0]
        for (const i of SHORTCUTS) {
          if (options[`user${i}`] === org && options[`userIsOrg${i}`]) {
            activeKey = i
            break
          }
        }

      } else if (context === 'org-project') {
        const org = contextParams[0]
        const name = contextParams[1]
        const number = contextParams[2]
        for (const i of SHORTCUTS) {
          if (options[`projectNumber${i}`] === number &&
              options[`projectName${i}`] === name &&
              options[`projectOrg${i}`] === org) {
            activeKey = i
            break
          }
        }

      } else if (context === 'repo-project') {
        const repo = contextParams[0]
        const name = contextParams[1]
        const number = contextParams[2]
        for (const i of SHORTCUTS) {
          if (options[`projectNumber${i}`] === number &&
              options[`projectName${i}`] === name &&
              options[`projectRepo${i}`] === repo) {
            activeKey = i
            break
          }
        }

      } else if (context === 'milestone') {
        const repo = contextParams[0]
        const name = contextParams[1]
        const number = contextParams[2]
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
    } else if (shortcutContext === 'team') {
      clone.querySelector('.team-icon').style.display = 'block'
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
          !options.milestoneName && !options.teamName) {
        this.welcome.style.display = 'block'
      }

      if (options.active && typeof options.active === 'string') {
        if (options.active === 'user' && isPresent(options.user)) {
          if (options.userIsOrg) {
            this.loadActiveOrganization(options.user)
          } else {
            this.loadActiveUser(options.user)
          }

        } else if (options.active === 'repository' && isPresent(options.repository)) {
          this.loadActiveRepository(options.repository)

        } else if (options.active === 'project' && isPresent(options.projectNumber) &&
                   isPresent(options.projectRepo) && isPresent(options.projectName)) {
          this.loadActiveRepoProject(options.projectRepo, options.projectName,
                                     options.projectNumber)

        } else if (options.active === 'milestone' && isPresent(options.milestoneNumber) &&
                   isPresent(options.milestoneRepo) && isPresent(options.milestoneName)) {
          this.loadActiveMilestone(options.milestoneRepo, options.milestoneName,
                                   options.milestoneNumber)

        } else if (options.active === 'team' && isPresent(options.teamOrg) &&
                   isPresent(options.teamName)) {
          this.loadActiveTeam(options.teamOrg, options.teamName)

        } else if (options.active === 'project' && isPresent(options.projectNumber) &&
                   isPresent(options.projectOrg) && isPresent(options.projectName)) {
          this.loadActiveOrgProject(options.projectOrg, options.projectName,
                                    options.projectNumber)
        }

      // No active context:
      } else if (isPresent(options.repository)) {
        this.loadActiveRepository(options.repository)

      } else if (isPresent(options.user)) {
        if (options.userIsOrg) {
          this.loadActiveOrganization(options.user)
        } else {
          this.loadActiveUser(options.user)
        }

      } else if (isPresent(options.milestoneNumber) && isPresent(options.milestoneRepo) &&
                 isPresent(options.milestoneName)) {
        this.loadActiveMilestone(options.milestoneRepo, options.milestoneName,
                                 options.milestoneNumber)

      } else if (isPresent(options.teamOrg) && isPresent(options.teamName)) {
        this.loadActiveTeam(options.teamOrg, options.teamName)

      } else if (isPresent(options.projectNumber) && isPresent(options.projectRepo) &&
                 isPresent(options.projectName)) {
        this.loadActiveRepoProject(options.projectRepo, options.projectName,
                                   options.projectNumber)

      } else if (isPresent(options.projectNumber) && isPresent(options.projectOrg) &&
                 isPresent(options.projectName)) {
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
      for (const i of SHORTCUTS) {
        const repo = options[`repository${i}`]
        if (isPresent(repo)) {
          contextCount++
          this.addShortcut(i, 'repository', (headerEl, logoEl) => {
            headerEl.textContent = repo
            this.loadRepoLogo(repo, logoEl)
          })
        }

        const milestoneName = options[`milestoneName${i}`]
        if (isPresent(milestoneName)) {
          contextCount++
          const milestoneRepo = options[`milestoneRepo${i}`]
          this.addShortcut(i, 'milestone', (headerEl, logoEl) => {
            headerEl.textContent = milestoneName
            this.loadRepoLogo(milestoneRepo, logoEl)
          })
        }

        const teamName = options[`teamName${i}`]
        if (isPresent(teamName)) {
          contextCount++
          const teamOrg = options[`teamOrg${i}`]
          this.addShortcut(i, 'team', (headerEl, logoEl) => {
            headerEl.textContent = teamName
            this.loadUserLogo(teamOrg, logoEl)
          })
        }

        const projectName = options[`projectName${i}`]
        if (isPresent(projectName)) {
          contextCount++
          const projectRepo = options[`projectRepo${i}`]
          const org = options[`projectOrg${i}`]
          this.addShortcut(i, 'project', (headerEl, logoEl) => {
            headerEl.textContent = projectName
            if (isPresent(projectRepo)) {
              this.loadRepoLogo(projectRepo, logoEl)
            } else if (isPresent(org)) {
              this.loadUserLogo(org, logoEl)
            }
          })
        }

        const user = options[`user${i}`]
        if (isPresent(user)) {
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
    if (isPresent(user)) {
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
