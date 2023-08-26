import os
from dataclasses import dataclass

from fastapi import Depends, HTTPException, status, Request

from modal import Stub, Secret, web_endpoint, Image

stub = Stub()

custom_image = Image.debian_slim().pip_install("pygithub", "pymongo", "cohere")

GITHUB_APP_ID = 381420


@dataclass
class IssueInput:
    repo_name: str
    issue_number: int
    title: str
    body: str


def handle_issue(cohere_client, mongo_client, issue_input: IssueInput):
    """
    Handles issues.
    """
    print(f"Handling issue {issue_input.issue_number} in {issue_input.repo_name}")
    text = f"{issue_input.title}\n\n{issue_input.body}"

    # get the issue's embeddings
    cohere_response = cohere_client.embed(
        texts=[text],
        model="small",
    )

    print("Got embeddings")

    doc = {
        "type": "issue",
        "text": text,
        "githubId": issue_input.issue_number,
        "cohereSmallEmbedding": cohere_response.embeddings[0],
    }

    update = {
        "$set": doc,
    }

    mongo_client["backseat"]["embeddings"].update_one(
        {
            "type": "issue",
            "githubId": issue_input.issue_number,
        },
        update,
        upsert=True,
    )

    print("Wrote to MongoDB")


@dataclass
class IssueCommentInput:
    repo_name: str
    issue_number: int
    comment: str


def handle_issue_comment(
    cohere_client, mongo_client, issue_comment_input: IssueCommentInput
):
    """
    Handles issue comments.
    """
    print(
        f"Handling issue comment {issue_comment_input.issue_number} in {issue_comment_input.repo_name}"
    )

    original_issue = mongo_client["backseat"]["embeddings"].find_one(
        {
            "type": "issue",
            "githubId": issue_comment_input.issue_number,
        },
    )

    if original_issue is None:
        print("Original issue not found")
        return

    text = original_issue["text"] + "\n\n" + issue_comment_input.comment

    # get the issue's embeddings
    cohere_response = cohere_client.embed(
        texts=[text],
        model="small",
    )

    print("Got embeddings")

    doc = {
        "type": "issue",
        "text": text,
        "githubId": issue_comment_input.issue_number,
        "cohereSmallEmbedding": cohere_response.embeddings[0],
    }

    update = {
        "$set": doc,
    }

    mongo_client["backseat"]["embeddings"].update_one(
        {
            "type": "issue",
            "githubId": issue_comment_input.issue_number,
        },
        update,
        upsert=True,
    )

    print("Wrote to MongoDB")


def handle_installation(cohere_client, mongo_client, repo_name: str):
    """
    Handles installation events.
    """
    from github import Github, GithubIntegration

    app = GithubIntegration(GITHUB_APP_ID, os.getenv("GITHUB_APP_PRIVATE_KEY"))
    print("Got integration")

    owner = repo_name.split("/")[0]
    repo = repo_name.split("/")[1]
    installation = app.get_installation(owner, repo)
    installation_token = app.get_access_token(installation.id).token

    print(f"Installation token: {installation_token}")

    github = Github(installation_token)

    # list issues
    gh_repo = github.get_repo(repo_name)
    issues = gh_repo.get_issues()

    print(f"Found issues")

    for issue in issues:
        # don't handle PRs
        if issue.pull_request is not None:
            continue

        handle_issue(
            cohere_client,
            mongo_client,
            IssueInput(
                repo_name=repo_name,
                issue_number=issue.number,
                title=issue.title,
                body=issue.body,
            ),
        )


@stub.function(secret=Secret.from_name("backseat"), image=custom_image)
@web_endpoint(method="POST")
async def github_app_webhook(
    request: Request,
):
    """
    Handles requests from the GitHub App.
    """
    event_type = request.headers.get("X-GitHub-Event")
    body = await request.json()

    # pretty-print body
    import json

    print(json.dumps(body, indent=4))

    import cohere
    from pymongo import MongoClient

    cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))
    mongo_client = MongoClient(os.getenv("MONGODB_URI"))

    match event_type:
        case "issues":
            issue_body = body.get("issue").get("body")
            handle_issue(
                cohere_client,
                mongo_client,
                IssueInput(
                    repo_name=body.get("repository").get("full_name"),
                    issue_number=body.get("issue").get("number"),
                    title=body.get("issue").get("title"),
                    body=issue_body,
                ),
            )

        case "issue_comment":
            handle_issue_comment(
                cohere_client,
                mongo_client,
                IssueCommentInput(
                    repo_name=body.get("repository").get("full_name"),
                    issue_number=body.get("issue").get("number"),
                    comment=body.get("comment").get("body"),
                ),
            )

        case "push":
            print("Push event")

        case "pull_request":
            print("Pull request event")

        case "installation":
            print("Installation event")

            action = body.get("action")
            if action == "created":
                handle_installation(
                    cohere_client,
                    mongo_client,
                    body.get("repositories")[0].get("full_name"),
                )

            elif action == "deleted":
                print("Installation deleted")

        case _:
            print("Unhandled event type: " + event_type)

    mongo_client.close()

    return {"status": "ok"}
