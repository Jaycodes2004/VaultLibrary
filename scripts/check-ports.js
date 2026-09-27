const { execSync } = require('child_process');

try {
  const netstat = execSync('netstat -ano -p tcp').toString();
  const tasklist = execSync('tasklist /FO CSV /NH').toString();

  const processes = {};
  tasklist.split('\n').forEach((line) => {
    const match = line.match(/^"([^"]+)","(\d+)"/);
    if (match) {
      processes[match[2]] = match[1];
    }
  });

  const ports = {};
  netstat.split('\n').forEach((line) => {
    if (line.includes('LISTENING')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const local = parts[1];
        const pid = parts[4];
        const port = local.split(':').pop();
        if (!ports[port]) {
          ports[port] = {
            port: parseInt(port, 10),
            pid,
            processName: processes[pid] || 'System Service'
          };
        }
      }
    }
  });

  const sorted = Object.values(ports).sort((a, b) => a.port - b.port);
  console.log('\n=== CURRENTLY ASSIGNED / LISTENING PORTS ON THIS SYSTEM ===');
  console.table(sorted);

  const port9000InUse = !!ports['9000'];
  console.log(`\nIs Port 9000 Free? ${port9000InUse ? 'NO (Already In Use)' : 'YES (Available and Free to Use)'}`);
} catch (err) {
  console.error(err);
}
