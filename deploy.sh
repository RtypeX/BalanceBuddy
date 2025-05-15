#to be ran on the main branch. Build files will be sent to the gh-pages branch

#must commit any changes to the main branch before running this script

#after creating this doc, in the terminal, run 'chmod +x deploy.sh' to make it executable

#run using './deploy.sh' command in the terminal

#switch branches using 'git checkout branchName' i.e. gh_pages or main

#!/bin/bash

# Stop on errors
set -e

# Step 1: Check if we're on the main branch before proceeding
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "Error: Please run this script from the main branch. Currently on: $current_branch"
    exit 1
fi
echo "Confirmed on the main branch."

# Step 2: Build the Next.js app
# Ensure your next.config.js has `output: 'export'` for static site generation
# The build output will be in the 'out' directory.
echo "Building the Next.js app..."
npm run build

# Step 3: Verify the build was successful
if [ ! -d "out" ]; then # Changed from "build/web" to "out"
    echo "Error: Build folder 'out' not found. Make sure the build was successful and next.config.js is set for static export."
    exit 1
fi
echo "Build completed successfully. Output is in 'out' directory."

# Step 4: Create a temporary folder to store build files
TEMP_DIR=$(mktemp -d)
echo "Temporary directory created at: $TEMP_DIR"

# Copy the build folder to the temporary directory
echo "Copying the build folder ('out') to the temporary directory..."
cp -r out/* "$TEMP_DIR/" # Changed from "build/web" to "out"

# Step 5: Switch to gh-pages branch or create it if it doesn't exist
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "Switching to existing gh-pages branch..."
    git checkout gh-pages
else
    echo "Creating new gh-pages branch..."
    git checkout -b gh-pages
fi

# Step 6: Remove old files from gh-pages branch
echo "Cleaning up old files..."
git rm -rf . || true # Keep '|| true' to prevent error if nothing to remove

# Step 7: Remove existing directories that may cause conflicts (less relevant for Next.js 'out' structure but good practice)
echo "Removing potentially conflicting directories (e.g., _next, assets) if they exist..."
rm -rf _next assets # Common Next.js static export folders at root

# Step 8: Copy the files from the temporary directory to the root of gh-pages
echo "Copying build files to the root of gh-pages..."
cp -r "$TEMP_DIR"/* ./

# Step 9: Remove the empty 'out' folder if present after copy (should not be needed as we copy its contents)
# If 'out' itself was copied, this would be `rm -rf out`

# Step 10: Add, commit, and push the changes
echo "Committing and pushing changes to gh-pages..."
git add .
git commit -m "Deploy updated Next.js app to gh-pages"
git push origin gh-pages

# Step 11: Switch back to the main branch
echo "Switching back to the main branch..."
git checkout main

# Step 12: Clean up the temporary directory
rm -rf "$TEMP_DIR"
echo "Temporary directory cleaned up."

# Make sure to replace YOUR_GITHUB_USERNAME and YOUR_REPO_NAME with your actual GitHub username and repository name
echo "Deployment complete! Visit: https://rtypex.github.io/balanceBuddy/"
