const fs = require('fs');
const files = [
    'public/signup.html',
    'public/projects.html',
    'public/account.html',
    'public/admin.html'
];

const oldPattern = `const API_BASE_URL = window.location.port === '8000' 
            ? 'http://localhost:3000' 
            : '';`;

const newPattern = `const API_BASE_URL = (() => {
            const host = window.location.hostname;
            const port = window.location.port;
            const protocol = window.location.protocol;
            
            // Localhost with port 8000
            if (host === 'localhost' && port === '8000') {
                return 'http://localhost:3000';
            }
            
            // Sandbox public URL (8000-xxx.sandbox.novita.ai)
            if (host.includes('8000-') && host.includes('.sandbox.novita.ai')) {
                return protocol + '//' + host.replace('8000-', '3000-');
            }
            
            // Default: same origin
            return '';
        })();`;

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes(oldPattern)) {
            content = content.replace(oldPattern, newPattern);
            fs.writeFileSync(file, content, 'utf8');
            console.log(`✅ Updated: ${file}`);
        } else {
            console.log(`⚠️ Pattern not found in: ${file}`);
        }
    } catch (error) {
        console.log(`❌ Error processing ${file}:`, error.message);
    }
});

console.log('\n✅ All files processed!');
