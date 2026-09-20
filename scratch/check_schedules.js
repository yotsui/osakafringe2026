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

    const perfWithDates = allPerformances.find(p => p.dates && p.dates.length > 0);
    if (perfWithDates) {
        console.log("=== Found performance with dates ===");
        console.log(JSON.stringify(perfWithDates.dates[0], null, 2));
    } else {
        console.log("No dates found in any performance.");
    }
  } catch(e) {
    console.error(e.message);
  }
}
main();
