Web application that uses generative AI to simplify online sharing of recipes.

# Scheduled Workers:
- For information related to various cron jobs used in recipes-ai see [this.](./scheduled-workers.md)

# Tech Stack

* React
* Tailwind
* Node.js with Express
* MongoDB
* CloudFlare Images to act as the CDN for serving images
* Clerk
* OpenAI Platform SDK
* Cloudflare Workers

# List of Features

## Find recipes

* Publicly view shared recipes.
* Search recipes by name, author or diet.
* Pagination wherever a list/grid of recipes is displayed.

## Share recipes

* Add recipes with AI Assistance
  * AI will do the following:
    * Write the introduction and description of the recipe (GPT 3.5)
    * Identify and sort ingredients used in the recipe to build a categorised ingredient list, and associate ingredents with steps in which they are used. (GPT 3.5)
    * Identify whether the recipe is non-vegetarian, vegetarian or vegan.
    * Visualise and generate a cover image for the recipe if none is uploaded (GPT 3.5 & DALL-E 2)
      
 * Asynchronous processing of recipe submissions with polling-based status updates.

## Manage your recipes

* Authenticate with 3rd party OAuth providers or a local username and password.
* View recipes shared by you. 
* Delete your recipes.
* Manually edit your recipes to correct typos or mistakes in AI generated elements.

## Community Safety

* AI-powered spam filteration.
* AI-powered insights on common food allergens in recipes.
* AI-powered insights on the health implications of recipes.

# Related Resources:
- [Setting up Atlas App Service to connect with Cloudflare workers](https://www.mongodb.com/developer/products/atlas/cloudflare-worker-rest-api/#check-out-the-rest-api-code).
- [Finding your Cloudflare Account ID and API token](https://developers.cloudflare.com/images/cloudflare-images/api-request).