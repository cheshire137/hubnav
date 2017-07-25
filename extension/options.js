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
        this.flashErrorMessage(`Invalid repository: #${i}`)
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
    for (let i of USER_SHORTCUTS) {
      this[`userInput${i}`] = document.getElementById(`user${i}`)
      this[`userLogo${i}`] = document.getElementById(`user-logo${i}`)
    }
    this.shortcutTipContainer = document.getElementById('shortcut-tip-container')
    this.shortcut = document.getElementById('shortcut')
    this.optionsForm = document.getElementById('options-form')
    this.notification = document.getElementById('notification')
    this.versionEl = document.getElementById('extension-version')
    this.closedIssues = document.getElementById('closed-issues')
    this.newIssue = document.getElementById('new-issue')
    this.mergedPullRequests = document.getElementById('merged-pull-requests')
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
    for (let i of USER_SHORTCUTS) {
      this[`userInput${i}`].addEventListener('keyup', e => this.onUserKeyup(e, i))
      this[`userLogo${i}`].addEventListener('load', () => this.onUserLogoLoad(i))
      this[`userLogo${i}`].addEventListener('error', () => this.onUserLogoError(i))
    }
    this.optionsForm.addEventListener('submit', e => this.onSubmit(e))
    this.closedIssues.addEventListener('change', () => this.checkFormValidity())
    this.newIssue.addEventListener('change', () => this.checkFormValidity())
    this.mergedPullRequests.addEventListener('change', () => this.checkFormValidity())
    this.newPullRequest.addEventListener('change', () => this.checkFormValidity())
  }

  loadRepoLogo(rawRepo, i) {
    let user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
      user = encodeURIComponent(user)
      this[`repoLogo${i}`].src = `https://github.com/${user}.png?size=72`
      this[`repoLogo${i}`].alt = user
    }
  }

  loadUserLogo(rawUser, i) {
    const user = encodeURIComponent(rawUser)
    this[`userLogo${i}`].src = `https://github.com/${user}.png?size=72`
    this[`userLogo${i}`].alt = user
  }

  showBadRepoLogo(i) {
    this[`repoLogo${i}`].src = 'bad-user.png'
    this[`repoLogo${i}`].alt = ''
  }

  showBadUserLogo(i) {
    this[`userLogo${i}`].src = 'bad-user.png'
    this[`userLogo${i}`].alt = ''
  }

  showDefaultUserLogo(i) {
    this[`userLogo${i}`].src = 'unknown-user.png'
    this[`userLogo${i}`].alt = ''
  }

  showDefaultRepoLogo(i) {
    this[`repoLogo${i}`].src = 'unknown-user.png'
    this[`repoLogo${i}`].alt = ''
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

  onRepoKeyup(event, i) {
    if (this[`repoInput${i}Timer`]) {
      clearTimeout(this[`repoInput${i}Timer`])
    }
    this[`repoInput${i}Timer`] = setTimeout(() => {
      this.setRepoLogoSource(i)
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

  onRepoLogoLoad(i) {
    if (this.isBadLogo(this[`repoLogo${i}`].src)) {
      return
    }
    delete this.errors[`repositoryLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onUserLogoError(i) {
    this.showBadUserLogo(i)
    this.errors[`userLogo${i}`] = true
    const user = encodeURIComponent((this[`userInput${i}`].value || '').trim())
    this.flashErrorMessage(`Invalid user: can't find "${user}"`)
    this.checkFormValidity()
  }

  onRepoLogoError(i) {
    this.showBadRepoLogo(i)
    this.errors[`repositoryLogo${i}`] = true
    const repo = (this[`repoInput${i}`].value || '').trim()
    const user = encodeURIComponent(repo.split('/')[0] || '')
    this.flashErrorMessage(`Invalid repository #${i}: can't find "${user}"`)
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
      const user8 = (this.userInput8.value || '').trim()
      const user9 = (this.userInput9.value || '').trim()
      const user0 = (this.userInput0.value || '').trim()
      const closedIssues = this.closedIssues.checked
      const newIssue = this.newIssue.checked
      const mergedPullRequests = this.mergedPullRequests.checked
      const newPullRequest = this.newPullRequest.checked
      const newOptions = { repository, repository1, repository2, repository3, repository4,
                           defaultBranch1, defaultBranch2, defaultBranch3,
                           defaultBranch4, defaultBranch, closedIssues, newIssue,
                           mergedPullRequests, newPullRequest, user8, user9, user0 }
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
      for (let i of USER_SHORTCUTS) {
        const user = options[`user${i}`]
        if (user && user.length > 0) {
          this[`userInput${i}`].value = user
          this.loadUserLogo(user, i)
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
      if (typeof options.newPullRequest === 'boolean') {
        this.newPullRequest.checked = options.newPullRequest
      } else {
        this.newPullRequest.checked = true
      }
    })
  }

  setup() {
    this.repoInput1.focus()
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
