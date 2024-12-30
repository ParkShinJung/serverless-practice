const readline = require('readline');
const {exec} = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


    rl.close();

    const compileCommand = 'tsc';
    exec(compileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        console.error(`Error compiling TypeScript: ${compileStderr}`);
        process.exit(1);
      }
      console.log(compileStdout);

      const command = `cd packages && serverless offline --stage dev`;
      console.log(`Executing: ${command}`);
      const childProcess = exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${stderr}`);
          process.exit(1);
        }
        console.log(stdout);
      });

      childProcess.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      childProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });
    });

