export async function getExtendedAttestorGroupPublicKey(coordinatorURL: string): Promise<string> {
  try {
    const netlifyFunctionEndpoint = `/.netlify/functions/fetch-extended-attestor-group-public-key?coordinatorURL=${coordinatorURL}`;

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
