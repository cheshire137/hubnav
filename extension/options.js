class OptionsPage {
  constructor() {
    this.findElements()
  }

  isValidRepo(repo) {
    if (repo.length < 1) {
      return true
    }
    const slashIndex = repo.indexOf('/')
    return slashIndex > 0 && slashIndex < repo.length - 1
  }

  checkRepoValidity() {
    const repo = (this.repoInput.value || '').trim()
    if (this.isValidRepo(repo)) {
      this.optionsForm.classList.remove('error')
      this.submitButton.disabled = false
    } else {
      this.optionsForm.classList.add('error')
      this.flashErrorMessage('Invalid repository')
      this.submitButton.disabled = true
    }
  }

  findElements() {
    this.repoInput = document.getElementById('repository')
    this.repoLogo = document.getElementById('repo-logo')
    this.orgInput = document.getElementById('organization')
    this.orgLogo = document.getElementById('org-logo')
    this.optionsForm = document.getElementById('options-form')
    this.notification = document.getElementById('notification')
    this.submitButton = document.getElementById('submit-button')
  }

  flashSaveNotice() {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer)
    }
    this.notification.classList.remove('error')
    this.notification.textContent = 'Saved!'
    this.notification.style.display = 'block'
    this.notificationTimer = setTimeout(() => {
      this.notification.style.display = 'none'
    }, 1500)
  }

  flashErrorMessage(message) {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer)
    }
    this.notification.classList.add('error')
    this.notification.textContent = message
    this.notification.style.display = 'block'
    this.notificationTimer = setTimeout(() => {
      this.notification.style.display = 'none'
    }, 1500)
  }

  focusField() {
    const hash = window.location.hash
    if (hash === '#select-repository') {
      this.repoInput.focus()
    } else if (hash === '#select-organization') {
      this.orgInput.focus()
    }
  }

  hookUpHandlers() {
    this.optionsForm.addEventListener('submit', e => this.onSubmit(e))
    this.submitButton.addEventListener('click', e => e.currentTarget.blur())
    this.repoInput.addEventListener('keyup', e => this.onRepoKeyup(e))
    this.orgInput.addEventListener('keyup', e => this.onOrgKeyup(e))
    this.repoLogo.addEventListener('error', () => this.showDefaultRepoLogo())
    this.orgLogo.addEventListener('error', () => this.showDefaultOrgLogo())
  }

  loadOrgLogo(rawOrg) {
    const org = encodeURIComponent(rawOrg)
    this.orgLogo.src = `https://github.com/${org}.png`
    this.orgLogo.alt = org
  }

  loadRepoLogo(rawRepo) {
    let user = rawRepo.split('/')[0]
    if (user && user.length > 0) {
      user = encodeURIComponent(user)
      this.repoLogo.src = `https://github.com/${user}.png`
      this.repoLogo.alt = user
    }
  }

  showDefaultOrgLogo() {
    this.orgLogo.src = 'unknown-org.png'
    this.orgLogo.alt = ''
  }

  showDefaultRepoLogo() {
    this.repoLogo.src = 'unknown-org.png'
    this.repoLogo.alt = ''
  }

  onOrgKeyup(event) {
    if (this.orgInputTimer) {
      clearTimeout(this.orgInputTimer)
    }
    this.orgInputTimer = setTimeout(() => {
      this.setOrgLogoSource()
    }, 750)
  }

  onRepoKeyup(event) {
    if (this.repoInputTimer) {
      clearTimeout(this.repoInputTimer)
    }
    this.repoInputTimer = setTimeout(() => {
      this.checkRepoValidity()
      this.setRepoLogoSource()
    }, 750)
  }

  setOrgLogoSource() {
    const org = (this.orgInput.value || '').trim()
    if (org.length < 1) {
      this.showDefaultOrgLogo()
    } else {
      this.loadOrgLogo(org)
    }
  }

  setRepoLogoSource() {
    const repo = (this.repoInput.value || '').trim()
    if (repo.length < 1) {
      this.showDefaultRepoLogo()
    } else {
      this.loadRepoLogo(repo)
    }
  }

  onSubmit(event) {
    event.preventDefault()
    if (this.optionsForm.classList.contains('error')) {
      return
    }
    const options = {
      repository: (this.repoInput.value || '').trim(),
      organization: (this.orgInput.value || '').trim()
    }
    HubnavStorage.save(options).then(() => this.flashSaveNotice())
  }

  restoreOptions() {
    HubnavStorage.load().then(options => {
      if (options.repository && options.repository.length > 0) {
        this.repoInput.value = options.repository
        this.loadRepoLogo(options.repository)
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
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new OptionsPage()
  page.setup()
})
