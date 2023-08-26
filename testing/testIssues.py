
import requests
# GitHub API token for authenticated requests (optional but recommended)
api_token = os.getenv('GITHUB_TOKEN')

# GitHub repository info
owner = "astronomer"
repo = "astronomer-cosmos"

# Base URL for GitHub API
base_url = f"https://api.github.com/repos/{owner}/{repo}/issues"

# Headers for the API request
headers = {
    "Authorization": f"token {api_token}",
    "Accept": "application/vnd.github.v3+json",
}

# List to store all issues
all_issues = []

# Pagination setup
page_number = 1
per_page = 100  # Max allowed is 100

while True:
    # Make the API request
    params = {
        "page": page_number,
        "per_page": per_page,
        "state": "all",  # Fetch all issues (open and closed)
    }
    response = requests.get(base_url, headers=headers, params=params)
    issues = response.json()

    # Break the loop if we have no more issues to fetch
    if len(issues) == 0:
        break

    # Append the issues to our all_issues list
    all_issues.extend(issues)

    # Move on to the next page
    page_number += 1

# Now all_issues contains all the issues from the repo
print(f"Fetched {len(all_issues)} issues from {owner}/{repo}.")


# After fetching all issues in `all_issues` list
with open('issues_list.txt', 'w') as f:
    for issue in all_issues:
        issue_number = issue.get('number', 'N/A')
        issue_title = issue.get('title', 'N/A')
        f.write(f"Issue #{issue_number}: {issue_title}\n")
