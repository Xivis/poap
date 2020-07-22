import { getAddress, formatUnits } from 'ethers/utils';
import * as yup from 'yup';

function isValidAddress(str: string): boolean {
  try {
    getAddress(str);
    return true;
  } catch (error) {
    return false;
  }
}

const isValidEmail = (email: string) => {
  return yup.string().email().isValidSync(email);
};

const convertToGWEI = (numberInWEI: string) => {
  return Number(formatUnits(numberInWEI, 'gwei')).toString();
};

const convertToETH = (numberInWEI: string) => {
  return Number(formatUnits(numberInWEI, 'ether'));
};

const convertFromGWEI = (numberInGWEI: string) => {
  let numberGWEI: number = Number(numberInGWEI);
  for (let i = 1; i < 10; i++) {
    numberGWEI = Number(numberGWEI) * 10;
  }
  return String(numberGWEI);
};

const reduceAddress = (address: string) => {
  if (address.length < 10) return address;
  return address.slice(0, 6) + '\u2026' + address.slice(-4);
};

export { isValidAddress, convertToGWEI, convertFromGWEI, convertToETH, reduceAddress, isValidEmail };
