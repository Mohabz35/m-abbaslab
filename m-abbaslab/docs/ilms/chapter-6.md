# CHAPTER 6: ATTENDANCE, ENGAGEMENT ANALYTICS, AND LEARNING CONTINUITY

## 6.1 Chapter Introduction
This chapter defines how the Intelligent Learning Management System (ILMS) records, validates, analyzes, and applies attendance and engagement data to support learning continuity and academic progression.

Written as advanced developer documentation, this chapter explains how raw participation data is transformed into institutionally reliable records and analytical signals without compromising academic integrity or student fairness.

---

## 6.2 Attendance as a First-Class Academic Record
Within the ILMS, attendance is treated as a formal academic record, not a secondary metric.

Attendance data is:
- Unit-specific
- Session-specific
- Time-bound
- Immutable once validated

This approach ensures continuity, traceability, and institutional trust.

---

## 6.3 Attendance Data Model

### 6.3.1 Attendance Session Entity
An Attendance Session represents a single instructional event linked to a course unit.

Key attributes include:
- Session ID
- Unit Code
- Delivery Mode (Online / Physical)
- Scheduled Time Window
- Validation Method

### 6.3.2 Attendance Record Entity
An Attendance Record links a student to an attendance session.

Attributes include:
- Student ID
- Session ID
- Attendance Status
- Validation Timestamp

Once confirmed, records cannot be altered.

---

## 6.4 Online Attendance Logic
For online sessions, attendance is validated automatically using:
- Session join time
- Participation duration
- Minimum activity thresholds

Validation rules are configurable at the institutional level.

---

## 6.5 Physical Attendance Logic Using Session Codes
For physical sessions:
- The system generates a unique session code
- The code is valid only within a defined time window
- Students submit the code through their dashboard

This ensures accurate attendance without requiring specialized hardware.

---

## 6.6 Attendance Aggregation and Metrics
Attendance records are aggregated at multiple levels:
- Per session
- Per unit
- Per semester

Aggregated metrics include:
- Attendance percentage
- Absence trends
- Risk indicators

---

## 6.7 Engagement Analytics

### 6.7.1 Engagement Signals
Engagement is inferred from multiple activity signals, including:
- Attendance consistency
- Assessment submission patterns
- Interaction with learning materials

These signals are observational, not punitive.

### 6.7.2 Engagement Profiles
Each student has a derived engagement profile updated periodically.

Profiles are used for:
- Early warning systems
- Academic support interventions

They are not used for grading.

---

## 6.8 Learning Continuity Across Semesters
Attendance and engagement records persist across semesters to support continuity.

The system evaluates:
- Completion of attendance requirements
- Eligibility for progression

These evaluations follow institutional policy.

---

## 6.9 Relationship Between Attendance, Engagement, and Skill DNA
Attendance and engagement data feed Skill DNA as contextual signals.

They influence skill confidence levels but do not override academic assessments.

---

## 6.10 Exceptional Attendance Scenarios
The system provides structured handling for:
- Excused absences
- Network disruptions during online sessions

All exceptions are logged and auditable.

---

## 6.11 Areas of Flexibility
Configurable elements include:
- Attendance thresholds
- Engagement weighting
- Session validation windows

---

## 6.12 Areas Requiring Policy Definition
Institutions must define:
- Minimum attendance requirements
- Progression rules

The system enforces these definitions.

---

## 6.13 Open Discussion Areas
Potential future enhancements include:
- Biometric validation integrations
- Advanced engagement prediction models

---

## 6.14 Chapter Summary
This chapter detailed how attendance and engagement are captured, analyzed, and applied to ensure learning continuity.

The next chapter focuses on Skill DNA intelligence, analytics, and student development insights.
