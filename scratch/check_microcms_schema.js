const fs = require('fs');

async function main() {
  const pageSize = 50;
  try {
    let allPerformances = [];
    let offset = 0;
    while(offset < 200) {
      const res = await fetch(`https://${process.env.MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/performances?limit=${pageSize}&offset=${offset}`, {
        headers: { 'X-MICROCMS-API-KEY': process.env.MICROCMS_API_KEY }
      });
      const data = await res.json();
      if(data.contents && data.contents.length > 0) {
        allPerformances.push(...data.contents);
      } else {
        break;
      }
      offset += pageSize;
    }

    const performances = allPerformances;
    
    // find any object containing open_date key anywhere
    const findKey = (obj, keyToFind, path = "") => {
      if (!obj || typeof obj !== 'object') return null;
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          const res = findKey(obj[i], keyToFind, `${path}[${i}]`);
          if (res) return res;
        }
      } else {
        if (keyToFind in obj) {
           return { path: `${path}.${keyToFind}`, val: obj[keyToFind], obj };
        }
        for (const k of Object.keys(obj)) {
          const res = findKey(obj[k], keyToFind, `${path}.${k}`);
          if (res) return res;
        }
      }
      return null;
    };

    console.log("=== Searching for open_date ===");
    const foundOpenDate = findKey(performances, 'open_date');
    if (foundOpenDate) {
      console.log(`Found open_date at path: ${foundOpenDate.path}`);
      console.log(`Value: ${foundOpenDate.val}`);
      console.log(`Object containing it:`, foundOpenDate.obj);
    } else {
      console.log("No open_date found in any performance");
    }

    console.log("\n=== Searching for open ===");
    const foundOpen = findKey(performances, 'open');
    if (foundOpen) {
      console.log(`Found open at path: ${foundOpen.path}`);
      console.log(`Value: ${foundOpen.val}`);
      console.log(`Object containing it:`, foundOpen.obj);
    } else {
      console.log("No open found in any performance");
    }
  } catch(e) {
    console.error(e.message);
  }
}
main();
