#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { TourreservationEKSStack } from '../lib/tourreservation-eks-stack';

const app = new cdk.App();
new TourreservationEKSStack(app, 'TourreservationEKSStack');
