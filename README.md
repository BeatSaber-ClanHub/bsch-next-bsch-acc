# Beat Saber Clan Hub / Website

Welcome to the official open-source repository for the Beat Saber Clan Hub (BSCH) website! This project is built to be community-driven, and we encourage contributions from everyone. If you're interested in running this project yourself or contributing, please follow the guidelines below.

## Technologies Used

This project leverages the following technologies:

- **Next.js:** A React framework for building performant and scalable web applications. It provides features like server-side rendering, static site generation, and API routes. ([https://nextjs.org/](https://nextjs.org/))
- **React:** A JavaScript library for building user interfaces. It allows for creating reusable UI components and managing application state efficiently. ([https://react.dev/](https://react.dev/))
- **Tailwind CSS:** A utility-first CSS framework that provides a set of pre-defined CSS classes for styling HTML elements. It allows for rapid UI development and customization. ([https://tailwindcss.com/](https://tailwindcss.com/))
- **shadcn/ui:** A collection of reusable UI components built with Radix UI Primitives and styled with Tailwind CSS. Provides a modern and accessible UI. ([https://ui.shadcn.com/](https://ui.shadcn.com/))
- **Supabase:** An open-source Firebase alternative that provides a suite of tools for building scalable and secure applications, including a PostgreSQL database, authentication, and real-time capabilities. ([https://supabase.com/](https://supabase.com/))
- **PostgreSQL:** A powerful, open-source relational database system used for storing and managing application data in Supabase. ([https://www.postgresql.org/](https://www.postgresql.org/))
- **Uploadthing:** A file upload service that simplifies the process of uploading files to the cloud. Provides secure and efficient file management. ([https://uploadthing.com/](https://uploadthing.com/))
- **Better Auth:** A library for simplifying authentication and authorization in web applications. Provides a secure and flexible way to manage user access. ([https://www.better-auth.com/](https://www.better-auth.com/))

## Contributions

We're excited to have you contribute! Whether you're a seasoned developer or new to open source, your ideas and contributions are welcome. Here's how you can get involved:

- **Submit Pull Requests (PRs):** If you have an idea for a new feature, bug fix, or improvement, feel free to create a pull request. We'll review it and, if it aligns with the project's goals, merge it into the main branch.
- **Suggest Ideas:** If you have suggestions but aren't comfortable contributing code, please share them in the `#suggestions` channel on the BSCH Discord server. We value your input!

## Running Locally (Development Setup)

To run this project locally, follow these steps:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/BeatSaber-ClanHub/bsch-next-bsch-acc.git
    cd <repository_directory>
    ```

2.  **Configure Environment Variables:**

    - Create a `.env` file in the project's root directory.
    - Populate the `.env` file with the following environment variables. Instructions for obtaining these variables are provided below.

3.  **Uploadthing Configuration:**

    - Go to [uploadthing.com](https://uploadthing.com/) and create a new project.
    - **`UPLOADTHING_TOKEN`:** Copy the API Key from your Uploadthing project and paste it into the `.env` file.
    - **`UPLOADTHING_HOSTNAME`:** Locate your App ID in the Uploadthing dashboard (under API Keys -> Legacy). Construct the Uploadthing hostname by prepending your App ID to `ufs.sh`. For example, if your App ID is `your-app-id`, the hostname would be `your-app-id.ufs.sh`. Paste this into the `.env` file.

4.  **Better Auth Configuration:**

    - Generate a `BETTER_AUTH_SECRET` value at [better-auth.com/docs/installation](https://www.better-auth.com/docs/installation).
    - Paste the generated secret into the `.env` file.

5.  **Discord OAuth Configuration:**

    - Set up a Discord OAuth application. Follow the Discord Developer documentation for instructions.
    - Obtain your Discord Client ID and Client Secret.
    - Paste the Client ID and Client Secret into the appropriate environment variables in the `.env` file.
    - Set the OAuth callback URL to `http://localhost:3000/api/auth/callback/discord`.

6.  **API Key Encryption Key:**

    - Create a 32-character encryption key for API key generation. This key is used to protect the generated API keys.
    - Paste the encryption key into the `ENCRYPTION_KEY` environment variable.

7.  **Prisma Setup:**

    - Set up a Prisma project. Follow the Supabase documentation for instructions.
    - Connect your Supabase project to your local development environment using the Prisma ORM. Update your `DATABASE_URL` in your `.env` file.

8.  **Install Dependencies:**

    ```bash
    npm install  # or yarn install, pnpm install
    ```

9.  **Run the Application:**

    ```bash
    npm run dev  # or yarn dev, pnpm dev
    ```

    This will start the development server. You can access the application in your browser at `http://localhost:3000`.

## Running Locally (Docker Development Setup)

This section outlines the steps to run the BSCH website locally within a Docker container. This approach provides a consistent and isolated environment for development.

**Prerequisites:**

- Docker installed on your system. You can download it from [https://www.docker.com/get-started](https://www.docker.com/get-started).
- A `.env` file populated with the necessary environment variables (see the "Running Locally" section above for instructions on obtaining these).
- A Dockerfile. This is included in the repo if you cloned it.

**Steps**

1. **Build the Docker Image:** Open a terminal in the project's root directory and run the following command to build the Docker image. Replace `<image_name>` with a name for your image (e.g., `bsch-dev`):

   ```bash
   docker build -t <image_name> .
   ```

2. **Run the Docker Container:** After the image is built, run the container using the following command. Replace `<image_name>` with the name you chose in the previous step:

   ```bash
   docker run -p 3000:3000 `<image_name>`
   ```

## Contributing Guidelines

I am not super picky with contribution guidelines. Just be civil and keep them meaningful. Please keep commit messages on topic to as it helps me out

We look forward to your contributions!
