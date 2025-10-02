import { GetCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getDynamoDocumentClient } from '../utils/dynamoClient';

const USER_TABLE = process.env.USER_TABLE ?? 'interviewselect-users';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const userId = event.pathParameters?.id;

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing user id' }) };
    }

    const dynamo = getDynamoDocumentClient();
    const response = await dynamo.send(
      new GetCommand({
        TableName: USER_TABLE,
        Key: { id: userId },
      })
    );

    if (!response.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Profile not found' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ profile: response.Item }),
    };
  } catch (error) {
    console.error('Failed to retrieve profile', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
