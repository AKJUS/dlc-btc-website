import { Handler, HandlerEvent } from '@netlify/functions';
import { getAttestorExtendedGroupPublicKey } from 'dlc-btc-lib/attestor-request-functions';

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

    const coordinatorURL = event.queryStringParameters.coordinatorURL;

    const attestorGroupPublicKey = await getAttestorExtendedGroupPublicKey(coordinatorURL);

    return {
      statusCode: 200,
      body: attestorGroupPublicKey,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Failed to get Attestor Group Public Key: ${error.message}`,
      }),
    };
  }
};

export { handler };
