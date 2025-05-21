# Movie Streaming App

A full-stack movie streaming application with:
- React frontend
- FastAPI backend
- AWS services integration for video streaming
- Infrastructure as Code with Terraform

## Project Structure
- `/frontend`: React application with Vite
- `/backend`: FastAPI application
- `/infra`: Terraform infrastructure code

## Features
- User authentication (register, login, profile management)
- Browse and search movies
- Movie details with video player
- Admin panel for movie management
- Video transcoding for streaming (AWS MediaConvert)
- AWS S3 integration for storing movie files
- CloudFront for content delivery
- Containerized deployment with ECS Fargate
- RDS PostgreSQL database
- Complete infrastructure as code

## Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- AWS account
- Terraform (v1.0.0+)

## Setup Instructions

### Local Development

#### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The frontend will be available at `http://localhost:5173`

#### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

6. Initialize the database:
   ```
   python -m app.core.init_db
   ```

7. Start the backend server:
   ```
   python main.py
   ```

8. The API will be available at `http://localhost:8000`

#### Connecting to the AWS Database Locally

To connect to the AWS RDS database from your local machine during development:

1. Make sure you have the SSH key file for the bastion host:
   ```
   chmod 400 movie-streaming-dev-key.pem
   ```

2. Set up an SSH tunnel through the bastion host (use the full path to the key file):
   ```
   ssh -i "D:\path\to\movie-streaming-dev-key.pem" -L 5432:movie-streaming-dev-db.cxe8owk2c2jy.us-east-1.rds.amazonaws.com:5432 ec2-user@54.242.10.53 -N
   ```

   This command will appear to be "stuck" with no output - this is normal as it's maintaining the tunnel connection.

   Note: We're connecting directly to the RDS instance instead of the RDS Proxy because the proxy might still be initializing.

3. Update your `.env` file to use the local tunnel:
   ```
   DATABASE_URL=postgresql://movieadmin:your_password@localhost:5432/moviedb
   ```

   Replace `your_password` with the actual password from AWS Secrets Manager.

4. You can retrieve the database password using AWS CLI:
   ```
   aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:us-east-1:058264078343:secret:movie-streaming-dev-db-credentials-PkebvW --query "SecretString" --output text
   ```

5. Keep the SSH tunnel running in a separate terminal window while you're working with the database.

### Production Deployment

For production deployment, we use the Terraform infrastructure to deploy the application to AWS:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Build the backend Docker image:
   ```bash
   cd backend
   docker build -t movie-streaming-backend:latest .
   ```

3. Push the Docker image to a container registry (ECR):
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-aws-account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag movie-streaming-backend:latest <your-aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/movie-streaming-backend:latest
   docker push <your-aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/movie-streaming-backend:latest
   ```

4. Update the Terraform variables with your container image:
   ```bash
   # Edit infra/environments/[env]/terraform.tfvars
   # Set backend_container_image to your ECR image URL
   ```

5. Deploy the infrastructure (see Infrastructure Setup section)

## Infrastructure Setup

### Infrastructure Components

The infrastructure is built using Terraform and consists of the following components:

1. **VPC and Networking**
   - Public, private, and database subnets across multiple availability zones
   - NAT Gateway for outbound internet access
   - Security groups for network isolation

2. **Database**
   - RDS PostgreSQL instance
   - RDS Proxy for connection pooling and security
   - Bastion host for secure database access
   - Automated backups
   - Credentials stored in AWS Secrets Manager

3. **Backend Application**
   - ECS Fargate for containerized deployment
   - Application Load Balancer for traffic distribution
   - Auto-scaling based on CPU and memory utilization

4. **Frontend Hosting**
   - S3 for static file hosting
   - CloudFront for global content delivery
   - HTTPS support with ACM certificates

5. **Video Processing**
   - S3 buckets for original and transcoded videos
   - MediaConvert for video transcoding to HLS format
   - CloudFront for video streaming

6. **DNS and SSL**
   - Route53 for DNS management (optional)
   - ACM for SSL certificates

### Prerequisites
1. Install Terraform (v1.0.0+)
2. Configure AWS CLI with appropriate credentials
3. Create an S3 bucket for Terraform state (or use an existing one)
4. Create a DynamoDB table for state locking (optional)

### Setting Up Remote State
Before running Terraform, set up the remote state infrastructure:

```bash
# Navigate to the infra directory
cd infra

# Run the setup script (Windows)
.\setup-remote-state.ps1

# Or for Linux/macOS
./setup-remote-state.sh
```

### Deploying Infrastructure

1. Navigate to the environment directory:
   ```bash
   cd infra/environments/dev
   ```

2. Initialize Terraform:
   ```bash
   terraform init
   ```

3. Create a workspace (optional):
   ```bash
   terraform workspace new dev
   ```

4. Review the execution plan:
   ```bash
   terraform plan
   ```

5. Apply the changes:
   ```bash
   terraform apply
   ```

6. After deployment, Terraform will output important information:
   - S3 bucket names
   - CloudFront domain names
   - RDS endpoint and RDS Proxy endpoint
   - Bastion host public IP address
   - ECS service details
   - Environment variables for your application

### Environment Configuration
After deploying the infrastructure, update your application's `.env` file with the values from the Terraform output:

```bash
# Get the environment variables content
terraform output env_file_content
```

## API Documentation
Once the backend is running, you can access the API documentation at:
- Local development: `http://localhost:8000/docs`
- Deployed API: `https://api.[your-domain]/docs` (if using a custom domain)
- Or via the ALB DNS: `http://[alb-dns-name]/docs`

## Infrastructure Cost Optimization

The infrastructure is designed to be cost-effective while providing all necessary components:

1. **Development Environment**
   - Single-AZ RDS instance (db.t4g.micro - free tier eligible)
   - Minimal ECS Fargate resources (0.25 vCPU, 0.5GB RAM)
   - No multi-AZ deployments
   - CloudFront with minimal edge locations (PriceClass_100)

2. **Production Environment**
   - Multi-AZ RDS for high availability
   - Auto-scaling for ECS tasks
   - CloudFront with global edge locations (PriceClass_All)
   - Enhanced security features

You can further optimize costs by:
- Scheduling the development environment to shut down during non-working hours
- Using Reserved Instances for RDS in production
- Setting up S3 lifecycle policies to archive or delete old content
- Monitoring and adjusting resources based on actual usage

## CI/CD Pipeline

The application includes a comprehensive CI/CD pipeline using GitHub Actions:

1. **Infrastructure Pipeline**: Manages the Terraform infrastructure
2. **Backend Pipeline**: Builds and deploys the FastAPI backend
3. **Frontend Pipeline**: Builds and deploys the React frontend

For detailed information about the CI/CD pipeline, see [CI/CD Documentation](docs/CICD.md).

### Setting Up the Pipeline

1. Push your code to GitHub
2. Configure the required GitHub secrets (see CI/CD documentation)
3. Run the "Initialize Infrastructure" workflow
4. Run the "Terraform Infrastructure" workflow to create the initial infrastructure

After the initial setup, the pipeline will automatically deploy changes when you push to the main branch.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
