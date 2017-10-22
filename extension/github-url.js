class GitHubUrl {
  constructor(githubUrl) {
    this.githubUrl = githubUrl || 'https://github.com'
  }

  teams(rawOrg) {
    const org = encodeURIComponent(rawOrg)
    return `${this.githubUrl}/orgs/${org}/teams`
  }
}

window.GitHubUrl = GitHubUrl
