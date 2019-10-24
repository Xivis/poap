const fs = require('fs');
const path = require('path');
const os = require('os');
const ethers = require('ethers');
const artifact = require('../build/contracts/Poap.json');

const provider = new ethers.providers.InfuraProvider('mainnet', 'cf7a7eed37254ec4b95670607e76a917');
const wallet = new ethers.Wallet('CDF2DF30545E16094B4D62FA1624DE9A44432547CE3F582DE8F066C42ABBC4EE',  provider);

const contract = new ethers.Contract('0x22c1f6050e56d2876009903609a2cc3fef83b415', artifact.abi, wallet);

async function getTokenOwner(tokenId) {
  const eventId = await contract.functions.tokenEvent(tokenId);
  const owner = await contract.functions.ownerOf(tokenId);
  return [eventId.toNumber(), tokenId.toString(), owner]
}
const filename = path.join(__dirname, 'output.csv');
const lastTokenId = 5000;
let responseArray = [];
const arrayTimes = Array.from({ length: lastTokenId });

const getTokens = async () => {
  await Promise.all(arrayTimes.map(async (el, i) => {
    console.log('Fetching: ', i);
    let tokenOwner;
    try{
      tokenOwner = await getTokenOwner(i);
      responseArray.push(tokenOwner);
    } catch (e) {
      //
    }
  }));
  fs.writeFileSync(filename, responseArray.join(os.EOL));
};

getTokens();
