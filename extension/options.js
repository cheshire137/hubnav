class OptionsPage {
  constructor() {
    this.findElements()
  }

  findElements() {
    this.repoInput = document.getElementById('repository')
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
    if (window.location.hash === '#select-repository') {
      this.repoInput.focus()
    }
  }

  hookUpHandlers() {
    this.optionsForm.addEventListener('submit', e => this.onSubmit(e))
    this.submitButton.addEventListener('click', e => e.currentTarget.blur())
  }

  onSubmit(event) {
    event.preventDefault()
    const options = {
      repository: this.repoInput.value
    }
    HubnavStorage.save(options).then(() => this.flashSaveNotice())
  }

  restoreOptions() {
    HubnavStorage.load().then(options => {
      this.repoInput.value = options.repository || ''
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
