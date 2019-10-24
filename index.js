const { promisify, getModuleParts } = require('./utils');
const installDependency = require('install-dependency');
const resolve = promisify(require('resolve'));
const mkdirp = require('mkdirp');
const { join } = require('path');
const { writeFileSync } = require('fs');

const cache = new Map();

async function requireOnDemand(name, version, cwd, triedInstall = false) {
  let [resolved] = await localResolve(name, version, cwd, triedInstall);
  return require(resolved);
}

async function localResolve(name, version, cwd, triedInstall = false) {
  const packageName = getModuleParts(name)[0];
  const basedir = join(cwd, 'node_modules', '.require-on-demand', packageName);
  mkdirp.sync(basedir);

  let key = name;
  let resolved = cache.get(key);
  if (!resolved) {
    try {
      resolved = await resolve(name, { basedir });
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && !triedInstall) {
        writeFileSync(
          join(basedir, 'package.json'),
          '{}',
          'utf-8',
        );
        console.log(`>> Install ${packageName}@${version} on demand.`);
        await installDependency(`${packageName}@${version}`, basedir, {
          npmClient: 'yarn',
        });
        return await localResolve(name, version, cwd, true);
      }
      throw e;
    }
    cache.set(key, resolved);
  }
  return resolved;
}

requireOnDemand.getModuleParts = getModuleParts;
module.exports = requireOnDemand;

