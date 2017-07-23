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
    for (let i = 1; i <= 4; i++) {
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
    this.repoInput1 = document.getElementById('repository1')
    this.repoInput2 = document.getElementById('repository2')
    this.repoInput3 = document.getElementById('repository3')
    this.repoInput4 = document.getElementById('repository4')
    this.defaultBranchInput1 = document.getElementById('default-branch1')
    this.defaultBranchInput2 = document.getElementById('default-branch2')
    this.defaultBranchInput3 = document.getElementById('default-branch3')
    this.defaultBranchInput4 = document.getElementById('default-branch4')
    this.repoLogo1 = document.getElementById('repo-logo1')
    this.repoLogo2 = document.getElementById('repo-logo2')
    this.repoLogo3 = document.getElementById('repo-logo3')
    this.repoLogo4 = document.getElementById('repo-logo4')
    this.orgInput = document.getElementById('organization')
    this.orgLogo = document.getElementById('org-logo')
    this.optionsForm = document.getElementById('options-form')
    this.notification = document.getElementById('notification')
    this.versionEl = document.getElementById('extension-version')
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

  focusField() {
    const hash = window.location.hash
    if (hash === '#select-repository') {
      this.repoInput1.focus()
    } else if (hash === '#select-organization') {
      this.orgInput.focus()
    }
  }

  getManifest() {
    const url = chrome.extension.getURL('manifest.json')
    return window.fetch(url).then(response => response.json())
  }

  hookUpHandlers() {
    for (let i = 1; i <= 4; i++) {
      this[`repoInput${i}`].addEventListener('keyup', e => this.onRepoKeyup(e, i))
      this[`defaultBranchInput${i}`].addEventListener('keyup', e => this.onDefaultBranchKeyup(e, i))
      this[`repoLogo${i}`].addEventListener('load', () => this.onRepoLogoLoad(i))
      this[`repoLogo${i}`].addEventListener('error', () => this.onRepoLogoError(i))
    }
    this.optionsForm.addEventListener('submit', e => this.onSubmit(e))
    this.orgInput.addEventListener('keyup', e => this.onOrgKeyup(e))
    this.orgLogo.addEventListener('load', () => this.onOrgLogoLoad())
    this.orgLogo.addEventListener('error', () => this.onOrgLogoError())
  }

  loadOrgLogo(rawOrg) {
    const org = encodeURIComponent(rawOrg)
    this.orgLogo.src = `https://github.com/${org}.png`
    this.orgLogo.alt = org
  }

  loadRepoLogo(rawRepo, i) {
    let user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
      user = encodeURIComponent(user)
      this[`repoLogo${i}`].src = `https://github.com/${user}.png`
      this[`repoLogo${i}`].alt = user
    }
  }

  showBadOrgLogo() {
    this.orgLogo.src = 'bad-user.png'
    this.orgLogo.alt = ''
  }

  showDefaultOrgLogo() {
    this.orgLogo.src = 'unknown-user.png'
    this.orgLogo.alt = ''
  }

  showBadRepoLogo(i) {
    this[`repoLogo${i}`].src = 'bad-user.png'
    this[`repoLogo${i}`].alt = ''
  }

  showDefaultRepoLogo(i) {
    this[`repoLogo${i}`].src = 'unknown-user.png'
    this[`repoLogo${i}`].alt = ''
  }

  onOrgKeyup(event) {
    if (this.orgInputTimer) {
      clearTimeout(this.orgInputTimer)
    }
    this.orgInputTimer = setTimeout(() => {
      this.setOrgLogoSource()
      this.checkFormValidity()
    }, 750)
  }

  onDefaultBranchKeyup(event, i) {
    if (this[`defaultBranchTimer${i}`]) {
      clearTimeout(this[`defaultBranchTimer${i}`])
    }
    this[`defaultBranchTimer${i}`] = setTimeout(() => {
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

  onRepoLogoLoad(i) {
    if (this.isBadLogo(this[`repoLogo${i}`].src)) {
      return
    }
    delete this.errors[`repositoryLogo${i}`]
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
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

  onOrgLogoLoad() {
    if (this.isBadLogo(this.orgLogo.src)) {
      return
    }
    delete this.errors.organizationLogo
    if (!this.anyErrors()) {
      this.optionsForm.classList.remove('error')
    }
  }

  onOrgLogoError() {
    this.showBadOrgLogo()
    this.errors.organizationLogo = true
    const org = encodeURIComponent((this.orgInput.value || '').trim())
    this.flashErrorMessage(`Can't find organization "${org}"`)
    this.checkFormValidity()
  }

  setOrgLogoSource() {
    const org = (this.orgInput.value || '').trim()
    if (org.length < 1) {
      this.showDefaultOrgLogo()
    } else {
      this.loadOrgLogo(org)
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
      const organization = (this.orgInput.value || '').trim()
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
      let defaultBranch = currentOptions.defaultBranch
      if (!defaultBranch || defaultBranch.length < 1) {
        if (defaultBranch1.length > 0) {
          defaultBranch = defaultBranch1
        } else if (defaultBranch2.length > 0) {
          defaultBranch = defaultBranch2
        } else if (defaultBranch3.length > 0) {
          defaultBranch = defaultBranch3
        } else if (defaultBranch4.length > 0) {
          defaultBranch = defaultBranch4
        }
      }
      const newOptions = { repository, repository1, repository2, repository3, repository4,
                           organization, defaultBranch1, defaultBranch2, defaultBranch3,
                           defaultBranch4, defaultBranch }
      HubnavStorage.save(newOptions).then(() => this.flashSaveNotice())
    })
  }

  restoreOptions() {
    HubnavStorage.load().then(options => {
      for (let i = 1; i <= 4; i++) {
        const repo = options[`repository${i}`]
        if (repo && repo.length > 0) {
          this[`repoInput${i}`].value = repo
          this.loadRepoLogo(repo, i)
        }
        this[`defaultBranchInput${i}`].value = options[`defaultBranch${i}`] || 'master'
      }
      if (options.organization && options.organization.length > 0) {
        this.orgInput.value = options.organization
        this.loadOrgLogo(options.organization)
      }
    })
  }

  setup() {
    this.focusField()
    this.hookUpHandlers()
    this.restoreOptions()
    this.getManifest().then(manifest => {
      this.versionEl.textContent = manifest.version
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new OptionsPage()
  page.setup()
})
