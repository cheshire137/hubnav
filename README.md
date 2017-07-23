# Hubnav

A Chrome extension for navigating github.com via keyboard shortcuts.

**[Install from the Chrome Web Store](https://chrome.google.com/webstore/detail/hubnav/aanefongalfonofnpgkgcibhogmgnckm)**

Use keyboard shortcuts to quickly access issues, pull requests, and the file finder for up to four of your most frequented GitHub repositories. Shortcuts are also available for accessing the repositories, teams, and members of your GitHub organization as well as for GitHub search.

![screenshot of popup](https://raw.githubusercontent.com/cheshire137/hubnav/master/screenshotPopup.png)

## How to Use

1. Open the extension popup:

    - In macOS: **Option-H**
    - In Windows/Linux: **Alt-H**

    The keyboard shortcut can be changed from `chrome://extensions/`
    via the "Keyboard shortcuts" link at the bottom.

2. Navigate to your desired GitHub page via shortcuts:

    **General commands:**

    - **o** - customize settings for the extension
    - **s** - open global GitHub search

    **Repository commands:**

    - **f** - open file finder for your selected repository
    - **i** - open issues for your selected repository
    - **Shift i** - view closed issues for your selected repository
    - **Ctrl i** - create a new issue in your selected repository
    - **p** - open pull requests for your selected repository
    - **Shift p** - view merged pull requests in your selected repository
    - **Ctrl p** - create a new pull request in your selected repository
    - **h** - open home page of your selected repository

    **Organization commands:**

    - **t** - open teams for your selected organization
    - **m** - view members of your selected organization
    - **r** - view repositories in your selected organization

    **Quick repository switching:**

    - **1** - switch to your first repository
    - **2** - switch to your second repository
    - **3** - switch to your third repository
    - **4** - switch to your fourth repository

## How to Develop

Clone this repository locally via
`git clone https://github.com/cheshire137/hubnav.git`. In Chrome, go to
`chrome://extensions/` and ensure "Developer mode" is
enabled. Then click "Load unpacked extension..." and
choose the extension/ directory from wherever you cloned this repository.
