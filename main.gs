

var monthNames = ["Січня", "Лютого", "Березня", "Квітня", "Травня", "Червня",
  "Липня", "Серпня", "Вересня", "Жовтня", "Листопада", "Грудня"];
var dayNames = ["Понеділок", "Вівторок", "Середа", "Четвер", "П’ятниця", "Субота", "Неділя"];


function createWeekSheet() {
  var newSpreadsheet = createSheetAndMakeCurrent();
  var daysRange = createDaysRow(newSpreadsheet)
  var userEmails = createDrinkersColum(newSpreadsheet)
  var usersCount = userEmails.length
  fillCells(newSpreadsheet, 2, 2, usersCount, daysRange)
  setUsersPermision(newSpreadsheet,usersCount, daysRange);
  addSumFormula(newSpreadsheet,usersCount, daysRange);
  sendEmails(userEmails)
}

function createSheetAndMakeCurrent(){
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var newSheet = activeSpreadsheet.insertSheet(getSheetName())
  activeSpreadsheet.setActiveSheet(newSheet)
  return newSheet;
}

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

Date.prototype.plusDays = function(d){
  var date = new Date(this.getTime());
  date.setDate(this.getDate() + d);
  return date;
};

function getSheetName(){
  var currentDate = new Date();
 
  var mondayDateObj = getMonday(currentDate)
  var sundayDateObj = mondayDateObj.plusDays(6)
  
  var mondayDate = mondayDateObj.getDate()
  var sundayDate = sundayDateObj.getDate();
  
  var mondayDateMonthName = monthNames[mondayDateObj.getMonth() ]
  var sundayDateMonthName = monthNames[sundayDateObj.getMonth() ]
  var currentYear = new Date().getFullYear()
  return "Teambuilding(" + mondayDate.toString() + " " + mondayDateMonthName + "-" + sundayDate.toString() + " " + sundayDateMonthName + " " + currentYear +")"
}

function createDrinkersColum(sheet){
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var users = activeSpreadsheet.getViewers()
  
  var emails = users.map(function(userObj){ 
    return userObj.getEmail();
  });
  
  var startOfUsersRow = 2
  for (var row = startOfUsersRow; row < emails.length + startOfUsersRow; ++row) {
    var userRange = sheet.getRange(row, 1, 1, 1);
    userRange.setValue(emails[row - startOfUsersRow])
  }
  
  sheet.autoResizeColumn(1);
  return emails
}

function createDaysRow(sheet) {
  var cell = sheet.getRange("B1:H1");
  cell.setValues([dayNames]);
  return 7
}

function fillCells(sheet, row, col, rowCount, colCount) {
  var cell = sheet.getRange(row, col, rowCount, colCount);
  
  var firtsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var formatedCell = firtsSheet.getRange("A1");
  formatedCell.copyTo(cell, {formatOnly:true})
  
   var rule = SpreadsheetApp.newDataValidation()
   .requireValueInList(["Норм", "Паснув"], true)
   .setAllowInvalid(true)
   .build()
   cell.setDataValidation(rule);
}

function setUsersPermision(sheet, usersCount, colCount) {
  
  var sheetProtection = sheet.protect().setDescription('Main Protection');
  sheetProtection.removeEditors(sheetProtection.getEditors())
  if (sheetProtection.canDomainEdit()) {
   sheetProtection.setDomainEdit(false);
  }
  var userEditField = sheet.getRange(2, 2, usersCount, colCount);
  sheetProtection.setUnprotectedRanges([userEditField])
    
  var startOfUsersRow = 2
  for (var row = startOfUsersRow; row < usersCount + startOfUsersRow; ++row) {
    var userRange = sheet.getRange(row, 2, 1, colCount);
    var protection = userRange.protect().setDescription('User protected range');
    var userEmail = sheet.getRange(row, 1, 5, 5).getValue().toString();
    protection.removeEditors(protection.getEditors())
    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
    protection.addEditor(userEmail);
  }
}

function addSumFormula(sheet, usersCount, colCount) {
  var cell = sheet.getRange(2 + usersCount, 2, 1, colCount);
  var strtemp = "=COUNTIF(R[-"+usersCount+"]C[0]:R[-1]C[0], \"*Норм*\")"
  cell.setFormulaR1C1("=COUNTIF(R[-"+usersCount+"]C[0]:R[-1]C[0], \"*Норм*\")")
}

function sendEmails(emails) {
  for (var i = 0; i < emails.length; ++i) {
    var subject = getSheetName();
    var message = "<p>Доброго часу доби</p>"
    message += "<p>Відмідтьсь за бухач.</p>"
    message += "<p><a href='" + SpreadsheetApp.getActiveSpreadsheet().getUrl() + "'>spreadsheets url</a></p>";
    message += "<p>З повагою,</p>"
    message += "<p>PM</p>"
    MailApp.sendEmail({
      to: emails[i],
      subject: subject,
      htmlBody: message
    });
  }
}
