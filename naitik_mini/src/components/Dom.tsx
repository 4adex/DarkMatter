import Card from "./card";
import tag from "../Tag.png"
function Checkbox() {

    interface TreeNode {
      nid: string;
      tag: string;
      children: TreeNode[];
      content: string;
      nodeType: string; // adjust the type if needed
    }

    const handleClick = async () => {
      let [tab] = await chrome.tabs.query({ active : true });
      // giving generic params to executeScript for handling args
      chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {

            // ---- initiate variables ----
            var rootElement = document.documentElement;
            var node : TreeNode = {
                nid: 'root',
                tag: rootElement.tagName,
                children: [],
                content: rootElement.textContent ?? "",
                nodeType: "HTML_ELEMENT"
                }
            var nodeIdContentMap: { [key: string]: string } = {};
            const parentId = node.nid

            // set naitik id
            rootElement.setAttribute('naitik-id', parentId);
            traverseAndUpdate(rootElement, parentId, node);
            // create map
            iterateAndPopulateMap(node);
            console.log("Node id content Map")
            console.log(nodeIdContentMap);


            console.log("Declaring mock content map");
          //   nodeIdContentMap = {
          //     "root-1-3-1-3-1-2-0-0-3-2-6-3-2": "LIMITED TIME>> Harvest Season Specials",
          //     "root-1-3-1-3-1-2-0-0-3-2-6-3-3": "HURRY>> Offer Ends Nov 30th",
          //     "root-1-3-1-3-1-2-0-0-3-2-6-4": "88 Viewing This Product",
          // }
            
            // TODO ?? Basic clean map abhi (doable) or clean from backend? Depends on size of req and shit as poora content tree bhejna umm.

            // make request
            askNano(nodeIdContentMap)
              .then(results => {
                console.log(results);
                for (const key in results) {
                  if (results.hasOwnProperty(key)) {
                      const value = results[key];
                      console.log(`${key}: ${value}`);
                      //inject css with value
                      const element = document.querySelector(`[naitik-id="${key}"]`) as HTMLElement;
                      if (element) {

                        element.style.border = '1px solid red';
                        element.style.background = '#DFD4FF';
                        element.style.position = 'relative';
                        element.style.borderRadius = '13px';
                        element.style.padding = '10px';
                        element.style.margin = '10px';
                        // console.log(element.innerText);
                        const boxDiv = document.createElement('div');
                        boxDiv.style.display = 'flex';
                        boxDiv.style.justifyContent = 'center';
                        boxDiv.style.alignItems = 'center';
                        boxDiv.style.flex = 'flex';
                        boxDiv.style.color = 'white';
                        boxDiv.style.background = '#940CFF';
                        boxDiv.style.fontSize = '12px';
                        boxDiv.style.padding = '8px 22px';
                        boxDiv.style.fontSize = '12px';
                        boxDiv.style.borderRadius = '20px';
                        // boxDiv.style.height = '32px';
                        boxDiv.style.width = 'auto';
                        boxDiv.style.minWidth = '100px';
                        boxDiv.style.boxShadow = '0px 4px 10.7px 0px rgba(0, 0, 0, 0.25)';
                        boxDiv.style.position = 'absolute';
                        // boxDiv.style.left = `${element.offsetLeft + element.offsetWidth + 10}px`;
                        // boxDiv.style.top = `${element.offsetTop}px`;
                        boxDiv.style.right = '10%';
                        boxDiv.style.top = '-40%';
                        boxDiv.innerText = value;
                        // const textWidth = boxDiv.offsetWidth;
                        // boxDiv.style.width = `${textWidth}px`;

                        if (element.parentNode) {
                          element.appendChild(boxDiv);
                        }
                        console.log(element.innerText);
                    } else {
                        console.log('Element not found');
                    }
                  }
              }
            })
            .catch(error => {
              console.error('Error:', error.message);
            });

            // ---- Helper Functions ----
            function traverseAndUpdate(element:any, parent:any, node:any) {
              for (var i = 0; i < element.children.length; i++) {

                var childElement = element.children[i];
                var childNid = parent + '-' + i;
                var IGNORE_ELEMENTS = ["SCRIPT", "STYLE", "LINK", "NOSCRIPT", "IFRAME", "OBJECT", "EMBED", "PARAM", "SOURCE", "CANVAS", "SVG", "USE", "TRACK", "INPUT", "TEXTAREA", "SELECT", "OPTION", "OPTGROUP", "BUTTON", "LABEL", "FIELDSET", "LEGEND", "BR", "HR"];
                var BLOCK_ELEMENTS = ["DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "DL", "DT", "DD", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TH", "TD", "FORM", "HEADER", "FOOTER", "NAV", "SECTION", "ARTICLE", "ASIDE", "DETAILS", "DIALOG", "SUMMARY", "FIGURE", "FIGCAPTION", "ADDRESS", "MAIN", "HR", "PRE", "BLOCKQUOTE"];
                var INLINE_ELEMENTS = ["SPAN", "A", "STRONG", "B", "I", "EM", "MARK", "SMALL", "DEL", "INS", "SUB", "SUP", "Q", "CITE", "DFN", "ABBR", "TIME", "CODE", "VAR", "SAMP", "KBD", "STRONG", "B", "I", "EM", "MARK", "SMALL", "DEL", "INS", "SUB", "SUP", "Q", "CITE", "DFN", "ABBR", "TIME", "CODE", "VAR", "SAMP", "KBD", "S", "U", "WBR", "IMG", "BR", "INPUT", "TEXTAREA", "SELECT", "OPTION", "OPTGROUP", "BUTTON", "LABEL", "FIELDSET", "LEGEND", "IFRAME", "OBJECT", "EMBED", "PARAM", "SOURCE", "CANVAS", "SVG", "USE", "TRACK", "INPUT", "TEXTAREA", "SELECT", "OPTION", "OPTGROUP", "BUTTON", "LABEL", "FIELDSET", "LEGEND"];
                var contents = [];
    
                childElement.setAttribute('naitik-id', childNid);
                node.children.push({
                    nid: childElement.getAttribute('naitik-id'),
                    tag: childElement.tagName,
                    children: [],
                    content: !IGNORE_ELEMENTS.includes(childElement.tagName) ? cleanText(childElement.textContent) : "",
                    nodeType: IGNORE_ELEMENTS.includes(childElement.tagName) ? "IGNORE_ELEMENT" : BLOCK_ELEMENTS.includes(childElement.tagName) ? "BLOCK_ELEMENT" : INLINE_ELEMENTS.includes(childElement.tagName) ? "INLINE_ELEMENT" : "TEXT_NODE"
                    });
                if (node.nodeType == "TEXT_NODE" || node.nodeType == "INLINE_ELEMENT" || node.nodeType == "BLOCK_ELEMENT" || node.nodeType == "IGNORE_ELEMENT"){
                    contents.push(node.content);
                }
                traverseAndUpdate(childElement, childNid, node.children[i]);
              }
            }

            function cleanText(text:any) {
              const continuousSpaceOverTwoCharactorRule = /\s{2,}/g;
              const newText = text.replace(continuousSpaceOverTwoCharactorRule, ' ').replace('\n', '');
              return newText;
            }

            function iterateAndPopulateMap(node:TreeNode) : void {
              if(cleanContent(node.content))
              {nodeIdContentMap[node.nid] = node.content;}
  
              for (var i = 0; i < node.children.length; i++) {
              iterateAndPopulateMap(node.children[i]);
              }
          }

          //First I will assume that I have an askNano function that takes the content map and returns the dark patterns ka map
          async function askNano(requestbody:{ [key: string]: string }) {

            const allowedValues = [
              "LIMITED TIME>> Harvest Season Specials ",
              "HURRY>> Offer Ends Nov 30th ",
            ];

            const filteredRequestBody = Object.fromEntries(
              Object.entries(requestbody).filter(([_, value]) => allowedValues.includes(value))
            );
            console.log("-----------------filteredReqBody-----------------------");
            console.log(filteredRequestBody);
            console.log("-------------------------------------------------------");
            const cleanedMap = cleanup(filteredRequestBody);
            console.log("-----------------cleanedMap-----------------------");
            console.log(cleanedMap);
            console.log("-------------------------------------------------------");
            if (requestbody) {
              var resultMap: { [key: string]: string } = {};
              for (const key in cleanedMap) {
                if (cleanedMap.hasOwnProperty(key)) {
                  resultMap[key] = 'Detected: Urgency';
                }
              }
            return resultMap;
            }
          }

          function cleanup(inputDict: { [key: string]: string }) {
            var filteredDict: { [key: string]: string } = {};
        
            for (var key in inputDict) {
                if (!inputDict.hasOwnProperty(key)) continue;
        
                var value = inputDict[key];
        
                // Skip if value is a single space, contains '{', or is longer than 156 characters
                if (value === " " || value.indexOf('{') !== -1 || value.length > 156) {
                    continue;
                }
        
                // Check if value starts with an alphanumeric character, a letter, or a space
                if (value && (value[0].match(/^[a-zA-Z0-9 ]$/) || value[0] === ' ')) {
                    filteredDict[key] = value;
                }
            }
        
            // Further filter out keys where '{' is in the first 30 characters of the value
        
            // Call cleanusingtries on the filtered dictionary
            var cleanedMap = cleanUsingTries(filteredDict);
        
            return cleanedMap;
        }

        function cleanUsingTries(A: { [key: string]: string }): { [key: string]: string } {
          // Strip whitespace from values
          for (const a in A) {
              if (A.hasOwnProperty(a)) {
                  A[a] = A[a].trim();
              }
          }
      
          // Sort the keys
          const L = Object.keys(A).sort();
      
          // Initialize root and B
          const root: { [key: number]: [Record<number, any>, string] } = {};
          const B: { [key: string]: string } = {};
      
          // Process each key in L
          for (const l of L) {
              const V = l.split('-');
              if (V.length < 2) {
                  continue; // Skip keys without '-'
              }
      
              let pre: { [key: number]: [Record<number, any>, string] } | null = null;
              let cur: Record<number, any> = root;
      
              for (let i = 1; i < V.length; i++) {
                  const v = parseInt(V[i]);
                  if (isNaN(v)) {
                      continue; // Skip invalid numbers
                  }
                  if (v in cur) {
                      if (cur[v][1] === A[l]) {
                          break;
                      }
                      pre = cur;
                      cur = cur[v][0];
                      continue;
                  } else {
                      cur[v] = [{}, "INVALID"];
                      pre = cur;
                      cur = cur[v][0];
                      continue;
                  }
              }
      
              // If the loop didn't break, update the last node
              if (pre !== null) {
                  const lastV = parseInt(V[V.length - 1]);
                  if (!isNaN(lastV) && pre.hasOwnProperty(lastV)) {
                      pre[lastV][1] = A[l];
                      B[l] = A[l];
                  }
              }
          }
      
          return B;
      }

          

        //   async function makeApiRequest(requestbody:{ [key: string]: string }) {
        //     const apiUrl = 'http://127.0.0.1:5000/checkdarkpattern';

        //     console.log(requestbody)

        //     const allowedValues = [
        //       "LIMITED TIME>> Harvest Season Specials ",
        //       "HURRY>> Offer Ends Nov 30th ",
        //       "Viewing This Product",
        //   ];
          
        //     const filteredRequestBody = Object.fromEntries(
        //       Object.entries(requestbody).filter(([_, value]) => allowedValues.includes(value))
        //     );

        //     // console.log("filteredReqBody")
        //     // console.log(filteredRequestBody)

        //     const finalRequestBody = {
        //       website_url: window.location.href,
        //       data: filteredRequestBody
        //     };

        //     const requestOptions = {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(finalRequestBody)
        //     };
        
        //     try {
        //         const response = await fetch(apiUrl, requestOptions);
        //         if (!response.ok) {
        //             throw new Error(`API request failed with status: ${response.status}`);
        //         }
                
        //         return response.json();

        //     } catch (error:any) {
        //         console.error('Error making API request:', error.message);
        //     }
        // }

        function cleanContent(content:string) : boolean {
          // write cleaning logic here
          if(content == null || content == "")
          {
            return false;
          }
          return true;
        }

        }
      });
    }

    return (
      <>
          <Card heading="Get Dark Patterns" primaryButton="Show Dark Patterns" content="This website has potential dark patterns present. Utilise a trained model to detect them" imageSrc={tag} onPrimaryButtonClick={handleClick}></Card>
      </>
    )
  }
  
  export default Checkbox