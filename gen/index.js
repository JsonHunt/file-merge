// Generated by CoffeeScript 1.9.1
(function() {
  var _, async, cson, endOfLine, fs, getFilesOn, minimatch, path, run, toInclude;

  fs = require('fs');

  cson = require('cson');

  endOfLine = require('os').EOL;

  async = require('async');

  path = require('path');

  _ = require('underscore');

  minimatch = require('minimatch');

  run = function() {
    var config, includedFiles, startPath;
    config = {
      include: [],
      exclude: []
    };
    process.argv.forEach(function(val, index, array) {
      var filename;
      if (val === "-c") {
        filename = array[index + 1];
        config = cson.parseCSONFile(filename);
      }
      if (val === "-i") {
        config.include = array[index + 1].split(",");
      }
      if (val === "-e") {
        config.exclude = array[index + 1].split(",");
      }
      if (val === "-o") {
        config.output = array[index + 1];
      }
      if (val === "-r") {
        return config.root = array[index + 1];
      }
    });
    startPath = process.cwd();
    if (config.root) {
      startPath += path.sep + config.root;
    }
    includedFiles = [];
    return getFilesOn(startPath, function(allFiles) {
      var data, file, i, index, j, len, len1;
      console.log("Looking for matching files in " + startPath + ". " + allFiles.length + " files on the path");
      if (config.include) {
        console.log("Including following patterns: " + config.include);
      }
      if (config.exclude) {
        console.log("Excluding following patterns: " + config.exclude);
      }
      for (index = i = 0, len = allFiles.length; i < len; index = ++i) {
        file = allFiles[index];
        if (toInclude(file, config.include, config.exclude)) {
          includedFiles.push(file);
        }
      }
      data = "";
      for (j = 0, len1 = includedFiles.length; j < len1; j++) {
        file = includedFiles[j];
        data += fs.readFileSync(file) + endOfLine;
      }
      return fs.writeFile(config.output, data, function(err) {
        if (err) {
          throw err;
        }
        return console.log("Concatenated " + includedFiles.length + " files into " + config.output);
      });
    });
  };

  toInclude = function(file, incGlobs, exGlobs) {
    var exGlob, i, incGlob, j, len, len1;
    for (i = 0, len = exGlobs.length; i < len; i++) {
      exGlob = exGlobs[i];
      if (minimatch(file, exGlob)) {
        return false;
      }
    }
    for (j = 0, len1 = incGlobs.length; j < len1; j++) {
      incGlob = incGlobs[j];
      if (minimatch(file, incGlob)) {
        return true;
      }
    }
    return false;
  };

  getFilesOn = function(absPath, callback) {
    return fs.lstat(absPath, (function(_this) {
      return function(err, stats) {
        if (stats.isDirectory()) {
          fs.readdir(absPath, function(err, files) {
            var f;
            f = [];
            return async.eachSeries(files, function(file, fileCb) {
              return getFilesOn("" + absPath + path.sep + file, function(filesX) {
                f = _.union(f, filesX);
                return fileCb();
              });
            }, function(err) {
              if (err) {
                throw err;
              }
              return callback(f);
            });
          });
        }
        if (stats.isFile()) {
          return callback([absPath]);
        }
      };
    })(this));
  };

  exports.run = run;

}).call(this);