class OptionsPage {
  constructor() {
    this.findElements()
    this.errors = {}
  }

  anyErrors() {
    return Object.keys(this.errors).length > 0
  }

  isValidRepo(repo) {
    if (repo.length < 1) {
      return true
    }
    const slashIndex = repo.indexOf('/')
    return slashIndex > 0 && slashIndex < repo.length - 1
  }

  isValidUrl(url) {
    const regexStr = '^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$'
    return new RegExp(regexStr, 'i').test(url)
  }

  openChromeExtensions(event) {
    event.preventDefault()
    event.target.blur()
    chrome.tabs.create({ url: 'chrome://extensions' })
  }

  checkFormValidity() {
    const repoInputs = document.querySelectorAll('.repository-input')
    for (const repoInput of repoInputs) {
      const i = repoInput.getAttribute('data-key')
      const repo = repoInput.value.trim()
      if (this.isValidRepo(repo)) {
        delete this.errors[`repository${i}`]
      } else {
        this.errors[`repository${i}`] = true
        this.flashErrorMessage(`Invalid repository: shortcut ${i}`)
      }
    }

    const githubUrlInputs = document.querySelectorAll('.github-url-input')
    for (const urlInput of githubUrlInputs) {
      const i = urlInput.getAttribute('data-key')
      const url = urlInput.value.trim()
      if (this.isValidUrl(url)) {
        delete this.errors[`githubUrl${i}`]
      } else {
        this.errors[`githubUrl${i}`] = true
        this.flashErrorMessage(`Invalid GitHub URL: shortcut ${i}`)
      }
    }

    const projectNameInputs = document.querySelectorAll('.project-name-input')
    for (const nameInput of projectNameInputs) {
      const i = nameInput.getAttribute('data-key')
      const name = nameInput.value.trim()
      const container = nameInput.closest('.project-container')
      const repoInput = container.querySelector('.project-repo-input')
      const repo = repoInput ? repoInput.value.trim() : null
      const orgInput = container.querySelector('.project-org-input')
      const org = orgInput ? orgInput.value.trim() : null
      const number = container.querySelector('.project-number-input').value

      if (repoInput) {
        if (repo.length < 1 || !this.isValidRepo(repo)) {
          this.errors[`projectRepository${i}`] = true
          this.flashErrorMessage(`Invalid project repository: shortcut ${i}`)
        } else {
          delete this.errors[`projectRepository${i}`]
        }
      } else if (orgInput) {
        if (org.length < 1) {
          this.errors[`projectOrg${i}`] = true
          this.flashErrorMessage(`Invalid project organization: shortcut ${i}`)
        } else {
          delete this.errors[`projectOrg${i}`]
        }
      }

      if ((isPresent(org) || isPresent(repo) || isPresent(name)) &&
          number.length < 1) {
        this.errors[`projectNumber${i}`] = true
        this.flashErrorMessage(`Must set project number: shortcut ${i}`)
      } else {
        delete this.errors[`projectNumber${i}`]
      }

      if ((isPresent(org) || isPresent(repo) || number.length > 0) && name.length < 1) {
        this.errors[`projectName${i}`] = true
        this.flashErrorMessage(`Must set project name: shortcut ${i}`)
      } else {
        delete this.errors[`projectName${i}`]
      }
    }

    if (this.anyErrors()) {
      this.optionsForm.classList.add('error')
    } else {
      this.optionsForm.classList.remove('error')
      this.saveOptions()
    }
  }

  findElements() {
    this.repoTemplate = document.getElementById('repository-template')
    this.repoProjectTemplate = document.getElementById('repo-project-template')
    this.orgProjectTemplate = document.getElementById('org-project-template')
    this.userProjectTemplate = document.getElementById('user-project-template')
    this.userTemplate = document.getElementById('user-template')
    this.orgTemplate = document.getElementById('org-template')
    this.milestoneTemplate = document.getElementById('milestone-template')
    this.teamTemplate = document.getElementById('team-template')

    this.shortcutsContainer = document.getElementById('shortcuts-container')
    this.shortcutTipContainer = document.getElementById('shortcut-tip-container')
    this.noShortcutTipContainer = document.getElementById('no-shortcut-tip-container')
    this.shortcut = document.getElementById('shortcut')
    this.chromeExtensionsLinks = document.querySelectorAll('.chrome-extensions-link')
    this.optionsForm = document.getElementById('options-form')
    this.notification = document.getElementById('notification')
    this.versionEl = document.getElementById('extension-version')
    this.closedIssues = document.getElementById('closed-issues')
    this.newIssue = document.getElementById('new-issue')
    this.mergedPullRequests = document.getElementById('merged-pull-requests')
    this.closedPullRequests = document.getElementById('closed-pull-requests')
    this.newPullRequest = document.getElementById('new-pull-request')

    this.addShortcutMenu = document.getElementById('add-shortcut-menu')
    this.addShortcutMenuTrigger = document.getElementById('add-shortcut-menu-trigger')
    this.addShortcutMenuItems = document.querySelectorAll('.shortcut-dropdown-item')
  }

  flashNotification(message, isError, delay) {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer)
    }
    this.notification.classList.toggle('error', isError)
    this.notification.textContent = message
    this.notification.style.display = 'block'
    this.notificationTimer = setTimeout(() => {
      this.notification.style.display = 'none'
    }, delay)
  }

  flashSaveNotice() {
    this.flashNotification('Saved!', false, 2000)
  }

  flashErrorMessage(message) {
    this.flashNotification(message, true, 5000)
  }

  toggleOpenShortcutMenu(event) {
    event.target.blur()
    const isActive = this.addShortcutMenu.classList.contains('is-active')
    this.addShortcutMenu.classList.toggle('is-active', !isActive)
  }

  onShortcutMenuItemClick(event) {
    event.preventDefault()

    this.addShortcutMenu.classList.remove('is-active')

    const menuItem = event.currentTarget
    const shortcutType = menuItem.getAttribute('data-type')

    if (shortcutType === 'repository') {
      this.addRepositoryShortcut(event)

    } else if (shortcutType === 'organization') {
      this.addOrgShortcut(event)

    } else if (shortcutType === 'user') {
      this.addUserShortcut(event)

    } else if (shortcutType === 'repo-project') {
      this.addRepoProjectShortcut(event)

    } else if (shortcutType === 'org-project') {
      this.addOrgProjectShortcut(event)

    } else if (shortcutType === 'user-project') {
      this.addUserProjectShortcut(event)

    } else if (shortcutType === 'milestone') {
      this.addMilestoneShortcut(event)

    } else if (shortcutType === 'team') {
      this.addTeamShortcut(event)
    }
  }

  hookUpHandlers() {
    for (const menuItem of this.addShortcutMenuItems) {
      menuItem.addEventListener('click', e => this.onShortcutMenuItemClick(e))
    }
    this.addShortcutMenuTrigger.addEventListener('click', e => this.toggleOpenShortcutMenu(e))
    this.optionsForm.addEventListener('submit', e => this.onSubmit(e))
    this.closedIssues.addEventListener('change', () => this.checkFormValidity())
    this.newIssue.addEventListener('change', () => this.checkFormValidity())
    this.mergedPullRequests.addEventListener('change', () => this.checkFormValidity())
    this.closedPullRequests.addEventListener('change', () => this.checkFormValidity())
    this.newPullRequest.addEventListener('change', () => this.checkFormValidity())
    for (const link of this.chromeExtensionsLinks) {
      link.addEventListener('click', e => this.openChromeExtensions(e))
    }
    document.addEventListener('click', e => this.onDocumentClick(e))
  }

  loadRepoLogo(rawRepo, imgTag) {
    const user = rawRepo.split('/')[0]
    if (isPresent(user)) {
      this.loadLogoForUser(user, imgTag)
    }
  }

  loadLogoForUser(rawUser, img) {
    const user = encodeURIComponent(rawUser)
    img.src = `https://github.com/${user}.png?size=72`
    img.alt = user
  }

  showBadLogoForUser(img) {
    img.src = 'bad-user.png'
    img.alt = ''
  }

  showDefaultUserLogo(i) {
    this.showDefaultLogoForUser(this[`userLogo${i}`])
  }

  showDefaultLogoForUser(img) {
    img.src = 'unknown-user.png'
    img.alt = ''
  }

  onDefaultBranchKeyup(event, i) {
    if (this[`defaultBranchTimer${i}`]) {
      clearTimeout(this[`defaultBranchTimer${i}`])
    }
    this[`defaultBranchTimer${i}`] = setTimeout(() => {
      this.checkFormValidity()
    }, 750)
  }

  onGithubUrlKeyup(event, i) {
    if (this[`githubUrlTimer${i}`]) {
      clearTimeout(this[`githubUrlTimer${i}`])
    }
    this[`githubUrlTimer${i}`] = setTimeout(() => {
      this.checkFormValidity()
    }, 750)
  }

  onUserKeyup(type, event, i) {
    if (this[`${type}UserInput${i}Timer`]) {
      clearTimeout(this[`${type}UserInput${i}Timer`])
    }
    const userInput = event.target
    const imgTag = userInput.closest('.control').querySelector(`.${type}-user-logo`)
    this[`${type}UserInput${i}Timer`] = setTimeout(() => {
      const user = userInput.value.trim()
      if (user.length < 1) {
        this.showDefaultLogoForUser(imgTag)
      } else {
        this.loadLogoForUser(user, imgTag)
      }
      this.checkFormValidity()
    }, 750)
  }

  onOrgKeyup(type, event, i) {
    if (this[`${type}OrgInput${i}Timer`]) {
      clearTimeout(this[`${type}OrgInput${i}Timer`])
    }
    const orgInput = event.target
    const imgTag = orgInput.closest('.control').querySelector(`.${type}-org-logo`)
    this[`${type}OrgInput${i}Timer`] = setTimeout(() => {
      const org = orgInput.value.trim()
      if (org.length < 1) {
        this.showDefaultLogoForUser(imgTag)
      } else {
        this.loadLogoForUser(org, imgTag)
      }
      this.checkFormValidity()
    }, 750)
  }

  onTeamOrgKeyup(event, i) {
    this.onOrgKeyup('team', event, i)
  }

  onProjectOrgKeyup(event, i) {
    this.onOrgKeyup('project', event, i)
  }

  onProjectUserKeyup(event, i) {
    this.onUserKeyup('project', event, i)
  }

  onUserScopeKeyup(event, i) {
    if (this[`userScopeInput${i}Timer`]) {
      clearTimeout(this[`userScopeInput${i}Timer`])
    }
    const scopeInput = event.target
    const imgTag = scopeInput.closest('.control').querySelector('.scope-logo')
    this[`userScopeInput${i}Timer`] = setTimeout(() => {
      const scope = (scopeInput.value || '').trim()
      if (scope.length < 1) {
        this.showDefaultLogoForUser(imgTag)
      } else if (scope.indexOf('/') > -1) { // repository
        this.loadRepoLogo(scope, imgTag)
      } else { // organization
        this.loadLogoForUser(scope, imgTag)
      }
      this.checkFormValidity()
    }, 750)
  }

  validateRepoInput(repoInput, imgTag) {
    const repo = repoInput.value.trim()
    if (repo.length < 1) {
      this.showDefaultLogoForUser(imgTag)
    } else {
      this.loadRepoLogo(repo, imgTag)
    }
    this.checkFormValidity()
  }

  onRepoKeyup(event, i) {
    if (this[`repoInput${i}Timer`]) {
      clearTimeout(this[`repoInput${i}Timer`])
    }
    const repoInput = event.target
    const imgTag = repoInput.closest('.control').querySelector('.repository-logo')
    this[`repoInput${i}Timer`] = setTimeout(() => {
      this.validateRepoInput(repoInput, imgTag)
    }, 750)
  }

  onMilestoneRepoKeyup(event, i) {
    if (this[`milestoneRepoInput${i}Timer`]) {
      clearTimeout(this[`milestoneRepoInput${i}Timer`])
    }
    const repoInput = event.target
    const imgTag = repoInput.closest('.control').querySelector('.milestone-repo-logo')
    this[`milestoneRepoInput${i}Timer`] = setTimeout(() => {
      this.validateRepoInput(repoInput, imgTag)
    }, 750)
  }

  onProjectRepoKeyup(event, i) {
    if (this[`projectRepoInput${i}Timer`]) {
      clearTimeout(this[`projectRepoInput${i}Timer`])
    }
    const repoInput = event.target
    const imgTag = repoInput.closest('.control').querySelector('.project-repo-logo')
    this[`projectRepoInput${i}Timer`] = setTimeout(() => {
      this.validateRepoInput(repoInput, imgTag)
    }, 750)
  }

  onUserLogoLoad(event, i) {
    if (this.isBadLogo(event.target.src)) {
      return
    }
    delete this.errors[`userLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onUserScopeLogoLoad(event, i) {
    if (this.isBadLogo(event.target.src)) {
      return
    }
    delete this.errors[`userScopeLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onTeamOrgLogoLoad(event, i) {
    if (this.isBadLogo(event.target.src)) {
      return
    }
    delete this.errors[`teamOrgLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onTeamOrgLogoError(event, i) {
    const imgTag = event.target
    this.showBadLogoForUser(imgTag)
    this.errors[`teamOrgLogo${i}`] = true
    const orgInput = imgTag.closest('.control').querySelector('.team-org-input')
    const org = encodeURIComponent(orgInput.value.trim())
    this.flashErrorMessage(`Invalid team organization: can't find "${org}"`)
    this.checkFormValidity()
  }

  onProjectOrgLogoLoad(event, i) {
    if (this.isBadLogo(event.target.src)) {
      return
    }
    delete this.errors[`projectOrgLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onProjectUserLogoLoad(event, i) {
    if (this.isBadLogo(event.target.src)) {
      return
    }
    delete this.errors[`projectUserLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onRepoLogoLoad(event, i) {
    if (this.isBadLogo(event.target.src)) {
      return
    }
    delete this.errors[`repositoryLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onMilestoneRepoLogoLoad(event, i) {
    if (this.isBadLogo(event.target.src)) {
      return
    }
    delete this.errors[`milestoneRepoLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onMilestoneRepoLogoError(event, i) {
    const imgTag = event.target
    this.showBadLogoForUser(imgTag)
    this.errors[`milestoneRepoLogo${i}`] = true
    const repoInput = imgTag.closest('.control').querySelector('.milestone-repo-input')
    const repo = repoInput.value.trim()
    const user = encodeURIComponent(repo.split('/')[0] || '')
    this.flashErrorMessage(`Invalid milestone repository ${i}: can't find "${user}"`)
    this.checkFormValidity()
  }

  onProjectRepoLogoLoad(event, i) {
    if (this.isBadLogo(event.target.src)) {
      return
    }
    delete this.errors[`projectRepoLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onProjectRepoLogoError(event, i) {
    const imgTag = event.target
    this.showBadLogoForUser(imgTag)
    this.errors[`projectRepoLogo${i}`] = true
    const repoInput = imgTag.closest('.control').querySelector('.project-repo-input')
    const repo = repoInput.value.trim()
    const user = encodeURIComponent(repo.split('/')[0] || '')
    this.flashErrorMessage(`Invalid project repository ${i}: can't find "${user}"`)
    this.checkFormValidity()
  }

  onUserScopeLogoError(event, i) {
    const imgTag = event.target
    this.showBadLogoForUser(imgTag)
    this.errors[`userScopeLogo${i}`] = true
    const scopeInput = imgTag.closest('.control').querySelector('.scope-input')
    const scope = encodeURIComponent(scopeInput.value.trim())
    this.flashErrorMessage(`Invalid scope: can't find organization or repository "${scope}"`)
    this.checkFormValidity()
  }

  onUserLogoError(event, i) {
    const imgTag = event.target
    this.showBadLogoForUser(imgTag)
    this.errors[`userLogo${i}`] = true
    const userInput = imgTag.closest('.control').querySelector('.login-input')
    const user = encodeURIComponent(userInput.value.trim())
    this.flashErrorMessage(`Invalid user: can't find "${user}"`)
    this.checkFormValidity()
  }

  onProjectUserLogoError(event, i) {
    const imgTag = event.target
    this.showBadLogoForUser(imgTag)
    this.errors[`projectUserLogo${i}`] = true
    const userInput = imgTag.closest('.control').querySelector('.project-user-input')
    const user = encodeURIComponent(userInput.value.trim())
    this.flashErrorMessage(`Invalid user: can't find "${user}"`)
    this.checkFormValidity()
  }

  onProjectOrgLogoError(event, i) {
    const imgTag = event.target
    this.showBadLogoForUser(imgTag)
    this.errors[`projectOrgLogo${i}`] = true
    const orgInput = imgTag.closest('.control').querySelector('.project-org-input')
    const org = encodeURIComponent(orgInput.value.trim())
    this.flashErrorMessage(`Invalid organization: can't find "${org}"`)
    this.checkFormValidity()
  }

  onRepoLogoError(event, i) {
    const imgTag = event.target
    this.showBadLogoForUser(imgTag)
    this.errors[`repositoryLogo${i}`] = true
    const repoInput = imgTag.closest('.control').querySelector('.repository-input')
    const repo = repoInput.value.trim()
    const user = encodeURIComponent(repo.split('/')[0] || '')
    this.flashErrorMessage(`Invalid repository ${i}: can't find "${user}"`)
    this.checkFormValidity()
  }

  isBadLogo(url) {
    return url === `chrome-extension://${chrome.runtime.id}/bad-user.png`
  }

  onDocumentClick(event) {
    const clickedEl = event.target
    const shortcutMenu = clickedEl.closest('#add-shortcut-menu')
    if (shortcutMenu) {
      return
    }
    this.addShortcutMenu.classList.remove('is-active')
  }

  onSubmit(event) {
    event.preventDefault()
    this.saveOptions()
  }

  getFallbackActiveContext(options) {
    if (this.hasActiveRepositoryDetails(options)) {
      return 'repository'
    }

    if (this.hasActiveUserDetails(options)) {
      return options.userIsOrg ? 'organization' : 'user'
    }

    if (this.hasActiveProjectDetails(options)) {
      return 'project'
    }

    if (this.hasActiveMilestoneDetails(options)) {
      return 'milestone'
    }

    if (this.hasActiveTeamDetails(options)) {
      return 'team'
    }

    return null
  }

  saveOptions() {
    if (this.optionsForm.classList.contains('error')) {
      return
    }

    HubnavStorage.load().then(currentOptions => {
      const newOptions = {}

      const repoInputs = document.querySelectorAll('.repository-input')
      for (const repoInput of repoInputs) {
        const repo = repoInput.value.trim()
        if (isPresent(repo)) {
          const i = repoInput.getAttribute('data-key')
          newOptions[`repository${i}`] = repo
        }
      }

      newOptions.repository = currentOptions.repository
      const repoOptions = []
      for (const i of SHORTCUTS) {
        const repo = newOptions[`repository${i}`]
        if (isPresent(repo)) {
          if (!newOptions.repository || newOptions.repository.length < 1) {
            newOptions.repository = repo
          }
          repoOptions.push(repo)
        }
      }
      // Ensure active repository is one of the four options
      if (repoOptions.indexOf(newOptions.repository) < 0) {
        newOptions.repository = repoOptions[0]
      }

      const branchInputs = document.querySelectorAll('.default-branch-input')
      for (const branchInput of branchInputs) {
        const i = branchInput.getAttribute('data-key')
        const repo = newOptions[`repository${i}`]
        if (isPresent(repo)) {
          const branch = branchInput.value.trim()
          newOptions[`defaultBranch${i}`] = branch
          if (newOptions.repository === repo) {
            newOptions.defaultBranch = branch
          }
        }
      }

      const githubUrlInputs = document.querySelectorAll('.github-url-input')
      for (const urlInput of githubUrlInputs) {
        const i = urlInput.getAttribute('data-key')
        const repo = newOptions[`repository${i}`]
        if (isPresent(repo)) {
          const url = urlInput.value.trim()
          newOptions[`githubUrl${i}`] = url
          if (newOptions.repository === repo) {
            newOptions.githubUrl = url
          }
        }
      }

      const teamNameInputs = document.querySelectorAll('.team-name-input')
      for (const nameInput of teamNameInputs) {
        const name = nameInput.value.trim()
        if (isPresent(name)) {
          const i = nameInput.getAttribute('data-key')
          const container = nameInput.closest('.team-container')
          const orgInput = container.querySelector('.team-org-input')
          const org = orgInput.value.trim()
          newOptions[`teamName${i}`] = name
          newOptions[`teamOrg${i}`] = org
        }
      }

      newOptions.teamName = currentOptions.teamName
      newOptions.teamOrg = currentOptions.teamOrg
      const teamNameOptions = []
      for (const i of SHORTCUTS) {
        const name = newOptions[`teamName${i}`]
        if (isPresent(name)) {
          if (newOptions.teamName === name) {
            newOptions.teamOrg = newOptions[`teamOrg${i}`]
          }
          if (!newOptions.teamName || newOptions.teamName.length < 1) {
            newOptions.teamName = name
            newOptions.teamOrg = newOptions[`teamOrg${i}`]
          }
          teamNameOptions.push(name)
        }
      }
      if (teamNameOptions.indexOf(newOptions.teamName) < 0) {
        newOptions.teamName = null
        newOptions.teamOrg = null
      }

      const milestoneNameInputs = document.querySelectorAll('.milestone-name-input')
      for (const nameInput of milestoneNameInputs) {
        const name = nameInput.value.trim()
        if (isPresent(name)) {
          const i = nameInput.getAttribute('data-key')
          const container = nameInput.closest('.milestone-container')
          const repoInput = container.querySelector('.milestone-repo-input')
          const repo = repoInput.value.trim()
          const number = container.querySelector('.milestone-number-input').value
          newOptions[`milestoneName${i}`] = name
          newOptions[`milestoneNumber${i}`] = number
          newOptions[`milestoneRepo${i}`] = repo
        }
      }

      newOptions.milestoneName = currentOptions.milestoneName
      newOptions.milestoneNumber = currentOptions.milestoneNumber
      newOptions.milestoneRepo = currentOptions.milestoneRepo
      const milestoneNameOptions = []
      for (const i of SHORTCUTS) {
        const name = newOptions[`milestoneName${i}`]
        if (isPresent(name)) {
          if (newOptions.milestoneName === name) {
            newOptions.milestoneNumber = newOptions[`milestoneNumber${i}`]
            newOptions.milestoneRepo = newOptions[`milestoneRepo${i}`]
          }
          if (!newOptions.milestoneName || newOptions.milestoneName.length < 1) {
            newOptions.milestoneName = name
            newOptions.milestoneNumber = newOptions[`milestoneNumber${i}`]
            newOptions.milestoneRepo = newOptions[`milestoneRepo${i}`]
          }
          milestoneNameOptions.push(name)
        }
      }
      if (milestoneNameOptions.indexOf(newOptions.milestoneName) < 0) {
        newOptions.milestoneName = null
        newOptions.milestoneNumber = null
        newOptions.milestoneRepo = null
      }

      const projectNameInputs = document.querySelectorAll('.project-name-input')
      for (const nameInput of projectNameInputs) {
        const name = nameInput.value.trim()
        if (isPresent(name)) {
          const i = nameInput.getAttribute('data-key')
          const container = nameInput.closest('.project-container')
          const repoInput = container.querySelector('.project-repo-input')
          const repo = repoInput ? repoInput.value.trim() : null
          const orgInput = container.querySelector('.project-org-input')
          const org = orgInput ? orgInput.value.trim() : null
          const number = container.querySelector('.project-number-input').value
          newOptions[`projectName${i}`] = name
          newOptions[`projectNumber${i}`] = number
          newOptions[`projectRepo${i}`] = repo
          newOptions[`projectOrg${i}`] = org
        }
      }

      newOptions.projectName = currentOptions.projectName
      newOptions.projectNumber = currentOptions.projectNumber
      newOptions.projectRepo = currentOptions.projectRepo
      newOptions.projectOrg = currentOptions.projectOrg
      const projectNameOptions = []
      for (const i of SHORTCUTS) {
        const name = newOptions[`projectName${i}`]
        if (isPresent(name)) {
          if (newOptions.projectName === name) {
            newOptions.projectNumber = newOptions[`projectNumber${i}`]
            newOptions.projectRepo = newOptions[`projectRepo${i}`]
            newOptions.projectOrg = newOptions[`projectOrg${i}`]
          }
          if (!newOptions.projectName || newOptions.projectName.length < 1) {
            newOptions.projectName = name
            newOptions.projectNumber = newOptions[`projectNumber${i}`]
            newOptions.projectRepo = newOptions[`projectRepo${i}`]
            newOptions.projectOrg = newOptions[`projectOrg${i}`]
          }
          projectNameOptions.push(name)
        }
      }
      if (projectNameOptions.indexOf(newOptions.projectName) < 0) {
        newOptions.projectName = null
        newOptions.projectNumber = null
        newOptions.projectRepo = null
        newOptions.projectOrg = null
      }

      const userInputs = document.querySelectorAll('.login-input')
      for (const userInput of userInputs) {
        const user = userInput.value.trim()
        if (isPresent(user)) {
          const i = userInput.getAttribute('data-key')
          const container = userInput.closest('.user-container')
          const isOrg = container.classList.contains('org-container')
          newOptions[`user${i}`] = user
          newOptions[`userIsOrg${i}`] = isOrg

          if (isOrg) {
            delete newOptions[`userScope${i}`]
          } else {
            const scope = container.querySelector('.scope-input').value.trim()
            newOptions[`userScope${i}`] = scope
          }
        }
      }

      newOptions.user = currentOptions.user
      const userOptions = []
      for (const i of SHORTCUTS) {
        const user = newOptions[`user${i}`]
        if (isPresent(user)) {
          if (newOptions.user === user) {
            newOptions.userIsOrg = newOptions[`userIsOrg${i}`]
            newOptions.scope = newOptions[`userScope${i}`]
          }
          if (!newOptions.user || newOptions.user.length < 1) {
            newOptions.user = user
            newOptions.userIsOrg = newOptions[`userIsOrg${i}`]
            newOptions.scope = newOptions[`userScope${i}`]
          }
          userOptions.push(user)
        }
      }
      // Ensure active user is one of the options
      if (userOptions.indexOf(newOptions.user) < 0) {
        newOptions.user = userOptions[0]
        for (const i of SHORTCUTS) {
          if (newOptions[`user${i}`] === newOptions.user) {
            newOptions.userIsOrg = newOptions[`userIsOrg${i}`]
            newOptions.scope = newOptions[`userScope${i}`]
            break
          }
        }
      }

      newOptions.active = currentOptions.active
      if (newOptions.active) {
        // Ensure if we had a project as the current context and the user changed
        // its name or other details, we still keep a project as the active context.
        if (newOptions.active === 'project' && !this.hasActiveProjectDetails(newOptions)) {
          for (const i of SHORTCUTS) {
            const name = newOptions[`projectName${i}`]
            if (isPresent(name)) {
              newOptions.projectName = name
              newOptions.projectNumber = newOptions[`projectNumber${i}`]
              newOptions.projectOrg = newOptions[`projectOrg${i}`]
              newOptions.projectRepo = newOptions[`projectRepo${i}`]
              break
            }
          }

          if (!this.hasActiveProjectDetails(newOptions)) {
            newOptions.active = this.getFallbackActiveContext(newOptions)
          }

        // Ensure if we had a milestone as the current context and the user changed
        // its name or other details, we still keep a milestone as the active context.
        } else if (newOptions.active === 'milestone' &&
                   !this.hasActiveMilestoneDetails(newOptions)) {
          for (const i of SHORTCUTS) {
            const name = newOptions[`milestoneName${i}`]
            if (isPresent(name)) {
              newOptions.milestoneName = name
              newOptions.milestoneNumber = newOptions[`milestoneNumber${i}`]
              newOptions.milestoneRepo = newOptions[`milestoneRepo${i}`]
              break
            }
          }

          if (!this.hasActiveMilestoneDetails(newOptions)) {
            newOptions.active = this.getFallbackActiveContext(newOptions)
          }

        // Ensure if we had a team as the current context and the user changed
        // its name or other details, we still keep a team as the active context.
        } else if (newOptions.active === 'team' && !this.hasActiveTeamDetails(newOptions)) {
          for (const i of SHORTCUTS) {
            const name = newOptions[`teamName${i}`]
            if (isPresent(name)) {
              newOptions.teamName = name
              newOptions.teamOrg = newOptions[`teamOrg${i}`]
              break
            }
          }

          if (!this.hasActiveTeamDetails(newOptions)) {
            newOptions.active = this.getFallbackActiveContext(newOptions)
          }
        }
      } else {
        newOptions.active = this.getFallbackActiveContext(newOptions)
      }

      newOptions.closedIssues = this.closedIssues.checked
      newOptions.newIssue = this.newIssue.checked
      newOptions.mergedPullRequests = this.mergedPullRequests.checked
      newOptions.closedPullRequests = this.closedPullRequests.checked
      newOptions.newPullRequest = this.newPullRequest.checked

      HubnavStorage.save(newOptions).then(() => this.flashSaveNotice())
    })
  }

  hasActiveUserDetails(options) {
    return isPresent(options.user)
  }

  hasActiveRepositoryDetails(options) {
    return isPresent(options.repository)
  }

  hasActiveTeamDetails(options) {
    return isPresent(options.teamName) && isPresent(options.teamOrg)
  }

  hasActiveProjectDetails(options) {
    return isPresent(options.projectName) &&
      typeof options.projectNumber === 'number' &&
      (isPresent(options.projectRepo) || isPresent(options.projectOrg))
  }

  hasActiveMilestoneDetails(options) {
    return isPresent(options.milestoneName) &&
      typeof options.milestoneNumber === 'number' &&
      isPresent(options.milestoneRepo)
  }

  loadTemplate(key, template, container, populate) {
    const clone = template.content.cloneNode(true)
    populate(clone)
    container.appendChild(clone)

    const newNode = container.lastElementChild
    newNode.id = this.getUniqueID()
    newNode.setAttribute('data-key', key)
    newNode.addEventListener('dragstart', e => this.onDragStart(e))
    newNode.addEventListener('dragover', e => this.onDragOver(e))
    newNode.addEventListener('dragleave', e => this.onDragLeave(e))
    newNode.addEventListener('drop', e => this.onDrop(e))
    newNode.addEventListener('dragend', e => this.onDragEnd(e))
  }

  onDragStart(event) {
    const container = event.target
    event.dataTransfer.setData('text/plain', container.id)
    event.dropEffect = 'move'
    container.classList.add('drag')
    this.shortcutsContainer.classList.add('drag')
  }

  onDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const target = event.target.closest('.shortcut-container')
    target.classList.add('drag-target')
  }

  onDragLeave(event) {
    const target = event.target.closest('.shortcut-container')
    target.classList.remove('drag-target')
  }

  onDrop(event) {
    event.preventDefault()
    const allShortcuts = Array.from(this.shortcutsContainer.children)

    const id = event.dataTransfer.getData('text')
    const movingEl = document.getElementById(id)
    const movingElIndex = allShortcuts.indexOf(movingEl)

    const target = event.target.closest('.shortcut-container')
    const targetIndex = allShortcuts.indexOf(target)

    if (movingElIndex < targetIndex) {
      if (targetIndex < allShortcuts.length - 1) {
        this.shortcutsContainer.insertBefore(movingEl, target.nextElementSibling)
      } else {
        this.shortcutsContainer.appendChild(movingEl)
      }
    } else {
      this.shortcutsContainer.insertBefore(movingEl, target)
    }

    movingEl.classList.remove('drag')
    this.shortcutsContainer.classList.remove('drag')
    const highlightedTarget = this.shortcutsContainer.querySelector('.drag-target')
    if (highlightedTarget) {
      highlightedTarget.classList.remove('drag-target')
    }

    this.updateKeysForEachShortcut()
    this.saveOptions()
  }

  onDragEnd() {
    this.shortcutsContainer.classList.remove('drag')
    const movingEl = this.shortcutsContainer.querySelector('.shortcut-container.drag')
    if (movingEl) {
      movingEl.classList.remove('drag')
    }
  }

  updateKeysForEachShortcut() {
    const containers = this.shortcutsContainer.querySelectorAll('.shortcut-container')
    for (let i = 0; i < containers.length; i++) {
      const key = SHORTCUTS[i]
      const container = containers[i]
      const oldKey = container.getAttribute('data-key')
      if (oldKey === key) {
        continue
      }

      container.setAttribute('data-key', key)
      container.querySelector('.i').textContent = key
      const fields = container.querySelectorAll('[data-key]')
      for (const field of fields) {
        field.setAttribute('data-key', key)
      }
    }
  }

  getNextShortcut() {
    const containers = this.shortcutsContainer.querySelectorAll('.shortcut-container')
    return SHORTCUTS[containers.length]
  }

  focusLastAddedInput() {
    const input = document.querySelector('.focus-target')
    input.focus()
    input.classList.remove('focus-target')
  }

  addOrgShortcut(event) {
    this.addUserOrOrgShortcut(event, true)
  }

  addMilestoneShortcut(event) {
    event.currentTarget.blur()
    const key = this.getNextShortcut()
    const repo = ''
    const number = ''
    const name = ''
    this.addMilestone(key, repo, number, name)
    this.hideShortcutMenuIfNecessary()
    this.focusLastAddedInput()
  }

  addTeamShortcut(event) {
    event.currentTarget.blur()
    const key = this.getNextShortcut()
    const org = ''
    const name = ''
    this.addTeam(key, org, name)
    this.hideShortcutMenuIfNecessary()
    this.focusLastAddedInput()
  }

  addUserShortcut(event) {
    this.addUserOrOrgShortcut(event, false)
  }

  addUserOrOrgShortcut(event, isOrg) {
    event.currentTarget.blur()
    const key = this.getNextShortcut()
    const login = ''
    const scope = ''
    this.addUser(key, login, isOrg, scope)
    this.hideShortcutMenuIfNecessary()
    this.focusLastAddedInput()
  }

  addOrgProjectShortcut(event) {
    event.currentTarget.blur()
    const key = this.getNextShortcut()
    this.addOrgProject(key, '', '', '')
    this.hideShortcutMenuIfNecessary()
    this.focusLastAddedInput()
  }

  addUserProjectShortcut(event) {
    event.currentTarget.blur()
    const key = this.getNextShortcut()
    this.addUserProject(key, '', '', '')
    this.hideShortcutMenuIfNecessary()
    this.focusLastAddedInput()
  }

  addRepoProjectShortcut(event) {
    event.currentTarget.blur()
    const key = this.getNextShortcut()
    this.addRepoProject(key, '', '', '')
    this.hideShortcutMenuIfNecessary()
    this.focusLastAddedInput()
  }

  addRepositoryShortcut(event) {
    event.target.blur()
    const key = this.getNextShortcut()
    this.addRepository(key, '', 'master', null)
    this.hideShortcutMenuIfNecessary()
    this.focusLastAddedInput()
  }

  addTeam(i, org, name) {
    const populate = teamEl => {
      teamEl.querySelector('.i').textContent = i

      const nameInputID = `team${i}-name`
      teamEl.querySelector('.team-name-label').htmlFor = nameInputID

      const nameInput = teamEl.querySelector('.team-name-input')
      nameInput.id = nameInputID
      nameInput.value = name
      nameInput.setAttribute('data-key', i)
      nameInput.addEventListener('change', () => this.checkFormValidity())
      nameInput.classList.add('focus-target')

      const orgLogo = teamEl.querySelector('.team-org-logo')
      orgLogo.addEventListener('load', e => this.onTeamOrgLogoLoad(e, i))
      orgLogo.addEventListener('error', e => this.onTeamOrgLogoError(e, i))

      const orgInputID = `team${i}-org`
      const orgLabel = teamEl.querySelector('.team-org-label')
      orgLabel.htmlFor = orgInputID

      const orgInput = teamEl.querySelector('.team-org-input')
      orgInput.id = orgInputID
      orgInput.setAttribute('data-key', i)
      orgInput.addEventListener('keyup', e => this.onTeamOrgKeyup(e, i))

      if (isPresent(org)) {
        orgInput.value = org
        this.loadLogoForUser(org, orgLogo)
      }

      const removeButton = teamEl.querySelector('.remove-team-button')
      removeButton.addEventListener('click', e => this.removeTeam(e, i))
    }
    this.loadTemplate(i, this.teamTemplate, this.shortcutsContainer, populate)
  }

  addMilestone(i, repo, number, name) {
    const populate = milestoneEl => {
      milestoneEl.querySelector('.i').textContent = i

      const nameInputID = `milestone${i}-name`
      milestoneEl.querySelector('.milestone-name-label').htmlFor = nameInputID

      const nameInput = milestoneEl.querySelector('.milestone-name-input')
      nameInput.id = nameInputID
      nameInput.value = name
      nameInput.setAttribute('data-key', i)
      nameInput.addEventListener('change', () => this.checkFormValidity())

      const numberInputID = `milestone${i}-number`
      milestoneEl.querySelector('.milestone-number-label').htmlFor = numberInputID

      const numberInput = milestoneEl.querySelector('.milestone-number-input')
      numberInput.id = numberInputID
      numberInput.value = number
      numberInput.setAttribute('data-key', i)
      numberInput.addEventListener('change', () => this.checkFormValidity())

      const repoLogo = milestoneEl.querySelector('.milestone-repo-logo')
      repoLogo.addEventListener('load', e => this.onMilestoneRepoLogoLoad(e, i))
      repoLogo.addEventListener('error', e => this.onMilestoneRepoLogoError(e, i))

      const repoInputID = `milestone${i}-repo`
      const repoLabel = milestoneEl.querySelector('.milestone-repo-label')
      repoLabel.htmlFor = repoInputID

      const repoInput = milestoneEl.querySelector('.milestone-repo-input')
      repoInput.id = repoInputID
      repoInput.value = repo
      repoInput.setAttribute('data-key', i)
      repoInput.addEventListener('keyup', e => this.onMilestoneRepoKeyup(e, i))
      repoInput.classList.add('focus-target')

      this.loadRepoLogo(repo, repoLogo)

      const removeButton = milestoneEl.querySelector('.remove-milestone-button')
      removeButton.addEventListener('click', e => this.removeMilestone(e, i))
    }
    this.loadTemplate(i, this.milestoneTemplate, this.shortcutsContainer, populate)
  }

  addUserProject(i, name, number, user) {
    const populate = projectEl => {
      projectEl.querySelector('.i').textContent = i

      const nameInputID = `project${i}-name`
      projectEl.querySelector('.project-name-label').htmlFor = nameInputID

      const nameInput = projectEl.querySelector('.project-name-input')
      nameInput.id = nameInputID
      nameInput.value = name
      nameInput.setAttribute('data-key', i)
      nameInput.addEventListener('change', () => this.checkFormValidity())

      const numberInputID = `project${i}-number`
      projectEl.querySelector('.project-number-label').htmlFor = numberInputID

      const numberInput = projectEl.querySelector('.project-number-input')
      numberInput.id = numberInputID
      numberInput.value = number
      numberInput.setAttribute('data-key', i)
      numberInput.addEventListener('change', () => this.checkFormValidity())

      const userLogo = projectEl.querySelector('.project-user-logo')
      if (userLogo) {
        userLogo.addEventListener('load', e => this.onProjectUserLogoLoad(e, i))
        userLogo.addEventListener('error', e => this.onProjectUserLogoError(e, i))
      }

      const userInputID = `project${i}-user`
      const userLabel = projectEl.querySelector('.project-user-label')
      if (userLabel) {
        userLabel.htmlFor = userInputID
      }

      if (isPresent(user) && userLogo) {
        this.loadLogoForUser(user, userLogo)
      }

      const userInput = projectEl.querySelector('.project-user-input')
      if (userInput) {
        userInput.id = userInputID
        userInput.value = user
        userInput.setAttribute('data-key', i)
        userInput.addEventListener('keyup', e => this.onProjectUserKeyup(e, i))
        userInput.classList.add('focus-target')
      }

      const removeButton = projectEl.querySelector('.remove-project-button')
      removeButton.addEventListener('click', e => this.removeProject(e, i))
    }
    this.loadTemplate(i, this.userProjectTemplate, this.shortcutsContainer, populate)
  }

  addOrgProject(i, name, number, org) {
    const populate = projectEl => {
      projectEl.querySelector('.i').textContent = i

      const nameInputID = `project${i}-name`
      projectEl.querySelector('.project-name-label').htmlFor = nameInputID

      const nameInput = projectEl.querySelector('.project-name-input')
      nameInput.id = nameInputID
      nameInput.value = name
      nameInput.setAttribute('data-key', i)
      nameInput.addEventListener('change', () => this.checkFormValidity())

      const numberInputID = `project${i}-number`
      projectEl.querySelector('.project-number-label').htmlFor = numberInputID

      const numberInput = projectEl.querySelector('.project-number-input')
      numberInput.id = numberInputID
      numberInput.value = number
      numberInput.setAttribute('data-key', i)
      numberInput.addEventListener('change', () => this.checkFormValidity())

      const orgLogo = projectEl.querySelector('.project-org-logo')
      if (orgLogo) {
        orgLogo.addEventListener('load', e => this.onProjectOrgLogoLoad(e, i))
        orgLogo.addEventListener('error', e => this.onProjectOrgLogoError(e, i))
      }

      const orgInputID = `project${i}-org`
      const orgLabel = projectEl.querySelector('.project-org-label')
      if (orgLabel) {
        orgLabel.htmlFor = orgInputID
      }

      if (isPresent(org) && orgLogo) {
        this.loadLogoForUser(org, orgLogo)
      }

      const orgInput = projectEl.querySelector('.project-org-input')
      if (orgInput) {
        orgInput.id = orgInputID
        orgInput.value = org
        orgInput.setAttribute('data-key', i)
        orgInput.addEventListener('keyup', e => this.onProjectOrgKeyup(e, i))
        orgInput.classList.add('focus-target')
      }

      const removeButton = projectEl.querySelector('.remove-project-button')
      removeButton.addEventListener('click', e => this.removeProject(e, i))
    }
    this.loadTemplate(i, this.orgProjectTemplate, this.shortcutsContainer, populate)
  }

  addRepoProject(i, name, number, repo) {
    const populate = projectEl => {
      projectEl.querySelector('.i').textContent = i

      const nameInputID = `project${i}-name`
      projectEl.querySelector('.project-name-label').htmlFor = nameInputID

      const nameInput = projectEl.querySelector('.project-name-input')
      nameInput.id = nameInputID
      nameInput.value = name
      nameInput.setAttribute('data-key', i)
      nameInput.addEventListener('change', () => this.checkFormValidity())

      const numberInputID = `project${i}-number`
      projectEl.querySelector('.project-number-label').htmlFor = numberInputID

      const numberInput = projectEl.querySelector('.project-number-input')
      numberInput.id = numberInputID
      numberInput.value = number
      numberInput.setAttribute('data-key', i)
      numberInput.addEventListener('change', () => this.checkFormValidity())

      const repoLogo = projectEl.querySelector('.project-repo-logo')
      if (repoLogo) {
        repoLogo.addEventListener('load', e => this.onProjectRepoLogoLoad(e, i))
        repoLogo.addEventListener('error', e => this.onProjectRepoLogoError(e, i))
      }

      const repoInputID = `project${i}-repo`
      const repoLabel = projectEl.querySelector('.project-repo-label')
      if (repoLabel) {
        repoLabel.htmlFor = repoInputID
      }

      const repoInput = projectEl.querySelector('.project-repo-input')
      if (repoInput) {
        repoInput.id = repoInputID
        repoInput.value = repo
        repoInput.setAttribute('data-key', i)
        repoInput.addEventListener('keyup', e => this.onProjectRepoKeyup(e, i))
        repoInput.classList.add('focus-target')
      }

      if (isPresent(repo) && repoLogo) {
        this.loadRepoLogo(repo, repoLogo)
      }

      const removeButton = projectEl.querySelector('.remove-project-button')
      removeButton.addEventListener('click', e => this.removeProject(e, i))
    }
    this.loadTemplate(i, this.repoProjectTemplate, this.shortcutsContainer, populate)
  }

  addUser(i, login, isOrg, scope) {
    const populate = userEl => {
      userEl.querySelector('.i').textContent = i

      const userLogo = userEl.querySelector('.user-logo')
      if (userLogo) {
        userLogo.addEventListener('load', e => this.onUserLogoLoad(e, i))
        userLogo.addEventListener('error', e => this.onUserLogoError(e, i))
        if (isPresent(login)) {
          this.loadLogoForUser(login, userLogo)
        }
      }

      const loginInputID = `userInput${i}`
      userEl.querySelector('.login-label').htmlFor = loginInputID

      if (!isOrg) {
        const scopeInputID = `scopeInput${i}`
        userEl.querySelector('.scope-label').htmlFor = scopeInputID

        const scopeInput = userEl.querySelector('.scope-input')
        scopeInput.id = scopeInputID
        scopeInput.value = scope || ''
        scopeInput.setAttribute('data-key', i)
        scopeInput.addEventListener('keyup', e => this.onUserScopeKeyup(e, i))

        const scopeLogo = userEl.querySelector('.scope-logo')
        scopeLogo.addEventListener('load', e => this.onUserScopeLogoLoad(e, i))
        scopeLogo.addEventListener('error', e => this.onUserScopeLogoError(e, i))
        if (isPresent(scope)) {
          if (scope.indexOf('/') > -1) { // repository
            this.loadRepoLogo(scope, scopeLogo)
          } else { // organization
            this.loadLogoForUser(scope, scopeLogo)
          }
        }
      }

      const loginInput = userEl.querySelector('.login-input')
      loginInput.id = loginInputID
      loginInput.value = login
      loginInput.setAttribute('data-key', i)
      loginInput.addEventListener('keyup', e => this.onUserKeyup(e, i))
      loginInput.classList.add('focus-target')

      const removeButton = userEl.querySelector('.remove-user-button')
      removeButton.addEventListener('click', e => this.removeUser(e, i))
    }

    const template = isOrg ? this.orgTemplate : this.userTemplate
    this.loadTemplate(i, template, this.shortcutsContainer, populate)
  }

  getUniqueID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      const v = (c === 'x') ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  addRepository(i, repo, defaultBranch, githubUrl) {
    const populate = repoEl => {
      repoEl.querySelector('.i').textContent = i

      const repoInputID = `repository${i}`
      repoEl.querySelector('.repository-label').htmlFor = repoInputID

      const repoInput = repoEl.querySelector('.repository-input')
      repoInput.id = repoInputID
      repoInput.value = repo
      repoInput.setAttribute('data-key', i)
      repoInput.addEventListener('keyup', e => this.onRepoKeyup(e, i))
      repoInput.classList.add('focus-target')

      const branchInputID = `default-branch${i}`
      repoEl.querySelector('.default-branch-label').htmlFor = branchInputID

      const branchInput = repoEl.querySelector('.default-branch-input')
      branchInput.id = branchInputID
      branchInput.value = defaultBranch || 'master'
      branchInput.setAttribute('data-key', i)
      branchInput.addEventListener('keyup', e => this.onDefaultBranchKeyup(e, i))

      const githubUrlInputID = `github-url-${i}`
      repoEl.querySelector('.github-url-label').htmlFor = githubUrlInputID

      const githubUrlInput = repoEl.querySelector('.github-url-input')
      githubUrlInput.id = githubUrlInputID
      githubUrlInput.value = githubUrl || 'https://github.com'
      githubUrlInput.setAttribute('data-key', i)
      githubUrlInput.addEventListener('keyup', e => this.onGithubUrlKeyup(e, i))

      const repoLogo = repoEl.querySelector('.repository-logo')
      repoLogo.addEventListener('load', e => this.onRepoLogoLoad(e, i))
      repoLogo.addEventListener('error', e => this.onRepoLogoError(e, i))
      this.loadRepoLogo(repo, repoLogo)

      const removeButton = repoEl.querySelector('.remove-repository-button')
      removeButton.addEventListener('click', e => this.removeRepository(e, i))
    }
    this.loadTemplate(i, this.repoTemplate, this.shortcutsContainer, populate)
  }

  hideShortcutMenuIfNecessary() {
    const numShortcutsLoaded = document.querySelectorAll('.shortcut-input').length
    if (numShortcutsLoaded < SHORTCUTS.length) {
      this.addShortcutMenu.style.display = 'block'
    } else {
      this.addShortcutMenu.style.display = 'none'
    }
  }

  removeProject(event, i) {
    this.removeShortcut(event, i, '.project-container')
    this.hideShortcutMenuIfNecessary()
  }

  removeMilestone(event, i) {
    this.removeShortcut(event, i, '.milestone-container')
    this.hideShortcutMenuIfNecessary()
  }

  removeTeam(event, i) {
    this.removeShortcut(event, i, '.team-container')
    this.hideShortcutMenuIfNecessary()
  }

  removeUser(event, i) {
    this.removeShortcut(event, i, '.user-container')
    this.hideShortcutMenuIfNecessary()
  }

  removeRepository(event, i) {
    this.removeShortcut(event, i, '.repository-container')
    this.hideShortcutMenuIfNecessary()
  }

  removeShortcut(event, i, containerClass) {
    const button = event.target
    button.blur()
    const container = button.closest(containerClass)
    container.remove()
    this.updateKeysForEachShortcut()
    this.saveOptions()
  }

  restoreOptions() {
    HubnavStorage.load().then(options => {
      for (const i of SHORTCUTS) {
        const repo = options[`repository${i}`]
        if (isPresent(repo)) {
          this.addRepository(i, repo, options[`defaultBranch${i}`], options[`githubUrl${i}`])
        }

        const projectName = options[`projectName${i}`]
        if (isPresent(projectName)) {
          const projectNumber = options[`projectNumber${i}`]
          const projectOrg = options[`projectOrg${i}`]
          const projectRepo = options[`projectRepo${i}`]
          if (isPresent(projectOrg)) {
            this.addOrgProject(i, projectName, projectNumber, projectOrg)
          } else {
            this.addRepoProject(i, projectName, projectNumber, projectRepo)
          }
        }

        const milestoneName = options[`milestoneName${i}`]
        if (isPresent(milestoneName)) {
          const milestoneNumber = options[`milestoneNumber${i}`]
          const milestoneRepo = options[`milestoneRepo${i}`]
          this.addMilestone(i, milestoneRepo, milestoneNumber, milestoneName)
        }

        const teamName = options[`teamName${i}`]
        if (isPresent(teamName)) {
          const teamOrg = options[`teamOrg${i}`]
          this.addTeam(i, teamOrg, teamName)
        }

        const user = options[`user${i}`]
        if (isPresent(user)) {
          let isOrg = false
          if (typeof options[`userIsOrg${i}`] === 'boolean') {
            isOrg = options[`userIsOrg${i}`]
          }
          const scope = options[`userScope${i}`]
          this.addUser(i, user, isOrg, scope)
        }
      }
      this.hideShortcutMenuIfNecessary()

      const focusTargets = document.querySelectorAll('.focus-target')
      for (const input of focusTargets) {
        input.classList.remove('focus-target')
      }

      if (typeof options.closedIssues === 'boolean') {
        this.closedIssues.checked = options.closedIssues
      } else {
        this.closedIssues.checked = true
      }
      if (typeof options.newIssue === 'boolean') {
        this.newIssue.checked = options.newIssue
      } else {
        this.newIssue.checked = true
      }
      if (typeof options.mergedPullRequests === 'boolean') {
        this.mergedPullRequests.checked = options.mergedPullRequests
      } else {
        this.mergedPullRequests.checked = true
      }
      if (typeof options.closedPullRequests === 'boolean') {
        this.closedPullRequests.checked = options.closedPullRequests
      } else {
        this.closedPullRequests.checked = true
      }
      if (typeof options.newPullRequest === 'boolean') {
        this.newPullRequest.checked = options.newPullRequest
      } else {
        this.newPullRequest.checked = true
      }
    })
  }

  setup() {
    this.hookUpHandlers()
    this.restoreOptions()
    this.showShortcutTip()
    this.displayCurrentVersion()
  }

  displayCurrentVersion() {
    const manifest = chrome.runtime.getManifest()
    this.versionEl.textContent = manifest.version
  }

  showShortcutTip() {
    chrome.commands.getAll(commands => {
      const popupCommand = commands.filter(c => c.name === '_execute_browser_action')[0]
      if (popupCommand && isPresent(popupCommand.shortcut)) {
        this.shortcut.textContent = popupCommand.shortcut
        this.shortcutTipContainer.style.display = 'block'
      } else {
        this.noShortcutTipContainer.style.display = 'block'
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new OptionsPage()
  page.setup()
})
