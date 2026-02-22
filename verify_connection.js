const fs = require('fs');
const path = require('path');

// Manual .env parsing to avoid dependency
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envLines = envFile.split('\n');
        const env = {};
        envLines.forEach(line => {
            const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
            if (match) {
                env[match[1]] = match[2];
            }
        });
        return env;
    } catch (e) {
        console.error("Could not load .env file", e.message);
        return {};
    }
}

const env = loadEnv();
const SUPABASE_DB_USER = env.SUPABASE_DB_USER;
const SUPABASE_DB_PASSWORD = env.SUPABASE_DB_PASSWORD;
const SUPABASE_DB_PORT = env.SUPABASE_DB_PORT || 6543;

// Check for 'pg' module
let Client;
try {
    Client = require('pg').Client;
} catch (e) {
    console.error("❌ 'pg' module not found. Please run 'npm install pg' to run this verification script.");
    process.exit(1);
}

async function testConnection() {
    console.log("Testing Supabase Connection...");
    console.log(`User: ${SUPABASE_DB_USER}`);
    console.log(`Port: ${SUPABASE_DB_PORT}`);
    console.log(`Host: db.otwrjisvqfmlwngbsoiq.supabase.co`);

    const client = new Client({
        host: 'db.otwrjisvqfmlwngbsoiq.supabase.co',
        port: SUPABASE_DB_PORT,
        user: SUPABASE_DB_USER,
        password: SUPABASE_DB_PASSWORD,
        database: 'postgres',
        ssl: {
            rejectUnauthorized: false
        },
    });

    try {
        await client.connect();
        console.log("✅ Connection Successful!");

        const res = await client.query('SELECT current_user, version();');
        console.log(`Connected as: ${res.rows[0].current_user}`);
        console.log(`Version: ${res.rows[0].version}`);

        // Test RPC access if possible
        // const rpcRes = await client.query("SELECT * FROM handle_router_logic('test', 'test', '{}')");
        // console.log("RPC Test Result:", rpcRes.rows);

        await client.end();
        console.log("✅ Connection Verification Complete.");
    } catch (err) {
        console.error("❌ Connection Failed:", err);
    }
}

testConnection();
