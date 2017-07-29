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
      const repo = repoInput.value.trim()
      if (this.isValidRepo(repo)) {
        delete this.errors[`repository${i}`]
      } else {
        this.errors[`repository${i}`] = true
        this.flashErrorMessage(`Invalid repository: shortcut ${i}`)
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
    for (let i of USER_SHORTCUTS) {
      this[`userInput${i}`].addEventListener('keyup', e => this.onUserKeyup(e, i))
      this[`userLogo${i}`].addEventListener('load', () => this.onUserLogoLoad(i))
      this[`userLogo${i}`].addEventListener('error', () => this.onUserLogoError(i))
      this[`userIsOrg${i}`].addEventListener('change', () => this.checkFormValidity())
    }
    this.addRepoButton.addEventListener('click', e => this.addRepositoryShortcut(e))
    this.addProjectButton.addEventListener('click', e => this.addProjectShortcut(e))
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

  loadProjectOrgLogo(org, imgTag) {
    this.loadLogoForUser(org, imgTag)
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
    const orgInput = event.target
    const org = orgInput.value.trim()
    const repoInput = orgInput.closest('.project-container').querySelector('.project-repo-input')
    repoInput.disabled = org.length > 0
    this[`projectOrgInput${i}Timer`] = setTimeout(() => {
      const imgTag = orgInput.closest('.control').querySelector('.project-org-logo')
      if (org.length < 1) {
        this.showDefaultLogoForUser(imgTag)
      } else {
        this.loadProjectOrgLogo(org, imgTag)
      }
      this.checkFormValidity()
    }, 750)
  }

  onRepoKeyup(event, i) {
    if (this[`repoInput${i}Timer`]) {
      clearTimeout(this[`repoInput${i}Timer`])
    }
    this[`repoInput${i}Timer`] = setTimeout(() => {
      const repoInput = event.target
      const repo = (repoInput.value || '').trim()
      const imgTag = repoInput.closest('.control').querySelector('.repository-logo')
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
    const repo = repoInput.value.trim()
    const orgInput = repoInput.closest('.project-container').querySelector('.project-org-input')
    orgInput.disabled = repo.length > 0
    this[`projectRepoInput${i}Timer`] = setTimeout(() => {
      const imgTag = repoInput.closest('.control').querySelector('.project-repo-logo')
      if (repo.length < 1) {
        this.showDefaultLogoForUser(imgTag)
      } else {
        this.loadProjectRepoLogo(repo, imgTag)
      }
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

  onUserLogoError(i) {
    this.showBadUserLogo(i)
    this.errors[`userLogo${i}`] = true
    const user = encodeURIComponent((this[`userInput${i}`].value || '').trim())
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

  setUserLogoSource(i) {
    const user = (this[`userInput${i}`].value || '').trim()
    if (user.length < 1) {
      this.showDefaultUserLogo(i)
    } else {
      this.loadUserLogo(user, i)
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

  addProjectShortcut(event) {
    event.currentTarget.blur()
    const projectNameInputs = document.querySelectorAll('.project-name-input')
    const shortcutAndNode = this.getNextShortcut(projectNameInputs, PROJECT_SHORTCUTS,
                                                 '.project-container')
    this.addProject(shortcutAndNode[0], '', '', '', '', shortcutAndNode[1])
    if (projectNameInputs.length + 1 >= PROJECT_SHORTCUTS.length) {
      this.addProjectButton.style.display = 'none'
    }
  }

  addRepositoryShortcut(event) {
    event.currentTarget.blur()
    const repoInputs = document.querySelectorAll('.repository-input')
    const shortcutAndNode = this.getNextShortcut(repoInputs, REPO_SHORTCUTS,
                                                 '.repository-container')
    this.addRepository(shortcutAndNode[0], '', 'master', shortcutAndNode[1])
    if (repoInputs.length + 1 >= REPO_SHORTCUTS.length) {
      this.addRepoButton.style.display = 'none'
    }
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
        this.loadProjectOrgLogo(org, orgLogo)
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

      const removeButton = projectEl.querySelector('.remove-project-button')
      removeButton.addEventListener('click', e => this.removeProject(e, i))
    }
    this.loadTemplate(this.projectTemplate, this.projectsContainer, populate, subsequentNode)
  }

  addRepository(i, repo, defaultBranch, subsequentNode) {
    const populate = repoEl => {
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
      this.loadRepoLogo(repo, repoLogo)

      const removeButton = repoEl.querySelector('.remove-repository-button')
      removeButton.addEventListener('click', e => this.removeRepository(e, i))
    }
    this.loadTemplate(this.repoTemplate, this.reposContainer, populate, subsequentNode)
  }

  removeProject(event, i) {
    this.removeShortcut(event, i, '.project-container')
  }

  removeRepository(event, i) {
    this.removeShortcut(event, i, '.repository-container')
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
          this.addRepository(i, repo, options[`defaultBranch${i}`])
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
