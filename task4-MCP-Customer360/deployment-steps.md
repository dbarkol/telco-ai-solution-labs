
## Local Testing

- Install dependencies
  ```bash
  npm install
  ```

- Create .env file
  ```bash
  cp .env.example .env
  ```

- Start the server
  ```bash
  npm start
  ```

## Create Container image and push to ACR

```bash
# List container images
docker images

# Build the MCP Server container
. ./scripts/build-container.sh

# Tag the mcp server container
docker tag telco-mcp-cust-info oaiapigateway.azurecr.io/telco-mcp-cust-info:v1.0.2.122325

# Login to Azure
az Login

# Login to Azure container registry.  Substitute the correct value for ACR Name
az acr login -n {acr-name}.azurecr.io

# Push the mcp customer info. server to acr
docker push {acr-name}.azurecr.io/telco-mcp-cust-info:v1.0.2.122325
```

## Create an Azure Container App
Refer to this [doc](https://learn.microsoft.com/en-us/azure/container-apps/quickstart-portal)