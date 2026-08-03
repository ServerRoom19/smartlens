# Stage 1: Build the Next.js app
FROM node:20-alpine as smart-lens
WORKDIR /app

# Copy package files and Prisma schema before installing dependencies
COPY ./smart-lens/package*.json ./
COPY ./smart-lens/prisma ./prisma

# Install dependencies
RUN npm install

# Copy the entire source code of the Next.js app
COPY ./smart-lens/ ./

# Run the build command
RUN npm run build

# Stage 2: Build Flask app
FROM python:3.9-slim as object-detection
WORKDIR /app

# Copy the source code of the Flask app
COPY ./object-detection/ .

# Stage 3: Combine both apps into the final container
FROM node:20-bullseye-slim
WORKDIR /app

# Copy the built Next.js app from the smart-lens stage
COPY --from=smart-lens /app /app/smart-lens

# Copy the built Flask app from the object-detection stage
COPY --from=object-detection /app /app/object-detection

# Install Python and required packages
RUN apt-get update && apt-get install -y python3 python3-venv libgl1 libglib2.0-0

# Create a virtual environment
RUN python3 -m venv myenv

# Activate virtual environment and install dependencies
COPY ./object-detection/requirements.txt .
RUN . myenv/bin/activate && pip install -r requirements.txt
RUN . myenv/bin/activate && myenv/bin/pip install opencv-python
RUN . myenv/bin/activate && myenv/bin/pip install flask_cors

# Create an entrypoint script
RUN echo '#!/bin/bash\nsource /app/myenv/bin/activate\nexec "$@"' > /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the ports for both apps
EXPOSE 3000 5000

# Use the entrypoint script to activate the virtual environment before starting the apps
ENTRYPOINT ["/entrypoint.sh"]

# Start both apps in parallel using bash
CMD ["bash", "-c", "cd /app/smart-lens && npm start & cd /app/object-detection && python -m api.app"]