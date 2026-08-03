
![Smart Lens](https://github.com/Saharsh101103/smartlens/blob/master/smart-lens/public/android-chrome-512x512.png?raw=true)

# Smart-Lens

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/navendu-pottekkat/awesome-readme?include_prereleases)](https://img.shields.io/github/v/release/navendu-pottekkat/awesome-readme?include_prereleases)
[![GitHub](https://img.shields.io/github/license/navendu-pottekkat/awesome-readme)](https://img.shields.io/github/license/navendu-pottekkat/awesome-readme)

This repository contains a Next.js frontend application and a Flask backend for object detection using TensorFlow. This guide will help you set up and run the application using Docker.

# Table of Contents
- [Smart-Lens](##smart-lens)
- [Prerequisites](#Setup)
- [Running the Application](#RunningtheApplication)
- [Usage](#usage)
- [Endpoint](#Endpoint)
- [License](#License)


# Prerequisites

**Docker**: Ensure you have Docker installed on your system. You can download and install Docker from docker.com.  

# Setup


**1. Clone the Repository**
Clone this repository to your local machine:
```shell
git clone https://github.com/Saharsh101103/smartlens.git
cd smartlens
```
**2. Setup environment variable**
Create .env file in "smartlens/smart-lens/.env"
Setup database and database keys to .env:
```shell
DATABASE_URL= "Add your db URL"
NEXT_PUBLIC_SUPABASE_URL="Add your db PUBLIC URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="Add your db ANON KEY"
```

Setup search engine using GOOGLE DEVELOPER CONSOLE, and add KEYS to .env:
```shell
GOOGLE_KEY="Add google_key"
GOOGLE_ID="Add google_id"
```

Add backend URL to .env:
```shell
BACKEND_URL="http://localhost:5000"
```

**3. Build the Docker Image
Build the Docker image using the Dockerfile provided:**
```shell
docker build -t smartlens .
```
This command creates a Docker image named smartlens based on the Dockerfile.

# Running the Application


**1. Start the Docker Container
Run the Docker container with the necessary port mappings:**
```shell
docker run -p 3000:3000 -p 5000:5000 smartlens
```
This command maps port 3000 for the Next.js frontend and port 5000 for the Flask backend.


**2. Access the Applications:**

Frontend (Next.js): Open your web browser and go to http://localhost:3000 to access the Next.js application.


# Endpoints


**Object Detection Endpoint**

URL: http://localhost:5000/detect

Method: POST

Description: Accepts an image URL and returns object detection results.

Request Body:
```shell
{
  "image_url": "http://example.com/image.jpg"
}

```

Response:
```shell
[
  {
    "class_name": "person"
  },
  {
    "class_name": "dog"
  }
]

```


# Contributor:

**Kshitiz Sharma** contributed in development of whole backend.

![Kshitiz Sharma](https://media.licdn.com/dms/image/v2/D4D03AQFLS-aBdLJAhQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1694627216748?e=1729123200&v=beta&t=zFhycPI0xghCX3YGrVMNkOkWyTGLSTqmo077UN3r6vM)

(https://github.com/Kshitiz19215)





# License


This project is licensed under the MIT License

[MIT license](./LICENSE)









