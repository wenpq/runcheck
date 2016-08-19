# runcheck
Check workflow before a run


## Style, linter, and formatter

We use [eslint](http://eslint.org/) for linter and style control. Please use the latest stable eslint release. The eslint config file is `.eslintrc`. The file name format is controlled by [eslint-plugin-filenames](https://github.com/selaux/eslint-plugin-filenames).

If you are using [sublime text](https://www.sublimetext.com/), there are several plugins that support eslint in the editor: [sublimelinter](http://www.sublimelinter.com/en/latest/), [sublimelinter eslint](https://github.com/roadhump/SublimeLinter-eslint), and [eslint formatter](https://github.com/TheSavior/ESLint-Formatter).

## Default branch

The default branch will be updated with sprints. When a sprint is closed, the sprint will merge to master, and a new branch will be created from master to the next sprint. All commits or pull requests should be made to the current default branch. A sprint branch is name as `sn`, where `n` is the sprint number.
