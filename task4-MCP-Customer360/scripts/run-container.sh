
docker run -d \
  --name telco-mcp-server \
  -p 3000:3000 \
  -e API_KEY=demo-api-key-12345 \
  telco-mcp-cust-info:latest