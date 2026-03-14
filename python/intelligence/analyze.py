"""
Student Roadmap AI - Intelligence Service
Generates personalized roadmaps from student profile data.
Uses mock/demo logic for MVP; structured for easy LLM/RAG plug-in.
"""

import json
import sys
from typing import Any


def analyze_profile(data: dict[str, Any]) -> dict[str, Any]:
    """Generate roadmap from student profile. Replace with LLM/retrieval in production."""
    name = data.get("name", "Student")
    grade = data.get("gradeLevel", "Unknown")
    gpa = data.get("gpa")
    majors = data.get("intendedMajors", [])
    industry = data.get("intendedIndustry", "")
    colleges = data.get("targetColleges", [])
    interests = data.get("interests", [])
    extracurriculars = data.get("extracurriculars", [])
    awards = data.get("awards", [])
    leadership = data.get("leadershipExp", [])
    hours = data.get("hoursPerWeek", 0)
    goals = data.get("goals", "")

    # Mock analysis - structured for real LLM swap
    student_summary = (
        f"{name} is a {grade} student with interests in {', '.join(interests or ['various fields'])}. "
        f"{'GPA: ' + str(gpa) + '.' if gpa else ''} "
        f"Intended path: {industry or 'TBD'}; majors: {', '.join(majors or ['undeclared'])}. "
        f"Target schools: {', '.join(colleges[:5]) if colleges else 'Not specified'}."
    )

    strengths = []
    if gpa and gpa >= 3.5:
        strengths.append("Strong academic performance.")
    if awards:
        strengths.append(f"Recognition through awards: {', '.join(awards[:3])}.")
    if leadership:
        strengths.append("Demonstrated leadership experience.")
    if extracurriculars:
        strengths.append("Involved in extracurricular activities.")
    strengths_analysis = " ".join(strengths) if strengths else "Building a strong foundation."

    gaps = []
    if not leadership:
        gaps.append("Consider taking on leadership roles.")
    if not awards or len(awards) < 2:
        gaps.append("Pursue competitions or recognition opportunities.")
    if hours and hours < 5:
        gaps.append("Limited hours may constrain extracurricular depth.")
    gaps_analysis = " ".join(gaps) if gaps else "Profile is developing well."

    def rec(name: str, reason: str, priority: str = "medium") -> dict:
        return {"name": name, "reason": reason, "priority": priority}

    rec_extracurriculars = [
        rec("STEM Club / Robotics", "Aligns with technical interests and builds teamwork.", "high"),
        rec("Debate or Model UN", "Develops communication and critical thinking.", "medium"),
        rec("Community Service", "Demonstrates values and commitment.", "high"),
    ]
    rec_projects = [
        rec("Personal Portfolio Website", "Showcases work and technical skills.", "high"),
        rec("Research or Capstone Project", "Demonstrates depth in intended major.", "high"),
    ]
    rec_coursework = [
        rec("AP/IB courses in intended focus", "Strengthens academic profile.", "high"),
        rec("Statistics or Data Science", "Valuable across disciplines.", "medium"),
    ]
    rec_competitions = [
        rec("Science Olympiad / USABO", "Academic recognition.", "high"),
        rec("Hackathons", "Hands-on technical experience.", "high"),
    ]
    rec_internships = [
        rec("Summer Research Program", "Research experience for college applications.", "high"),
        rec("Local Internship", "Real-world exposure to intended industry.", "medium"),
    ]

    def timeline_item(month: str, actions: list[str], focus: str) -> dict:
        return {"month": month, "actions": actions, "focus": focus}

    t3 = [
        timeline_item("Month 1", ["Identify 2-3 target extracurriculars", "Start portfolio or project"], "Foundation"),
        timeline_item("Month 2", ["Apply to summer programs", "Join new club or activity"], "Expansion"),
        timeline_item("Month 3", ["Prepare for upcoming exams", "Document achievements"], "Consolidation"),
    ]
    t6 = t3 + [
        timeline_item("Month 4", ["Begin leadership role", "Submit competition entries"], "Leadership"),
        timeline_item("Month 5", ["Summer program prep", "Refine college list"], "Planning"),
        timeline_item("Month 6", ["Execute summer plan", "Build relationships with mentors"], "Execution"),
    ]
    t12 = t6 + [
        timeline_item("Month 7-9", ["College application prep", "Standardized test planning"], "Applications"),
        timeline_item("Month 10-12", ["Finalize applications", "Pursue senior-year leadership"], "Final Push"),
    ]

    college_estimates = []
    for c in (colleges or ["Reach School", "Target School", "Safety School"])[:5]:
        tier = "target" if "target" in c.lower() else ("safety" if "safety" in c.lower() else "reach")
        college_estimates.append({
            "name": c,
            "tier": tier,
            "notes": f"Continue building profile in {industry or 'intended field'}.",
            "improvementAreas": ["Strong extracurriculars", "Clear narrative"],
        })

    top_actions = [
        {"action": "Take on a leadership role", "impact": "High - differentiates profile", "priority": 1, "timeframe": "3 months"},
        {"action": "Complete a substantive project", "impact": "High - demonstrates initiative", "priority": 2, "timeframe": "6 months"},
        {"action": "Pursue 1-2 competitions", "impact": "Medium - adds recognition", "priority": 3, "timeframe": "6 months"},
    ]

    citations = [
        {"title": "College Admissions and Holistic Review", "source": "NACAC", "year": 2023, "excerpt": "Admissions consider academic and non-academic factors."},
        {"title": "Extracurricular Impact on Outcomes", "source": "Education Policy", "year": 2022, "excerpt": "Depth often matters more than breadth."},
    ]

    return {
        "studentSummary": student_summary,
        "strengthsAnalysis": strengths_analysis,
        "gapsAnalysis": gaps_analysis,
        "recommendedExtracurriculars": rec_extracurriculars,
        "recommendedProjects": rec_projects,
        "courseworkSuggestions": rec_coursework,
        "competitions": rec_competitions,
        "internshipsPrograms": rec_internships,
        "timeline3Month": t3,
        "timeline6Month": t6,
        "timeline12Month": t12,
        "collegeCompetitiveness": {
            "colleges": college_estimates,
            "summary": "Profile is developing. Focus on leadership and distinct projects to strengthen applications.",
        },
        "topActions": top_actions,
        "citations": citations,
    }


def main() -> None:
    raw = sys.stdin.read()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)
    result = analyze_profile(data)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
