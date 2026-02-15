# CHAPTER 9: SAMPLE DATA, ILLUSTRATIVE SCENARIOS, AND SYSTEM WALKTHROUGH

## 9.1 Chapter Introduction
This chapter provides concrete sample data and illustrative scenarios to demonstrate how the Intelligent Learning Management System (ILMS) operates in practice. While previous chapters defined architecture, workflows, and logic, this chapter answers the practical question:
“What does the data actually look like, and how does the system behave with real users?”

This chapter functions as a conceptual prototype. It is not a live system, but a structured, realistic representation of how data flows through the ILMS from admission to analytics.

---

## 9.2 Institutional Sample Structure

### 9.2.1 University Profile (Sample)
- **University Name**: Example National University
- **Faculties**: 9
- **Departments per Faculty**: 3–6
- **Total Students**: ~8,500
- **Academic Calendar**: Semester-based

### 9.2.2 Faculty, Department, and Programme Samples
- **Faculty**: Humanities and Social Sciences
- **Department**: Social Sciences
- **Programme**: BSc Economics and Statistics

**Programme Attributes**:
- Programme Code: BSES
- Duration: 4 years
- Delivery Mode: Full-time

---

## 9.3 Student Sample Data

### 9.3.1 Student Identity Record
| Field | Sample Value |
| :--- | :--- |
| Admission Number | CB18-72341/24 |
| Full Name | Sample Student |
| Programme Code | BSES |
| Year of Study | Year 2 |
| Academic Status | Active |

This admission number serves as the single source of truth for all system interactions.

### 9.3.2 Derived Academic Placement
From the admission record, the system automatically derives:
- **Faculty**: Humanities and Social Sciences
- **Department**: Social Sciences
- **Active Semester**: Year 2, Semester 1

No manual selection is required.

---

## 9.4 Course Unit and Enrollment Sample

### 9.4.1 Curriculum Mapping (Excerpt)
| Unit Code | Unit Name | Year | Semester |
| :--- | :--- | :--- | :--- |
| ECO 210 | Microeconomics II | 2 | 1 |
| STA 221 | Probability Theory | 2 | 1 |
| ECO 230 | Econometrics I | 2 | 1 |

### 9.4.2 Automatic Enrollment Result
Upon login, the student is automatically enrolled in the above units and sees them on their dashboard.

---

## 9.5 Lecturer Sample Data

### 9.5.1 Lecturer Identity Record
| Field | Sample Value |
| :--- | :--- |
| Lecturer Code | LEC-045 |
| Full Name | Dr. Mohammed Abas |
| Units Taught | ECO 210, ECO 230 |

Lecturer authority is unit-based, not faculty-bound.

---

## 9.6 Lecture Session and Attendance Sample

### 9.6.1 Lecture Session Record
| Field | Sample Value |
| :--- | :--- |
| Session ID | ECO210-2024-01 |
| Delivery Mode | Physical |
| Attendance Code | ECO210-A7K9 |
| Time Window | 09:00–10:30 |

### 9.6.2 Attendance Submission
| Student | Session | Status |
| :--- | :--- | :--- |
| CB18-72341/24 | ECO210-2024-01 | Present |

Attendance is validated and locked.

---

## 9.7 Assessment and Grading Sample

### 9.7.1 Assessment Definition
| Field | Sample Value |
| :--- | :--- |
| Assessment ID | ECO210-ASS-01 |
| Type | Assignment |
| Weight | 20% |

### 9.7.2 Submission and Grade
| Student | Score | Status |
| :--- | :--- | :--- |
| CB18-72341/24 | 16/20 | Graded |

The grade contributes to the unit aggregate.

---

## 9.8 Skill DNA Sample Output

### 9.8.1 Skill Evidence Extraction
Derived signals:
- Attendance consistency: High
- Assignment timeliness: High
- Performance trend: Positive

### 9.8.2 Skill Profile Snapshot
| Skill Category | Confidence Level |
| :--- | :--- |
| Analytical Reasoning | Strong |
| Discipline & Consistency | Strong |
| Quantitative Analysis | Developing |

These insights are advisory, not graded.

---

## 9.9 End-to-End System Walkthrough Summary
```
Admission Number → Identity Resolution
                → Programme & Units
                → Lectures & Attendance
                → Assessments & Grades
                → Skill DNA Analytics
```
This walkthrough demonstrates the complete lifecycle of a student within the ILMS.

---

## 9.10 Role of This Chapter in Development
This chapter serves as:
- A reference for prototype development
- A guide for MVP implementation
- A validation tool for system logic

Actual implementation may adjust data formats without altering system behavior.

---

## 9.11 Areas for Prototype Expansion
Future prototype stages may include:
- Larger datasets
- Multiple faculties and programmes
- Simulated failure cases

---

## 9.12 Chapter Summary
This chapter provided realistic sample data and illustrative scenarios demonstrating how the ILMS operates end-to-end. It bridges the gap between abstract design and practical implementation, preparing the groundwork for prototyping and MVP development.
