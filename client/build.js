const browserify = require('browserify')()
const transformTools = require('browserify-transform-tools')
const _ = require('underscore')
const path = require('path')
const fs = require('fs');

const inFile = "src/bootstrap.js"
const outFile = "dist/lib/app.js"
const writeStream = fs.createWriteStream(outFile, {flags: 'w'});

const aliases = require('./package.json')._moduleAliases

const tr = transformTools.makeRequireTransform("requireTransform",
    { evaluateArguments: true }, (args, opts, cb) => {
        // console.log()
        // Add .js extension to avoid mixing up directories with files of the same name
        const requestPath = args[0] + ".js"
        const requiringDirectory = path.dirname(opts.file)
        // console.log('Require to:', requestPath)
        const matchingAlias = _.find(_.keys(aliases), (alias) => {
             // Matching /^alias(\/|$)/
            if (requestPath.indexOf(alias) === 0) {
                if (requestPath.length === alias.length) return true
                if (requestPath[alias.length] === '/') return true
            }

            return false
        })
        
        if (matchingAlias) {
            // console.log('Found matching alias', matchingAlias)
            const expandedPath = aliases[matchingAlias] + requestPath.substring(matchingAlias.length)
            // console.log('Expanded required path would be:', expandedPath)
            // console.log('Requiring file name:', opts.file)
            // console.log('Requiring directory name:', requiringDirectory)
            const relativePath = path.relative(requiringDirectory, expandedPath)
            // console.log('Relative path: ', relativePath)
            // Remove the unnecessary .js extension
            const newPath = `${relativePath.startsWith("../") ? "" : "./"}${relativePath}`.slice(0, -3)
            // console.log('New path:', newPath)
            return cb(null, "require('" + newPath + "')")
        }

        return cb()
    })

browserify.add(inFile)
browserify.transform(tr)
browserify.bundle().pipe(writeStream)

console.log('Browserified bundle created at %s from entry %s using aliases %s', outFile, inFile, _.keys(aliases))