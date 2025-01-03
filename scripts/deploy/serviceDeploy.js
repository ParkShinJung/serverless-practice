const readline = require('readline');
const {exec} = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

process.env.stage = "dev";

rl.close();

const commands = [
  'tsc',
  'yarn build-lambda',
  `cd packages && serverless deploy --stage dev`
];

const executeCommands = (cmds) => {
  if (cmds.length === 0) {
    console.log('All commands executed successfully.');
    return;
  }
  const command = cmds.shift();
  console.log(`Executing: ${command}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing ${command}:`, stderr);
      process.exit(1);
    }
    console.log(stdout);
    executeCommands(cmds);
  });
};

executeCommands(commands);
