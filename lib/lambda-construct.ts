import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs'

import { Construct } from 'constructs'
import { Duration } from 'aws-cdk-lib'
import { Runtime } from 'aws-cdk-lib/aws-lambda'

export interface LambdaConstructDeps {
  vpc: cdk.aws_ec2.IVpc
  subnetSelection: cdk.aws_ec2.SubnetSelection
  securityGroups: cdk.aws_ec2.ISecurityGroup[]
}

export class LambdaConstruct extends Construct {
  public handler: lambda.NodejsFunction
  constructor(scope: Construct, id: string, deps: LambdaConstructDeps) {
    super(scope, id)

    this.handler = new lambda.NodejsFunction(this, id, {
      entry: `src/${id}.ts`,
      handler: 'main',
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      environment: {
        API_ENDPOINT: 'https://www.mcdonalds.co.kr',
      },
      vpc: deps.vpc,
      vpcSubnets: deps.subnetSelection,
      securityGroups: deps.securityGroups
    })
  }
}
