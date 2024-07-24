import esbuild from 'esbuild'
import fs from 'fs-extra'

const copyTargets = ['index.html', 'style.css']

console.time('build')

await esbuild.build({
	entryPoints: ['src/index.js'],
	minify: true,
	bundle: true,
	outfile: 'build/index.js',
})

copyTargets.forEach(name => {
	fs.copySync(`./src/${name}`, `./build/${name}`)
})

console.timeEnd('build')
