class OptionsPage {
  constructor() {
    this.findElements()
  }

  findElements() {
    this.repoInput = document.getElementById('repository')
    this.orgInput = document.getElementById('organization')
    this.orgLogo = document.getElementById('org-logo')
    this.optionsForm = document.getElementById('options-form')
    this.saveNotice = document.getElementById('save-notice')
    this.submitButton = document.getElementById('submit-button')
  }

  flashSaveNotice() {
    this.saveNotice.style.display = 'block'
    setTimeout(() => {
      this.saveNotice.style.display = 'none'
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
    this.orgInput.addEventListener('keyup', e => this.onOrgKeyup(e))
    this.orgLogo.addEventListener('load', () => this.onOrgLogoLoad())
    this.orgLogo.addEventListener('error', () => this.showDefaultOrgLogo())
  }

  loadOrgLogo(rawOrg) {
    const org = encodeURIComponent(rawOrg)
    this.orgLogo.src = `https://github.com/${org}.png`
    this.orgLogo.alt = org
  }

  showDefaultOrgLogo() {
    this.orgLogo.src = 'unknown-org.png'
    this.orgLogo.alt = ''
  }

  onOrgKeyup(event) {
    if (this.orgInputTimer) {
      clearTimeout(this.orgInputTimer)
    }
    this.orgInputTimer = setTimeout(() => {
      this.setOrgLogoSource()
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

  onSubmit(event) {
    event.preventDefault()
    const options = {
      repository: (this.repoInput.value || '').trim(),
      organization: (this.orgInput.value || '').trim()
    }
    HubnavStorage.save(options).then(() => this.flashSaveNotice())
  }

  restoreOptions() {
    HubnavStorage.load().then(options => {
      this.repoInput.value = options.repository || ''
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
