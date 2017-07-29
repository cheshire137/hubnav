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

  checkFormValidity() {
    const repoInputs = document.querySelectorAll('.repository-input')
    for (let repoInput of repoInputs) {
      const i = repoInput.getAttribute('data-key')
      const repo = (repoInput.value || '').trim()
      if (this.isValidRepo(repo)) {
        delete this.errors[`repository${i}`]
      } else {
        this.errors[`repository${i}`] = true
        this.flashErrorMessage(`Invalid repository: shortcut ${i}`)
      }
    }

    for (let i of PROJECT_SHORTCUTS) {
      const repo = (this[`projectRepoInput${i}`].value || '').trim()
      const org = (this[`projectOrgInput${i}`].value || '').trim()
      const number = this[`projectNumberInput${i}`].value
      const name = (this[`projectNameInput${i}`].value || '').trim()

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
    for (let i of PROJECT_SHORTCUTS) {
      this[`projectRepoInput${i}`] = document.getElementById(`project${i}-repo`)
      this[`projectOrgInput${i}`] = document.getElementById(`project${i}-org`)
      this[`projectRepoLogo${i}`] = document.getElementById(`project${i}-repo-logo`)
      this[`projectOrgLogo${i}`] = document.getElementById(`project${i}-org-logo`)
      this[`projectNumberInput${i}`] = document.getElementById(`project${i}-number`)
      this[`projectNameInput${i}`] = document.getElementById(`project${i}-name`)
    }
    for (let i of USER_SHORTCUTS) {
      this[`userInput${i}`] = document.getElementById(`user${i}`)
      this[`userLogo${i}`] = document.getElementById(`user-logo${i}`)
      this[`userIsOrg${i}`] = document.getElementById(`user${i}-is-org`)
    }
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
    for (let i of PROJECT_SHORTCUTS) {
      this[`projectRepoInput${i}`].addEventListener('keyup', e => this.onProjectRepoKeyup(e, i))
      this[`projectOrgInput${i}`].addEventListener('keyup', e => this.onProjectOrgKeyup(e, i))
      this[`projectRepoLogo${i}`].addEventListener('load', () => this.onProjectRepoLogoLoad(i))
      this[`projectRepoLogo${i}`].addEventListener('error', () => this.onProjectRepoLogoError(i))
      this[`projectOrgLogo${i}`].addEventListener('load', () => this.onProjectOrgLogoLoad(i))
      this[`projectOrgLogo${i}`].addEventListener('error', () => this.onProjectOrgLogoError(i))
      this[`projectNumberInput${i}`].addEventListener('change', () => this.checkFormValidity())
      this[`projectNameInput${i}`].addEventListener('change', () => this.checkFormValidity())
    }
    for (let i of USER_SHORTCUTS) {
      this[`userInput${i}`].addEventListener('keyup', e => this.onUserKeyup(e, i))
      this[`userLogo${i}`].addEventListener('load', () => this.onUserLogoLoad(i))
      this[`userLogo${i}`].addEventListener('error', () => this.onUserLogoError(i))
      this[`userIsOrg${i}`].addEventListener('change', () => this.checkFormValidity())
    }
    this.addRepoButton.addEventListener('click', e => this.addRepositoryShortcut(e))
    this.optionsForm.addEventListener('submit', e => this.onSubmit(e))
    this.closedIssues.addEventListener('change', () => this.checkFormValidity())
    this.newIssue.addEventListener('change', () => this.checkFormValidity())
    this.mergedPullRequests.addEventListener('change', () => this.checkFormValidity())
    this.closedPullRequests.addEventListener('change', () => this.checkFormValidity())
    this.newPullRequest.addEventListener('change', () => this.checkFormValidity())
  }

  loadRepoLogo(rawRepo, i, imgTag) {
    let user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
      this.loadLogoForUser(user, imgTag)
    }
  }

  loadProjectRepoLogo(rawRepo, i) {
    let user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
      this.loadLogoForUser(user, this[`projectRepoLogo${i}`])
    }
  }

  loadProjectOrgLogo(org, i) {
    this.loadLogoForUser(org, this[`projectOrgLogo${i}`])
  }

  loadUserLogo(rawUser, i) {
    this.loadLogoForUser(rawUser, this[`userLogo${i}`])
  }

  loadLogoForUser(rawUser, img) {
    const user = encodeURIComponent(rawUser)
    img.src = `https://github.com/${user}.png?size=72`
    img.alt = user
  }

  showBadUserLogo(i) {
    this.showBadLogoForUser(this[`userLogo${i}`])
  }

  showBadProjectOrgLogo(i) {
    this.showBadLogoForUser(this[`projectOrgLogo${i}`])
  }

  showBadProjectRepoLogo(i) {
    this.showBadLogoForUser(this[`projectRepoLogo${i}`])
  }

  showBadLogoForUser(img) {
    img.src = 'bad-user.png'
    img.alt = ''
  }

  showDefaultUserLogo(i) {
    this.showDefaultLogoForUser(this[`userLogo${i}`])
  }

  showDefaultProjectOrgLogo(i) {
    this.showDefaultLogoForUser(this[`projectOrgLogo${i}`])
  }

  showDefaultProjectRepoLogo(i) {
    this.showDefaultLogoForUser(this[`projectRepoLogo${i}`])
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

  onUserKeyup(event, i) {
    if (this[`userInput${i}Timer`]) {
      clearTimeout(this[`userInput${i}Timer`])
    }
    this[`userInput${i}Timer`] = setTimeout(() => {
      this.setUserLogoSource(i)
      this.checkFormValidity()
    }, 750)
  }

  onProjectOrgKeyup(event, i) {
    if (this[`projectOrgInput${i}Timer`]) {
      clearTimeout(this[`projectOrgInput${i}Timer`])
    }
    this[`projectRepoInput${i}`].disabled = event.target.value.trim().length > 0
    this[`projectOrgInput${i}Timer`] = setTimeout(() => {
      this.setProjectOrgLogoSource(i)
      this.checkFormValidity()
    }, 750)
  }

  onRepoKeyup(event, i) {
    if (this[`repoInput${i}Timer`]) {
      clearTimeout(this[`repoInput${i}Timer`])
    }
    this[`repoInput${i}Timer`] = setTimeout(() => {
      this.setRepoLogoSource(i, event.target)
      this.checkFormValidity()
    }, 750)
  }

  onProjectRepoKeyup(event, i) {
    if (this[`projectRepoInput${i}Timer`]) {
      clearTimeout(this[`projectRepoInput${i}Timer`])
    }
    this[`projectOrgInput${i}`].disabled = event.target.value.trim().length > 0
    this[`projectRepoInput${i}Timer`] = setTimeout(() => {
      this.setProjectRepoLogoSource(i)
      this.checkFormValidity()
    }, 750)
  }

  onUserLogoLoad(i) {
    if (this.isBadLogo(this[`userLogo${i}`].src)) {
      return
    }
    delete this.errors[`userLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onProjectOrgLogoLoad(i) {
    if (this.isBadLogo(this[`projectOrgLogo${i}`].src)) {
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

  onProjectRepoLogoLoad(i) {
    if (this.isBadLogo(this[`projectRepoLogo${i}`].src)) {
      return
    }
    delete this.errors[`projectRepoLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onProjectRepoLogoError(i) {
    this.showBadProjectRepoLogo(i)
    this.errors[`projectRepoLogo${i}`] = true
    const repo = (this[`projectRepoInput${i}`].value || '').trim()
    const user = encodeURIComponent(repo.split('/')[0] || '')
    this.flashErrorMessage(`Invalid project repository ${i}: can't find "${user}"`)
    this.checkFormValidity()
  }

  onUserLogoError(i) {
    this.showBadUserLogo(i)
    this.errors[`userLogo${i}`] = true
    const user = encodeURIComponent((this[`userInput${i}`].value || '').trim())
    this.flashErrorMessage(`Invalid user: can't find "${user}"`)
    this.checkFormValidity()
  }

  onProjectOrgLogoError(i) {
    this.showBadProjectOrgLogo(i)
    this.errors[`projectOrgLogo${i}`] = true
    const org = encodeURIComponent((this[`projectOrgLogo${i}`].value || '').trim())
    this.flashErrorMessage(`Invalid organization: can't find "${org}"`)
    this.checkFormValidity()
  }

  onRepoLogoError(event, i) {
    const imgTag = event.target
    this.showBadLogoForUser(imgTag)
    this.errors[`repositoryLogo${i}`] = true
    const repoInput = imgTag.closest('.control').querySelector('.repository-input')
    const repo = (repoInput.value || '').trim()
    const user = encodeURIComponent(repo.split('/')[0] || '')
    this.flashErrorMessage(`Invalid repository ${i}: can't find "${user}"`)
    this.checkFormValidity()
  }

  isBadLogo(url) {
    return url === `chrome-extension://${chrome.runtime.id}/bad-user.png`
  }

  setUserLogoSource(i) {
    const user = (this[`userInput${i}`].value || '').trim()
    if (user.length < 1) {
      this.showDefaultUserLogo(i)
    } else {
      this.loadUserLogo(user, i)
    }
  }

  setRepoLogoSource(i, repoInput) {
    const repo = (repoInput.value || '').trim()
    const imgTag = repoInput.closest('.control').querySelector('.repository-logo')
    if (repo.length < 1) {
      this.showDefaultLogoForUser(imgTag)
    } else {
      this.loadRepoLogo(repo, i, imgTag)
    }
  }

  setProjectRepoLogoSource(i) {
    const repo = (this[`projectRepoInput${i}`].value || '').trim()
    if (repo.length < 1) {
      this.showDefaultProjectRepoLogo(i)
    } else {
      this.loadProjectRepoLogo(repo, i)
    }
  }

  setProjectOrgLogoSource(i) {
    const org = (this[`projectOrgInput${i}`].value || '').trim()
    if (org.length < 1) {
      this.showDefaultProjectOrgLogo(i)
    } else {
      this.loadProjectOrgLogo(org, i)
    }
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

      newOptions.projectRepo5 = (this.projectRepoInput5.value || '').trim()
      newOptions.projectRepo6 = (this.projectRepoInput6.value || '').trim()
      newOptions.projectRepo7 = (this.projectRepoInput7.value || '').trim()
      newOptions.projectOrg5 = (this.projectOrgInput5.value || '').trim()
      newOptions.projectOrg6 = (this.projectOrgInput6.value || '').trim()
      newOptions.projectOrg7 = (this.projectOrgInput7.value || '').trim()
      newOptions.projectNumber5 = this.projectNumberInput5.value
      newOptions.projectNumber6 = this.projectNumberInput6.value
      newOptions.projectNumber7 = this.projectNumberInput7.value
      newOptions.projectName5 = (this.projectNameInput5.value || '').trim()
      newOptions.projectName6 = (this.projectNameInput6.value || '').trim()
      newOptions.projectName7 = (this.projectNameInput7.value || '').trim()
      newOptions.projectNumber = currentOptions.projectNumber
      newOptions.projectRepo = currentOptions.projectRepo
      newOptions.projectOrg = currentOptions.projectOrg
      newOptions.projectName = currentOptions.projectName
      const projectNameOptions = [newOptions.projectName5, newOptions.projectName6,
                                  newOptions.projectName7]
      if (projectNameOptions.indexOf(newOptions.projectName) < 0) {
        newOptions.projectNumber = null
        newOptions.projectRepo = null
        newOptions.projectOrg = null
      }

      newOptions.user8 = (this.userInput8.value || '').trim()
      newOptions.user9 = (this.userInput9.value || '').trim()
      newOptions.user0 = (this.userInput0.value || '').trim()
      newOptions.userIsOrg8 = this.userIsOrg8.checked
      if (newOptions.user8.length < 1) {
        newOptions.userIsOrg8 = false
      }
      newOptions.userIsOrg9 = this.userIsOrg9.checked
      if (newOptions.user9.length < 1) {
        newOptions.userIsOrg9 = false
      }
      newOptions.userIsOrg0 = this.userIsOrg0.checked
      if (newOptions.user0.length < 1) {
        newOptions.userIsOrg0 = false
      }
      newOptions.user = currentOptions.user
      if (!newOptions.user || newOptions.user.length < 1) {
        if (newOptions.user8.length > 0) {
          newOptions.user = newOptions.user8
        } else if (newOptions.user9.length > 0) {
          newOptions.user = newOptions.user9
        } else if (newOptions.user0.length > 0) {
          newOptions.user = newOptions.user0
        }
      }
      // Ensure active user is one of the three options
      const userOptions = [newOptions.user8, newOptions.user9, newOptions.user0]
      if (userOptions.indexOf(newOptions.user) < 0) {
        newOptions.user = newOptions.user8
      }
      newOptions.userIsOrg = newOptions.userIsOrg8
      if (newOptions.user === newOptions.user9) {
        newOptions.userIsOrg = newOptions.userIsOrg9
      } else if (newOptions.user === newOptions.user0) {
        newOptions.userIsOrg = newOptions.userIsOrg0
      }

      newOptions.active = currentOptions.active
      if (!newOptions.active) {
        if (newOptions.repository && newOptions.repository.length > 0) {
          newOptions.active = 'repository'
        } else if (user && user.length > 0) {
          newOptions.active = userIsOrg ? 'organization' : 'user'
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

  loadTemplate(template, container, populate) {
    const clone = template.content.cloneNode(true)
    if (typeof populate === 'function') {
      populate(clone)
    }
    container.appendChild(clone)
  }

  addRepositoryShortcut(event) {
    event.currentTarget.blur()
    const numReposLoaded = document.querySelectorAll('.repository-input').length
    const i = REPO_SHORTCUTS[numReposLoaded]
    this.addRepository(i, '', 'master')
    if (numReposLoaded + 1 >= REPO_SHORTCUTS.length) {
      this.addRepoButton.style.display = 'none'
    }
  }

  addRepository(i, repo, defaultBranch) {
    this.loadTemplate(this.repoTemplate, this.reposContainer, repoEl => {
      repoEl.querySelector('.i').textContent = i

      const repoInputID = `repository${i}`
      repoEl.querySelector('.repository-label').htmlFor = repoInputID

      const repoInput = repoEl.querySelector('.repository-input')
      repoInput.id = repoInputID
      repoInput.value = repo
      repoInput.setAttribute('data-key', i)
      repoInput.addEventListener('keyup', e => this.onRepoKeyup(e, i))

      const branchInputID = `default-branch${i}`
      repoEl.querySelector('.default-branch-label').htmlFor = branchInputID

      const branchInput = repoEl.querySelector('.default-branch-input')
      branchInput.id = branchInputID
      branchInput.value = defaultBranch || 'master'
      branchInput.setAttribute('data-key', i)
      branchInput.addEventListener('keyup', e => this.onDefaultBranchKeyup(e, i))

      const repoLogo = repoEl.querySelector('.repository-logo')
      repoLogo.addEventListener('load', e => this.onRepoLogoLoad(e, i))
      repoLogo.addEventListener('error', e => this.onRepoLogoError(e, i))
      this.loadRepoLogo(repo, i, repoLogo)

      const removeButton = repoEl.querySelector('.remove-repository-button')
      removeButton.addEventListener('click', e => this.removeRepository(e, i))
    })
  }

  removeRepository(event, i) {
    const button = event.target
    button.blur()
    const container = button.closest('.repository-container')
    container.remove()
    this.saveOptions()
  }

  restoreOptions() {
    HubnavStorage.load().then(options => {
      for (let i of REPO_SHORTCUTS) {
        const repo = options[`repository${i}`]
        if (repo && repo.length > 0) {
          this.addRepository(i, repo, options[`defaultBranch${i}`])
        }
      }
      const numReposLoaded = document.querySelectorAll('.repository-input').length
      if (numReposLoaded >= REPO_SHORTCUTS.length) {
        this.addRepoButton.style.display = 'none'
      }

      for (let i of PROJECT_SHORTCUTS) {
        const projectRepo = options[`projectRepo${i}`]
        if (projectRepo && projectRepo.length > 0) {
          this[`projectRepoInput${i}`].value = projectRepo
          this.loadProjectRepoLogo(projectRepo, i)
          this[`projectOrgInput${i}`].disabled = true
        }
        const projectOrg = options[`projectOrg${i}`]
        if (projectOrg && projectOrg.length > 0) {
          this[`projectOrgInput${i}`].value = projectOrg
          this.loadProjectOrgLogo(projectOrg, i)
          this[`projectRepoInput${i}`].disabled = true
        }
        this[`projectNameInput${i}`].value = options[`projectName${i}`] || ''
        this[`projectNumberInput${i}`].value = options[`projectNumber${i}`] || ''
      }
      for (let i of USER_SHORTCUTS) {
        const user = options[`user${i}`]
        if (user && user.length > 0) {
          this[`userInput${i}`].value = user
          this.loadUserLogo(user, i)
          let isOrg = false
          if (typeof options[`userIsOrg${i}`] === 'boolean') {
            isOrg = options[`userIsOrg${i}`]
          }
          this[`userIsOrg${i}`].checked = isOrg
        }
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
