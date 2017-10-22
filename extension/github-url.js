class GitHubUrl {
  constructor(githubUrl) {
    this.baseUrl = (githubUrl || 'https://github.com').replace(/\/+$/, '')
  }

  repository(nameWithOwner) {
    const [rawOwner, rawName] = nameWithOwner.split('/')
    const owner = encodeURIComponent(rawOwner)
    const name = encodeURIComponent(rawName)
    return `${this.baseUrl}/${owner}/${name}`
  }

  teams(rawOrg) {
    const org = encodeURIComponent(rawOrg)
    return `${this.baseUrl}/orgs/${org}/teams`
  }

  search() {
    return `${this.baseUrl}/search`
  }

  fileFinder(repo, branch) {
    return `${this.repository(repo)}/find/${branch}`
  }
}

window.GitHubUrl = GitHubUrl
