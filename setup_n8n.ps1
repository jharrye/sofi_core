
# n8n Setup Script


# 0. Load Configuration from .env
$EnvPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $EnvPath) {
    Get-Content $EnvPath | ForEach-Object {
        if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)\s*$') {
            $Key = $matches[1]
            $Value = $matches[2]
            Set-Variable -Name "ENV_$Key" -Value $Value -Scope Script
        }
    }
    Write-Host "Loaded configuration from .env"
} else {
    Write-Error ".env file not found at $EnvPath"
    exit 1
}

$N8N_URL = "http://localhost:5678"
# Note: Ideally API Key should also be in .env, but keeping as is for now if not present there.
$API_KEY = os.getenv("N8N_API_KEY", "your_api_key_here")

$Headers = @{
    "X-N8N-API-KEY" = $API_KEY
    "Content-Type" = "application/json"
}

# 1. Create Credential
# Using Transaction Pooler Port (Default 6543) and Service Key/User
$CredBody = @{
    name = "Supabase Postgres"
    type = "postgres"
    data = @{
        host = "db.otwrjisvqfmlwngbsoiq.supabase.co"
        user = $ENV_SUPABASE_DB_USER
        password = $ENV_SUPABASE_DB_PASSWORD
        database = "postgres"
        port = [int]$ENV_SUPABASE_DB_PORT
        ssl = "require" 
    }
} | ConvertTo-Json -Depth 4

Write-Host "Creating Credential..."
try {
    $CredResponse = Invoke-RestMethod -Uri "$N8N_URL/api/v1/credentials" -Method Post -Headers $Headers -Body $CredBody
    $CredId = $CredResponse.id
    Write-Host "Credential Created: $CredId"
} catch {
    Write-Host "Error creating credential: $_"
    # If error is about duplicate name, we might want to continue using basic auth logic or just warn. 
    # For now, let's try to proceed, but if CredId is null workflow creation will fail for that node.
    $CredId = "UNKNOWN"
}

# 2. Create Workflow
$WebhookId = [Guid]::NewGuid().ToString()

$WorkflowNodes = @(
    @{
        parameters = @{
            path = "whatsapp-webhook"
            responseMode = "lastNode"
            options = @{}
        }
        name = "WhatsApp Webhook"
        type = "n8n-nodes-base.webhook"
        typeVersion = 1
        position = @(460, 460)
        webhookId = $WebhookId
    },
    @{
        parameters = @{
            operation = "executeQuery"
            query = "SELECT * FROM handle_router_logic(`$1, `$2, `$3)"
            additionalFields = @{
                queryParams = "{{ `$json.body.wa_phone }}, {{ `$json.body.wa_message_id }}, {{ JSON.stringify(`$json.body) }}"
            }
        }
        name = "Router Logic"
        type = "n8n-nodes-base.postgres"
        typeVersion = 1
        position = @(680, 460)
        credentials = @{
            postgres = @{
                id = $CredId
                name = "Supabase Postgres"
            }
        }
    }
)

$WorkflowConnections = @{
    "WhatsApp Webhook" = @{
        main = @(
            @(
                @{
                    node = "Router Logic"
                    type = "main"
                    index = 0
                }
            )
        )
    }
}

$WorkflowBody = @{
    name = "WhatsApp Router Flow"
    nodes = $WorkflowNodes
    connections = $WorkflowConnections
    settings = @{
        executionOrder = "v1"
    }
} | ConvertTo-Json -Depth 10

Write-Host "Creating Workflow..."
try {
    $WorkflowResponse = Invoke-RestMethod -Uri "$N8N_URL/api/v1/workflows" -Method Post -Headers $Headers -Body $WorkflowBody
    $WorkflowId = $WorkflowResponse.id
    Write-Host "Workflow Created: $WorkflowId"
    
    # 3. Activate
    Write-Host "Activating Workflow..."
    try {
        $ActivationResponse = Invoke-RestMethod -Uri "$N8N_URL/api/v1/workflows/$WorkflowId/activate" -Method Post -Headers $Headers
        Write-Host "Workflow Activated: $($ActivationResponse.active)"
    } catch {
        Write-Host "Error activating workflow: $_"
    }
    
    Write-Host "Webhook URL (Production): $N8N_URL/webhook/whatsapp-webhook"
    Write-Host "Webhook URL (Test): $N8N_URL/webhook-test/whatsapp-webhook"
} catch {
    Write-Host "Error creating workflow: $_"
}
