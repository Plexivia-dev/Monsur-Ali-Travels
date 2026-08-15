const CF_API_TOKEN = process.env.CF_API_TOKEN;
const DOMAIN = process.env.CF_DOMAIN || 'monsuralitravels.com';
const VPS_IP = process.env.VPS_IP || '144.79.218.241';

if (!CF_API_TOKEN) {
  console.error('❌ Please provide CF_API_TOKEN environment variable. Example: CF_API_TOKEN=your_token node scripts/cloudflare_dns_setup.mjs');
  process.exit(1);
}

async function cfFetch(path, options = {}) {
  const url = `https://api.cloudflare.com/client/v4${path}`;
  const headers = {
    Authorization: `Bearer ${CF_API_TOKEN}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  return data;
}

async function run() {
  console.log('1. Verifying Cloudflare API Token & Account...');
  let accountId = null;

  try {
    const userRes = await cfFetch('/user/tokens/verify');
    console.log('Token verified status:', userRes.status || userRes.messages);
  } catch (err) {
    console.log('Token verify notice:', err.message);
  }

  try {
    const accountsRes = await cfFetch('/accounts');
    if (accountsRes.result && accountsRes.result.length > 0) {
      accountId = accountsRes.result[0].id;
      console.log(`Account ID found: ${accountId} (${accountsRes.result[0].name})`);
    } else {
      console.log('No accounts returned in direct query:', accountsRes);
    }
  } catch (err) {
    console.log('Accounts query error:', err.message);
  }

  console.log(`\n2. Checking if zone '${DOMAIN}' exists in Cloudflare...`);
  let zone = null;
  const zonesRes = await cfFetch(`/zones?name=${DOMAIN}`);
  if (zonesRes.result && zonesRes.result.length > 0) {
    zone = zonesRes.result[0];
    console.log(`Zone found! Zone ID: ${zone.id}`);
  } else {
    console.log(`Zone '${DOMAIN}' not found in query. Result:`, zonesRes);
  }

  if (!zone) {
    if (!accountId) {
      console.error('❌ Cannot create zone without account ID. Please verify token permissions.');
      return;
    }
    console.log(`Zone '${DOMAIN}' not found. Creating zone under account ${accountId}...`);
    const createRes = await cfFetch('/zones', {
      method: 'POST',
      body: JSON.stringify({
        name: DOMAIN,
        account: { id: accountId },
        jump_start: true,
        type: 'full',
      }),
    });
    if (createRes.success && createRes.result) {
      zone = createRes.result;
      console.log(`✅ Zone created successfully! Zone ID: ${zone.id}`);
    } else {
      console.error('❌ Failed to create zone:', JSON.stringify(createRes, null, 2));
      return;
    }
  }

  console.log('\n=============================================');
  console.log('📌 Cloudflare Nameservers for your domain:');
  if (zone.name_servers) {
    zone.name_servers.forEach((ns, i) => console.log(`  NameServer ${i + 1}: ${ns}`));
  }
  console.log('=============================================\n');

  console.log('3. Setting up DNS Records for VPS IP:', VPS_IP);
  const recordsToCreate = [
    { type: 'A', name: '@', content: VPS_IP, proxied: false, comment: 'Root domain' },
    { type: 'A', name: 'dashboard', content: VPS_IP, proxied: false, comment: 'Dashboard SPA' },
    { type: 'A', name: 'server', content: VPS_IP, proxied: false, comment: 'Backend API' },
    { type: 'A', name: 'service', content: VPS_IP, proxied: false, comment: 'Backend API service' },
    { type: 'A', name: 'www', content: VPS_IP, proxied: false, comment: 'WWW record' },
  ];

  const existingRecordsRes = await cfFetch(`/zones/${zone.id}/dns_records`);
  const existing = existingRecordsRes.result || [];

  for (const record of recordsToCreate) {
    const fullTarget = record.name === '@' ? DOMAIN : `${record.name}.${DOMAIN}`;
    const match = existing.find((r) => r.type === record.type && (r.name === fullTarget || r.name === record.name));
    
    const payload = {
      type: record.type,
      name: fullTarget,
      content: record.content,
      proxied: record.proxied,
      comment: record.comment,
      ttl: 1,
    };

    if (match) {
      console.log(`Updating existing record: ${fullTarget} (${record.type}) -> ${record.content}`);
      const updateRes = await cfFetch(`/zones/${zone.id}/dns_records/${match.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      console.log(`  Result: ${updateRes.success ? '✅ Success' : '❌ Error: ' + JSON.stringify(updateRes.errors)}`);
    } else {
      console.log(`Creating record: ${fullTarget} (${record.type}) -> ${record.content}`);
      const createRes = await cfFetch(`/zones/${zone.id}/dns_records`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(`  Result: ${createRes.success ? '✅ Success' : '❌ Error: ' + JSON.stringify(createRes.errors)}`);
    }
  }

  console.log('\n🎉 Cloudflare DNS configuration successfully completed!');
}

run().catch(console.error);
