import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
 
export class ConnectedVehicleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
 
    // Create S3 Bucket
    const s3Bucket = new s3.Bucket(this, 'MyFirstBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
 
    // Create Kinesis Stream
    const kinesisStream = new kinesis.Stream(this, 'MyFirstStream', {
      streamName: 'my-awesome-stream',
    });
 
    // Create DynamoDB Table
    const dynamoDBTable = new dynamodb.TableV2(this, 'Table', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      tableName: 'mytable',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
 
    // Create Lambda Function
    const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('C:/Users/Uday/Documents/my-lambda-function'), // Update with your actual path
      functionName: 'MyLambdaFunction',
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        DYNAMODB_TABLE_NAME: dynamoDBTable.tableName,
      },
    });
 
    // Grant permissions to Lambda to read from Kinesis and write to DynamoDB
    kinesisStream.grantRead(lambdaFunction);
    dynamoDBTable.grantWriteData(lambdaFunction);
 
    // Add a policy to allow Lambda to write CloudWatch Logs (optional)
    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        resources: ['*'],
      })
    );
   
  }
}