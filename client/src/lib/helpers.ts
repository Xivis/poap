import { getAddress, formatUnits } from 'ethers/utils';

function isValidAddress(str: string): boolean {
  try {
    getAddress(str);
    return true;
  } catch (error) {
    return false;
  }
}

const convertToGWEI = (numberInWEI: string) => {
  return Number(formatUnits(numberInWEI, 'gwei')).toString();
};

const convertToETH = (numberInWEI: string) => {
  return Number(formatUnits(numberInWEI, 'ether'));
};

const convertFromGWEI = (numberInGWEI: string) => {
  let numberGWEI: number = Number(numberInGWEI);
  for (let i = 1; i < 10; i ++){
    numberGWEI = Number(numberGWEI) * 10;
  }
  return String(numberGWEI);
};

const reduceHex = (hexString: string) => {
  if (hexString.length < 10) return hexString
  return hexString.slice(0, 6) + '\u2026' + hexString.slice(-4)
};

export { isValidAddress, convertToGWEI, convertFromGWEI, convertToETH, reduceHex };
