// Searches GMail label for URLs in messages
// Returns URLs in list, pushes data to Google Sheet
//
function GetURLs ()
{
  // Get the active spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();  
 
  // Label to search
  var userInputSheet = ss.getSheets()[0];
 
  var labelName = userInputSheet.getRange("B2").getValue();
 
  // Create/empty target sheet
  var sheetName = "Label: " + labelName;
  var sheet = ss.getSheetByName (sheetName) || ss.insertSheet (sheetName, ss.getSheets().length);
  sheet.clear();
 
  // Get all URLs in nested array (threads -> messages)
  var urlsOnly = [];
  var messageData = [];
 
  var startIndex = 0;
  var pageSize = 100;
  while (1)
  {
    // Search in pages of 100
    var threads = GmailApp.search ("label:" + labelName, startIndex, pageSize);
    if (threads.length == 0)
      break;
    else
      startIndex += pageSize;
 
    // Get all messages for the current batch of threads
    var messages = GmailApp.getMessagesForThreads (threads);
 
    // Loop over all messages
    for (var i = 0; i < messages.length ; i++)
    {
      // Loop over all messages in this thread
      for (var j = 0; j < messages[i].length; j++)
      {
        var urlStore = messages[i][j].getBody();
 
        // urlGet formats (http or https):
        // http://
        // https://
 
        var urlGet = "";
        var matches = mailFrom.match (/\s*"?([^"]*)"?\s+<(.+)>/);
        if (matches)
        {
          name = matches[1];
          email = matches[2];
        }
        else
        {
          email = mailFrom;
        }
        // Check if (and where) we have this already
        var index = addressesOnly.indexOf (mailFrom);
        if (index > -1)
        {
          // We already have this address
		  //remove it (ordered by data new to old)
          addressesOnly.splice(index, 1);
          messageData.splice(index, 1);
        }
 
        // Add data
        addressesOnly.push (urlGet);
        messageData.push ([name, email, mailDate]);
      }
    }
  }
 
  // Add data to corresponding sheet
  sheet.getRange (1, 1, messageData.length, 3).setValues (messageData);
}
 
 
//
// Adds a menu to easily call the script
//
function onOpen ()
{
  var sheet = SpreadsheetApp.getActiveSpreadsheet ();
 
  var menu = [ 
    {name: "Extract URLs",functionName: "GetURLs"}
  ];  
 
  sheet.addMenu ("Get Links", menu);    
}
