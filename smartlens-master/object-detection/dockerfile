# Use an official Python image as a base
FROM python:3.9-slim

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Create a virtual environment named myenv
RUN python -m venv myenv

# Activate the virtual environment
RUN  myenv\Scripts\activate

# Install the dependencies
RUN pip install -r requirements.txt

# Copy the application code
COPY . .

# Run the application
CMD ["python", "api/app.py"]