# Digital Garden Memory

## Git workflow
- **Never use Co-Authored-By in commits.** Commits are always Maaike's. Claude is not an author.
- **Always ask before pushing** to remote. Don't push autonomously.
- Previous commit removed all Claude author attribution from git history

## Content preferences
- Never use em-dashes
- Sentence case for titles
- "Tended" instead of "Updated" for garden language
- ai field: "100% Maai" for Maaike's own content

## YouTube channel
- Channel: Convocat (www.youtube.com/convocat)
- WebFetch doesn't work for YouTube (consent redirect). Use Chrome MCP instead.
- Upload date extraction: `document.querySelector('meta[itemprop="uploadDate"]')?.content`
- 27 videos currently added to the garden

## Dev server
- Needs restart when new content collection files are added
- Config in `.claude/launch.json`, name: "digital-garden", port 4321
- **When Maaike asks to "show" something, render it on localhost** using the preview tools. Don't just read the file back to her.

## Collaboration patterns
- [Backend bias](feedback_backend_bias.md) - Claude defaults to infrastructure over content tasks
- [Setup first](feedback_setup_first.md) - Always configure prerequisites before triggering new features
- [Understand before doing](feedback_understand_before_doing.md) - Research ALL config options before using a new feature

## Active projects
- [Claude features x garden](project_claude_features_garden.md) - Practical demos of new Claude features on the garden (March 2026)
