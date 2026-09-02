# MCP Setup
npx sanity@latest mcp configure  # Configure MCP for your AI editor

# Schema & Types
npx sanity schemas deploy     # Deploy schema to Content Lake for MCP/editor access
npx sanity schemas extract    # Extract schema for TypeGen
npx sanity typegen generate  # Generate TypeScript types

# Development
npx sanity dev               # Start Studio dev server
npx sanity build             # Build Studio for production
npx sanity deploy            # Deploy Studio to Sanity hosting

# Blueprints (infrastructure as code)
npx sanity blueprints init    # Initialize a Blueprint and create a Stack
npx sanity blueprints plan    # Preview infrastructure changes (read-only)
npx sanity blueprints deploy  # Apply the Blueprint to the Stack
npx sanity blueprints info    # Verify Stack status and deployed resources
npx sanity blueprints logs    # View Stack deployment logs

# Help
npx sanity docs search "query"  # Search Sanity documentation
npx sanity --help               # List all CLI commands