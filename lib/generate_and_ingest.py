import json
import random
import time
import boto3
 
# AWS Kinesis configuration
kinesis_client = boto3.client('kinesis')
stream_name = 'my-awesome-stream'
 
# AWS DynamoDB configuration
dynamodb_client = boto3.client('dynamodb')
table_name = 'mytable'
 
# Vehicle data generation function
def generate_vehicle_data():
    vin = ''.join(random.choices('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=17))
    model = random.choice(['Sedan', 'SUV', 'Truck'])
    make = random.choice(['Toyota', 'Ford', 'Honda'])
    year = random.randint(2000, 2022)
 
    payload = {
        'VIN': vin,
        'Model': model,
        'Make': make,
        'Year': year
    }
 
    return payload
 
# Main loop to generate and ingest data
if __name__ == "__main__":
    i = 0
    while i < 5:
        payload = generate_vehicle_data()
 
        # Send payload to Kinesis stream
        kinesis_client.put_record(
            StreamName=stream_name,
            Data=json.dumps(payload),
            PartitionKey='partitionkey'
        )
 
        print(f"Payload sent to Kinesis: {payload}")
 
        # Write payload to DynamoDB
        dynamodb_client.put_item(
            TableName=table_name,
            Item={
                'pk': {'S': payload['VIN']},
                'Model': {'S': payload['Model']},
                'Make': {'S': payload['Make']},
                'Year': {'N': str(payload['Year'])}
            }
        )
 
        print(f"Payload written to DynamoDB: {payload}")
 
        # Wait for a minute before generating the next payload
        time.sleep(60)
 
        i += 1  # Increment the loop counter