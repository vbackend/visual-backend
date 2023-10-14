import fs from 'fs-extra';
import path from 'path';

export class FileFuncs {
  static readFile = (path: string) => {
    return new Promise((res, rej) => {
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
          console.log('Failed to read file:', err);
          rej(err);
        } else {
          res(data);
          return;
        }
      });
    });
  };

  static writeFile = (path: string, data: string) => {
    return new Promise((res, rej) => {
      fs.writeFile(path, data, (err) => {
        if (err) {
          console.log('Failed to write file:', err);
          rej(err);
        } else {
          // console.log('Successfully written to file');
          res(true);
          return;
        }
      });
    });
  };

  static createDirIfNotExists = async (path: string) => {
    return new Promise((res, rej) => {
      fs.mkdir(path, { recursive: true }, (err) => {
        if (err) {
          if (err.code === 'EEXIST') {
            res(true);
          } else {
            console.error(`Error creating directory: ${err.message}`);
            rej(err);
          }
        } else {
          res(true);
        }
      });
    });
  };

  static createFileIfNotExists = (filePath: string) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // The file doesn't exist, so create it
        fs.writeFile(filePath, '', (error) => {
          if (error) {
            console.error('Error creating file:', error);
          }
        });
      } else {
        console.log('File already exists.');
      }
    });
  };

  static deleteDir = (directoryPath: string) => {
    return new Promise((res, rej) => {
      if (!fs.existsSync(directoryPath)) {
        // console.log('Directory does not exist.');
        return;
      }

      const files = fs.readdirSync(directoryPath);

      files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        if (fs.statSync(filePath).isDirectory()) {
          this.deleteDir(filePath);
        } else {
          fs.unlinkSync(filePath);
          // console.log(`Deleted file: ${filePath}`);
        }
      });

      fs.rmdirSync(directoryPath);
      // console.log(`Deleted directory: ${directoryPath}`);
      res(true);
    });
  };

  static deleteFile = (filePath: string) => {
    return new Promise((res, rej) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          rej(err);
          return;
        }
        res(true);
      });
    });
  };

  // Function to copy a directory recursively
  static copyDir(sourceDir: string, destinationDir: string) {
    return new Promise((res, rej) => {
      fs.copy(sourceDir, destinationDir, (err) => {
        if (err) {
          console.error(`Error copying directory: ${err}`);
          rej(err);
        } else {
          res(true);
        }
      });
    });
  }

  static renameDir(oldDir: string, newDir: string) {
    return new Promise((res, rej) => {
      fs.rename(oldDir, newDir, (err) => {
        if (err) {
          console.error('Error renaming folder:', err);
          rej(err);
        } else {
          res(true);
        }
      });
    });
  }

  static folderExists(folderPath: string) {
    return new Promise((res, rej) => {
      fs.stat(folderPath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res(false);
          } else {
            rej(false);
          }
        } else {
          res(true);
        }
      });
    });
  }

  static async copyFileContent(fromPath: string, toPath: string) {
    let data: any = await this.readFile(fromPath);
    await this.writeFile(toPath, data);
  }
}
