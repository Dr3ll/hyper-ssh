const fs = require('fs');
const path = require('path');

const USER_CONFIG_FILE = 'hyper_ssh_menu.config.json';

function configFilePath() {
  let configDir;
  if (process.env['HOME']) {
    // unix
    configDir = process.env['HOME'];
  } else if (process.env['APPDATA']) {
    // windows
    configDir = process.env['APPDATA']
  }

  return path.join(configDir, 'hyper_plugins/' + USER_CONFIG_FILE);
}

function configDir (file) {
  return file.replace(/\\/g, '/')
    .replace(/\/[^/]*\/?$/, '')
}

function loadConfig() {
  let config = {};
  fs.readFile(configFilePath(), (err, data) => {
    if (!err) {

      let data_json = {};

      try {
        data_json = JSON.parse(data.toString());
      } catch (e) {
        if (!data.toString().length) {
          data_json = config;
        } else {
          data_json.sshSetups = [];
        }
      }

      config.sshSetups = data_json.sshSetups;

      if (!data.toString() || data.toString().length < 10) {
        if (!data_json.length || !data_json.sshSetups || data_json.sshSetups.length <= 0) {
          saveConfig(config);
        }
      }

    } else {
      if (err.code === 'ENOENT') {
        saveConfig(config);
      }
    }
  });

  return config;
}

function saveConfig(config, firstTry = true) {
  return fs.writeFile(configFilePath(), JSON.stringify(config), (err) => {
    if(!err) {

    } else {
      if (firstTry) {
        fs.mkdir(configDir(configFilePath()), (err) => {
          if (!err) {
            saveConfig(config, false);
          } else {

          }
        });
      } else {
        // error
      }
    }
  });
}

/*function loadUserConfig() {
  const configFile = loadUserConfig();
  const dir = configFile.replace(/\\/g, '/')
    .replace(/\/[^/]*\/?$/, '');

  shell.openExternal('file://' + dir);
}*/


module.exports = [
  loadConfig,
  saveConfig
];
