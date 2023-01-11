import * as dotenv from 'dotenv'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as targets from 'aws-cdk-lib/aws-events-targets'

import { LambdaConstruct, LambdaConstructDeps } from './lambda-construct'
import { Stack, StackProps } from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { EventConstruct } from './event-contruct'

export class McdonaldsKrHappymealStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    dotenv.config()
    
    // default environment
    const defaultVpc = ec2.Vpc.fromLookup(this, 'defaultVpc', {
      vpcId: process.env.DEFAULT_VPC!
    })
    const defaultPrivateSubnet = ec2.Subnet.fromSubnetId(this, 'defaultPrivateSubnet', process.env.DEFAULT_PRIVATE_SUBNET!)
    const defaultSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'defaultSecurityGroup', process.env.DEFAULT_SECURITY_GROUP!)
    const defaultLambdaDeps: LambdaConstructDeps = {
      vpc: defaultVpc,
      subnetSelection: { subnets: [defaultPrivateSubnet] },
      securityGroups: [defaultSecurityGroup]
    }

    const lambda = new LambdaConstruct(this, 'mcdonalds-kr-happymeal', defaultLambdaDeps).handler
    const rule = new EventConstruct(this, 'event-mcdonalds-kr-happymeal', 'cron(0 0 * * ? *)').eventRule
    rule.addTarget(new targets.LambdaFunction(lambda))
    targets.addLambdaPermission(rule, lambda)    
  }
}
