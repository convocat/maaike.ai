# Garden workflow

This document describes how content moves from idea to published post in the digital garden.

## The guiding principle: meaningful friction

Not all content needs the same amount of ceremony. Jottings should be instant. Articles deserve a deliberate publication moment. The workflow reflects that difference.

## Content types and their paths

| Content type | Branch | PR | LinkedIn |
|---|---|---|---|
| Articles | ✅ | ✅ | new posts only |
| Projects | ✅ | ✅ | no |
| Major redesigns | ✅ | ✅ | no |
| Field notes | no | no | no |
| Seeds | no | no | no |
| Jottings | no | no | new posts only |
| Weblinks | no | no | no |

## Articles

1. Create a branch: `git checkout -b draft/your-article-slug`
2. Write and iterate on the post in `src/content/articles/`
3. When ready: open a pull request to `main`
4. Review the diff as your editorial check
5. Merge. GitHub Actions handles the rest: tags, backlinks, OG image, LinkedIn.

LinkedIn only fires for new files (first publish). Revisions to existing articles do not post to LinkedIn.

## Projects

1. Create a branch: `git checkout -b project/project-slug`
2. Add the hub post and any initial project files
3. Open a PR when the project is ready to go live
4. Merge. Tagging and backlinks run automatically.

Ongoing project files (experiments, field notes linked to a project) can be added directly to main after the initial hub is published.

## Major redesigns

1. Create a branch: `git checkout -b redesign/feature-name`
2. Work on the redesign locally, test with `npm run dev`
3. Open a PR when stable
4. Merge to deploy

## Field notes and seeds

Push directly to main. These are intentionally scrappy and garden-like. No branch needed.

Use `draft: true` in frontmatter while actively drafting. Remove it when ready to publish.

## Jottings

Push directly to main. Jottings are instant by design.

New jottings automatically trigger LinkedIn sharing. Updates do not.

## Weblinks

Push directly to main. No LinkedIn, no branch. The `share-link.yml` GitHub workflow also supports quick weblink creation via manual dispatch.

## Automation summary

All pushes and PR merges to `main` run:
- Tag resolution
- Backlink computation
- OG image generation

Additionally:
- PR merge with a new article file (`on-article-publish.yml`): LinkedIn post
- Direct push with a new jotting file (`on-jotting-push.yml`): LinkedIn post

New vs updated is detected by git file status: `A` (added) triggers LinkedIn, `M` (modified) does not.

## Setting up LinkedIn auto-posting

The LinkedIn workflows require two GitHub secrets. Add them in **repo Settings > Secrets and variables > Actions**:

| Secret | Value |
|---|---|
| `LINKEDIN_ACCESS_TOKEN` | OAuth access token from your LinkedIn app |
| `LINKEDIN_MEMBER_URN` | Optional. Your LinkedIn member URN (`urn:li:person:...`). Auto-fetched if not set. |

If the secrets are not configured, the workflows run but skip the LinkedIn step gracefully with a log message.

**Token expiry:** LinkedIn access tokens expire after 60 days. Refresh the `LINKEDIN_ACCESS_TOKEN` secret when it expires.

## Custom LinkedIn post text

Add a `<div class="linkedin">` block anywhere in a post body to override the auto-generated text (title + description):

```html
<div class="linkedin">
Your custom LinkedIn post text here.
</div>
```

The block is hidden on the published site but renders as a sage green card in Typora. If no block is present, the post title and description are used automatically.

## Branch naming conventions

| Type | Pattern | Example |
|---|---|---|
| Article draft | `draft/slug` | `draft/context-engineering-design` |
| Project | `project/slug` | `project/book-recommender` |
| Redesign | `redesign/name` | `redesign/stream-homepage` |
