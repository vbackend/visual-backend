const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(
  'release/build/mac-arm64/VisualBackend-arm64.zip'
);
const archive = archiver('zip', {
  zlib: { level: 6 }, // Sets the compression level.
});

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log(
    'archiver has been finalized and the output file descriptor has closed.'
  );
});

output.on('end', function () {
  console.log('Data has been drained');
});

const file = __dirname + '/release/build/mac-arm64/VisualBackend.app';
// console.log(file);
archive.pipe(output);
archive.directory(file, 'VisualBackend.app');

archive.finalize();
