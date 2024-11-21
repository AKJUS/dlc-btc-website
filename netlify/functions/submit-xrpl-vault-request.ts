import { Handler, HandlerEvent } from '@netlify/functions';
import { submitSetupXRPLVaultRequest } from 'dlc-btc-lib/attestor-request-functions';
import { AttestorChainID } from 'dlc-btc-lib/models';

const handler: Handler = async (event: HandlerEvent) => {
  try {
    if (!event.queryStringParameters) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'No Parameters were provided',
        }),
      };
    }

    if (!event.queryStringParameters.coordinatorURL) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'No Coordinator URL was provided',
        }),
      };
    }

    if (!event.queryStringParameters.userXRPLAddress) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'No XRPL User Address was provided',
        }),
      };
    }

    if (!event.queryStringParameters.attestorChainID) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'No Attestor Chain ID was provided',
        }),
      };
    }

    const coordinatorURL = event.queryStringParameters.coordinatorURL;
    const userXRPLAddress = event.queryStringParameters.userXRPLAddress;
    const attestorChainID = event.queryStringParameters.attestorChainID as AttestorChainID;

    await submitSetupXRPLVaultRequest(coordinatorURL, userXRPLAddress, attestorChainID);

    return {
      statusCode: 200,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Failed to submit Setup XRPL Vault Request: ${error.message}`,
      }),
    };
  }
};

export { handler };
