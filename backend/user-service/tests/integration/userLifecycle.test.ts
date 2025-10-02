import { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  CreateUserPoolCommand,
  CreateUserPoolClientCommand,
  DeleteUserPoolCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler as registerHandler } from '../../src/handlers/registerUser';
import { handler as getHandler } from '../../src/handlers/getUserProfile';
import { handler as updateHandler } from '../../src/handlers/updateUserProfile';
import { handler as deleteHandler } from '../../src/handlers/deleteUserProfile';

const tableName = process.env.USER_TABLE ?? 'interviewselect-users';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.COGNITO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const documentClient = DynamoDBDocumentClient.from(dynamoClient);

let userPoolId: string;
let appClientId: string;

beforeAll(async () => {
  const describe = await dynamoClient
    .send(new DescribeTableCommand({ TableName: tableName }))
    .catch(() => null);
  if (!describe) {
    await dynamoClient.send(
      new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
        ],
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      })
    );
  }

  const poolResponse = await cognitoClient.send(
    new CreateUserPoolCommand({ PoolName: `test-pool-${Date.now()}` })
  );
  userPoolId = poolResponse.UserPool?.Id ?? '';
  const clientResponse = await cognitoClient.send(
    new CreateUserPoolClientCommand({
      ClientName: `test-client-${Date.now()}`,
      UserPoolId: userPoolId,
      GenerateSecret: false,
      ExplicitAuthFlows: ['ALLOW_USER_PASSWORD_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
    })
  );
  appClientId = clientResponse.UserPoolClient?.ClientId ?? '';

  process.env.COGNITO_USER_POOL_ID = userPoolId;
  process.env.COGNITO_APP_CLIENT_ID = appClientId;
});

afterAll(async () => {
  if (userPoolId) {
    await cognitoClient.send(new DeleteUserPoolCommand({ UserPoolId: userPoolId }));
  }
  await dynamoClient.send(new DeleteTableCommand({ TableName: tableName })).catch(() => undefined);
});

describe('User lifecycle via API handlers', () => {
  let createdProfileId: string;
  const email = `user-${Date.now()}@example.com`;

  it('registers a user and stores profile', async () => {
    const event: APIGatewayProxyEventV2 = {
      version: '2.0',
      routeKey: 'POST /users',
      rawPath: '/users',
      rawQueryString: '',
      headers: {},
      requestContext: {} as never,
      isBase64Encoded: false,
      body: JSON.stringify({
        email,
        password: 'Password123!',
        type: 'freelancer',
        profile: { name: 'Integration Tester', bio: 'QA', yearsOfExperience: 2 },
      }),
    };

    const response = await registerHandler(event);
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body as string);
    createdProfileId = body.profile.id;

    const stored = await documentClient.send(
      new GetCommand({ TableName: tableName, Key: { id: createdProfileId } })
    );
    expect(stored.Item?.email).toBe(email);
  });

  it('retrieves the created profile', async () => {
    const event: APIGatewayProxyEventV2 = {
      version: '2.0',
      routeKey: 'GET /users/{id}',
      rawPath: `/users/${createdProfileId}`,
      rawQueryString: '',
      headers: {},
      requestContext: {} as never,
      isBase64Encoded: false,
      pathParameters: { id: createdProfileId },
    };

    const response = await getHandler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body as string);
    expect(body.profile.id).toBe(createdProfileId);
  });

  it('updates profile information', async () => {
    const event: APIGatewayProxyEventV2 = {
      version: '2.0',
      routeKey: 'PUT /users/{id}',
      rawPath: `/users/${createdProfileId}`,
      rawQueryString: '',
      headers: {},
      requestContext: {} as never,
      isBase64Encoded: false,
      body: JSON.stringify({ id: createdProfileId, profile: { bio: 'Updated bio' } }),
    };

    const response = await updateHandler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body as string);
    expect(body.profile.bio).toBe('Updated bio');
  });

  it('deletes the profile and cognito user', async () => {
    const event: APIGatewayProxyEventV2 = {
      version: '2.0',
      routeKey: 'DELETE /users/{id}',
      rawPath: `/users/${createdProfileId}`,
      rawQueryString: `email=${encodeURIComponent(email)}`,
      headers: {},
      requestContext: {} as never,
      isBase64Encoded: false,
      pathParameters: { id: createdProfileId },
      queryStringParameters: { email },
    };

    const response = await deleteHandler(event);
    expect(response.statusCode).toBe(204);
  });
});
