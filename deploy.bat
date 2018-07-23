robocopy ./src/ ./docs /s /e
robocopy ./build/contracts/ ./docs /s /e
git add .
git commit -m "group assets for github pages"
git push -u origin master

