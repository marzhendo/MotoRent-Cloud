# 3. Instance Telemetry for Cloud Load Balancing Demonstration

Date: 2026-11-22  
Status: Accepted

## Context
A major component of Tugas 9 involves illustrating and understanding cloud horizontal scalability (Scale-Out/Scale-In) and Load Balancing algorithms (Round-Robin, Least Connection, Least Response Time). When evaluating a multi-instance cloud deployment on AWS EC2 behind an Application Load Balancer (ALB), it is traditionally difficult for an observer to see which specific instance served an HTTP request without inspecting private cloud logs.

## Decision
We include an instance identifier in the backend response:
1. An HTTP response header `X-Instance-Id` containing the EC2 instance ID, container hostname, or local environment tag.
2. A lightweight `/api/info` endpoint returning the active instance name, server uptime, and timestamp.

## Consequences
- Enables live, visual demonstration of the AWS Load Balancer distributing requests across multiple backend nodes during project presentation.
- Adds minimal compute overhead (single environment variable read).
