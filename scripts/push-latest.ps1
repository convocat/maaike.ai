# push-latest.ps1
# Finds the most recently modified content file, commits it, and pushes to main.
# Assign this to a keyboard shortcut via a desktop .lnk for one-key publishing.

$repoRoot = Split-Path -Parent $PSScriptRoot

Set-Location $repoRoot

# Find most recently modified .md file in src/content/
$latest = Get-ChildItem -Path "src\content" -Recurse -Filter "*.md" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $latest) {
    [System.Windows.Forms.MessageBox]::Show("No content files found.", "Push latest") | Out-Null
    exit 1
}

# Extract title from frontmatter for the commit message
$content = Get-Content $latest.FullName -Raw
$title = ""
if ($content -match 'title:\s+"?([^"\n]+)"?') {
    $title = $matches[1].Trim()
} else {
    $title = $latest.BaseName
}

$relPath = $latest.FullName.Replace("$repoRoot\", "").Replace("\", "/")
$commitMsg = "Tend: $title"

# Stage, commit, push
git add $relPath
$status = git status --porcelain $relPath

if (-not $status) {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show("No changes to commit in:`n$relPath", "Push latest") | Out-Null
    exit 0
}

git commit -m $commitMsg
git push origin main

Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.MessageBox]::Show("Pushed: $title`n`n$relPath", "Push latest") | Out-Null
