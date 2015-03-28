fs = require 'fs'
cson = require 'cson'
endOfLine = require('os').EOL
async = require 'async'
path = require 'path'
_ = require 'underscore'
minimatch = require 'minimatch'

run = ()->
	config = {
		include: []
		exclude: []
	}
	process.argv.forEach (val, index, array) ->
		if val is "-c"
			filename = array[index+1]
			config = cson.parseCSONFile(filename)
		if val is "-i"
			config.include = array[index+1].split(",")
		if val is "-e"
			config.exclude = array[index+1].split(",")
		if val is "-o"
			config.output = array[index+1]
		if val is "-r"
			config.root = array[index+1]

	# startPath = array[array.length-1]
	startPath = process.cwd()
	if config.root
		startPath += path.sep + config.root
	includedFiles = []
	getFilesOn startPath, (allFiles)->
		console.log "Looking for matching files in #{startPath}. #{allFiles.length} files on the path"
		console.log "Including following patterns: #{config.include}" if config.include
		console.log "Excluding following patterns: #{config.exclude}" if config.exclude
		for file,index in allFiles
			if toInclude(file,config.include,config.exclude)
				includedFiles.push(file)

		data = ""
		for file in includedFiles
			data += fs.readFileSync(file) + endOfLine

		fs.writeFile config.output, data, (err)->
			throw err if err
			console.log "Concatenated #{includedFiles.length} files into #{config.output}"

toInclude = (file, incGlobs, exGlobs)->
	for exGlob in exGlobs
		if minimatch(file,exGlob)
			return false
	for incGlob in incGlobs
		if minimatch(file, incGlob)
			return true
	return false

getFilesOn = (absPath, callback)->
	fs.lstat absPath, (err,stats)=>
		if stats.isDirectory()
			fs.readdir absPath, (err,files)=>
				f = []
				async.eachSeries files, (file,fileCb)=>
					getFilesOn "#{absPath}#{path.sep}#{file}", (filesX)->
						f = _.union f, filesX
						fileCb()
				, (err)->
					throw err if err
					# console.log "Folder #{absPath} contains #{f.length} files"
					callback(f)

		if stats.isFile()
			callback [absPath]

exports.run = run
