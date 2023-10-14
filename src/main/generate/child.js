const { spawn } = require('child_process');

let args = process.argv.slice(2)
let path = args[0];
let pkgName = args[1];

console.log(`Running npm install ${pkgName} on ${path}`)
// const npmInstall = spawn('npm', ['install', pkgName], { cwd: path });
// process.send(`Running npm install ${pkgName} on ${path} `)


// npmInstall.on('close', (code) => {
//     if (code === 0) {
//         process.send({type: 'success'})
//         resolve(true); // Resolve the promise if npm install succeeds (exit code 0)
//     } else {
//         process.send({type: 'fail'})
//         reject(new Error(`npm install failed with exit code ${code}`)); // Reject the promise if npm install fails
//     }
// });