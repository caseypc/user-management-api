We're evaluating your ability to build
maintainable, well-architected code, not perfection. Comment frequently so we can see
your thought process.

# Part 1: Build a User Registration System (90 minutes)
Requirements
Build a simple user management system with the following:
Backend (Symfony/PHP)

Create a REST API for managing users with these endpoints:
GET /api/users - List all users (with pagination)
GET /api/users/{id} - Get single user
POST /api/users - Create user
PUT /api/users/{id} - Update user
DELETE /api/users/{id} - Delete user

## User Entity Fields:
id (auto-generated)
firstName
lastName
email (unique)
role (enum: admin, manager, user)
status (enum: active, inactive, pending)
createdAt
updatedAt

## Architecture Requirements:
Use the Repository pattern for data access
Use a Service layer for business logic
Controllers should be thin-delegate to services
Include basic validation (email format, required fields)
Frontend (React + TypeScript)
Build a user management interface with:
Data Table using AgGrid (or similar) displaying all users
Sortable columns
Pagination
Status shown with visual indicator (badge/chip)
Registration Form (modal or separate view)
Form validation
Error handling with user feedback
Success confirmation

State Management
Proper loading states during data fetching
Optimistic updates OR refetch after mutations
Error state handling


What we're looking for:
Clean separation of concerns
TypeScript types/interfaces properly defined
Proper use of React hooks (useState, useEffect, custom hooks for data fetching)
Component composition


# Part 2: Code Review (30 minutes)
Review the following code samples. For each, identify the problems and provide your
recommended fix.
```php
<?PHP
// USERCONTROLLER.PHP
CLASS USERCONTROLLER EXTENDS ABSTRACTCONTROLLER
{
#[ROUTE('/API/USERS/WITH-ACTIVITY', METHODS: ['GET'])]
PUBLIC FUNCTION GETUSERSWITHACTIVITY(ENTITYMANAGERINTERFACE $EM): JSONRESPONSE
{
$USERS = $EM->GETREPOSITORY(USER::CLASS)->FINDALL();
$RESULT = [];
FOREACH ($USERS AS $USER) {
// GET USER'S RECENT LOGINS
$LOGINS = $EM->GETREPOSITORY(LOGINHISTORY::CLASS)
->FINDBY(['USER' => $USER], ['LOGINAT' => 'DESC'], 5);
// GET USER'S ASSIGNED STUDIES
$STUDIES = $EM->GETREPOSITORY(STUDYASSIGNMENT::CLASS)
->FINDBY(['USER' => $USER, 'ACTIVE' => TRUE]);
// GET USER'S PENDING TASKS
$TASKS = $EM->GETREPOSITORY(TASK::CLASS)
->FINDBY(['ASSIGNEDTO' => $USER, 'STATUS' => 'PENDING']);
$RESULT[] = [
'ID' => $USER->GETID(),
'NAME' => $USER->GETFULLNAME(),
'EMAIL' => $USER->GETEMAIL(),
'RECENTLOGINS' => ARRAY_MAP(FN($L) => $L->GETLOGINAT()->FORMAT('Y-M-D H:I'),
$LOGINS),
'ACTIVESTUDIES' => COUNT($STUDIES),
'PENDINGTASKS' => COUNT($TASKS),
];
}
RETURN $THIS->JSON($RESULT);
}
}
Questions:
What is the performance problem with this code?
How many database queries will this execute for 100 users?
Provide a refactored solution.
Sample B: React Component Issues
// USERDASHBOARD.TSX
FUNCTION USERDASHBOARD({ USERID }) {
CONST [USER, SETUSER] = USESTATE(NULL);
CONST [STUDIES, SETSTUDIES] = USESTATE([]);
CONST [TASKS, SETTASKS] = USESTATE([]);
CONST [LOADING, SETLOADING] = USESTATE(FALSE);
USEEFFECT(() => {
FETCHUSER();
FETCHSTUDIES();
FETCHTASKS();
}, []);
ASYNC FUNCTION FETCHUSER() {
CONST RES = AWAIT FETCH(`/API/USERS/${USERID}`);
CONST DATA = AWAIT RES.JSON();
SETUSER(DATA);
}
ASYNC FUNCTION FETCHSTUDIES() {
CONST RES = AWAIT FETCH(`/API/USERS/${USERID}/STUDIES`);
CONST DATA = AWAIT RES.JSON();
SETSTUDIES(DATA);
}
ASYNC FUNCTION FETCHTASKS() {
CONST RES = AWAIT FETCH(`/API/USERS/${USERID}/TASKS`);
CONST DATA = AWAIT RES.JSON();
SETTASKS(DATA);
}
FUNCTION UPDATETASKSTATUS(TASKID, STATUS) {
FETCH(`/API/TASKS/${TASKID}`, {
METHOD: 'PUT',
BODY: JSON.STRINGIFY({ STATUS })
});
DOCUMENT.GETELEMENTBYID(`TASK-${TASKID}`).CLASSLIST.ADD('COMPLETED');
}
RETURN (
<DIV>
<H1>{USER.NAME}</H1>
{STUDIES.MAP(STUDY => <DIV KEY={STUDY.ID}>{STUDY.NAME}</DIV>)}
{TASKS.MAP(TASK => (
<DIV ID={`TASK-${TASK.ID}`} KEY={TASK.ID}>
{TASK.TITLE}
<BUTTON ONCLICK={() => UPDATETASKSTATUS(TASK.ID, 'DONE')}>
COMPLETE
</BUTTON>
</DIV>
))}
</DIV>
);
}
```

# Questions:
List all the issues you can identify (there are at least 6)
Provide a refactored version addressing these issues



Sample C: Service Layer Anti-patterns
```php
<?PHP
// USERSERVICE.PHP
CLASS USERSERVICE
{
PUBLIC FUNCTION __CONSTRUCT(
PRIVATE ENTITYMANAGERINTERFACE $EM
) {}
PUBLIC FUNCTION CREATEUSER(ARRAY $DATA): USER
{
$USER = NEW USER();
$USER->SETEMAIL($DATA['EMAIL']);
$USER->SETFIRSTNAME($DATA['FIRSTNAME']);
$USER->SETLASTNAME($DATA['LASTNAME']);
$USER->SETROLE($DATA['ROLE']);
$USER->SETSTATUS('PENDING');
$USER->SETCREATEDAT(NEW \DATETIME());
$THIS->EM->PERSIST($USER);
$THIS->EM->FLUSH();
// SEND WELCOME EMAIL
$MAILER = NEW \SWIFT_MAILER(NEW \SWIFT_SMTPTRANSPORT('SMTP.EXAMPLE.COM', 587));
$MESSAGE = (NEW \SWIFT_MESSAGE('WELCOME!'))
->SETFROM('NOREPLY@SCOUT.COM')
->SETTO($USER->GETEMAIL())
->SETBODY("WELCOME {$USER->GETFIRSTNAME()}!");
$MAILER->SEND($MESSAGE);
// LOG TO FILE
FILE_PUT_CONTENTS('/VAR/LOG/USERS.LOG', "CREATED USER: {$USER->GETEMAIL()}\N",
FILE_APPEND);
// UPDATE EXTERNAL CRM
$CH = CURL_INIT('HTTPS://CRM.EXAMPLE.COM/API/CONTACTS');
CURL_SETOPT($CH, CURLOPT_POST, TRUE);
CURL_SETOPT($CH, CURLOPT_POSTFIELDS, JSON_ENCODE([
'EMAIL' => $USER->GETEMAIL(),
'NAME' => $USER->GETFULLNAME()
]));
CURL_EXEC($CH);
CURL_CLOSE($CH);
RETURN $USER;
}
}
```

## Questions:
What SOLID principles does this violate?
What will happen if the CRM API is slow or down?
How would you refactor this for better maintainability and reliability?
Part 3: Architecture Discussion (Written - 30 minutes)
Answer briefly (2-3 paragraphs each):

When would you choose MongoDB over a relational database for a new feature? What
factors influence this decision?

Describe how you would implement a feature that needs to process 10,000 records nightly
(e.g., sending reminder emails). What patterns/tools would you use and why?

A React component is re-rendering too frequently, causing performance issues. Walk
through your debugging approach and potential solutions.
Submission

---

Push your code to your repository and provide us with the link.
Include a README with:
Setup instructions
Any assumptions you made
What you would improve given more time
Code review answers can be in a CODE_REVIEW.md file
Architecture answers in ARCHITECTURE.md