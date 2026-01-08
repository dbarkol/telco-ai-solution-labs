## Local Testing and Azure Deployment 

### Create an Azure Function App

This will auto create a storage account + container and app insights instance
- Optional: Go to storage account and enable access for yourself. Role - Storage Blob data owner.

When func is deployed, two storage containers - `azure-webjobs-hosts` and `azure-webjobs-secrets` are automatically created.
- In Func App Settings: Deployment settings: Set application package container location & authentication type to `system managed identity`.
- In Func App Settings: Identity - Go to function app and enable `system managed/assigned identity`
- Go to storage account and set `Storage blob data owner/contributor` role to Function app managed identity.
- Go to storage account and set `Storage Queue Data Contributor` role to function app managed identity.
- In Func App Settings: Env Variables: Set `AzureWebJobsStorage__accountName` to storage account & `AzureWebJobsStorage__credential` to `managedidentity`.
- In Function App: App Keys: `mcp_extension` key can be retrieved from the portal or using az funcapp command.  Refer to Azure Function documentation.
- Also assign `storage blob data owner/contributor` role to the linux/jumpbox vm. This is required for Az function CLI to deploy the app to Azure.

### Install Azurite

Refer to this [doc](https://learn.microsoft.com/en-us/azure/storage/common/storage-install-azurite?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json&tabs=visual-studio%2Cblob-storage)

### Run Azurite

```bash
azurite --silent --location ./azurite --debug ./azurite/debug.log
```

### Publish the Function to Azure Function App
Refer to this [doc](https://learn.microsoft.com/en-us/azure/azure-functions/functions-core-tools-reference?tabs=v2#func-azure-functionapp-fetch-app-settings)

### Important Notes
Make the following updates to the Function prior to deploying it to Azure Function App

- host.json:

  As per docs, configure extensionBundle and set "webhookAuthorizationLevel": "Anonymous".  If this value is set to 'System', then HTTP header (api-key)
will need to be passed in when invoking a tool (function).

- local.settings.json:

  For local testing, download + run Azurite and set - "AzureWebJobsStorage": "UseDevelopmentStorage=true"
