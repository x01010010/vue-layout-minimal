# Project Creation Wizard: ASCII Wireframes (Mandatory Fields Marked *)
 
---
 
## 1. General Info
 
```
+------------------------------------------------------+
| Project Creation Wizard - Step 1: General Info       |
+------------------------------------------------------+
| Project Name*:      [__________________________]     |
| Owner*:             [__________________________]     |
| Description*:       [__________________________]     |
| Project Tags:       [__________________________]     |
|                                                      |
|                                 [Reset Form]   [Next]|
+------------------------------------------------------+
```
 
---
 
## 2. Setup Type
 
```
+------------------------------------------------------+
| Project Creation Wizard - Step 2: Setup Type         |
+------------------------------------------------------+
| Select Setup Type*:                                  |
|   ( ) OAD                                            |
|   ( ) Classic                                        |
|                                                      |
| [Previous]                      [Reset Form]   [Next]|
+------------------------------------------------------+
```
 
---
 
## 3. Database Selection
 
```
+------------------------------------------------------+
| Project Creation Wizard - Step 3: Database           |
+------------------------------------------------------+
| Existing database: [__________________________]      |
|                                                      |
|           ---- or ----                               |
|                                                      |
| [Create new database]                                |
|                                                      |
| [Previous]                      [Reset Form]   [Next]|
+------------------------------------------------------+
```
## 3a. New Database

+------------------------------------------------------+
| Project Creation Wizard - Step 3a: New Database      |
+------------------------------------------------------+
| Business Area* [cl|claims|corporate|crm|it|pl]       |
|                                                      |
| For each Database:                                   |
|   +----------------------------------------------+   |
|   | Database Name*: [_______________________]    |   |
|   |                                              |   |
|   | Entitlement Bases*:                          |   |
|   |   [Add Entitlement Base]                     |   |
|   |   For each Entitlement Base:                 |   |
|   |     Name*: [_________] Owner*: [_________]   |   |
|   |     TSO*: [_________]                        |   |
|   |     Read Only Owner*: [_________]            |   |
|   |     Read Only TSO*: [_________]              |   |
|   |     [Remove Entitlement Base]                |   |
|   |                                              |   |
|   | Schemas:                                     |   |
|   |   [Add Schema]                               |   |
|   |   For each Schema:                           |   |
|   |     Name: [_________]                        |   |
|   |     Purpose: (raw|staging|user_managed|target|ods|published) |   |
|   |     Data Retention Days: [____]              |   |
|   |     Restricted: [ ]                          |   |
|   |     [Remove Schema]                          |   |
|   |                                              |   |
|   | Custom Tags:                                 |   |
|   |   [Add Custom Tag]                           |   |
|   |   For each Custom Tag:                       |   |
|   |     Tag: [_________]                         |   |
|   |     Support Group Name: [_________]          |   |
|   |     Support Group Email: [_________]         |   |
|   |     [Remove Custom Tag]                      |   |
|   |                                              |   |
|   | [Remove Database]                            |   |
|   +----------------------------------------------+   |
| [Add Database]                                      |
|                                                      |
| [Previous]                      [Reset Form]   [Next]|
+------------------------------------------------------+ 
---
 

## 4. Environments
 
```
+------------------------------------------------------+
| Project Creation Wizard - Step 4: Environments       |
+------------------------------------------------------+
| Select Environments*:                                |
|   [x] DEV (always selected)                          |
|   [ ] QA                                             |
|   [ ] PROD (disabled unless QA is selected)          |
|                                                      |
| [Previous]                      [Reset Form]   [Next]|
+------------------------------------------------------+
```
 
---
 
## 5. Database Authorization

```
+-----------------------------------------------------------+
| Project Creation Wizard - Step 5: Database Authentication |
+-----------------------------------------------------------+
|  QA DB (tab)             | Prod DB (tab)                  |
|                                                           |
|  Service account:* [__________]                           |
|  Password:* [__________]                                  |
|   -- OR --                                                |
|  Keypair: [_________] / [_________]                       |
|                                                           |
| [Previous]                           [Reset Form]   [Next]|
+-----------------------------------------------------------+
 ```
---
 
## 6. Notifications
 
```
+------------------------------------------------------+
| Project Creation Wizard - Step 6: Notifications      |
+------------------------------------------------------+
| Support Group*:      [__________________________]    |
| Email Distribution:  [__________________________]    |
|                                                      |
| [Previous]                      [Reset Form]   [Next]|
+------------------------------------------------------+
```
 
---
 
## 7. GitHub Setup
 
```
+------------------------------------------------------+
| Project Creation Wizard - Step 7: GitHub Setup       |
+------------------------------------------------------+
| GitHub Team*:         [__________________________]   |
| Repository Name*:     [__________________________]   |
|                                                      |
|                                                      |
| [Previous]                      [Reset Form]   [Next]|
+------------------------------------------------------+
```
 
---
 
## 8. Entitlements
 
```
+------------------------------------------------------+
| Project Creation Wizard - Step 8: Entitlements       |
+------------------------------------------------------+
| Entitlement Owner*:   [__________________________]   |
| Technical Owner*:     [__________________________]   |
|                                                      |
| [Previous]                      [Reset Form]   [Next]|
+------------------------------------------------------+
```
 
---
 
## 9. Review & Create
 
```
+------------------------------------------------------+
| Project Creation Wizard - Step 9: Review & Create    |
+------------------------------------------------------+
| [Summary of all entered data]                        |
|                                                      |
| [Edit General Info] [Edit Setup Type] ...            |
|                                                      |
| [Back] [Create Project]                  [Save Draft]|
+------------------------------------------------------+
 
