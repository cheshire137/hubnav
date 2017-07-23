class GitHubAPI {
  constructor() {
    this.basePath = 'https://api.github.com/graphql'
  }

  static checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response
    }
    const error = new Error(response.statusText)
    error.response = response
    throw error
  }

  static parseJson(response) {
    return response.json()
  }

  getRepository(repo, query) {
    const parts = repo.split('/')
    const owner = parts[0]
    const name = parts[1]
    const params = `owner:"${owner}",name:"${name}"`
    return this.post(`query { repository(${params}) { ${query} } }`)
  }

  post(query, headers) {
    const data = { method: 'POST', headers }
    data.body = JSON.stringify({ query })
    return fetch(this.basePath, data).then(GitHubAPI.checkStatus).
      then(GitHubAPI.parseJson)
  }
}

window.GitHubAPI = GitHubAPI
