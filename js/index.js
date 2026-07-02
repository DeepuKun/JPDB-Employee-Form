// Configuration state variables (loaded from inputs or local storage defaults)
let connToken = "";
let dbName = "";
let relName = "";

// Custom Toast Notification System
function showToast(message, type = "success") {
    const container = document.getElementById("alert-container");
    const toast = document.createElement("div");
    toast.className = `custom-toast toast-${type}`;
    
    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-xmark";
    if (type === "warning") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="toast-content">${message}</div>
    `;
    container.appendChild(toast);
    
    // Trigger entry transition
    setTimeout(() => {
        toast.classList.add("show");
    }, 50);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

// -------------------------------------------------------------
// State Management Helpers
// -------------------------------------------------------------

// Toggle disabling navigation buttons (First, Prev, Next, Last)
function disableNavigation(status) {
    $("#first").prop("disabled", status);
    $("#prev").prop("disabled", status);
    $("#next").prop("disabled", status);
    $("#last").prop("disabled", status);
}

// Toggle disabling specified operational control button
function disableCtrl(btnId, status) {
    $(btnId).prop("disabled", status);
}

// Enable/Disable input fields (except empid, which is handled contextually)
function disableForm(status) {
    $("#empname").prop("disabled", status);
    $("#empsalary").prop("disabled", status);
    $("#emphra").prop("disabled", status);
    $("#empda").prop("disabled", status);
    $("#empdeduct").prop("disabled", status);
}

// Make all form fields empty
function makeDataFormEmpty() {
    $("#empid").val("");
    $("#empname").val("");
    $("#empsalary").val("");
    $("#emphra").val("");
    $("#empda").val("");
    $("#empdeduct").val("");
}

// Local Storage Getter / Setter Helpers
function getCurrRecNoFromLS() {
    return localStorage.getItem("curr_rec_no");
}

function setCurrRecNo2LS(recNo) {
    if (recNo === null || recNo === undefined) {
        localStorage.removeItem("curr_rec_no");
    } else {
        localStorage.setItem("curr_rec_no", recNo);
    }
}

function setFirstRecNo2LS(recNo) {
    if (recNo === null || recNo === undefined) {
        localStorage.removeItem("first_rec_no");
    } else {
        localStorage.setItem("first_rec_no", recNo);
    }
}

function setLastRecNo2LS(recNo) {
    if (recNo === null || recNo === undefined) {
        localStorage.removeItem("last_rec_no");
    } else {
        localStorage.setItem("last_rec_no", recNo);
    }
}

function getFirstRecNoFromLS() {
    return localStorage.getItem("first_rec_no");
}

function getLastRecNoFromLS() {
    return localStorage.getItem("last_rec_no");
}

// Evaluate if there is only one record in the database relation
function isOnlyOneRecordPresent() {
    const first = getFirstRecNoFromLS();
    const last = getLastRecNoFromLS();
    if (first && last && first === last) {
        return true;
    }
    return false;
}

// Check database stats to handle empty database or single-record boundaries
function checkForNoOrOneRecord() {
    console.log("Checking record presence constraints...");
    
    // Check if database relation has records
    const statsReq = createGET_RELATION_STATSRequest(connToken, dbName, relName);
    const statsRes = executeCommand(statsReq, irlPartUrl);
    
    if (statsRes.status === 400 || !statsRes.data) {
        // Relation or DB does not exist, treat as empty database
        console.warn("DB / Relation stats check failed: Empty relation state.");
        setCurrRecNo2LS(null);
        setFirstRecNo2LS(null);
        setLastRecNo2LS(null);
        
        makeDataFormEmpty();
        disableForm(true);
        $("#empid").prop("disabled", true);
        
        disableNavigation(true);
        disableCtrl("#new", false);
        disableCtrl("#save", true);
        disableCtrl("#edit", true);
        disableCtrl("#change", true);
        disableCtrl("#reset", true);
        return true;
    }
    
    const stats = JSON.parse(statsRes.data);
    const recordCount = stats.record_count;
    console.log(`Relation stats loaded. Record count: ${recordCount}`);

    if (recordCount === 0) {
        setCurrRecNo2LS(null);
        setFirstRecNo2LS(null);
        setLastRecNo2LS(null);
        
        makeDataFormEmpty();
        disableForm(true);
        $("#empid").prop("disabled", true);
        
        disableNavigation(true);
        disableCtrl("#new", false);
        disableCtrl("#save", true);
        disableCtrl("#edit", true);
        disableCtrl("#change", true);
        disableCtrl("#reset", true);
        return true;
    } else if (recordCount === 1) {
        // Only one record present
        disableNavigation(true);
        disableCtrl("#new", false);
        disableCtrl("#edit", false);
        disableCtrl("#save", true);
        disableCtrl("#change", true);
        disableCtrl("#reset", true);
        return true;
    }
    
    return false;
}

// -------------------------------------------------------------
// Database Command Functions
// -------------------------------------------------------------

// Populate form inputs with record details and enable/disable navigation buttons dynamically
function showData(jsonObj) {
    if (jsonObj.status !== 200 || !jsonObj.data) {
        console.error("No record found to show data.");
        return;
    }
    
    let parsedData;
    try {
        parsedData = JSON.parse(jsonObj.data);
    } catch (e) {
        parsedData = jsonObj.data;
    }
    
    console.log("Record retrieved: ", parsedData);
    
    let recNo;
    let record;
    if (parsedData.record !== undefined) {
        recNo = parsedData.rec_no;
        record = parsedData.record;
    } else {
        record = parsedData;
        recNo = getCurrRecNoFromLS();
    }
    
    // Fill values into inputs
    $("#empid").val(record.empid);
    $("#empname").val(record.empname);
    $("#empsalary").val(record.empsalary);
    $("#emphra").val(record.emphra);
    $("#empda").val(record.empda);
    $("#empdeduct").val(record.empdeduct);
    
    // Update pointer values
    setCurrRecNo2LS(recNo);
    $("#empid").prop("disabled", true);
    disableForm(true);
    
    // Evaluate constraints
    if (checkForNoOrOneRecord()) {
        return;
    }
    
    // Toggle navigation based on pointer values
    const first = getFirstRecNoFromLS();
    const last = getLastRecNoFromLS();
    
    disableNavigation(false);
    
    // If current is first, disable First and Prev buttons
    if (String(recNo) === String(first)) {
        $("#first").prop("disabled", true);
        $("#prev").prop("disabled", true);
    }
    
    // If current is last, disable Last and Next buttons
    if (String(recNo) === String(last)) {
        $("#next").prop("disabled", true);
        $("#last").prop("disabled", true);
    }
    
    // Reset control buttons state to default viewing state
    disableCtrl("#new", false);
    disableCtrl("#edit", false);
    disableCtrl("#save", true);
    disableCtrl("#change", true);
    disableCtrl("#reset", true);
}

// Fetch the First Record in the dataset
function getFirst() {
    console.log("Fetching FIRST_RECORD...");
    const req = createFIRST_RECORDRequest(connToken, dbName, relName);
    const res = executeCommand(req, irlPartUrl);
    if (res.status === 200) {
        const parsed = JSON.parse(res.data);
        setFirstRecNo2LS(parsed.rec_no);
        showData(res);
    } else {
        console.warn("First record query failed:", res.message);
    }
}

// Fetch the Last Record in the dataset
function getLast() {
    console.log("Fetching LAST_RECORD...");
    const req = createLAST_RECORDRequest(connToken, dbName, relName);
    const res = executeCommand(req, irlPartUrl);
    if (res.status === 200) {
        const parsed = JSON.parse(res.data);
        setLastRecNo2LS(parsed.rec_no);
        showData(res);
    } else {
        console.warn("Last record query failed:", res.message);
    }
}

// Fetch the Previous Record
function getPrev() {
    const curr = getCurrRecNoFromLS();
    if (!curr) return;
    
    console.log(`Fetching PREV_RECORD relative to record ${curr}...`);
    const req = createPREV_RECORDRequest(connToken, dbName, relName, curr);
    const res = executeCommand(req, irlPartUrl);
    if (res.status === 200) {
        showData(res);
    } else if (res.message === "BOF") {
        showToast("Beginning of file (BOF) reached.", "warning");
        $("#first").prop("disabled", true);
        $("#prev").prop("disabled", true);
    } else {
        showToast("Previous record failed: " + res.message, "error");
    }
}

// Fetch the Next Record
function getNext() {
    const curr = getCurrRecNoFromLS();
    if (!curr) return;
    
    console.log(`Fetching NEXT_RECORD relative to record ${curr}...`);
    const req = createNEXT_RECORDRequest(connToken, dbName, relName, curr);
    const res = executeCommand(req, irlPartUrl);
    if (res.status === 200) {
        showData(res);
    } else if (res.message === "EOF") {
        showToast("End of file (EOF) reached.", "warning");
        $("#next").prop("disabled", true);
        $("#last").prop("disabled", true);
    } else {
        showToast("Next record failed: " + res.message, "error");
    }
}

// -------------------------------------------------------------
// CRUD Form Handlers
// -------------------------------------------------------------

// Form field client-side validations
function validateData() {
    const empid = $("#empid").val().trim();
    const empname = $("#empname").val().trim();
    const empsalary = $("#empsalary").val().trim();
    const emphra = $("#emphra").val().trim();
    const empda = $("#empda").val().trim();
    const empdeduct = $("#empdeduct").val().trim();

    if (!empid) {
        showToast("Employee ID is required.", "error");
        $("#empid").focus();
        return null;
    }
    if (!empname) {
        showToast("Employee Name is required.", "error");
        $("#empname").focus();
        return null;
    }
    if (!empsalary) {
        showToast("Basic Salary is required.", "error");
        $("#empsalary").focus();
        return null;
    }
    if (!emphra) {
        showToast("HRA is required.", "error");
        $("#emphra").focus();
        return null;
    }
    if (!empda) {
        showToast("DA is required.", "error");
        $("#empda").focus();
        return null;
    }
    if (!empdeduct) {
        showToast("Deduction is required.", "error");
        $("#empdeduct").focus();
        return null;
    }

    return {
        empid: empid,
        empname: empname,
        empsalary: empsalary,
        emphra: emphra,
        empda: empda,
        empdeduct: empdeduct
    };
}

// Prepare UI state for inserting a new record
function newForm() {
    console.log("Preparing New Form state...");
    makeDataFormEmpty();
    
    // Enable all fields including primary key
    $("#empid").prop("disabled", false);
    disableForm(false);
    $("#empid").focus();
    
    // Disable navigation & update actions
    disableNavigation(true);
    disableCtrl("#new", true);
    disableCtrl("#save", false);
    disableCtrl("#edit", true);
    disableCtrl("#change", true);
    disableCtrl("#reset", false);
}

// Save the new record to JsonPowerDB
function saveData() {
    const validObj = validateData();
    if (!validObj) return;
    
    console.log("Saving new record details...");
    const jsonStr = JSON.stringify(validObj);
    const req = createPUTRequest(connToken, jsonStr, dbName, relName);
    const res = executeCommand(req, imlPartUrl);
    
    if (res.status === 200) {
        showToast("Record saved successfully!", "success");
        
        // Extract new record number
        const resData = JSON.parse(res.data);
        const newRecNo = resData.rec_no[0];
        
        // Update pointers
        setCurrRecNo2LS(newRecNo);
        setLastRecNo2LS(newRecNo);
        
        // If there wasn't a first record in LS, this new one is also the first
        if (!getFirstRecNoFromLS()) {
            setFirstRecNo2LS(newRecNo);
        }
        
        // Retrieve and display record
        const getReq = createGET_RECORDRequest(connToken, dbName, relName, newRecNo);
        const getRes = executeCommand(getReq, irlPartUrl);
        showData(getRes);
    } else {
        showToast("Error saving data: " + res.message, "error");
    }
}

// Prepare UI state to edit the current record
function editData() {
    console.log("Unlocking editing form controls...");
    // Keep empid primary key read-only
    $("#empid").prop("disabled", true);
    disableForm(false);
    $("#empname").focus();
    
    disableNavigation(true);
    disableCtrl("#new", true);
    disableCtrl("#save", true);
    disableCtrl("#edit", true);
    disableCtrl("#change", false);
    disableCtrl("#reset", false);
}

// Save edits back to the database
function changeData() {
    const validObj = validateData();
    if (!validObj) return;
    
    const curr = getCurrRecNoFromLS();
    if (!curr) {
        showToast("No active record selection to update.", "error");
        return;
    }
    
    console.log(`Updating record ${curr}...`);
    const jsonStr = JSON.stringify(validObj);
    const req = createUPDATERecordRequest(connToken, jsonStr, dbName, relName, curr);
    const res = executeCommand(req, imlPartUrl);
    
    if (res.status === 200) {
        showToast("Record updated successfully!", "success");
        
        // Fetch and show updated record details
        const getReq = createGET_RECORDRequest(connToken, dbName, relName, curr);
        const getRes = executeCommand(getReq, irlPartUrl);
        showData(getRes);
    } else {
        showToast("Error updating data: " + res.message, "error");
    }
}

// Cancel operations and reload original record (if any) or revert to empty DB state
function resetForm() {
    console.log("Resetting form states...");
    const curr = getCurrRecNoFromLS();
    
    if (curr) {
        // Reload current selected record from database
        const req = createGET_RECORDRequest(connToken, dbName, relName, curr);
        const res = executeCommand(req, irlPartUrl);
        if (res.status === 200) {
            showData(res);
            showToast("Form reset to current record.", "warning");
        } else {
            console.error("Reset reload failed.");
            initEmployeeForm();
        }
    } else {
        // If empty database, re-initialize
        initEmployeeForm();
        showToast("Form cleared.", "warning");
    }
}

// Query database checking if Employee ID exists (Tabbing/Blurring out)
function checkIDExists() {
    // Only check if employee ID input is enabled (meaning user is typing a new ID)
    if ($("#empid").prop("disabled")) return;
    
    const empId = $("#empid").val().trim();
    if (!empId) return;
    
    console.log(`Checking if employee ID '${empId}' exists...`);
    const req = createFIND_RECORDRequest(connToken, dbName, relName, JSON.stringify({ empid: empId }));
    const res = executeCommand(req, irlPartUrl);
    
    if (res.status === 200 && res.data && res.data.length > 0) {
        showToast("Employee ID exists. Loading details...", "warning");
        
        // Populate record details
        const recordMatch = res.data[0];
        const recNo = recordMatch.rec_no;
        
        // Transition form into viewing state for this record
        setCurrRecNo2LS(recNo);
        
        // Construct standard GET response mock to pass to showData
        const mockRes = {
            status: 200,
            data: JSON.stringify({
                rec_no: recNo,
                record: recordMatch.record
            })
        };
        showData(mockRes);
    } else {
        console.log("ID is unique. Proceeding with new entry.");
    }
}

// -------------------------------------------------------------
// Application Initialization
// -------------------------------------------------------------

// -------------------------------------------------------------
// Application Initialization & .env Loader
// -------------------------------------------------------------

async function loadEnvConfig() {
    console.log("Loading configurations...");
    try {
        // 1. Try Vercel Serverless API first
        const apiResponse = await fetch('/api/config');
        if (apiResponse.ok) {
            const config = await apiResponse.json();
            if (config.CONN_TOKEN && config.DB_NAME) {
                connToken = config.CONN_TOKEN;
                dbName = config.DB_NAME;
                relName = config.REL_NAME;
                const apiBaseUrl = config.BASE_URL;
                if (apiBaseUrl) {
                    setBaseUrl(apiBaseUrl);
                }
                console.log("Environment configs loaded dynamically from Vercel Server API.");
                return true;
            }
        }
    } catch (e) {
        console.log("Server API config not available, trying local .env.");
    }
    
    // 2. Fallback: Try local .env file
    try {
        const response = await fetch('.env');
        if (!response.ok) {
            throw new Error(`Failed to fetch local .env file, status: ${response.status}`);
        }
        const text = await response.text();
        const config = {};
        const lines = text.split(/\r?\n/);
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;
            const idx = line.indexOf('=');
            if (idx !== -1) {
                const key = line.substring(0, idx).trim();
                const val = line.substring(idx + 1).trim();
                config[key] = val;
            }
        }
        
        connToken = config.CONN_TOKEN;
        dbName = config.DB_NAME;
        relName = config.REL_NAME;
        const apiBaseUrl = config.BASE_URL;
        
        if (apiBaseUrl) {
            setBaseUrl(apiBaseUrl);
        }
        
        console.log("Environment configs loaded from local .env.");
        return true;
    } catch (e) {
        console.error("Error loading configurations:", e);
        showToast("Error loading connection configurations. Please check .env file locally or set environment variables on Vercel.", "error");
        return false;
    }
}

function initEmployeeForm() {
    console.log("Initializing employee form parameters...");
    
    // Clear state storage on fresh page load to prevent stale configurations
    localStorage.removeItem("curr_rec_no");
    localStorage.removeItem("first_rec_no");
    localStorage.removeItem("last_rec_no");
    
    if (!connToken || !dbName || !relName) {
        showToast("Ensure Database connection configs are completely filled in the .env file.", "error");
        return;
    }
    
    // Evaluate if there are any records present
    const isEmpty = checkForNoOrOneRecord();
    if (isEmpty) {
        console.log("Form initialized in empty database mode.");
        return;
    }
    
    // Load and index pointers
    // 1. Fetch first record and index it
    const reqFirst = createFIRST_RECORDRequest(connToken, dbName, relName);
    const resFirst = executeCommand(reqFirst, irlPartUrl);
    if (resFirst.status === 200) {
        const parsedFirst = JSON.parse(resFirst.data);
        setFirstRecNo2LS(parsedFirst.rec_no);
    }
    
    // 2. Fetch last record and index it
    const reqLast = createLAST_RECORDRequest(connToken, dbName, relName);
    const resLast = executeCommand(reqLast, irlPartUrl);
    if (resLast.status === 200) {
        const parsedLast = JSON.parse(resLast.data);
        setLastRecNo2LS(parsedLast.rec_no);
    }
    
    // 3. Load first record details to form on startup
    if (resFirst.status === 200) {
        showData(resFirst);
        console.log("Form initialized successfully with first record.");
    }
}

// -------------------------------------------------------------
// Event Listeners Registration
// -------------------------------------------------------------

$(document).ready(async function () {
    // 1. Load config from .env
    const loadedEnv = await loadEnvConfig();
    if (!loadedEnv) return;

    // 2. Initialize Form
    initEmployeeForm();

    // 3. Check if Employee ID exists on blur (tabbing out)
    $("#empid").blur(function () {
        checkIDExists();
    });

    // 4. Navigation actions
    $("#first").click(function () { getFirst(); });
    $("#prev").click(function () { getPrev(); });
    $("#next").click(function () { getNext(); });
    $("#last").click(function () { getLast(); });

    // 5. Operation buttons actions
    $("#new").click(function () { newForm(); });
    $("#save").click(function () { saveData(); });
    $("#edit").click(function () { editData(); });
    $("#change").click(function () { changeData(); });
    $("#reset").click(function () { resetForm(); });
});
