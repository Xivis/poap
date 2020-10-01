import { getDelegatedClaims, updateQrClaim } from './src/db';
import { Layer, TokenInfo } from './src/types';
import { Contract, Wallet } from 'ethers';
import getEnv from './src/envs';
import { getABI, getHelperSigner, mintToken } from './src/eth/helpers';
import poapGraph from './src/plugins/thegraph-utils';

import dotenv from 'dotenv';

dotenv.config();

async function main() {

  let signerWallet: Wallet;
  let gasPrice: number = 0;

  const delegatedQRs = await getDelegatedClaims()
  const env = getEnv({layer: Layer.layer1});

  if (!delegatedQRs){
    console.log("No delegated QRs were found")
    return;
  }

  const helperWallet = await getHelperSigner(gasPrice, {layer: Layer.layer1});
  signerWallet = helperWallet ? helperWallet : env.poapAdmin;

  const delegatedContract = new Contract(
    "0xAac2497174f2Ec4069A98375A67D798db8a05337",
    getABI('PoapDelegatedMint'),
    signerWallet
  );

  for (const delegatedQR of delegatedQRs) {
    const was_processed = await delegatedContract.functions.processed(delegatedQR.delegated_signed_message);
    let alreadyMinted = false;
    if(was_processed || !delegatedQR.beneficiary) {
      continue;
    }
    try {
      const tokens = await poapGraph.getAllTokens(delegatedQR.beneficiary);
      tokens.forEach((token: TokenInfo) => {
          alreadyMinted = delegatedQR.event === token.event;
        }
      )
    } catch (error) {
      console.log(error);
      console.log(`Can't get token for QR HASH: ${delegatedQR.qr_hash}`);
      // Don't try to mint it (can't be sure that it hasn't been already minted)
      continue
    }
    if (!alreadyMinted) {
      const tx = await mintToken(delegatedQR.event_id, delegatedQR.beneficiary, true, {layer: Layer.layer2})
      // If the transaction fail
      if(!tx){
        console.log(`Error in mintToken QR HASH:${delegatedQR.qr_hash}`);
        continue;
      }

      await updateQrClaim(
        delegatedQR.qr_hash,
        delegatedQR.beneficiary,
        JSON.stringify([delegatedQR.event_id, delegatedQR.beneficiary]),
        tx
      );
    }
    console.log(`Successfully mint QR HASH: ${delegatedQR.qr_hash}`);
  }

}

main().catch(err => {
  console.error('Failed', err);
});