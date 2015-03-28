# package file-merge

This package merges contents of specified files into one file.
Can traverse directory tree. Useful for things like combining .css files, etc.

### Installation
```
npm install -g file-merge
```

### Command line
```
file-merge [-c config-file][-i include-globs][-e exclude-globs][-r root] -o output
```

Globs for included and excluded files can be comma separated, i.e.
```
file-merge -i **/*.css,extras/*.css -e **/obsolete.css -o bundle.css
```

### merge-config.cson file sample:
```
include: ["**/*.cson"]
exclude: ["dupa/*.css"]
root: "."
output: "merged-file.txt"
```
