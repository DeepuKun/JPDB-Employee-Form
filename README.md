# Employee Navigation Form (JsonPowerDB)


A sleek, premium, single-page **Employee Form** application built using HTML, CSS, JavaScript, and jQuery, powered by **JsonPowerDB (JPDB)**.

This project implements full record navigation capabilities (First, Previous, Next, Last) and database operations (New, Save, Edit, Change, Reset) with dynamic state transitions and a local `.env` configuration file loader.

---

## 🚀 Key Features

*   **Premium Glassmorphic Design:** Sleek dark-mode aesthetic with interactive elements, animations, and custom alert toast notifications.
*   **Complete Navigation Flow:** Navigate forward and backward through records seamlessly. Buttons dynamically disable at database boundaries (BOF/EOF).
*   **CRUD Data Operations:**
    *   **New:** Clears the form, locks navigation, and opens inputs for a new entry.
    *   **Save:** Validates the input and commits a new record to the database.
    *   **Edit:** Locks the primary key field (`Employee ID`) and opens other fields for editing.
    *   **Change:** Updates the existing record in the database.
    *   **Reset:** Reverts the form to the last saved database state.
*   **Asynchronous Configuration:** Reads database details (Token, DB Name, Table, URL) dynamically from a root `.env` file instead of cluttering the UI.
*   **Smart Employee Lookup:** Tabbing/blurring out of the `Employee ID` field automatically checks if the record exists in the database. If it does, the application retrieves the details and transitions to viewing/editing mode.

---

## 🛠️ Tech Stack

*   **Frontend:** HTML5, Vanilla CSS, JavaScript (ES6+), jQuery
*   **Database:** [JsonPowerDB (JPDB)](https://login2explore.com/jpdb/docs.html) (High-performance Serverless NoSQL DB)
*   **Libraries:** `jpdb-commons.js` (Helper API wrapper)

---

## 📁 Directory Structure

```text
├── css/
│   └── style.css          # Premium glassmorphic styling
├── js/
│   ├── jpdb-commons.js    # Standard JPDB helper API functions
│   └── index.js          # Main application logic & state machine
├── .env                  # Environment configurations (ignored in git)
├── .gitignore            # Git ignore configuration
├── index.html            # Main entry page
└── README.md             # Project documentation
```

---

## ⚙️ Setup & Execution

### 1. Database Configuration
Create a file named `.env` in the root folder (or rename/configure the existing one) with your credentials:

```env
CONN_TOKEN=YOUR_CONNECTION_TOKEN_HERE
DB_NAME=EMPLOYEE-DB
REL_NAME=EmpData
BASE_URL=http://api.login2explore.com:5577
```

> [!WARNING]
> Keep your connection token safe! The `.env` file is added to `.gitignore` to prevent pushing keys to public git repositories.

### 2. Running Locally
Since JavaScript fetches the `.env` file from the root directory, the project needs to run on a local server. You can run it easily using `http-server` (Node.js) or any equivalent static server:

#### Option A: Node.js (Recommended)
Run the following in your terminal inside the project directory:
```bash
# Run server with caching disabled to prevent stale JavaScript executions
npx http-server -c-1 -p 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

#### Option B: VS Code Live Server extension
Right-click `index.html` and select **Open with Live Server**.

---

## 🧠 State Machine & Button Toggling

| Operation Mode | Fields State | Navigation (First, Prev, Next, Last) | Operation Buttons Enabled | Operation Buttons Disabled |
| :--- | :--- | :--- | :--- | :--- |
| **Default (Viewing)** | Read-Only | Enabled (Toggled based on index bounds) | New, Edit | Save, Change, Reset |
| **New (Adding)** | Enabled (including ID) | Disabled | Save, Reset | New, Edit, Change |
| **Editing** | Enabled (except ID) | Disabled | Change, Reset | New, Save, Edit |
| **Empty Database** | Disabled | Disabled | New | Save, Edit, Change, Reset |

*   **Pointers tracked in Local Storage:**
    *   `curr_rec_no`: The currently viewed record number.
    *   `first_rec_no`: Pointers to the first record index in the relation.
    *   `last_rec_no`: Pointers to the last record index in the relation.

---

## 🔗 JsonPowerDB APIs Used

The application communicates directly with JPDB endpoints (`/api/irl` and `/api/iml`) using the following command procedures:
1.  **`PUT`**: To save a new record.
2.  **`UPDATE`**: To update an existing record by record number.
3.  **`FIRST_RECORD`**: To fetch the beginning of the relation.
4.  **`LAST_RECORD`**: To fetch the end of the relation.
5.  **`PREV_RECORD`**: To step backward relative to the active index.
6.  **`NEXT_RECORD`**: To step forward relative to the active index.
7.  **`FIND_RECORD`**: To search if an `Employee ID` exists.
8.  **`GET_RECORD`**: To reload the active record on form resets.
9.  **`GET_RELATION_STATS`**: To handle empty database conditions dynamically on load.
