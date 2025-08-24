// Add a click listener to the button
document.getElementById("generateResults").addEventListener("click", () => {
  
  // Get the currently active tab in the current window
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    
    // Inject a script into that tab
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: async () => {
        
        // Grab the <ul> with assessments using XPath
        const ul = document.evaluate(
          '//*[@id="menu"]/ul/li[2]/div/ul',
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;

        if (!ul) return console.log("No assessment list found");

        // Get all list items inside that <ul>
        const items = [...ul.querySelectorAll('li.item')];

        // Filter main assessments and build URLs
        const assessmentLinks = items.reduce((acc, li) => {
          const key = li.getAttribute('data-key');
          const path = li.getAttribute('data-path');
          const label = li.querySelector('label')?.innerText.trim();

          const isMain = path && /^\/assessments\/[^/]+$/.test(path) && key !== 'upcoming';
          const isYearFolder = /^\d{4}/.test(label);

          if (isMain && !isYearFolder) {
            acc.push(`https://student.sirius.vic.edu.au/#?page=/assessments/${key}`);
          }
          return acc;
        }, []);

        console.log("Assessment URLs:", assessmentLinks);

        // Fetch HTML content from each URL
        for (const url of assessmentLinks) {
          try {
            const response = await fetch(url, { credentials: "include" });
            const html = await response.text();
            console.log(`HTML for ${url}:`, html);
          } catch (err) {
            console.log(`Failed to fetch ${url}:`, err);
          }
        }
      }
    });
  });
});
