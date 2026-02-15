# CHAPTER 10: PROTOTYPE DOCUMENTATION AND FUNCTIONAL BLUEPRINT

## 10.1 Chapter Introduction
This chapter defines the Prototype Documentation for the Intelligent Learning Management System (ILMS). The prototype represents the first tangible system form, translating architectural intent, workflows, and sample data into interactive system behavior.

The prototype is functional but incomplete by design. Its purpose is to validate logic, usability, and integration—not to deliver production readiness.

---

## 10.2 Objectives of the Prototype
The prototype aims to:
- Validate identity-driven access control
- Demonstrate role-based dashboards
- Test academic data flows end-to-end
- Visualize Skill DNA outputs
- Identify usability and performance gaps early

---

## 10.3 Prototype Scope Definition

### 10.3.1 Included Components
The prototype includes:
- Authentication & identity resolution
- Student dashboard
- Lecturer dashboard
- Admin dashboard (limited)
- Course and unit display
- Attendance capture (code-based)
- Assessment submission & grading (mock)
- Skill DNA visualization (read-only)

### 10.3.2 Excluded Components
The prototype explicitly excludes:
- Financial systems
- External integrations
- Full security hardening
- High-availability infrastructure

These are deferred to MVP or production phases.

---

## 10.4 User Interface Structure

### 10.4.1 Authentication Flow
1. User enters credentials
2. System resolves role from identity
3. Dashboard is auto-assigned

No role selection is allowed.

### 10.4.2 Student Dashboard (Prototype)
Key sections:
- Programme summary
- Active units
- Lecture timetable
- Attendance status
- Assessments
- Skill DNA snapshot

### 10.4.3 Lecturer Dashboard (Prototype)
Key sections:
- Assigned units
- Lecture schedule
- Attendance generation
- Assessment grading panel

### 10.4.4 Admin Dashboard (Prototype)
Key sections:
- Faculty & programme registry
- User provisioning
- Academic calendar

---

## 10.5 Functional Behavior Specification

### 10.5.1 Identity Resolution Logic
```
Login → Admission/Lecturer Code
      → Role Resolution
      → Programme / Unit Mapping
      → Dashboard Render
```

### 10.5.2 Attendance Capture Logic
- Lecturer generates session code
- Students submit code within time window
- System locks attendance record

### 10.5.3 Assessment Workflow
- Lecturer defines assessment
- Student submits work
- Lecturer grades
- System updates aggregates

---

## 10.6 Skill DNA Prototype Visualization
The prototype displays:
- Skill categories
- Confidence indicators
- Evidence summaries

No editing or external sharing is enabled.

---

## 10.7 Data Handling in Prototype
- Data may be mocked or partially persisted
- Referential integrity must be maintained
- Data resets are acceptable

---

## 10.8 Prototype Evaluation Criteria
The prototype is evaluated on:
- Functional correctness
- Role isolation
- Workflow clarity
- Usability feedback

Performance benchmarks are indicative only.

---

## 10.9 Known Limitations
Prototype limitations include:
- Simplified validation
- Manual data seeding
- Limited analytics depth

These are documented intentionally.

---

## 10.10 Transition from Prototype to MVP
Prototype outputs inform:
- Feature prioritization
- UI refinements
- Data model stabilization

The prototype is not discarded; it evolves.

---

## 10.11 Areas for Iteration and Feedback
Iteration areas include:
- Dashboard usability
- Attendance flow friction
- Skill DNA interpretation

Stakeholder feedback is encouraged.

---

## 10.12 Chapter Summary
This chapter defined the ILMS prototype as a controlled, functional representation of the system design. It establishes a clear boundary between conceptual documentation and implementation readiness, serving as the foundation for MVP development.
