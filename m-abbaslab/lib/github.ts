const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_USERNAME = 'Mohabz35'

export async function getGitHubProjects() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`,
      {
        headers: GITHUB_TOKEN ? {
          'Authorization': `token ${GITHUB_TOKEN}`
        } : {}
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch repos')
    }

    const repos = await response.json()

    if (!Array.isArray(repos)) {
      return []
    }

    return repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language
    }))
  } catch (error) {
    console.error('GitHub fetch error:', error)
    return []
  }
}