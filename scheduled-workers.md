# Scheduled Workers:
All scheduled workers (cron jobs) used in the project, have been developed on the CloudFlare Workers platform. The following workers are coded in this project:
- NORI (Non-Operational Records & Images): It is a scheduled worker built to delete submission tracking records and Images that are no longer needed (non-operational). 
    - The purpose of the worker:
        - Delete tracking records of successful submissions, older than 1 day, from the database.
        - Delete tracking records of hanging (incomplete) submissions, older than 1 day, from the database and their corresponding images from Cloudflare Images.
        - Delete tracking records of unsuccessful submissions, older than 30 days, from the database.
    - Default Frequency is deleting records once, every day, at 3:30am UTC.
    - We need to communicate with our database through HTTP requests (TCP) as UDP connections are not possible from Cloudflare workers. Setting up an atlas app service (realm) instance, linked to our pending submissions collection would be required to make this happen.
    - 

## Running Locally

The wrangler tooling is required for running the worker locally, install using this command:

```bash
npm i -g wrangler@latest
```

`cd` into the folder of the desired worker and Install dependencies:

```bash
npm install
```

Add requisite environment variables, as per the guide of the specific worker, in the `wrangler.toml` file. Variables must be added in the following format:

```properties
[vars]
VAR_1 = "..."
VAR_2 = "..."
```

Run the worker using the following command:

```bash
wrangler dev --local
```

To trigger the worker manually visit the following link:

```url
http://localhost:[PORT]/cdn-cgi/mf/scheduled
```

Replace `[PORT]` with the assigned local port.

## Deployment

Deployment can only be done on the Cloudflare platform.

`Wrangler` is required for deployment, install the package if you haven't already:

```bash
npm i -g wrangler@latest
```

`cd` into the folder containing the worker that needs to be deployed and run the following command:

```bash
wrangler deploy
```

Running the command for the first time, would require you to login to your cloudflare account.

Once deployed, set the required environment variables from the `worker settings` page in your cloudflare dashboard.