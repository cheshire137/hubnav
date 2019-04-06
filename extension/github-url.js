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

  repositoryProjects(nameWithOwner) {
    return `${this.repository(nameWithOwner)}/projects`
  }

  userProjects(rawUser) {
    const user = encodeURIComponent(rawUser)
    return `${this.baseUrl}/users/${user}/projects`
  }

  userProject(rawUser, rawNumber) {
    const user = encodeURIComponent(rawUser)
    const number = encodeURIComponent(rawNumber)
    return `${this.baseUrl}/users/${user}/projects/${number}?fullscreen=true`
  }

  organizationProject(rawOrg, rawNumber) {
    const org = encodeURIComponent(rawOrg)
    const number = encodeURIComponent(rawNumber)
    return `${this.baseUrl}/orgs/${org}/projects/${number}?fullscreen=true`
  }

  repositoryProject(repo, rawNumber) {
    const number = encodeURIComponent(rawNumber)
    return `${this.repository(repo)}/projects/${number}?fullscreen=true`
  }

  organizationProjectIssues(org, number, options) {
    const query = this.issuesQuery(options)
    return `${this.organizationProject(org, number)}&card_filter_query=${query}`
  }

  organizationProjectPullRequests(org, number, options) {
    const query = this.pullRequestsQuery(options)
    return `${this.organizationProject(org, number)}&card_filter_query=${query}`
  }

  userProjectIssues(user, number, options) {
    const query = this.issuesQuery(options)
    return `${this.userProject(user, number)}&card_filter_query=${query}`
  }

  repositoryProjectIssues(repo, number, options) {
    const query = this.issuesQuery(options)
    return `${this.repositoryProject(repo, number)}&card_filter_query=${query}`
  }

  userProjectPullRequests(user, number, options) {
    const query = this.pullRequestsQuery(options)
    return `${this.userProject(user, number)}&card_filter_query=${query}`
  }

  repositoryProjectPullRequests(repo, number, options) {
    const query = this.pullRequestsQuery(options)
    return `${this.repositoryProject(repo, number)}&card_filter_query=${query}`
  }

  issuesQuery(options) {
    let query = 'is%3Aissue'
    if (options.closed) {
      query += '+is%3Aclosed'
    } else {
      query += '+is%3Aopen'
    }
    return query
  }

  pullRequestsQuery(options) {
    let query = 'is%3Apr'
    if (options.merged) {
      query += '+is%3Amerged'
    } else if (options.closed) {
      query += '+is%3Aclosed+is%3Aunmerged'
    } else {
      query += '+is%3Aopen'
    }
    return query
  }

  team(rawOrg, rawName) {
    const org = encodeURIComponent(rawOrg)
    const name = encodeURIComponent(rawName)
    return `${this.baseUrl}/orgs/${org}/teams/${name}`
  }

  teamMembers(rawOrg, rawName) {
    return `${this.team(rawOrg, rawName)}/members`
  }

  teamRepositories(rawOrg, rawName) {
    return `${this.team(rawOrg, rawName)}/repositories`
  }

  teams(rawOrg) {
    const org = encodeURIComponent(rawOrg)
    return `${this.baseUrl}/orgs/${org}/teams`
  }

  milestone(repo, rawNumber, options) {
    const number = encodeURIComponent(rawNumber)
    let path = ''
    if (options && options.closed) {
      path = '?closed=1'
    }
    return `${this.repository(repo)}/milestone/${number}${path}`
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

  repositoryPullRequests(repo, options) {
    let path = ''
    if (options.merged) {
      path = '/pulls?utf8=✓&q=is%3Apr%20is%3Amerged'
    } else if (options.new) {
      path = '/compare'
    } else if (options.closed) {
      path = '/pulls?utf8=✓&q=is%3Apr%20is%3Aclosed+is%3Aunmerged'
    } else {
      path = '/pulls'
    }
    return `${this.repository(repo)}${path}`
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
