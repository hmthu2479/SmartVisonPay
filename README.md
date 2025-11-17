# Smart Vision Pay Kiosk

## Project Introduction
This is my graduation project: a **Smart Vision Pay Kiosk** that allows users to **scan products and generate bills** automatically using a **self fine-tuned YOLOv8 model** for object detection.  

The system also includes an **Admin Dashboard** to manage products, transactions, and customers.

---

## Features
- Scan products using camera or image input  
- Automatic bill generation  
- Transaction management  
- Admin dashboard with analytics and product management  
- Integration with **ZaloPay Sandbox** for payment testing  

---

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind, MUI  
- **Backend:** Node.js (Express), Flask (Python for YOLOv8 model)  
- **Database:** MongoDB  
- **Machine Learning:** YOLOv8 (self fine-tuned)  

---

## Project Structure
- frontend/ # React + TypeScript + Tailwind + MUI
- backend/ # Node.js Express API + MongoDB + Python Flask YOLOv8 API

---

## Prerequisites
- Node.js & npm  
- Python 3.10+  
- MongoDB  
- ngrok account (for ZaloPay sandbox testing)