# CHAPTER 13: EXAMINATION & QUESTION GENERATION ENGINE

## 13.1 Chapter Introduction
This chapter defines the Examination and Question Generation Engine of the Intelligent Learning Management System (ILMS). This engine is responsible for designing, delivering, securing, and evaluating assessments in a way that is academically sound, scalable, and aligned with institutional standards.

The engine is designed to support human-led examinations enhanced by system intelligence, not fully automated grading without oversight.

---

## 13.2 Objectives of the Examination Engine
The examination engine aims to:
- Standardize assessment delivery
- Reduce examination malpractice
- Support continuous assessment models
- Enable scalable testing for large student populations
- Preserve academic integrity and lecturer authority

---

## 13.3 Assessment Types Supported

### 13.3.1 Continuous Assessments
- Assignments
- Quizzes
- Practical exercises
- Projects

Each assessment contributes to the final grade based on predefined weights.

### 13.3.2 Examinations
- Mid-semester exams
- End-of-semester exams
- Make-up and supplementary exams

**Delivery modes**:
- Online (timed, controlled)
- Offline (recorded attendance & submission)

---

## 13.4 Question Bank Architecture

### 13.4.1 Question Repository
Each unit maintains its own question bank containing:
- Question ID
- Question type
- Difficulty level
- Topic mapping
- Model answer / marking guide

### 13.4.2 Question Types
Supported formats:
- Multiple Choice Questions (MCQ)
- Short Answer Questions
- Long-form / Essay Questions
- Problem-solving questions

---

## 13.5 Question Generation Logic

### 13.5.1 Manual Question Creation
Lecturers can:
- Create questions manually
- Tag questions by topic and difficulty
- Approve questions before use

### 13.5.2 Assisted Question Generation
The system may assist by:
- Suggesting question variations
- Rephrasing existing questions
- Generating practice questions

All generated content requires lecturer approval.

---

## 13.6 Examination Assembly Process
```
Question Bank → Selection Rules
              → Exam Paper Assembly
              → Lecturer Review
              → Exam Release
```
Rules may include:
- Topic coverage
- Difficulty distribution
- Randomization

---

## 13.7 Examination Delivery Controls
Security measures include:
- Time-bound access
- One-session enforcement
- Randomized question order
- Submission locking

---

## 13.8 Grading and Evaluation

### 13.8.1 Automated Grading
Applicable to:
- MCQs
- Structured responses

### 13.8.2 Manual Grading
Applicable to:
- Essays
- Projects

Lecturers retain final authority.

---

## 13.9 Academic Integrity Measures
- Question randomization
- Time window enforcement
- Plagiarism checks (future extension)
- Audit trails

---

## 13.10 Scalability Considerations
The engine supports:
- Thousands of concurrent exam sessions
- Load-balanced delivery
- Graceful failure recovery

---

## 13.11 Student Experience
Students can:
- View assessment schedules
- Attempt exams securely
- Receive structured feedback

---

## 13.12 Lecturer Experience
Lecturers can:
- Build reusable question banks
- Control exam parameters
- Review performance analytics

---

## 13.13 Relationship to Skill DNA
Assessment outcomes:
- Feed Skill DNA indicators
- Do not override academic grades

---

## 13.14 Limitations and Governance
The engine:
- Does not replace examiners
- Requires institutional policy alignment

---

## 13.15 Chapter Summary
This chapter defined a secure, scalable, and academically governed examination and question generation engine. It balances automation with human control, ensuring integrity while supporting modern assessment needs.
