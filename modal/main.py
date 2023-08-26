import os
from dataclasses import dataclass

from fastapi import Depends, HTTPException, status, Request

from modal import Stub, Secret, web_endpoint, Image

from issue_dedupe import check_for_dupes

import json

stub = Stub()

custom_image = Image.debian_slim().pip_install("pygithub", "pymongo", "cohere")

GITHUB_APP_ID = 381420


@dataclass
class IssueInput:
    repo_id: int
    repo_name: str
    issue_number: int
    title: str
    body: str

def pretty_print_object(obj):
    attributes = obj.__dict__
    return '\n\n'.join(f"{key}: {value}" for key, value in attributes.items())


def handle_pr(cohere_client, mongo_client, issue_input: IssueInput, post_process=False):
    """
    Handles PRs.
    """
    print(f"Handling pr {issue_input.issue_number} in {issue_input.repo_id}")
    text = f"{issue_input.title}\n\n{issue_input.body}"

    # write the issue id, repo id to mongodb
    doc = {
        "type": "pr",
        "repoId": issue_input.repo_id,
        "repoName": issue_input.repo_name,
        "issueNumber": issue_input.issue_number,
    }

    mongo_client["backseat"]["pull_requests"].update_one(
        {
            "type": "pr",
            "repoId": issue_input.repo_id,
            "issueNumber": issue_input.issue_number,
        },
        {
            "$set": doc,
        },
        upsert=True,
    )

    print("Wrote issue to pull_requests collection")

    # get the issue's embeddings
    cohere_response = cohere_client.embed(
        texts=[text],
        model="small",
    )

    print("Got embeddings")

    doc = {
        "type": "pr",
        "repoId": issue_input.repo_id,
        "repoName": issue_input.repo_name,
        "text": text,
        "issueNumber": issue_input.issue_number,
        "cohereSmallEmbedding": cohere_response.embeddings[0],
    }

    update = {
        "$set": doc,
    }

    mongo_client["backseat"]["embeddings"].update_one(
        {
            "type": "pr",
            "repoId": issue_input.repo_id,
            "issueNumber": issue_input.issue_number,
        },
        update,
        upsert=True,
    )

    print("Wrote embedding to MongoDB")

    if post_process:
        print("post process prs")

def handle_issue(
    cohere_client, mongo_client, issue_input: IssueInput, post_process=True
):
    """
    Handles issues.
    """
    print(f"Handling issue {issue_input.issue_number} in {issue_input.repo_id}")
    text = f"{issue_input.title}\n\n{issue_input.body}"

    # write the issue id, repo id to mongodb
    doc = {
        "type": "issue",
        "repoId": issue_input.repo_id,
        "repoName": issue_input.repo_name,
        "issueNumber": issue_input.issue_number,
    }

    mongo_client["backseat"]["issues"].update_one(
        {
            "type": "issue",
            "repoId": issue_input.repo_id,
            "issueNumber": issue_input.issue_number,
        },
        {
            "$set": doc,
        },
        upsert=True,
    )

    print("Wrote issue to issues collection")

    # get the issue's embeddings
    cohere_response = cohere_client.embed(
        texts=[text],
        model="small",
    )

    print("Got embeddings")

    doc = {
        "type": "issue",
        "repoId": issue_input.repo_id,
        "repoName": issue_input.repo_name,
        "text": text,
        "issueNumber": issue_input.issue_number,
        "cohereSmallEmbedding": cohere_response.embeddings[0],
    }

    update = {
        "$set": doc,
    }

    mongo_client["backseat"]["embeddings"].update_one(
        {
            "type": "issue",
            "repoId": issue_input.repo_id,
            "issueNumber": issue_input.issue_number,
        },
        update,
        upsert=True,
    )

    print("Wrote embedding to MongoDB")

    if post_process:
        check_for_dupes(
            issue_input.repo_id,
            issue_input.issue_number,
        )


@dataclass
class IssueCommentInput:
    repo_id: int
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
        f"Handling issue comment {issue_comment_input.issue_number} in {issue_comment_input.repo_id}"
    )

    original_issue = mongo_client["backseat"]["embeddings"].find_one(
        {
            "type": "issue",
            "repoId": issue_comment_input.repo_id,
            "issueNumber": issue_comment_input.issue_number,
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
        "repoId": issue_comment_input.repo_id,
        "repoName": original_issue["repoName"],
        "text": text,
        "issueNumber": issue_comment_input.issue_number,
        "cohereSmallEmbedding": cohere_response.embeddings[0],
    }

    update = {
        "$set": doc,
    }

    mongo_client["backseat"]["embeddings"].update_one(
        {
            "type": "issue",
            "repoId": issue_comment_input.repo_id,
            "issueNumber": issue_comment_input.issue_number,
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

    print("Found issues")

    for issue in issues:
        # don't handle PRs
        if issue.pull_request is not None:
            #print(json.dumps(issue, indent=4))
            prObj = issue.as_pull_request()
            #print(', '.join("%s: %s" % item for item in vars(prObj).items()))
            #print(pretty_print_object(prObj))
            #print(json.dumps(prObj._rawData, indent=2))
            title = prObj.title
            body = prObj.body
            files = prObj.get_files()
            for filee in files:
                #print(json.dumps(filee._rawData, indent=2))
                body += "  " + filee.patch
            
            handle_pr(
                cohere_client,
                mongo_client,
                IssueInput(
                    repo_id=gh_repo.id,
                    repo_name=repo_name,
                    issue_number=issue.number,
                    title=title,
                    body=body,
                )
            )
        else:
            handle_issue(
                cohere_client,
                mongo_client,
                IssueInput(
                    repo_id=gh_repo.id,
                    repo_name=repo_name,
                    issue_number=issue.number,
                    title=issue.title,
                    body=issue.body,
                ),
                post_process=False,
            )

    print("Done handling installation")

    for issue in issues:
        # don't handle PRs
        if issue.pull_request is not None:
            continue

        check_for_dupes(
            gh_repo.id,
            issue.number,
        )

    print("Done postprocessing")


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

    from github import Github, GithubIntegration

    app = GithubIntegration(GITHUB_APP_ID, os.getenv("GITHUB_APP_PRIVATE_KEY"))
    print("Got integration")

    repo_name = body.get("repository").get("full_name")

    owner = repo_name.split("/")[0]
    repo = repo_name.split("/")[1]

    installation = app.get_installation(owner, repo)
    installation_token = app.get_access_token(installation.id).token

    print(f"Installation token: {installation_token}")

    github = Github(installation_token)

    # list issues
    gh_repo = github.get_repo(repo_name)

    match event_type:
        case "issues":
            issue_body = body.get("issue").get("body")
            handle_issue(
                cohere_client,
                mongo_client,
                IssueInput(
                    repo_id=body.get("repository").get("id"),
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
                    repo_id=body.get("repository").get("id"),
                    repo_name=body.get("repository").get("full_name"),
                    issue_number=body.get("issue").get("number"),
                    comment=body.get("comment").get("body"),
                ),
            )

        case "push":
            print("Push event")

        case "pull_request":
            print("Pull request event")

            #print(json.dumps(issue, indent=4))

            prObj = gh_repo.get_issue(body.get("pull_request").get("number")).as_pull_request()
            #print(', '.join("%s: %s" % item for item in vars(prObj).items()))
            #print(pretty_print_object(prObj))
            #print(json.dumps(prObj._rawData, indent=2))
            title = prObj.title
            body = prObj.body
            if body is None:
                body = ""
            files = prObj.get_files()
            for filee in files:
                #print(json.dumps(filee._rawData, indent=2))
                body += "  " + filee.patch
            
            handle_pr(
                cohere_client,
                mongo_client,
                IssueInput(
                    repo_id=gh_repo.id,
                    repo_name=repo_name,
                    issue_number=prObj.number,
                    title=title,
                    body=body,
                )
            )

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
