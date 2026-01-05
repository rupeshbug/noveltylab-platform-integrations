# Meta Messaging Integration (Messenger and WhatsApp)

This document explains how Messenger and WhatsApp were configured using **Meta Developers** and **Meta Business Suite**, including webhook setup, token generation, and local testing with ngrok.

## Overview

Meta integrations require **two separate dashboards** that work together:

1. **Meta Developers** – App, webhook, and product configuration  
2. **Meta Business Suite** – Business assets, permissions, system users, and tokens

Both are mandatory for Messenger and WhatsApp.

## Common Requirements

- Meta account
- Meta Business Account
- Public HTTPS URL (used via ngrok during development)
- Node.js backend with webhook endpoints

---

## Messenger Configuration

### 1. Create Meta App

- Go to **Meta Developers**
- Create a new app
- App type: *Business*
- Save **App ID** and **App Secret**

![Meta Developers Dashboard](./images/img1.png)

### 2. Add Messenger Product

- Inside the app → Add product → **Messenger**
- Now we will configure settings.

### 3. Page Connection

- Connect a **Facebook Page** to the app
- This page will send and receive messages

![Connect Facebook Page](./images/img2.png)

### 4. Webhook Setup

- Go to **Webhooks** in your dashboard. Click **Set Up**.
- Add webhook URL: (https://<ngrok-domain>/webhook/messenger) 
> During local development, **ngrok** is used to expose the local server with a public HTTPS URL so Meta can reach the webhook.
- Verify using the **verify token** defined in the backend 
- Subscribe to the following events:
    - messages
    - messaging_postbacks

![Webhook Setup](./images/img3.png)

> Once verified, Messenger events will be delivered to the backend webhook endpoint.

---
