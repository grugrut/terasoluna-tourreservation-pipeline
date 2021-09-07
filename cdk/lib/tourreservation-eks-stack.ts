import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';

export class TourreservationEKSStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'TourreservationVPC', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ],
    });

    // IAM Role
    const clusterRole = new iam.Role(this, 'clusterRole', {
      roleName: 'TourreservationClusterRole',
      assumedBy: new iam.ServicePrincipal('eks.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy')]
    });
    const nodegroupRole = new iam.Role(this, 'nodegroupRole', {
      roleName: 'TourreservationNodegroupRole',
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'),
      ],
    });

    // EKS Cluster
    const cluster = new eks.Cluster(this, 'tourreservation-eks', {
      version: eks.KubernetesVersion.V1_21,
      clusterName: 'tourreservation-eks',
      mastersRole: clusterRole,
      vpc: vpc,
      vpcSubnets: [{
        subnetType: ec2.SubnetType.PUBLIC,
      }],
      endpointAccess: eks.EndpointAccess.PUBLIC,
      defaultCapacity: 0,
    });
    cluster.addNodegroupCapacity('nodegroup', {
      amiType: eks.NodegroupAmiType.AL2_X86_64,
      capacityType: eks.CapacityType.SPOT,
      desiredSize: 1,
      maxSize: 2,
      minSize: 0,
      diskSize: 10,
      instanceTypes: [new ec2.InstanceType('t3.small')],
      nodeRole: nodegroupRole,
    });
    const awsAuth = new eks.AwsAuth(this, 'awsAuth', {
      cluster: cluster,
    })
    awsAuth.addRoleMapping(nodegroupRole, {
      groups: ['system:bootstrappers', 'system:nodes'],
      username: 'system:node:{{EC2PrivateDNSName}}',
    });
    awsAuth.addMastersRole(
      iam.Role.fromRoleArn(this, 'admin', `arn:aws:iam::${this.account}:user/admin`),
      'admin');
  }
}
