import { createRequire } from "module";
const require = createRequire(import.meta.url);

async function test() {
  try {
    const pdf = require("pdf-parse");
    console.log("pdf-parse type:", typeof pdf);
    console.log("pdf-parse default type:", typeof pdf.default);
    
    // Test extraction logic
    if (typeof pdf === 'function') {
      console.log("Found function at root");
    } else if (pdf.default && typeof pdf.default === 'function') {
      console.log("Found function at .default");
    } else {
      console.log("Keys in pdf-parse:", Object.keys(pdf));
    }
  } catch (e) {
    console.error("Error loading pdf-parse:", e);
  }
}

test();
