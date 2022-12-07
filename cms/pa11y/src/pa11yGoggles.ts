/*
* This script is used to launch chrome with the proxy settings
* specified in the environment variables HTTP_PROXY and HTTP_PROXY_BYPASS_LIST
*
* Other configurable parameters through env variables:
* - PA11Y_CONF_PATH: Path to the pa11y config file. Defaults to .pa11yci
* - STARTING_URL: The url to start the chrome instance on. Defaults to the url
*  specified in the pa11y config file
* - CHROME_PATH: Path to the chrome binary. Defaults to the chrome binary
* installed on the system
*/
import {launch} from 'chrome-launcher';
import { readFileSync, existsSync } from 'fs'

if (!process.env.HTTP_PROXY) {
  throw new Error('HTTP_PROXY environment variable is not set');
}

const httpProxy = process.env.HTTP_PROXY;
const pa11yConfPath = process.env.PA11Y_CONF_PATH || '.pa11yci';
const httpProxyBypassList = process.env.HTTP_PROXY_BYPASS_LIST || 'dpl-cms.docker,picsum.photos,i.picsum.photos';
let startingUrl = process.env.STARTING_URL || '';

if (!startingUrl) {
  if (!existsSync(pa11yConfPath)) {
    throw new Error(`Tried to find Pa11y config file at ${pa11yConfPath} but it does not exist`);
  }

  const data = readFileSync('.pa11yci', 'utf8');
  const pa11yConf = JSON.parse(data);

  if (!pa11yConf.urls) {
    throw new Error(`Tried to parse Pa11y config file at ${pa11yConfPath} but it does not contain any urls`);
  }

  startingUrl = pa11yConf.urls[0].url;
};

launch({
  startingUrl,
  chromeFlags: [
    `--proxy-server=${httpProxy}`,
    `--proxy-bypass-list=${httpProxyBypassList}`,
    '--args',
    '--user-data-dir="/tmp/chrome_dev_test"',
    '--disable-web-security'
  ]
}).then(chrome => {
  console.log(`😎 Pa11y goggles are ON! See the world like Pa11y does...`);
});

