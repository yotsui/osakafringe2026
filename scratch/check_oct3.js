const fs = require('fs');

async function main() {
  try {
    let allPerformances = [];
    let offset = 0;
    while(offset < 200) {
      const res = await fetch(`https://${process.env.MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/performances?limit=50&offset=${offset}`, {
        headers: { 'X-MICROCMS-API-KEY': process.env.MICROCMS_API_KEY }
      });
      const data = await res.json();
      if(data.contents && data.contents.length > 0) {
        allPerformances.push(...data.contents);
      } else {
        break;
      }
      offset += 50;
    }

    const perfStr = JSON.stringify(allPerformances);
    console.log("Includes '2026-10-03' anywhere?", perfStr.includes('2026-10-03'));
    
    if (perfStr.includes('2026-10-03')) {
        const idx = perfStr.indexOf('2026-10-03');
        console.log("Context:", perfStr.substring(Math.max(0, idx - 100), idx + 100));
    }
  } catch(e) {
    console.error(e.message);
  }
}
main();
