# CHAPTER 5: ASSESSMENT, GRADING, AND ACADEMIC EVALUATION SYSTEMS

## 5.1 Chapter Introduction
This chapter defines how academic performance is measured, recorded, validated, and interpreted within the Intelligent Learning Management System (ILMS). It focuses on assessment logic, grading workflows, and evaluation integrity, ensuring that academic outcomes are handled with precision, fairness, and traceability.

Written as advanced developer documentation, this chapter explicitly separates academic evaluation (grades) from analytical interpretation (Skill DNA), while explaining how both interact without compromising institutional standards.

---

## 5.2 Assessment Framework Overview
The ILMS supports a structured assessment framework aligned with institutional academic policies. Assessments are treated as formal academic instruments, not simple tasks.

Core assessment categories include:
- Continuous Assessment (assignments, quizzes, coursework)
- Practical or project-based assessment
- Mid-semester evaluations (where applicable)
- Final examinations (grade recording only)

The system does not define academic policy; it enforces policy as configured by the institution.

---

## 5.3 Assessment Entity Model

### 5.3.1 Assessment Definition
An Assessment entity represents a measurable academic task associated with a specific course unit.

Key attributes include:
- Assessment ID
- Unit Code
- Assessment Type
- Maximum Score
- Weighting Factor
- Submission Window

Each assessment is immutable once released to students.

### 5.3.2 Submission Entity
A Submission entity represents a student’s response to an assessment.

Attributes include:
- Student ID
- Assessment ID
- Submission Timestamp
- Submission State

Submissions are version-controlled and time-stamped.

---

## 5.4 Grading Workflow

### 5.4.1 Grade Entry and Validation
Lecturers enter grades through controlled interfaces linked to their teaching assignments.

Validation rules include:
- Grade ranges enforced automatically
- Weighting constraints checked
- Lecturer authorization verified

Once validated, grades are locked.

### 5.4.2 Grade Modification Rules
Grade changes are:
- Logged
- Versioned
- Restricted to authorized roles

This ensures auditability and accountability.

---

## 5.5 Grade Aggregation and Computation
The system computes unit-level grades by aggregating weighted assessment scores.

Computation occurs:
- At defined evaluation checkpoints
- Automatically upon assessment completion

Manual recalculation is not permitted.

---

## 5.6 Student Grade Visibility
Students can view:
- Individual assessment results
- Aggregate unit grades
- Historical grade records

They cannot modify or contest grades within the system; dispute resolution follows institutional procedures.

---

## 5.7 Academic Integrity Controls
The system enforces integrity through:
- Role-based grade entry
- Time-bound submission windows
- Immutable grade records
- Complete audit logs

These controls ensure trustworthiness of academic outcomes.

---

## 5.8 Relationship Between Grades and Skill DNA
Grades and Skill DNA are intentionally decoupled.
- Grades represent academic performance
- Skill DNA represents inferred competencies

Skill DNA analytics consume grade data as input signals, not authoritative judgments.

---

## 5.9 Handling Exceptional Academic Scenarios
The system provides structured handling for:
- Late submissions
- Missing assessments
- Incomplete evaluations

These scenarios are resolved via configured institutional policies.

---

## 5.10 Areas of Flexibility
Configurable elements include:
- Assessment weighting schemes
- Grading scales
- Submission grace periods

---

## 5.11 Areas Requiring Institutional Policy
The following require explicit policy definition:
- Pass/fail thresholds
- Grade appeal processes
- Academic probation rules

The system enforces, but does not define, these policies.

---

## 5.12 Open Discussion Areas
Potential areas for future enhancement include:
- Rubric-based grading
- Peer assessment mechanisms

---

## 5.13 Chapter Summary
This chapter defined the assessment, grading, and academic evaluation mechanisms of the ILMS. It established clear workflows, integrity controls, and the boundary between academic judgment and analytical insight.

The next chapter focuses on attendance analytics, engagement measurement, and learning continuity mechanisms.
