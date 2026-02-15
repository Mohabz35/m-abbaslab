# CHAPTER 4: SYSTEM WORKFLOWS, USER JOURNEYS, AND OPERATIONAL LOGIC

## 4.1 Chapter Introduction
This chapter translates the static architecture and data models defined in Chapter 3 into living system behavior. It explains, step by step, how different users interact with the system, how data flows between entities, and how operational rules are enforced in real time.

Written as advanced developer documentation, this chapter ensures that no system behavior is implicit or assumed. Every major workflow is explicitly defined so that implementation, testing, and future scaling can proceed without ambiguity.

---

## 4.2 User Categories and Access Entry Points
The system supports three primary operational user categories:
- Students
- Lecturers
- Administrators

Each category enters the system through a common authentication gateway but is redirected to role-specific operational environments based on identity resolution.

```
AUTHENTICATION GATEWAY
        |
        v
IDENTITY RESOLUTION
        |
        +--> Student Dashboard
        +--> Lecturer Workspace
        +--> Admin Control Panel
```

This ensures a unified login experience while preserving strict role separation.

---

## 4.3 Student Workflow

### 4.3.1 Student Login and Identity Resolution
Upon login, the system validates the student’s admission number and resolves:
- Academic programme
- Year of study
- Active semester

This resolution step determines all subsequent dashboard content.

### 4.3.2 Student Dashboard Generation
The student dashboard is generated dynamically based on unit enrollment derived from programme rules.

Dashboard components include:
- Enrolled course units
- Assigned lecturers
- Lecture schedules
- Attendance summary
- Assessment tasks
- Skill DNA progress indicators

No manual configuration by the student is permitted.

### 4.3.3 Learning and Participation Workflow
Students interact with course units through:
- Viewing learning materials
- Attending lectures
- Submitting assignments
- Participating in discussions

Each interaction generates activity records stored in the Learning & Activity Layer.

### 4.3.4 Attendance Workflow (Student Perspective)
- **For online lectures**: Attendance is recorded automatically based on session participation.
- **For physical lectures**: Students submit a session code within a defined time window.

Attendance records are validated before being committed.

---

## 4.4 Lecturer Workflow

### 4.4.1 Lecturer Login and Unit Resolution
Upon login, the system resolves all course units associated with the lecturer’s code.

The lecturer workspace displays:
- Units taught
- Teaching schedules
- Active and upcoming lecture sessions

### 4.4.2 Lecture Session Management
Lecturers create lecture sessions by specifying:
- Unit
- Delivery mode
- Date and time

For physical sessions, a unique attendance code is generated.

### 4.4.3 Content and Assessment Management
Lecturers:
- Upload learning materials
- Create assessments
- Review submissions
- Record grades

Assessment outcomes are stored and later consumed by Skill DNA analytics.

---

## 4.5 Lecturer Hub Workflow
The Lecturer Hub supports coordination across common units.

It enables:
- Unit-level collaboration
- Shared content standards
- Coordinated scheduling

The Hub improves instructional consistency without centralizing control excessively.

---

## 4.6 Administrator Workflow

### 4.6.1 System Configuration
Administrators manage:
- Academic calendars
- Programme definitions
- Curriculum mappings

These configurations affect automatic enrollment and dashboard generation.

### 4.6.2 Oversight and Monitoring
Administrators monitor:
- System usage
- Attendance trends
- Data integrity alerts

They do not intervene directly in academic outcomes.

---

## 4.7 Cross-Workflow Data Flow

```
STUDENT ACTION
     |
     v
ACTIVITY RECORD
     |
     v
ATTENDANCE / ASSESSMENT
     |
     v
SKILL DNA UPDATE
```

This flow ensures traceability from user action to analytics.

---

## 4.8 Error Handling and Exceptional Scenarios
The system defines explicit handling for:
- Invalid session codes
- Missed attendance windows
- Incomplete assessments

These exceptions are logged and surfaced appropriately.

---

## 4.9 Areas of Flexibility
The following workflow elements are configurable:
- Attendance thresholds
- Session validation windows
- Dashboard visualization depth

---

## 4.10 Areas Requiring Policy Decisions
Certain workflows depend on institutional policy:
- Attendance minimums
- Assessment weighting

These are parameterized rather than hard-coded.

---

## 4.11 Open Discussion Areas
Future refinement areas include:
- Adaptive dashboards
- Personalized learning recommendations

---

## 4.12 Chapter Summary
This chapter detailed how users interact with the ILMS in practice, translating architectural definitions into operational workflows.

The next chapter focuses on assessment logic, grading systems, and academic evaluation mechanisms.
