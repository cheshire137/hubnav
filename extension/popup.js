function openOptions(hash) {
  const url = `chrome-extension://${chrome.runtime.id}/options.html#${hash}`
  chrome.tabs.create({ url })
}

function openFileFinder() {
  HubnavStorage.load().then(options => {
    if (options.repository && options.repository.length > 0) {
      const parts = options.repository.split('/')
      const owner = encodeURIComponent(parts[0])
      const name = encodeURIComponent(parts[1])
      const url = `https://github.com/${owner}/${name}/find/master`
      chrome.tabs.create({ url })
    } else {
      openOptions('select-repository')
    }
  })
}

function openGlobalSearch() {
  const url = 'https://github.com/search/'
  chrome.tabs.create({ url })
}

function openTeams() {
  HubnavStorage.load().then(options => {
    if (options.organization && options.organization.length > 0) {
      const org = encodeURIComponent(options.organization)
      const url = `https://github.com/orgs/${org}/teams`
      chrome.tabs.create({ url })
    } else {
      openOptions('select-organization')
    }
  })
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'f') {
    openFileFinder()
  } else if (event.key === 't') {
    openTeams()
  } else if (event.key === 's') {
    openGlobalSearch()
  } else if (event.key === 'o') {
    openOptions('select-organization')
  } else if (event.key === 'r') {
    openOptions('select-repository')
  }
})

class PopupPage {
  constructor() {
    this.findElements()
  }

  findElements() {
    this.repoReferences = document.querySelectorAll('.repository')
    this.orgReferences = document.querySelectorAll('.organization')
  }

  setup() {
    HubnavStorage.load().then(options => {
      this.updateRepoReferences(options.repository)
      this.updateOrgReferences(options.organization)
    })
  }

  updateRepoReferences(repo) {
    if (repo && repo.length > 0) {
      for (let i = 0; i < this.repoReferences.length; i++) {
        this.repoReferences[i].textContent = repo
      }
    }
  }

  updateOrgReferences(org) {
    if (org && org.length > 0) {
      for (let i = 0; i < this.orgReferences.length; i++) {
        this.orgReferences[i].textContent = org
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new PopupPage()
  page.setup()
})
