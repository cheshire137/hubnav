class OptionsPage {
  constructor() {
    this.findElements()
  }

  findElements() {
    this.repoInput = document.getElementById('repository')
  }

  focusField() {
    if (window.location.hash === '#select-repository') {
      this.repoInput.focus()
    }
  }

  setup() {
    this.focusField()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new OptionsPage()
  page.setup()
})
