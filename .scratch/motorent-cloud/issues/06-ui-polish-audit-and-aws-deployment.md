# 06: UI Polish, Audit & AWS Deployment Package

**What to build:** Visual design token refinement with anti-slop guidelines, code review against Alibaba security rules, and production deployment packaging for AWS EC2 and S3/CloudFront with clear demonstration instructions for the course evaluation.

**Blocked by:** 05: Return & Cancellation Lifecycle and Customer History

**Status:** ready-for-agent

- [ ] Design system tokens (`tokens.css`) and responsive layouts verified against `antislop-ui` and WCAG contrast rules.
- [ ] Codebase audited using `alibaba/open-code-review` for security vulnerabilities, error boundaries, and unhandled exceptions.
- [ ] Backend containerized with production-ready `Dockerfile` and Gunicorn/Uvicorn startup script for AWS EC2.
- [ ] Frontend static build pipeline (`npm run build`) configured and tested for AWS S3 and CloudFront distribution.
- [ ] Comprehensive deployment runbook (`DEPLOYMENT.md`) written explaining how to launch the backend on EC2, connect it to an Application Load Balancer (ALB), and demonstrate Round-Robin instance rotation.
