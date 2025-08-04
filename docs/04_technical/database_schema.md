# Database Schema

This document outlines the initial database schema for the Stratum platform. The primary database will be PostgreSQL.

## Table of Contents
1.  Core & User Management
2.  Organizational Structure
3.  Content & Training
4.  Documents & AI
5.  Social & Collaboration
6.  Billing

---

### 1. Core & User Management

#### `organizations`
Stores information about each tenant organization.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique identifier for the organization. |
| `name` | VARCHAR(255) | NOT NULL | The name of the organization. |
| `created_at` | TIMESTAMPZ | NOT NULL | Timestamp of creation. |

#### `users`
Stores user information. Linked to Firebase for authentication.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Internal unique identifier for the user. |
| `firebase_uid` | VARCHAR(255) | NOT NULL, UNIQUE | The unique ID provided by Firebase Auth. |
| `organization_id` | UUID | FOREIGN KEY (organizations.id) | The organization the user belongs to. |
| `role_id` | UUID | FOREIGN KEY (roles.id) | The role assigned to the user. |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address. |
| `full_name` | VARCHAR(255) | | User's full name. |
| `created_at` | TIMESTAMPZ | NOT NULL | Timestamp of creation. |

---

### 2. Organizational Structure

#### `roles`
Stores custom roles defined by each organization.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique identifier for the role. |
| `organization_id` | UUID | FOREIGN KEY (organizations.id) | The organization that defined this role. |
| `name` | VARCHAR(255) | NOT NULL | Name of the role (e.g., "Admin", "Manager"). |
| `permissions` | JSONB | | A JSON object defining specific permissions. |

#### `departments`
Stores the departments within an organization, allowing for a hierarchy.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique identifier for the department. |
| `organization_id` | UUID | FOREIGN KEY (organizations.id) | The organization this department belongs to. |
| `name` | VARCHAR(255) | NOT NULL | Name of the department. |
| `parent_department_id` | UUID | FOREIGN KEY (departments.id) | Self-referencing key for hierarchical structure. |

#### `department_members`
A join table linking users to departments (many-to-many).
| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | UUID | PRIMARY KEY, FOREIGN KEY (users.id) | User's ID. |
| `department_id` | UUID | PRIMARY KEY, FOREIGN KEY (departments.id) | Department's ID. |

---

### 3. Content & Training

#### `lessons`
Stores training lessons.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique ID for the lesson. |
| `organization_id` | UUID | FOREIGN KEY (organizations.id) | The organization this lesson belongs to. |
| `author_id` | UUID | FOREIGN KEY (users.id) | The user who created the lesson. |
| `title` | VARCHAR(255) | NOT NULL | The title of the lesson. |
| `content` | TEXT | | The main body of the lesson (e.g., Markdown). |
| `created_at` | TIMESTAMPZ | NOT NULL | Timestamp of creation. |
| `updated_at` | TIMESTAMPZ | | Timestamp of last update. |

#### `quizzes` and related tables
(Schema for `quizzes`, `quiz_questions`, `quiz_answers`, and `quiz_submissions` will be detailed here.)

---

### 4. Documents & AI

#### `documents`
Tracks documents uploaded for the RAG pipeline.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique ID for the document. |
| `organization_id` | UUID | FOREIGN KEY (organizations.id) | The organization this document belongs to. |
| `uploader_id` | UUID | FOREIGN KEY (users.id) | The user who uploaded the document. |
| `file_name` | VARCHAR(255) | NOT NULL | Original name of the file. |
| `s3_path` | VARCHAR(1024)| NOT NULL | Path to the file in the S3 bucket. |
| `status` | VARCHAR(50) | NOT NULL | Processing status (e.g., PENDING, PROCESSED, FAILED). |
| `uploaded_at` | TIMESTAMPZ | NOT NULL | Timestamp of upload. |

---

### 5. Social & Collaboration

#### `forum_threads` and `forum_posts`
(Schema for the forum system will be detailed here.)

---

### 6. Billing

#### `subscriptions`
Tracks the billing status of each organization.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique ID for the subscription record. |
| `organization_id`| UUID | FOREIGN KEY (organizations.id), UNIQUE | The organization this subscription belongs to. |
| `stripe_customer_id` | VARCHAR(255)| NOT NULL, UNIQUE | Stripe's customer ID. |
| `stripe_subscription_id` | VARCHAR(255)| NOT NULL, UNIQUE | Stripe's subscription ID. |
| `status` | VARCHAR(50) | NOT NULL | Subscription status (e.g., active, canceled, past_due). |
| `current_period_end` | TIMESTAMPZ | NOT NULL | When the current paid period ends. |
