import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const { headers, body } = _req;
  
  // Validate the GitHub secret if you have one
  // const signature = headers['x-hub-signature-256'];
  
  // Perform signature verification logic here if needed
  
  // Process the webhook event

  console.log(body);

  switch (headers['x-github-event']) {
    case 'push':
      // Handle push event
      console.log('Received a push event');
      break;
      
    case 'pull_request':
      // Handle pull request event
      console.log('Received a pull request event');
      break;
    case "issues":
        console.log('Received an issue event');

    // Handle other events
    default:
      console.log(`Received unknown event ${headers['x-github-event']}`);
  }

  // Respond to GitHub
  res.status(200).send('Webhook received');

}

export default handler;
