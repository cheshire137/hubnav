class GitHubUrl {
  constructor(githubUrl) {
    this.baseUrl = (githubUrl || 'https://github.com').replace(/\/+$/, '')
  }

  profile(rawLogin) {
    const login = encodeURIComponent(rawLogin)
    return `${this.baseUrl}/${login}`
  }

  repository(nameWithOwner) {
    const [rawOwner, rawName] = nameWithOwner.split('/')
    const owner = encodeURIComponent(rawOwner)
    const name = encodeURIComponent(rawName)
    return `${this.baseUrl}/${owner}/${name}`
  }

  team(rawOrg, rawName) {
    const org = encodeURIComponent(rawOrg)
    const name = encodeURIComponent(rawName)
    return `${this.baseUrl}/orgs/${org}/teams/${name}`
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

  repositoryIssues(repo, options) {
    let path = ''
    if (options.closed) {
      path = '?utf8=✓&q=is%3Aissue+is%3Aclosed'
    } else if (options.new) {
      path = '/new'
    }
    return `${this.repository(repo)}/issues${path}`
  }

  issues(options) {
    let params = '?utf8=✓&q=is%3Aissue'
    if (options.closed) {
      params += '+is%3Aclosed'
    } else {
      params += '+is%3Aopen'
    }
    if (options.user) {
      const user = encodeURIComponent(options.user)
      params += `+author%3A${user}`
    }
    if (options.repository) {
      const [rawOwner, rawName] = options.repository.split('/')
      const owner = encodeURIComponent(rawOwner)
      const name = encodeURIComponent(rawName)
      params += `+repo%3A${owner}%2F${name}`
    }
    if (options.organization) {
      const org = encodeURIComponent(options.organization)
      params += `+org%3A${org}`
    }
    return `${this.baseUrl}/issues${params}`
  }
}

window.GitHubUrl = GitHubUrl
