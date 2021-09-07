import { countResources, expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Cdk from '../lib/tourreservation-eks-stack';

test('VPC Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Cdk.TourreservationEKSStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(countResources('AWS::EC2::VPC', 1));
  expectCDK(stack).to(haveResource('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
  }));
});

