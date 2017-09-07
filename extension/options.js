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
    const regexQuery = "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$"
    if (new RegExp(regexQuery, "i").test(url)) {
      return true
    }
    return false
  }

  checkFormValidity() {
    const repoInputs = document.querySelectorAll('.repository-input')
    for (let repoInput of repoInputs) {
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
    for (let urlInput of githubUrlInputs) {
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
    for (let nameInput of projectNameInputs) {
      const i = nameInput.getAttribute('data-key')
      const name = nameInput.value.trim()
      const container = nameInput.closest('.project-container')
      const repo = container.querySelector('.project-repo-input').value.trim()
      const org = container.querySelector('.project-org-input').value.trim()
      const number = container.querySelector('.project-number-input').value

      if (this.isValidRepo(repo)) {
        delete this.errors[`projectRepository${i}`]
      } else {
        this.errors[`projectRepository${i}`] = true
        this.flashErrorMessage(`Invalid project repository: shortcut ${i}`)
      }

      if ((org.length > 0 || repo.length > 0 || name.length > 0) && number.length < 1) {
        this.errors[`projectNumber${i}`] = true
        this.flashErrorMessage(`Must set project number: shortcut ${i}`)
      } else {
        delete this.errors[`projectNumber${i}`]
      }

      if ((org.length > 0 || repo.length > 0 || number.length > 0) && name.length < 1) {
        this.errors[`projectName${i}`] = true
        this.flashErrorMessage(`Must set project name: shortcut ${i}`)
      } else {
        delete this.errors[`projectName${i}`]
      }

      if (repo.length > 0 && org.length > 0) {
        this.errors[`projectRepoOrgBoth${i}`] = true
        this.flashErrorMessage('Must set only one of repository or organization for ' +
                               `project: shortcut ${i}`)
      } else {
        delete this.errors[`projectRepoOrgBoth${i}`]
      }

      if ((number.length > 0 || name.length > 0) && org.length < 1 && repo.length < 1) {
        this.errors[`projectRepoOrg${i}`] = true
        this.flashErrorMessage('Must set either repository or organization for project: ' +
                               `shortcut ${i}`)
      } else {
        delete this.errors[`projectRepoOrg${i}`]
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
    this.reposContainer = document.getElementById('repositories-container')
    this.repoTemplate = document.getElementById('repository-template')
    this.addRepoButton = document.getElementById('add-repository-button')

    this.projectsContainer = document.getElementById('projects-container')
    this.projectTemplate = document.getElementById('project-template')
    this.addProjectButton = document.getElementById('add-project-button')

    this.usersContainer = document.getElementById('users-container')
    this.userTemplate = document.getElementById('user-template')
    this.orgTemplate = document.getElementById('org-template')
    this.addUserButton = document.getElementById('add-user-button')
    this.addOrgButton = document.getElementById('add-org-button')

    this.shortcutTipContainer = document.getElementById('shortcut-tip-container')
    this.shortcut = document.getElementById('shortcut')
    this.optionsForm = document.getElementById('options-form')
    this.notification = document.getElementById('notification')
    this.versionEl = document.getElementById('extension-version')
    this.closedIssues = document.getElementById('closed-issues')
    this.newIssue = document.getElementById('new-issue')
    this.mergedPullRequests = document.getElementById('merged-pull-requests')
    this.closedPullRequests = document.getElementById('closed-pull-requests')
    this.newPullRequest = document.getElementById('new-pull-request')
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

  hookUpHandlers() {
    this.addRepoButton.addEventListener('click', e => this.addRepositoryShortcut(e))
    this.addProjectButton.addEventListener('click', e => this.addProjectShortcut(e))
    this.addUserButton.addEventListener('click', e => this.addUserShortcut(e))
    this.addOrgButton.addEventListener('click', e => this.addOrgShortcut(e))
    this.optionsForm.addEventListener('submit', e => this.onSubmit(e))
    this.closedIssues.addEventListener('change', () => this.checkFormValidity())
    this.newIssue.addEventListener('change', () => this.checkFormValidity())
    this.mergedPullRequests.addEventListener('change', () => this.checkFormValidity())
    this.closedPullRequests.addEventListener('change', () => this.checkFormValidity())
    this.newPullRequest.addEventListener('change', () => this.checkFormValidity())
  }

  loadRepoLogo(rawRepo, imgTag) {
    const user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
      this.loadLogoForUser(user, imgTag)
    }
  }

  loadProjectRepoLogo(rawRepo, imgTag) {
    const user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
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

  onUserKeyup(event, i) {
    if (this[`userInput${i}Timer`]) {
      clearTimeout(this[`userInput${i}Timer`])
    }
    const userInput = event.target
    const imgTag = userInput.closest('.control').querySelector('.user-logo')
    this[`userInput${i}Timer`] = setTimeout(() => {
      const user = userInput.value.trim()
      if (user.length < 1) {
        this.showDefaultLogoForUser(imgTag)
      } else {
        this.loadLogoForUser(user, imgTag)
      }
      this.checkFormValidity()
    }, 750)
  }

  onProjectOrgKeyup(event, i) {
    if (this[`projectOrgInput${i}Timer`]) {
      clearTimeout(this[`projectOrgInput${i}Timer`])
    }
    const orgInput = event.target
    const imgTag = orgInput.closest('.control').querySelector('.project-org-logo')
    const repoInput = orgInput.closest('.project-container').querySelector('.project-repo-input')
    this[`projectOrgInput${i}Timer`] = setTimeout(() => {
      const org = orgInput.value.trim()
      repoInput.disabled = org.length > 0
      if (org.length < 1) {
        this.showDefaultLogoForUser(imgTag)
      } else {
        this.loadLogoForUser(org, imgTag)
      }
      this.checkFormValidity()
    }, 750)
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

  onRepoKeyup(event, i) {
    if (this[`repoInput${i}Timer`]) {
      clearTimeout(this[`repoInput${i}Timer`])
    }
    const repoInput = event.target
    const imgTag = repoInput.closest('.control').querySelector('.repository-logo')
    this[`repoInput${i}Timer`] = setTimeout(() => {
      const repo = (repoInput.value || '').trim()
      if (repo.length < 1) {
        this.showDefaultLogoForUser(imgTag)
      } else {
        this.loadRepoLogo(repo, imgTag)
      }
      this.checkFormValidity()
    }, 750)
  }

  onProjectRepoKeyup(event, i) {
    if (this[`projectRepoInput${i}Timer`]) {
      clearTimeout(this[`projectRepoInput${i}Timer`])
    }
    const repoInput = event.target
    const imgTag = repoInput.closest('.control').querySelector('.project-repo-logo')
    const orgInput = repoInput.closest('.project-container').querySelector('.project-org-input')
    this[`projectRepoInput${i}Timer`] = setTimeout(() => {
      const repo = repoInput.value.trim()
      orgInput.disabled = repo.length > 0
      if (repo.length < 1) {
        this.showDefaultLogoForUser(imgTag)
      } else {
        this.loadProjectRepoLogo(repo, imgTag)
      }
      this.checkFormValidity()
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

  onProjectOrgLogoLoad(event, i) {
    if (this.isBadLogo(event.target.src)) {
      return
    }
    delete this.errors[`projectOrgLogo${i}`]
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

  onSubmit(event) {
    event.preventDefault()
    this.saveOptions()
  }

  saveOptions() {
    if (this.optionsForm.classList.contains('error')) {
      return
    }

    HubnavStorage.load().then(currentOptions => {
      const newOptions = {}

      const repoInputs = document.querySelectorAll('.repository-input')
      for (let repoInput of repoInputs) {
        const repo = repoInput.value.trim()
        if (repo && repo.length > 0) {
          const i = repoInput.getAttribute('data-key')
          newOptions[`repository${i}`] = repo
        }
      }

      newOptions.repository = currentOptions.repository
      const repoOptions = []
      for (let i of REPO_SHORTCUTS) {
        const repo = newOptions[`repository${i}`]
        if (repo && repo.length > 0) {
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
      for (let branchInput of branchInputs) {
        const i = branchInput.getAttribute('data-key')
        const repo = newOptions[`repository${i}`]
        if (repo && repo.length > 0) {
          const branch = branchInput.value.trim()
          newOptions[`defaultBranch${i}`] = branch
          if (newOptions.repository === repo) {
            newOptions.defaultBranch = branch
          }
        }
      }

      const githubUrlInputs = document.querySelectorAll('.github-url-input')
      for (let urlInput of githubUrlInputs) {
        const i = urlInput.getAttribute('data-key')
        const repo = newOptions[`repository${i}`]
        if (repo && repo.length > 0) {
          const url = urlInput.value.trim()
          newOptions[`githubUrl${i}`] = url
          if (newOptions.repository === repo) {
            newOptions.githubUrl = url
          }
        }
      }

      const projectNameInputs = document.querySelectorAll('.project-name-input')
      for (let nameInput of projectNameInputs) {
        const name = nameInput.value.trim()
        if (name && name.length > 0) {
          const i = nameInput.getAttribute('data-key')
          const container = nameInput.closest('.project-container')
          const repo = container.querySelector('.project-repo-input').value.trim()
          const org = container.querySelector('.project-org-input').value.trim()
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
      for (let i of PROJECT_SHORTCUTS) {
        const name = newOptions[`projectName${i}`]
        if (name && name.length > 0) {
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
      for (let userInput of userInputs) {
        const user = userInput.value.trim()
        if (user && user.length > 0) {
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
      for (let i of USER_SHORTCUTS) {
        const user = newOptions[`user${i}`]
        if (user && user.length > 0) {
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
      // Ensure active user is one of the four options
      if (userOptions.indexOf(newOptions.user) < 0) {
        newOptions.user = userOptions[0]
        for (let i of USER_SHORTCUTS) {
          if (newOptions[`user${i}`] === newOptions.user) {
            newOptions.userIsOrg = newOptions[`userIsOrg${i}`]
            newOptions.scope = newOptions[`userScope${i}`]
            break
          }
        }
      }

      newOptions.active = currentOptions.active
      if (!newOptions.active) {
        if (newOptions.repository && newOptions.repository.length > 0) {
          newOptions.active = 'repository'
        } else if (newOptions.user && newOptions.user.length > 0) {
          newOptions.active = newOptions.userIsOrg ? 'organization' : 'user'
        } else if (newOptions.projectRepo && newOptions.projectRepo.length > 0 &&
                   newOptions.projectNumber && newOptions.projectNumber.length > 0 &&
                   newOptions.projectName && newOptions.projectName.length > 0) {
          newOptions.active = 'project'
        } else if (newOptions.projectOrg && newOptions.projectOrg.length > 0 &&
                   newOptions.projectNumber && newOptions.projectNumber.length > 0 &&
                   newOptions.projectName && newOptions.projectName.length > 0) {
          newOptions.active = 'project'
        }
      }

      newOptions.closedIssues = this.closedIssues.checked
      newOptions.newIssue = this.newIssue.checked
      newOptions.mergedPullRequests = this.mergedPullRequests.checked
      newOptions.closedPullRequests = this.closedPullRequests.checked
      newOptions.newPullRequest = this.newPullRequest.checked

      HubnavStorage.save(newOptions).then(() => this.flashSaveNotice())
    })
  }

  loadTemplate(template, container, populate, subsequentNode) {
    const clone = template.content.cloneNode(true)
    populate(clone)
    if (subsequentNode) {
      container.insertBefore(clone, subsequentNode)
    } else {
      container.appendChild(clone)
    }
  }

  getNextShortcut(inputs, shortcuts, containerClass) {
    let shortcut = null
    let subsequentNode = null
    for (let i = 0; i < inputs.length; i++) {
      const currentShortcut = inputs[i].getAttribute('data-key')
      if (currentShortcut !== shortcuts[i]) {
        shortcut = shortcuts[i]
        subsequentNode = inputs[i].closest(containerClass)
        break
      }
    }
    if (!shortcut) {
      shortcut = shortcuts[inputs.length]
    }
    return [shortcut, subsequentNode]
  }

  focusLastAddedInput() {
    const input = document.querySelector('.focus-target')
    input.focus()
    input.classList.remove('focus-target')
  }

  addOrgShortcut(event) {
    this.addUserOrOrgShortcut(event, true)
  }

  addUserShortcut(event) {
    this.addUserOrOrgShortcut(event, false)
  }

  addUserOrOrgShortcut(event, isOrg) {
    event.currentTarget.blur()
    const userInputs = document.querySelectorAll('.login-input')
    const shortcutAndNode = this.getNextShortcut(userInputs, USER_SHORTCUTS,
                                                 '.user-container')
    const i = shortcutAndNode[0]
    const login = ''
    const scope = ''
    const subsequentNode = shortcutAndNode[1]
    this.addUser(i, login, isOrg, scope, subsequentNode)
    if (userInputs.length + 1 >= USER_SHORTCUTS.length) {
      this.addUserButton.style.display = 'none'
      this.addOrgButton.style.display = 'none'
    }
    this.focusLastAddedInput()
  }

  addProjectShortcut(event) {
    event.currentTarget.blur()
    const projectNameInputs = document.querySelectorAll('.project-name-input')
    const shortcutAndNode = this.getNextShortcut(projectNameInputs, PROJECT_SHORTCUTS,
                                                 '.project-container')
    this.addProject(shortcutAndNode[0], '', '', '', '', shortcutAndNode[1])
    if (projectNameInputs.length + 1 >= PROJECT_SHORTCUTS.length) {
      this.addProjectButton.style.display = 'none'
    }
    this.focusLastAddedInput()
  }

  addRepositoryShortcut(event) {
    event.currentTarget.blur()
    const repoInputs = document.querySelectorAll('.repository-input')
    const shortcutAndNode = this.getNextShortcut(repoInputs, REPO_SHORTCUTS,
                                                 '.repository-container')
    this.addRepository(shortcutAndNode[0], '', 'master', null, shortcutAndNode[1])
    if (repoInputs.length + 1 >= REPO_SHORTCUTS.length) {
      this.addRepoButton.style.display = 'none'
    }
    this.focusLastAddedInput()
  }

  addProject(i, name, number, org, repo, subsequentNode) {
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
      orgLogo.addEventListener('load', e => this.onProjectOrgLogoLoad(e, i))
      orgLogo.addEventListener('error', e => this.onProjectOrgLogoError(e, i))

      const repoLogo = projectEl.querySelector('.project-repo-logo')
      repoLogo.addEventListener('load', e => this.onProjectRepoLogoLoad(e, i))
      repoLogo.addEventListener('error', e => this.onProjectRepoLogoError(e, i))

      const repoInputID = `project${i}-repo`
      projectEl.querySelector('.project-repo-label').htmlFor = repoInputID

      const repoInput = projectEl.querySelector('.project-repo-input')
      repoInput.id = repoInputID
      if (org && org.length > 0) {
        repoInput.disabled = true
        this.loadLogoForUser(org, orgLogo)
      } else {
        repoInput.value = repo
      }
      repoInput.setAttribute('data-key', i)
      repoInput.addEventListener('keyup', e => this.onProjectRepoKeyup(e, i))

      const orgInputID = `project${i}-org`
      projectEl.querySelector('.project-org-label').htmlFor = orgInputID

      const orgInput = projectEl.querySelector('.project-org-input')
      orgInput.id = orgInputID
      if (repo && repo.length > 0) {
        orgInput.disabled = true
        this.loadProjectRepoLogo(repo, repoLogo)
      } else {
        orgInput.value = org
      }
      orgInput.setAttribute('data-key', i)
      orgInput.addEventListener('keyup', e => this.onProjectOrgKeyup(e, i))
      orgInput.classList.add('focus-target')

      const removeButton = projectEl.querySelector('.remove-project-button')
      removeButton.addEventListener('click', e => this.removeProject(e, i))
    }
    this.loadTemplate(this.projectTemplate, this.projectsContainer, populate, subsequentNode)
  }

  addUser(i, login, isOrg, scope, subsequentNode) {
    const populate = userEl => {
      userEl.querySelector('.i').textContent = i

      const userLogo = userEl.querySelector('.user-logo')
      userLogo.addEventListener('load', e => this.onUserLogoLoad(e, i))
      userLogo.addEventListener('error', e => this.onUserLogoError(e, i))
      if (login && login.length > 0) {
        this.loadLogoForUser(login, userLogo)
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
        if (scope && scope.length > 0) {
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
    this.loadTemplate(template, this.usersContainer, populate, subsequentNode)
  }

  addRepository(i, repo, defaultBranch, githubUrl, subsequentNode) {
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
    this.loadTemplate(this.repoTemplate, this.reposContainer, populate, subsequentNode)
  }

  removeProject(event, i) {
    this.removeShortcut(event, i, '.project-container')
    const numProjectsLoaded = document.querySelectorAll('.project-name-input').length
    if (numProjectsLoaded < PROJECT_SHORTCUTS.length) {
      this.addProjectButton.style.display = 'block'
    }
  }

  removeUser(event, i) {
    this.removeShortcut(event, i, '.user-container')
    const numUsersLoaded = document.querySelectorAll('.login-input').length
    if (numUsersLoaded < USER_SHORTCUTS.length) {
      this.addUserButton.style.display = 'block'
    }
  }

  removeRepository(event, i) {
    this.removeShortcut(event, i, '.repository-container')
    const numReposLoaded = document.querySelectorAll('.repository-input').length
    if (numReposLoaded < REPO_SHORTCUTS.length) {
      this.addRepoButton.style.display = 'block'
    }
  }

  removeShortcut(event, i, containerClass) {
    const button = event.target
    button.blur()
    const container = button.closest(containerClass)
    container.remove()
    this.saveOptions()
  }

  restoreOptions() {
    HubnavStorage.load().then(options => {
      for (let i of REPO_SHORTCUTS) {
        const repo = options[`repository${i}`]
        if (repo && repo.length > 0) {
          this.addRepository(i, repo, options[`defaultBranch${i}`], options[`githubUrl${i}`])
        }
      }
      const numReposLoaded = document.querySelectorAll('.repository-input').length
      if (numReposLoaded >= REPO_SHORTCUTS.length) {
        this.addRepoButton.style.display = 'none'
      }

      for (let i of PROJECT_SHORTCUTS) {
        const projectName = options[`projectName${i}`]
        if (projectName && projectName.length > 0) {
          const projectNumber = options[`projectNumber${i}`]
          const projectOrg = options[`projectOrg${i}`]
          const projectRepo = options[`projectRepo${i}`]
          this.addProject(i, projectName, projectNumber, projectOrg, projectRepo)
        }
      }
      const numProjectsLoaded = document.querySelectorAll('.project-name-input').length
      if (numProjectsLoaded >= PROJECT_SHORTCUTS.length) {
        this.addProjectButton.style.display = 'none'
      }

      for (let i of USER_SHORTCUTS) {
        const user = options[`user${i}`]
        if (user && user.length > 0) {
          let isOrg = false
          if (typeof options[`userIsOrg${i}`] === 'boolean') {
            isOrg = options[`userIsOrg${i}`]
          }
          const scope = options[`userScope${i}`]
          this.addUser(i, user, isOrg, scope)
        }
      }
      const numUsersLoaded = document.querySelectorAll('.login-input').length
      if (numUsersLoaded >= USER_SHORTCUTS.length) {
        this.addUserButton.style.display = 'none'
      }

      const focusTargets = document.querySelectorAll('.focus-target')
      for (let input of focusTargets) {
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
      if (popupCommand && popupCommand.shortcut && popupCommand.shortcut.length > 0) {
        this.shortcut.textContent = popupCommand.shortcut
        this.shortcutTipContainer.style.display = 'block'
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new OptionsPage()
  page.setup()
})
