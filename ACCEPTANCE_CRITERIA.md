# Recruit-AI - Candidate Acceptance Criteria

## 📊 Scoring System

The system uses a **0-100 point scale** to evaluate candidates based on how well they match the job requirements.

---

## 🎯 Acceptance Threshold

### ✅ **INTERVIEW** - Score ≥ 65%
- **Threshold**: 65 points or higher
- **Action**: Send interview invitation email
- **Exception**: Strong potential candidates below 65 may still be recommended for interview by the AI

### ❌ **REJECT** - Score < 65%
- **Threshold**: Below 65 points
- **Action**: Send rejection email
- **Exception**: Only if there are no exceptional qualities

---

## 📈 Detailed Score Breakdown

| Score Range | Category | Description | Recommendation | Email Sent |
|-------------|----------|-------------|----------------|------------|
| **90-100** | Exceptional Fit | Exceeds requirements, outstanding candidate | ✅ Interview | Interview Invitation |
| **75-89** | Strong Fit | Meets most requirements, solid candidate | ✅ Interview | Interview Invitation |
| **60-74** | Moderate Fit | Has potential but some gaps exist | ✅ Interview | Interview Invitation |
| **40-59** | Weak Fit | Significant gaps in qualifications | ❌ Reject | Rejection Email |
| **0-39** | Poor Fit | Does not meet requirements | ❌ Reject | Rejection Email |

---

## 🔍 Evaluation Criteria

The AI evaluates candidates across **4 main criteria**:

### 1. **Experience** (25%)
- Years of relevant experience
- Industry background
- Previous roles and responsibilities
- Career progression

### 2. **Technical Skills** (35%)
- Required technologies and tools
- Programming languages
- Frameworks and libraries
- Technical proficiency level

### 3. **Education** (20%)
- Degree level and field
- Institution reputation
- Relevant certifications
- Continuous learning

### 4. **Soft Skills** (20%)
- Communication abilities
- Leadership experience
- Teamwork and collaboration
- Problem-solving skills

---

## 🤖 AI Recommendation Logic

The AI uses the following logic to determine recommendations:

```javascript
if (score >= 65 OR hasStrongPotential) {
  recommendation = "Interview";
  sendEmail = "Interview Invitation";
} else if (score < 65 AND noExceptionalQualities) {
  recommendation = "Reject";
  sendEmail = "Rejection Email";
}
```

### Special Cases:

**1. High Potential Exception:**
- Score: 60-64
- Has exceptional skills in one area
- Shows strong learning ability
- Result: May still get "Interview" recommendation

**2. Borderline Cases:**
- Score: 63-67
- AI carefully evaluates overall fit
- Considers growth potential
- Result: Decided case-by-case

---

## 📧 Email Automation

### Interview Email (Score ≥ 65)
**Trigger**: When `recommendation === "Interview"`

**Email Content:**
- Subject: 🎉 Interview Invitation - [Candidate Name]
- Includes candidate's score
- Invitation to schedule interview
- Next steps outlined

**Example:**
```
Dear John Doe,

Thank you for applying to our position. We were impressed by your profile.

📊 Your Application Score: 88/100

We would like to invite you for an interview...
```

### Rejection Email (Score < 65)
**Trigger**: When `recommendation === "Reject"`

**Email Content:**
- Subject: Application Update - [Candidate Name]
- Professional and respectful tone
- Encouragement to apply for future positions
- Best wishes for job search

**Example:**
```
Dear Jane Smith,

Thank you for your interest in our position.

After careful review, we have decided to move forward with other candidates...
```

---

## 🎨 Visual Representation

```
Score Scale:
0────────────────────────────────────────────────────────────────────────────100
│                                                │                              │
│           REJECT ZONE                          │      INTERVIEW ZONE          │
│         (Send Rejection)                       │  (Send Interview Invitation) │
│                                                │                              │
0                                               65                            100
                                                 ↑
                                          THRESHOLD
```

---

## 📊 Score Distribution (Expected)

Based on typical recruitment scenarios:

| Category | Score Range | Expected % of Candidates |
|----------|-------------|--------------------------|
| Exceptional | 90-100 | ~5-10% |
| Strong | 75-89 | ~15-20% |
| Moderate | 60-74 | ~25-30% |
| Weak | 40-59 | ~30-35% |
| Poor | 0-39 | ~10-15% |

**Interview Rate**: Approximately 45-60% of candidates (score ≥ 65)

---

## 🔧 Customizing the Threshold

If you want to change the acceptance threshold, you need to modify the **n8n workflow**:

### Location:
`backend/recruit-ai-workflow-with-email.json`

### Code to Modify:

**In "Parse LLM Response" node:**
```javascript
// Current threshold: 65
if (!['Interview', 'Reject'].includes(parsedData.recommendation)) {
  parsedData.recommendation = parsedData.score >= 65 ? 'Interview' : 'Reject';
  //                                              ↑
  //                                    Change this number
}
```

**In "Configure LLM Provider" node (System Prompt):**
```javascript
Recommendation Guidelines:
- "Interview": Score >= 65 OR strong potential despite lower score
//                      ↑
//              Change this number
- "Reject": Score < 65 AND no exceptional qualities
//                   ↑
//           Change this number
```

### Example: More Selective (70% threshold)
```javascript
parsedData.recommendation = parsedData.score >= 70 ? 'Interview' : 'Reject';
```

### Example: More Inclusive (60% threshold)
```javascript
parsedData.recommendation = parsedData.score >= 60 ? 'Interview' : 'Reject';
```

---

## 📈 Threshold Recommendations by Role Level

| Role Level | Suggested Threshold | Reasoning |
|------------|---------------------|-----------|
| **Entry Level** | 55-60% | More inclusive, focus on potential |
| **Mid Level** | 65-70% | Balanced, standard threshold |
| **Senior Level** | 70-75% | More selective, higher standards |
| **Leadership** | 75-80% | Very selective, proven track record |
| **Executive** | 80-85% | Highly selective, exceptional fit only |

---

## 🎯 Best Practices

### 1. **Monitor Your Interview Rate**
- Target: 40-60% of applicants
- Too high (>70%): Consider raising threshold
- Too low (<30%): Consider lowering threshold

### 2. **Review Edge Cases**
- Manually review candidates scoring 60-70
- Check for false negatives (good candidates rejected)
- Adjust threshold if needed

### 3. **Track Hiring Outcomes**
- Monitor which score ranges lead to successful hires
- Adjust threshold based on actual performance
- Refine criteria weights over time

### 4. **A/B Testing**
- Test different thresholds for similar roles
- Compare quality of candidates interviewed
- Optimize based on data

---

## 📝 Summary

### Current Settings:
- **Interview Threshold**: ≥ 65%
- **Rejection Threshold**: < 65%
- **Score Range**: 0-100
- **Evaluation Criteria**: 4 categories (Experience, Technical Skills, Education, Soft Skills)

### Email Automation:
- **Interview Email**: Automatically sent when score ≥ 65
- **Rejection Email**: Automatically sent when score < 65
- **Email Delivery**: Via SMTP (configured in n8n)

### Flexibility:
- ✅ AI can override threshold for exceptional cases
- ✅ Threshold is customizable in workflow
- ✅ Scoring is fair and realistic
- ✅ Considers both quantitative and qualitative factors

---

**Last Updated**: 2025-12-09  
**Current Threshold**: 65%  
**Recommendation**: This threshold works well for most mid-level positions. Adjust based on your specific needs and hiring outcomes.
