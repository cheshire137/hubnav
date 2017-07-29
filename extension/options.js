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
    for (let i of REPO_SHORTCUTS) {
      const repo = (this[`repoInput${i}`].value || '').trim()
      if (this.isValidRepo(repo)) {
        delete this.errors[`repository${i}`]
      } else {
        this.errors[`repository${i}`] = true
        this.flashErrorMessage(`Invalid repository: shortcut ${i}`)
      }
    }

    for (let i of PROJECT_SHORTCUTS) {
      const repo = (this[`projectRepoInput${i}`].value || '').trim()
      if (this.isValidRepo(repo)) {
        delete this.errors[`projectRepository${i}`]
      } else {
        this.errors[`projectRepository${i}`] = true
        this.flashErrorMessage(`Invalid project repository: shortcut ${i}`)
      }

      const org = (this[`projectOrgInput${i}`].value || '').trim()
      const number = this[`projectNumberInput${i}`].value
      if ((org.length > 0 || repo.length > 0) && number.length < 1) {
        this.errors[`projectNumber${i}`] = true
        this.flashErrorMessage(`Must set project number: shortcut ${i}`)
      } else {
        delete this.errors[`projectNumber${i}`]
      }

      if (repo.length > 0 && org.length > 0) {
        this.errors[`projectRepoOrgBoth${i}`] = true
        this.flashErrorMessage('Must set only one of repository or organization for ' +
                               `project: shortcut ${i}`)
      } else {
        delete this.errors[`projectRepoOrgBoth${i}`]
      }

      if (number.length > 0 && org.length < 1 && repo.length < 1) {
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
    for (let i of REPO_SHORTCUTS) {
      this[`repoInput${i}`] = document.getElementById(`repository${i}`)
      this[`defaultBranchInput${i}`] = document.getElementById(`default-branch${i}`)
      this[`repoLogo${i}`] = document.getElementById(`repo-logo${i}`)
    }
    for (let i of PROJECT_SHORTCUTS) {
      this[`projectRepoInput${i}`] = document.getElementById(`project${i}-repo`)
      this[`projectOrgInput${i}`] = document.getElementById(`project${i}-org`)
      this[`projectRepoLogo${i}`] = document.getElementById(`project${i}-repo-logo`)
      this[`projectOrgLogo${i}`] = document.getElementById(`project${i}-org-logo`)
      this[`projectNumberInput${i}`] = document.getElementById(`project${i}-number`)
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

  flashNotification(message, isError) {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer)
    }
    this.notification.classList.toggle('error', isError)
    this.notification.textContent = message
    this.notification.style.display = 'block'
    this.notificationTimer = setTimeout(() => {
      this.notification.style.display = 'none'
    }, 2000)
  }

  flashSaveNotice() {
    this.flashNotification('Saved!', false)
  }

  flashErrorMessage(message) {
    this.flashNotification(message, true)
  }

  hookUpHandlers() {
    for (let i of REPO_SHORTCUTS) {
      this[`repoInput${i}`].addEventListener('keyup', e => this.onRepoKeyup(e, i))
      this[`defaultBranchInput${i}`].addEventListener('keyup', e => this.onDefaultBranchKeyup(e, i))
      this[`repoLogo${i}`].addEventListener('load', () => this.onRepoLogoLoad(i))
      this[`repoLogo${i}`].addEventListener('error', () => this.onRepoLogoError(i))
    }
    for (let i of PROJECT_SHORTCUTS) {
      this[`projectRepoInput${i}`].addEventListener('keyup', e => this.onProjectRepoKeyup(e, i))
      this[`projectOrgInput${i}`].addEventListener('keyup', e => this.onProjectOrgKeyup(e, i))
      this[`projectRepoLogo${i}`].addEventListener('load', () => this.onProjectRepoLogoLoad(i))
      this[`projectRepoLogo${i}`].addEventListener('error', () => this.onProjectRepoLogoError(i))
      this[`projectOrgLogo${i}`].addEventListener('load', () => this.onProjectOrgLogoLoad(i))
      this[`projectOrgLogo${i}`].addEventListener('error', () => this.onProjectOrgLogoError(i))
      this[`projectNumberInput${i}`].addEventListener('change', () => this.checkFormValidity())
    }
    for (let i of USER_SHORTCUTS) {
      this[`userInput${i}`].addEventListener('keyup', e => this.onUserKeyup(e, i))
      this[`userLogo${i}`].addEventListener('load', () => this.onUserLogoLoad(i))
      this[`userLogo${i}`].addEventListener('error', () => this.onUserLogoError(i))
      this[`userIsOrg${i}`].addEventListener('change', () => this.checkFormValidity())
    }
    this.optionsForm.addEventListener('submit', e => this.onSubmit(e))
    this.closedIssues.addEventListener('change', () => this.checkFormValidity())
    this.newIssue.addEventListener('change', () => this.checkFormValidity())
    this.mergedPullRequests.addEventListener('change', () => this.checkFormValidity())
    this.closedPullRequests.addEventListener('change', () => this.checkFormValidity())
    this.newPullRequest.addEventListener('change', () => this.checkFormValidity())
  }

  loadRepoLogo(rawRepo, i) {
    let user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
      this.loadLogoForUser(user, this[`repoLogo${i}`])
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

  showBadRepoLogo(i) {
    this.showBadLogoForUser(this[`repoLogo${i}`])
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

  showDefaultRepoLogo(i) {
    this.showDefaultLogoForUser(this[`repoLogo${i}`])
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
      this.setRepoLogoSource(i)
      this.checkFormValidity()
    }, 750)
  }

  onProjectRepoKeyup(event, i) {
    if (this[`projectRepoInput${i}Timer`]) {
      clearTimeout(this[`projectRepoInput${i}Timer`])
    }
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

  onRepoLogoLoad(i) {
    if (this.isBadLogo(this[`repoLogo${i}`].src)) {
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

  onRepoLogoError(i) {
    this.showBadRepoLogo(i)
    this.errors[`repositoryLogo${i}`] = true
    const repo = (this[`repoInput${i}`].value || '').trim()
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

  setRepoLogoSource(i) {
    const repo = (this[`repoInput${i}`].value || '').trim()
    if (repo.length < 1) {
      this.showDefaultRepoLogo(i)
    } else {
      this.loadRepoLogo(repo, i)
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
      const repository1 = (this.repoInput1.value || '').trim()
      const repository2 = (this.repoInput2.value || '').trim()
      const repository3 = (this.repoInput3.value || '').trim()
      const repository4 = (this.repoInput4.value || '').trim()
      let repository = currentOptions.repository
      if (!repository || repository.length < 1) {
        if (repository1.length > 0) {
          repository = repository1
        } else if (repository2.length > 0) {
          repository = repository2
        } else if (repository3.length > 0) {
          repository = repository3
        } else if (repository4.length > 0) {
          repository = repository4
        }
      }
      // Ensure active repository is one of the four options
      if ([repository1, repository2, repository3, repository4].indexOf(repository) < 0) {
        repository = repository1
      }

      let defaultBranch1 = ''
      if (repository1.length > 0) {
        defaultBranch1 = (this.defaultBranchInput1.value || '').trim()
      }
      let defaultBranch2 = ''
      if (repository2.length > 0) {
        defaultBranch2 = (this.defaultBranchInput2.value || '').trim()
      }
      let defaultBranch3 = ''
      if (repository3.length > 0) {
        defaultBranch3 = (this.defaultBranchInput3.value || '').trim()
      }
      let defaultBranch4 = ''
      if (repository4.length > 0) {
        defaultBranch4 = (this.defaultBranchInput4.value || '').trim()
      }
      let defaultBranch = defaultBranch1
      if (repository === repository2) {
        defaultBranch = defaultBranch2
      } else if (repository === repository3) {
        defaultBranch = defaultBranch3
      } else if (repository === repository4) {
        defaultBranch = defaultBranch4
      }

      const projectRepo5 = (this.projectRepoInput5.value || '').trim()
      const projectRepo6 = (this.projectRepoInput6.value || '').trim()
      const projectRepo7 = (this.projectRepoInput7.value || '').trim()
      const projectOrg5 = (this.projectOrgInput5.value || '').trim()
      const projectOrg6 = (this.projectOrgInput6.value || '').trim()
      const projectOrg7 = (this.projectOrgInput7.value || '').trim()
      const projectNumber5 = this.projectNumberInput5.value
      const projectNumber6 = this.projectNumberInput6.value
      const projectNumber7 = this.projectNumberInput7.value
      const projectNumber = currentOptions.projectNumber
      const projectRepo = currentOptions.projectRepo
      const projectOrg = currentOptions.projectOrg

      const user8 = (this.userInput8.value || '').trim()
      const user9 = (this.userInput9.value || '').trim()
      const user0 = (this.userInput0.value || '').trim()
      let userIsOrg8 = this.userIsOrg8.checked
      if (user8.length < 1) {
        userIsOrg8 = false
      }
      let userIsOrg9 = this.userIsOrg9.checked
      if (user9.length < 1) {
        userIsOrg9 = false
      }
      let userIsOrg0 = this.userIsOrg0.checked
      if (user0.length < 1) {
        userIsOrg0 = false
      }
      let user = currentOptions.user
      if (!user || user.length < 1) {
        if (user8.length > 0) {
          user = user8
        } else if (user9.length > 0) {
          user = user9
        } else if (user0.length > 0) {
          user = user0
        }
      }
      // Ensure active user is one of the three options
      if ([user8, user9, user0].indexOf(user) < 0) {
        user = user8
      }
      let userIsOrg = userIsOrg8
      if (user === user9) {
        userIsOrg = userIsOrg9
      } else if (user === user0) {
        userIsOrg = userIsOrg0
      }

      let active = currentOptions.active
      if (!active) {
        if (repository && repository.length > 0) {
          active = 'repository'
        } else if (user && user.length > 0) {
          active = userIsOrg ? 'organization' : 'user'
        } else if (projectRepo && projectRepo.length > 0 &&
                   projectNumber && projectNumber.length > 0) {
          active = 'project'
        } else if (projectOrg && projectOrg.length > 0 &&
                   projectNumber && projectNumber.length > 0) {
          active = 'project'
        }
      }

      const closedIssues = this.closedIssues.checked
      const newIssue = this.newIssue.checked
      const mergedPullRequests = this.mergedPullRequests.checked
      const closedPullRequests = this.closedPullRequests.checked
      const newPullRequest = this.newPullRequest.checked

      const newOptions = {
        repository, repository1, repository2, repository3, repository4, defaultBranch1,
        defaultBranch2, defaultBranch3, defaultBranch4, defaultBranch, closedIssues, newIssue,
        mergedPullRequests, active, newPullRequest, user8, user9, user0, userIsOrg8, userIsOrg9,
        userIsOrg0, user, userIsOrg, closedPullRequests, projectRepo5, projectRepo6,
        projectRepo7, projectOrg5, projectOrg6, projectOrg7, projectNumber5, projectNumber6,
        projectNumber7, projectRepo, projectOrg, projectNumber
      }
      HubnavStorage.save(newOptions).then(() => this.flashSaveNotice())
    })
  }

  restoreOptions() {
    HubnavStorage.load().then(options => {
      for (let i of REPO_SHORTCUTS) {
        const repo = options[`repository${i}`]
        if (repo && repo.length > 0) {
          this[`repoInput${i}`].value = repo
          this.loadRepoLogo(repo, i)
        }
        this[`defaultBranchInput${i}`].value = options[`defaultBranch${i}`] || 'master'
      }
      for (let i of PROJECT_SHORTCUTS) {
        const projectRepo = options[`projectRepo${i}`]
        if (projectRepo && projectRepo.length > 0) {
          this[`projectRepoInput${i}`].value = projectRepo
          this.loadProjectRepoLogo(projectRepo, i)
        }
        const projectOrg = options[`projectOrg${i}`]
        if (projectOrg && projectOrg.length > 0) {
          this[`projectOrgInput${i}`].value = projectOrg
          this.loadProjectOrgLogo(projectOrg, i)
        }
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
