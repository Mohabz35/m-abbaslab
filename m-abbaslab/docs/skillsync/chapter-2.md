# SkillSync Mathematical Models & Equations
## Modeling Growth, Decay, and Synergy in Skill DNA

---

### 1. Conceptual Models
#### Figure 1: Skill DNA Vector Representation
A user’s skill profile is modeled as a multidimensional vector (**Skill DNA**), where each dimension represents proficiency in a specific skill domain. Skill strengths evolve over time due to learning, practice, and environmental exposure, while decay occurs in the absence of reinforcement.

**Formal Definition:**
Let $S_u(t) = [s_1(t), s_2(t), \dots, s_n(t)]$ represent the Skill DNA vector of user $u$ at time $t$, where $s_i(t) \in [0, 1]$ is normalized proficiency in skill $i$.

---

#### Figure 2: Skill Lifecycle Model
A lifecycle curve showing skill acquisition, consolidation, peak performance, stagnation, decay, and potential regeneration. The curve demonstrates that skills are not static assets but dynamic cognitive constructs.

**Phases:**
1. Acquisition
2. Acceleration
3. Plateau
4. Decay
5. Reinforcement or Obsolescence

---

#### Figure 3: Skill Interaction Graph
A weighted network graph where nodes represent skills and edges represent synergy or dependency. Edge weights indicate how strongly one skill accelerates or reinforces another.

**Example:**
- **Programming ↔ Mathematics** (high synergy)
- **Statistics ↔ Data Visualization**

---

### 2. Mathematical Models and Equations
#### 2.1 Skill Growth Equation
Skill acquisition follows a logistic growth function, consistent with learning science.

$s_i(t) = \frac{L}{1 + e^{-k(t-t_0)}}$

**Where:**
- $L$ = maximum achievable proficiency
- $k$ = learning rate
- $t_0$ = inflection point (time of fastest growth)

*Interpretation:* Early learning is slow, accelerates with practice, and plateaus as mastery is approached.

---

#### 2.2 Skill Decay Model (Forgetting Curve)
Based on Ebbinghaus-style exponential decay:

$s_i(t) = s_i(t_0) e^{-\lambda(t-t_0)}$

**Where:**
- $\lambda$ = decay constant
- Higher $\lambda$ implies faster skill loss

*Empirical Insight:* Cognitive skills decay after 2–6 weeks of non-use; Technical skills show measurable decay after 3–6 months.

---

#### 2.3 Skill Reinforcement Function
When practice or learning occurs:

$s_{i}(t+1) = s_{i}(t) + \alpha(1 - s_{i}(t))$

**Where:**
- $\alpha$ = reinforcement coefficient (practice intensity)

This ensures diminishing returns as mastery increases.

---

#### 2.4 Skill Synergy Model
Skill transfer effect between related skills:

$\Delta s_j = \sum_{i \neq j} w_{ij} \cdot s_i$

**Where:**
- $w_{ij}$ = synergy weight between skills $i$ and $j$

This mathematically defines **super skills** (clusters with high internal synergy).

---

### 3. Super Skill Index (SSI)
SSI predicts faster career mobility and higher income elasticity.

$SSI_u = \sum_{i=1}^{k} s_i \cdot C_i$

**Where:**
- $C_i$ = centrality of skill $i$ in the skill graph

---

### 4. Skill Waste Period (Skill Obsolescence Threshold)
A skill enters waste when: $s_i(t) < \theta$

**Where:**
- $\theta$ = minimum viable proficiency threshold
- Soft skills: $\theta \approx 0.4$ (longer durability)
- Technical skills: $\theta \approx 0.6$

---

### 5. AI Skill Prediction Model (Core SkillSync Logic)
Future State Prediction: $\hat{S}_u(t+1) = f(S_u(t), A_u(t), E(t))$

**Where:**
- $A_u(t)$ = user activities
- $E(t)$ = market & industry signals
