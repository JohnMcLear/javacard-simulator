$(function(){
    $('#search').on('keyup', function(e){
        if(e.keyCode === 13) {
            var parameters = { search: $(this).val() };
            $.get( '/searching',parameters, function(data) {
                $('#results').html(data);
            });
        };
    });
});

$(function(){
    newCard();       
});

$(function() {
    // Creating the console.
    var header = 'Welcome to the Java Card online simulator!\n' +
                 'Adam Noakes - University of Southampton\n';
    window.jqconsole = $('#console').jqconsole(header, 'Java Card> ');

    // Abort prompt on Ctrl+Z.
    jqconsole.RegisterShortcut('Z', function() {
      jqconsole.AbortPrompt();
      handler();
    });
    // Move to line start Ctrl+A.
    jqconsole.RegisterShortcut('A', function() {
      jqconsole.MoveToStart();
      handler();
    });
    // Move to line end Ctrl+E.
    jqconsole.RegisterShortcut('E', function() {
      jqconsole.MoveToEnd();
      handler();
    });
    jqconsole.RegisterMatching('{', '}', 'brace');
    jqconsole.RegisterMatching('(', ')', 'paran');
    jqconsole.RegisterMatching('[', ']', 'bracket');
    // Handle a command.
    var handler = function(command) {
      if (command) {
        console.log(command);
        try {
          sendCommand(command, handler);
        } catch (e) {
          jqconsole.Write('ERROR: ' + e.message + '\n');
        }
      } else {
        jqconsole.Prompt(true, handler);
      }
      
    };

// Initiate the first prompt.
handler();
});

function selectCard()
{
    var cardName = $("#availableCards").val();
    $.ajax({
        type: "GET",
        url: "/getcard",
        data: { 'cardName': cardName[0] },
        success: function(data){
            var appletInfo = $.parseJSON(data);
            console.log(appletInfo.entries[0].val3);

        }
    });

    $('#results').html($("#availableCards").val());
    $("#Submit_APDU").prop('disabled', false);

}

function sendCommand(input, handler){
    
    var words = input.split(" ");
    switch(words[0]){
        case "ls":
            ls(handler);
            break;            
        case "load":
            loadCard(handler);
            break;
        default:
            var lines = input.split(";");
            for(i=0; i<lines.length; i++){
                lines[i] = lines[i].split(" ");
            }
            sendAPDU(lines, handler);
            break;
    };

    
}

function loadCard(handler){
    $.ajax({
        type: "GET",
        url: "/load",
        success: function(data){
            console.log(data);
            if(data.result){

            }
            jqconsole.Write("Successfully loaded: " + data.cardName);
            jqconsole.Write('\n'); 
            jqconsole.Prompt(true, handler);
        }
    });
}

function sendAPDU(APDU, handler){
    for(i=0; i<APDU.length; i++){
        for(j=0; j<APDU[i].length; j++){
            APDU[i][j] = parseInt(APDU[i][j], 16);
        }
    }
    $.ajax({
        type: "POST",
        url: "/sendAPDU",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({"APDU": APDU}),
        success: function(data) { 
            jqconsole.Write("==> " + data.APDU); 
            jqconsole.Write('\n'); 
            jqconsole.Prompt(true, handler);
        }
    });
}

function ls(handler){
    $.ajax({
        type: "GET",
        url: "/ls",
        success: function(data){
            console.log("ss");
            var opts = $.parseJSON(data);
            $.each(opts, function(i, d) {

                jqconsole.Write(d.cardName + " ");
           });
            jqconsole.Write('\n'); 
            jqconsole.Prompt(true, handler);
        }
    });
}
//used by EEPROM.js (Recover.RecoverAll) to recover backed-up EEPROM to server's EEPROM
//Planned design will see this function restore to a local EEPROM (maybe)
function recoverAll(cardName, pkID, values, callback)
{
    $.ajax({
        type: "POST",
        url: "/recoverall",
        data: { 'cardName': cardName, 'pkID': pkID, 'values': values },
        Success: function(data) { callback(); }
    });
}

//retreives the data from server which is then used to be stored in Recover.savestr (EEPROM.js) (Backsup a local copy of the EEPROM)
//Planned design will see this function restore from a local copy (maybe)
//Could still use server as primary backup/ restore for eeprom 
function backupAll(cardName, pkID, callback)
{
    $.ajax({
        type: "GET",
        url: "/backupall",
        data: { 'cardName': cardName, 'pkID': pkID },
        Success: function(data) { callback(data); }
    });
}

$('#recoverAll').click(function(){
    var values = ["value0", "value1", "value2", "value3", "value4", "value5"];
    recoverAll('card1', '1', values);
});

$('#backupAll').click(function(){
    var values = ["value0", "value1", "value2", "value3", "value4", "value5"];
    backupAll('card1', '1', function(data){
        console.log(data);
    });
});

function deleteCard()
{
    var cardName = $("#availableCards").val();

    $.ajax({
        type: "DELETE",
        url: "/deletecard",
        data: { 'cardName': cardName[0] },
        success: function(data){
            // $('#results').html(data);
            //$('#availableCards').append('<option>' + data.cardName + '</option>');
            $('#availableCards').empty();
            // Parse the returned json data
            var opts = $.parseJSON(data);
            // Use jQuery's each to iterate over the opts value
            $.each(opts, function(i, d) {
                // You will need to alter the below to get the right values from your json object.  Guessing that d.id / d.modelName are columns in your carModels data
                // $('#emptyDropdown').append('<option value="' + d.ModelID + '">' + d.ModelName + '</option>');*/
                $('#availableCards').append('<option value="' + d.cardName + '">' + d.cardName + '</option>');
           });
        }
    });    
}

function newCard()
{
    //document.getElementById("results").innerHTML = "Hello World";
    //$('#results').html("hi");
    //var dropDown = document.getElementById("carId");
    //var carId = dropDown.options[dropDown.selectedIndex].value;
    var cardName = $('#search').val();
    $.ajax({
        type: "POST",
        url: "/newcard",
        data: { 'cardName': cardName  },
        success: function(data){
            // $('#results').html(data);
            //$('#availableCards').append('<option>' + data.cardName + '</option>');
            $('#availableCards').empty();
            // Parse the returned json data
            var opts = $.parseJSON(data);
            // Use jQuery's each to iterate over the opts value
            $.each(opts, function(i, d) {
                // You will need to alter the below to get the right values from your json object.  Guessing that d.id / d.modelName are columns in your carModels data
                // $('#emptyDropdown').append('<option value="' + d.ModelID + '">' + d.ModelName + '</option>');*/
                $('#availableCards').append('<option value="' + d.cardName + '">' + d.cardName + '</option>');
           });
        }
    });
}


function evalCommnad(string)
{

}