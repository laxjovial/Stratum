# API Documentation (Initial Draft)

This document provides a high-level overview of the RESTful API for the Stratum backend. The API is built with FastAPI.

## 1. Authentication

All endpoints (except for login/signup) are protected. Clients must include a JSON Web Token (JWT) provided by Firebase Authentication in the `Authorization` header of their requests.

**Example Header:**
`Authorization: Bearer <FIREBASE_JWT>`

The backend will verify the token's validity and extract the user's identity (`firebase_uid`) before processing the request.

## 2. API Versioning

The API will be versioned to ensure backward compatibility. The base path for all endpoints will be `/api/v1`.

## 3. Resource Endpoints

Below is a list of the primary resources and the endpoints that will be available to interact with them.

---

### `/auth`
Handles the final step of user registration.

*   `POST /auth/register`
    *   **Description:** Completes user registration after they have been created in Firebase. The request body will contain information to create the user record in our database and link it to the `firebase_uid`.
    *   **Called:** Once, immediately after a new user signs up on the frontend.

---

### `/organizations`
Manages tenant organizations.

*   `POST /organizations`
    *   **Description:** Creates a new organization. Typically called during the "First Run" setup by an Org Admin.
*   `GET /organizations/{org_id}`
    *   **Description:** Retrieves details for a specific organization.
*   `PUT /organizations/{org_id}`
    *   **Description:** Updates an organization's details.

---

### `/users`
Manages users within an organization.

*   `POST /organizations/{org_id}/users/invite`
    *   **Description:** Invites a new user to the organization by email.
*   `GET /organizations/{org_id}/users`
    *   **Description:** Lists all users in an organization.
*   `PUT /users/{user_id}/role`
    *   **Description:** Assigns or changes a user's role.

---

### `/hierarchy`
Manages the organizational chart.

*   `POST /organizations/{org_id}/departments`
    *   **Description:** Creates a new department.
*   `GET /organizations/{org_id}/departments`
    *   **Description:** Retrieves the full department structure.
*   `PUT /departments/{dept_id}`
    *   **Description:** Updates a department's name or parent.
*   `POST /departments/{dept_id}/members`
    *   **Description:** Assigns a user to a department.

---

### `/content`
Manages lessons and quizzes.

*   `POST /lessons`
    *   **Description:** Creates a new lesson.
*   `GET /lessons/{lesson_id}`
    *   **Description:** Retrieves a lesson.
*   `PUT /lessons/{lesson_id}`
    *   **Description:** Updates a lesson.
*   (Similar CRUD endpoints for `quizzes`, `questions`, etc.)

---

### `/documents`
Manages documents for the RAG pipeline.

*   `POST /documents/upload`
    *   **Description:** Provides a secure, pre-signed URL for the client to upload a file directly to S3.
*   `GET /documents`
    *   **Description:** Lists all documents and their processing status for the organization.

---

### `/chat`
The primary endpoint for AI-powered search.

*   `POST /chat`
    *   **Description:** Accepts a user query. Triggers the RAG pipeline to retrieve context and generate an answer. This will likely be a streaming response.
    *   **Request Body:** `{ "query": "What is our vacation policy?" }`
    *   **Response Body:** A stream of text chunks forming the answer.

---

### `/analytics`
Provides data for the admin dashboard.

*   `GET /analytics/completion`
    *   **Description:** Retrieves data on course completion rates.
*   `GET /analytics/engagement`
    *   **Description:** Retrieves data on user activity and forum engagement.

---

*(This is an initial outline. Detailed request/response models, parameters, and error codes will be documented using OpenAPI/Swagger as part of the backend implementation.)*
