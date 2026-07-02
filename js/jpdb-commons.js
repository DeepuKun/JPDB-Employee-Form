/* 
 * Copyright © 2018 - Hemant Kumar Dugar - All Rights Reserved
 */

var baseUrl = "http://api.login2explore.com:5577";

function setBaseUrl(baseUrlArg) {
    baseUrl = baseUrlArg;
}

var imlPartUrl = "/api/iml";
var irlPartUrl = "/api/irl";
var islPartUrl = "/api/isl";

var FILE_STATUS_OK = "OK";
var FILE_STATUS_EOF = "EOF";
var FILE_STATUS_BOF = "BOF";
var RELATION_IS_EMPTY = "RELATION_IS_EMPTY";
var DATA_HAS_BEEN_RETRIEVED_FROM_PI = "DATA_HAS_BEEN_RETRIEVED_FROM_PI";
var INVALID_RECORD = "INVALID_RECORD";
var DATA_NOT_FOUND = "DATA_NOT_FOUND";
var SUCCESS = "Success";
var FAILURE = "Faliure";
var COLUMN_EXIST = "COLUMN EXIST";
var COLUMN_DOES_NOT_EXIST = "COLUMN DOES NOT EXIST";
var RES_STATUS_SUCCESS = 200;
var RES_STATUS_FAILURE = 400;
var TRUE = "true";
var FALSE = "false";
var RELATION_DOES_NOT_EXIST ="RELATION DOES NOT EXIST";

function insertFormData2JPDB(formID) {
    var $form = $("#" + formID + "");
    var formDataInJson = getFormDataInJson($form);
    var formJsonStr = JSON.stringify(formDataInJson);

    $.ajaxSetup({async: false});
    var msgDivID = $("#" + formID + "").attr('data-response-div-id');
    var connToken = $("#" + formID + "").attr('data-connection-token');
    if (connToken === "" || connToken === undefined) {
        if (msgDivID === "" || msgDivID === undefined) {
            alert("JPDB Connection Token Missing!");
        } else {
            $("#" + msgDivID + '').html('JPDB Connection Token Missing!').fadeIn().delay(3000).fadeOut();
        }
        return false;
    }
    var dbName = $("#" + formID + "").attr('data-db-name');
    if (dbName === undefined) {
        dbName = "";
    }
    var relName = $("#" + formID + "").attr('data-table-name');
    if (relName === undefined) {
        relName = "";
    }

    var successMsg = $("#" + formID + "").attr('data-success-msg');
    var errorMsg = $("#" + formID + "").attr('data-error-msg');

    var putReq = createPUTRequest(connToken, formJsonStr, dbName, relName);
    var imlPartUrl = "/api/iml";
    var respJson = executeCommand(putReq, imlPartUrl);

    var status = respJson.status;
    var statusMsg = "";
    if (status === 200) {
        if (successMsg === "" || successMsg === undefined) {
            statusMsg = respJson.message;
        } else {
            statusMsg = successMsg;
        }
    } else {
        if (errorMsg === "" || errorMsg === undefined) {
            statusMsg = respJson.message;
        } else {
            statusMsg = errorMsg;
        }
    }
    if (msgDivID === "" || msgDivID === undefined) {
        alert(statusMsg);
    } else {
        $("#" + msgDivID + '').html(statusMsg).fadeIn().delay(3000).fadeOut();
    }

    document.getElementById(formID).reset();
    $.ajaxSetup({async: true});

    return false;
}

function createPUTRequest(connToken, jsonObj, dbName, relName) {
    var putRequest = "{\n"
            + "\"token\" : \""
            + connToken
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"PUT\",\n"
            + "\"rel\" : \""
            + relName + "\","
            + "\"jsonStr\": \n"
            + jsonObj
            + "\n"
            + "}";
    return putRequest;
}

function executeCommandAtGivenBaseUrl(reqString, dbBaseUrl, apiEndPointUrl) {
    var url = dbBaseUrl + apiEndPointUrl;
    var jsonObj;
    $.ajax({
        url: url,
        type: 'POST',
        async: false,
        data: reqString,
        success: function (result) {
            jsonObj = JSON.parse(result);
        },
        error: function (result) {
            var dataJsonObj = result.responseText;
            jsonObj = JSON.parse(dataJsonObj);
        }
    });
    return jsonObj;
}

function executeCommand(reqString, apiEndPointUrl) {
    var url = baseUrl + apiEndPointUrl;
    var jsonObj;
    $.ajax({
        url: url,
        type: 'POST',
        async: false,
        data: reqString,
        success: function (result) {
            jsonObj = JSON.parse(result);
        },
        error: function (result) {
            var dataJsonObj = result.responseText;
            jsonObj = JSON.parse(dataJsonObj);
        }
    });
    return jsonObj;
}

function getFormDataInJson($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });
    return indexed_array;
}

function createIS_COLUMN_EXISTRequest(token, dbname, relationName, colName) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbname
            + "\",\n" + "\"cmd\" : \"IS_COLUMN_EXIST\",\n"
            + "\"rel\" : \""
            + relationName
            + "\",\n"
            + "\"colName\" : \""
            + colName
            + "\",\n"
            + "\n"
            + "}";
    return req;
}

function createGETALLSyncRecordRequest(token, dbName, relName, timeStamp, pageNo, pageSize) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"GETALL\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n" + "\"timeStamp\": "
            + timeStamp
            + ",\n" + "\"pageNo\":"
            + pageNo
            + "," + "\"pageSize\":"
            + pageSize
            + "\n"
            + "}";
    return req;
}

function createGETALLRecordRequest(token, dbName, relName, pageNo, pageSize) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"GETALL\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n" + "\"pageNo\":"
            + pageNo
            + "," + "\"pageSize\":"
            + pageSize
            + "\n"
            + "}";
    return req;
}

function createGETALLCOLRequest(token, dbName, relName) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"GETALLCOL\",\n"
            + "\"rel\" : \""
            + relName
            + "\"\n"
            + "}";
    return req;
}

function createGETRequest(token, dbname, relationName, jsonObjStr) {
    var value1 = "{\n"
            + "\"token\" : \""
            + token
            + "\",\n" + "\"cmd\" : \"GET\",\n"
            + "\"dbName\": \""
            + dbname
            + "\",\n"
            + "\"rel\" : \""
            + relationName
            + "\",\n"
            + "\"jsonStr\":\n"
            + jsonObjStr
            + "\n"
            + "}";
    return value1;
}

function createGET_RECORDRequest(token, dbName, relName, reqId) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"GET_RECORD\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n" + "\"record\":"
            + reqId
            + "\n"
            + "}";
    return req;
}

function createGET_RELATION_STATSRequest(token, dbname, relationName) {
    var value1 = "{\n"
            + "\"token\" : \""
            + token
            + "\",\n" + "\"cmd\" : \"GET_RELATION_STATS\",\n"
            + "\"dbName\": \""
            + dbname
            + "\",\n"
            + "\"rel\" : \""
            + relationName
            + "\",\n"
            + "\n"
            + "}";
    return value1;
}

function createGET_ALL_RELATIONRequest(token, dbName) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"GET_ALL_RELATION\"\n"
            + "}";
    return req;
}

function createREMOVERecordRequest(token, dbName, relName, reqId) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"REMOVE\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n" + "\"record\":"
            + reqId
            + "\n"
            + "}";
    return req;
}

function createUPDATERecordRequest(token, jsonObj, dbName, relName, reqId) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"UPDATE\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n"
            + "\"jsonStr\":{ \""
            + reqId
            + "\":\n"
            + jsonObj
            + "\n"
            + "}}";
    return req;
}

function createFIND_RECORDRequest(token, dbName, relName, jsonObjStr) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"FIND_RECORD\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n"
            + "\"jsonStr\":\n"
            + jsonObjStr
            + "\n"
            + "}";
    return req;
}

function createNEXT_RECORDRequest(token, dbName, relName, recordNumber) {
    return createNavReq(token, dbName, relName, "NEXT_RECORD", recordNumber);
}

function createPREV_RECORDRequest(token, dbName, relName, recordNumber) {
    return createNavReq(token, dbName, relName, "PREV_RECORD", recordNumber);
}

function createFIRST_RECORDRequest(token, dbName, relName) {
    return createNavReq(token, dbName, relName, "FIRST_RECORD");
}

function createLAST_RECORDRequest(token, dbName, relName) {
    return createNavReq(token, dbName, relName, "LAST_RECORD");
}

function createNavReq(token, dbName, relName, nav, recNo) {
    var partReq = "";
    if (nav === "NEXT_RECORD" || nav === "PREV_RECORD") {
        partReq = ",\n"
                + "\"record\":"
                + recNo;
    }
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"" + nav + "\",\n"
            + "\"rel\" : \""
            + relName
            + '"'
            + partReq
            + "\n}";
    return req;
}
