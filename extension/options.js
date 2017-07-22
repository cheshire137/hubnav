class OptionsPage {
  constructor() {
    this.findElements()
  }

  findElements() {
    this.repoInput = document.getElementById('repository')
    this.optionsForm = document.getElementById('options-form')
    this.saveNotice = document.getElementById('save-notice')
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

  handleFormSubmit() {
    this.optionsForm.addEventListener('submit', e => this.onSubmit(e))
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
    this.handleFormSubmit()
    this.restoreOptions()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new OptionsPage()
  page.setup()
})
