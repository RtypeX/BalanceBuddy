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

# Step 2: Build the Flutter web app with the correct base href
echo "Building the Flutter web app with base href /myappRepo/..."
flutter build web --release --base-href="/myappRepo/" #change '/myappRepo/' to the name of the github repo of your project

# Step 3: Verify the build was successful
if [ ! -d "build/web" ]; then
    echo "Error: Build folder not found. Make sure the build was successful."
    exit 1
fi
echo "Build completed successfully."

# Step 4: Create a temporary folder to store build files
TEMP_DIR=$(mktemp -d)
echo "Temporary directory created at: $TEMP_DIR"

# Copy the build folder to the temporary directory
echo "Copying the build folder to the temporary directory..."
cp -r build/web/* "$TEMP_DIR/"

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
git rm -rf . || true

# Step 7: Remove existing directories that may cause conflicts
echo "Removing conflicting directories (assets, canvaskit) if they exist..."
rm -rf assets canvaskit

# Step 8: Copy the files from the temporary directory to the root of gh-pages
echo "Copying build files to the root of gh-pages..."
cp -r "$TEMP_DIR"/* ./

# Step 9: Remove the empty build folder if present
if [ -d "build" ]; then
    echo "Removing the empty build folder..."
    rm -rf build
fi

# Step 10: Add, commit, and push the changes
echo "Committing and pushing changes to gh-pages..."
git add .
git commit -m "Deploy updated web app to gh-pages"
git push origin gh-pages

# Step 11: Switch back to the main branch
echo "Switching back to the main branch..."
git checkout main

# Step 12: Clean up the temporary directory
rm -rf "$TEMP_DIR"
echo "Temporary directory cleaned up."

echo "Deployment complete! Visit: https://rtypex.github.io/myappRepo/" #change to your username in the link