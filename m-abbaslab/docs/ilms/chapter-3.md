# CHAPTER 3: CORE SYSTEM ARCHITECTURE, DATA MODELS, AND ENTITY RELATIONSHIPS

## 3.1 Chapter Introduction
This chapter represents the technical core of the entire system documentation. While previous chapters established context and rationale, this chapter defines what the system is made of at a structural level.

Written as advanced developer documentation, this chapter formally specifies:
- Core system entities
- Data models and their responsibilities
- Relationships between academic, identity, and activity data
- Structural rules that govern system behavior

Every workflow, interface, and feature described in later chapters is derived from the models defined here.

---

## 3.2 High-Level System Architecture Overview
At a conceptual level, the system architecture is organized into four tightly coordinated layers:
1. **Identity & Access Layer** – who the user is and what they are allowed to do
2. **Academic Structure Layer** – how the university is modeled
3. **Learning & Activity Layer** – what users do within the system
4. **Intelligence & Analytics Layer** – how meaning is extracted from activity

```
+-------------------------------+
|   Intelligence & Analytics    |
|   (Skill DNA, Insights)       |
+-------------------------------+
|   Learning & Activity Layer   |
|   (Units, Attendance, Tasks)  |
+-------------------------------+
|   Academic Structure Layer    |
|   (Programmes, Units, Terms)  |
+-------------------------------+
|   Identity & Access Layer     |
|   (Students, Lecturers)       |
+-------------------------------+
```

This layered approach ensures separation of concerns while enabling controlled data flow between layers.

---

## 3.3 Core Identity Entities

### 3.3.1 Student Entity
The Student entity represents a registered learner within the institution.

Key attributes include:
- Admission Number (Primary Identifier)
- Full Name
- Programme ID
- Year of Study
- Enrollment Status

Rules:
- Admission number is immutable
- A student belongs to exactly one programme at a time
- All academic activity must reference a valid student record

### 3.3.2 Lecturer Entity
The Lecturer entity represents an academic staff member authorized to teach course units.

Key attributes include:
- Lecturer Code (Primary Identifier)
- Full Name
- Institutional Role

Rules:
- Lecturer authority is unit-based, not faculty-based
- A lecturer may teach multiple units across programmes

### 3.3.3 Administrator Entity
The Administrator entity represents system governance roles.

Administrators:
- Configure system parameters
- Manage academic calendars
- Oversee data integrity

They do not generate academic data.

---

## 3.4 Academic Structure Entities

### 3.4.1 Faculty and Department Entities
Faculties and departments are modeled as organizational reference entities.

They:
- Provide classification and reporting structure
- Do not control system logic directly

### 3.4.2 Programme Entity
The Programme entity defines a structured academic pathway.

Attributes include:
- Programme Code
- Department ID
- Duration
- Curriculum Structure

A programme determines:
- Eligible students
- Applicable course units

### 3.4.3 Course Unit Entity
The Course Unit is the central operational entity of the system.

Attributes include:
- Unit Code
- Unit Title
- Credit Value
- Skill Mapping

All teaching, learning, and assessment activities are unit-bound.

---

## 3.5 Enrollment and Assignment Entities

### 3.5.1 Unit Enrollment
Represents the relationship between a student and a course unit.

Rules:
- Derived automatically from programme and year
- Cannot be manually altered by students

### 3.5.2 Teaching Assignment
Defines the relationship between lecturers and units.

Rules:
- Assigned by academic coordinators or administrators
- Multiple lecturers may teach the same unit

---

## 3.6 Learning and Activity Entities

### 3.6.1 Lecture Session
Represents a single teaching event.

Attributes include:
- Session ID
- Delivery Mode (Online / Physical)
- Attendance Code

### 3.6.2 Attendance Record
Links a student to a lecture session.

Attendance records are immutable once validated.

### 3.6.3 Assessment Entity
Represents graded or ungraded academic tasks.

Assessment results feed both grading and Skill DNA systems.

---

## 3.7 Skill DNA Data Model
Skill DNA is implemented as a separate analytical model.

Entities include:
- Skill Category
- Skill Indicator
- Skill Proficiency Record

Skill data is:
- Read-only to users
- Derived from verified academic activity

---

## 3.8 Core Entity Relationship Diagram (Textual Representation)

```
STUDENT
  | (enrolled in)
  v
PROGRAMME
  | (defines)
  v
COURSE UNIT <----> LECTURER
     |
     v
LECTURE SESSION
     |
     v
ATTENDANCE RECORD
     |
     v
SKILL DNA RECORD
```

This diagram illustrates the primary data flow relationships.

---

## 3.9 Data Integrity and Constraints
The system enforces:
- Referential integrity
- Role-based modification rules
- Immutable academic identifiers

These constraints protect institutional credibility.

---

## 3.10 Areas of Extension
Potential extensions include:
- Micro-credential entities
- Industry mentor roles
- Cross-institutional unit sharing

---

## 3.11 Areas for Optimization
Identified optimization points include:
- Query performance on large enrollment tables
- Skill aggregation algorithms

---

## 3.12 Open Design Discussions
Topics flagged for controlled evolution:
- Granularity of skill indicators
- Real-time vs batch analytics

---

## 3.13 Chapter Summary
This chapter defined the core architecture, data models, and entity relationships that form the backbone of the ILMS.

The next chapter describes system workflows and user interactions built on top of these models.
