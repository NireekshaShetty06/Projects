"""
Student Marks Analyzer - Web Application (Flask Backend)
Connects your Python analysis logic with a modern, interactive web interface.
"""

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def analyze_student_marks(name, marks_input):
    """
    Core Python calculation logic matching what was learned:
    Loops are used to compute total, highest, lowest, and passed subjects.
    """
    # Split input and convert to integers
    raw_marks = marks_input.replace(',', ' ').split()
    if not raw_marks:
        raise ValueError("Please enter marks for at least one subject.")

    marks = []
    for item in raw_marks:
        marks.append(int(item))

    # Initialize variables using loops as practiced
    total_marks = 0
    highest_mark = marks[0]
    lowest_mark = marks[0]
    passed_subjects = 0

    subject_details = []
    for index, mark in enumerate(marks, start=1):
        total_marks = total_marks + mark

        if mark > highest_mark:
            highest_mark = mark

        if mark < lowest_mark:
            lowest_mark = mark

        is_passed = mark >= 40
        if is_passed:
            passed_subjects = passed_subjects + 1

        subject_details.append({
            "subject": f"Subject {index}",
            "mark": mark,
            "passed": is_passed
        })

    total_subjects = len(marks)
    average_marks = round(total_marks / total_subjects, 2)

    # Determine performance grade/badge
    if average_marks >= 90:
        grade = "Outstanding (A+)"
        badge_color = "emerald"
    elif average_marks >= 75:
        grade = "Distinction (A)"
        badge_color = "blue"
    elif average_marks >= 60:
        grade = "First Class (B)"
        badge_color = "purple"
    elif average_marks >= 40:
        grade = "Pass Class (C)"
        badge_color = "amber"
    else:
        grade = "Needs Improvement (F)"
        badge_color = "rose"

    return {
        "student_name": name.strip() or "Student",
        "marks": marks,
        "total_marks": total_marks,
        "average_marks": average_marks,
        "highest_mark": highest_mark,
        "lowest_mark": lowest_mark,
        "passed_subjects": passed_subjects,
        "total_subjects": total_subjects,
        "all_passed": passed_subjects == total_subjects,
        "grade": grade,
        "badge_color": badge_color,
        "subject_details": subject_details
    }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json() or request.form
        student_name = data.get("name", "Student")
        marks_text = data.get("marks", "")

        result = analyze_student_marks(student_name, marks_text)
        return jsonify({"success": True, "result": result})
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Invalid marks entered. Please enter numbers separated by spaces."}), 400

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Student Marks Analyzer Web Server is running!")
    print("👉 Open your browser at: http://127.0.0.1:5000")
    print("=" * 50)
    app.run(debug=True, port=5000)
