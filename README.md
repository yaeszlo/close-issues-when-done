# Close issue when issue card is moved to Done

GitHub Action fixing unfathomable lack of most basic GitHub functionality. When Project Card is moved to Done column - Issue is closed!

It's a better than https://github.com/dessant/issue-states because it doesn't waste GitHub minutes.

Do not use this action, I made it out of spite.

But if you really want to, here's an example:

```
name: 'Sync issue status'

on:
  schedule:
    - cron: '30 18 * * *'
  workflow_dispatch:

jobs:
  action:
    runs-on: ubuntu-latest
    steps:
      - uses: yaeszlo/close-issues-when-done@master
        with:
          board_name: Project Board

```

This will run the action once a day at 18:30.
I recommend using it like this because otherwise you're wasting minutes and paying GitHub money, which they do not deserve.