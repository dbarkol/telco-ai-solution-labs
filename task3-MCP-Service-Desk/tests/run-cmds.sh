#!/bin/bash

# Start the Azurite storage emulator
azurite

# Start the function app
func start

# Package the function app for deployment (Optional)
zip -r deployment.zip . -x "*.git*" "local.settings.json" "tests/*" "node_modules/*" "*azurite*.*" "AzuriteConfig" "package-lock.json" "*blobstorage*/*" "*queuestorage*/*"

# Publish the function app to Azure
# Note: Replace <YourFunctionAppName> with the actual name of your Azure Function App.
func azure functionapp publish <YourFunctionAppName> --zip-file deployment.zip

# Clean up the zip file after publishing
rm deployment.zip
