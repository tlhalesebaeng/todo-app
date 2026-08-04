# Todo App

## Overview

This is a Todo application built using **Next.js 16**, **Prisma ORM**, and **SQLite**. The application allows users to manage tasks by assigning them a topic, status(fixed), and due date.

---

# Dependencies

## Runtime Dependencies

| Dependency                     | Version | Reason for Inclusion                                                                                                                                                                                                                                 |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| next                           | 16.2.12 | Chosen as the primary web framework because it provides file-based routing, server-side rendering, API routes, and production optimisations. The following dependencies came together with this one automatically: react(19.2.4), react-dom(19.2.4 ) |
| prisma                         | 7.9.1   | Chosen as the Object-Relational Mapper (ORM) to manage the database schema, migrations, and type-safe database access.                                                                                                                               |
| @prisma/client                 | 7.9.1   | Required by Prisma to generate the type-safe client used for querying the SQLite database.                                                                                                                                                           |
| better-sqlite3                 | 13.0.2  | Chosen as the SQLite database driver because it provides fast and reliable access to SQLite databases.                                                                                                                                               |
| @prisma/adapter-better-sqlite3 | 7.9.1   | Required so that Prisma can communicate with SQLite using the Better SQLite3 driver.                                                                                                                                                                 |

## Development Dependencies

| Dependency                  | Version | Reason for Inclusion                                                                                                       |
| --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| eslint                      | 9       | Chosen to identify programming errors and enforce consistent coding standards throughout the project.                      |
| eslint-config-next          | 16.2.12 | Required to provide the recommended ESLint configuration for Next.js applications.                                         |
| jest                        | 30.4.2  | Chosen as the testing framework for writing and executing automated unit and integration tests.                            |
| jest-environment-node       | 30.4.1  | Required by Jest to execute server-side tests in a Node.js environment.                                                    |
| babel-plugin-react-compiler | 1.0.0   | Installed automatically as part of the React Compiler tooling and was not explicitly chosen for application functionality. |

---

# Database Design

The application uses a SQLite relational database consisting of three tables.

## Task

| Column      | Type     | Description                                                |
| ----------- | -------- | ---------------------------------------------------------- |
| id          | Integer  | Primary key that uniquely identifies a task.               |
| title       | String   | Unique title of the task.                                  |
| description | String   | Detailed description of the task.                          |
| archived    | Boolean  | Indicates whether the task has been archived.              |
| statusId    | Integer  | Foreign key referencing the Status table.                  |
| topicId     | Integer  | Foreign key referencing the Topic table.                   |
| dueDate     | DateTime | Due date of the task.                                      |
| createdAt   | DateTime | Timestamp indicating when the task was created.            |
| updatedAt   | DateTime | Timestamp automatically updated whenever the task changes. |

---

## Topic

| Column | Type    | Description                                   |
| ------ | ------- | --------------------------------------------- |
| id     | Integer | Primary key that uniquely identifies a topic. |
| name   | String  | Unique name of the topic.                     |

---

## Status

| Column | Type    | Description                                    |
| ------ | ------- | ---------------------------------------------- |
| id     | Integer | Primary key that uniquely identifies a status. |
| name   | String  | Unique name of the status.                     |

---

# Table Relationships

The database contains two one-to-many relationships.

- **Topic → Task**
    - One topic can have many tasks.
    - Each task belongs to exactly one topic.

- **Status → Task**
    - One status can have many tasks.
    - Each task has exactly one status.

---

# Prerequisites

Before running the application, ensure the following software is installed:

- Node.js **v24.11.1**
- npm (included with Node.js)

---

# Installation

Clone the repository.

```bash
git clone https://github.com/tlhalesebaeng/todo-app
```

Navigate into the project directory.

```bash
cd todo-app
```

Install all project dependencies.

```bash
npm install
```

Create the environment configuration file by copying the example file.

**Linux/macOS**

```bash
cp .example.env .env
cp .example.test.env .env.test
```

**Windows Command Prompt**

```cmd
copy .example.env .env
copy .example.test.env .env.test
```

**Windows PowerShell**

```powershell
Copy-Item .example.env .env
Copy-Item .example.test.env .env.test
```

Generate the Prisma Client.

```bash
npx prisma generate
```

Create and synchronize the SQLite database with the Prisma schema.

```bash
npx prisma migrate dev
```

To view the database entries (Optional)

```bash
npx prisma studio
```

# Running the Application

Start the development server.

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

To build the application for production:

```bash
npm run build
```

To run the production build:

```bash
npm start
```

---

# Running Tests

Run all tests.

```bash
npm test
```

Generate a code coverage report.

```bash
npm run test:coverage
```

Both commands automatically push the Prisma schema to the SQLite test database before executing the test suite.
