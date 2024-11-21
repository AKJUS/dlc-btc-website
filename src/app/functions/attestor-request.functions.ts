import { AttestorChainID } from 'dlc-btc-lib/models';

export async function getAttestorExtendedGroupPublicKey(): Promise<string> {
  try {
    const netlifyFunctionEndpoint = `/.netlify/functions/fetch-attestor-group-public-key?coordinatorURL=${appConfiguration.coordinatorURL}`;

    const response = await fetch(netlifyFunctionEndpoint);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP Error: ${errorMessage}`);
    }

    return await response.text();
  } catch (error: any) {
    throw new Error(`Failed to get Attestor Group Public Key: ${error.message}`);
  }
}

export async function submitSetupXRPLVaultRequest(
  userAddress: string,
  attestorChainID: AttestorChainID
): Promise<void> {
  try {
    const netlifyFunctionEndpoint = `/.netlify/functions/submit-xrpl-vault-request?coordinatorURL=${appConfiguration.coordinatorURL}&userXRPLAddress=${userAddress}&attestorChainID=${attestorChainID}`;

    const response = await fetch(netlifyFunctionEndpoint);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP Error: ${errorMessage}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to submit Setup XRPL Vault Request: ${error.message}`);
  }
}
