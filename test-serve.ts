import { readFile } from 'fs/promises'

// Check if login.html exists in dist
const content = await readFile('dist/login.html', 'utf-8')
console.log('File size:', content.length)
console.log('First 100 chars:', content.substring(0, 100))
