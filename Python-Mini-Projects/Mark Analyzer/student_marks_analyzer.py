# ==========================================
# Project: Student Marks Analyzer
# A beginner-friendly console application
# ==========================================

# Step 1: Get the student's name from user input
student_name = input("Enter student name: ")

# Step 2: Get marks for 5 subjects in one line (space-separated)
marks_input = input("Enter marks for 5 subjects (separated by space): ")

# Step 3: Convert the input string into a list of integers
# .split() splits the string by spaces into individual string items
raw_marks = marks_input.split()

marks = []
for item in raw_marks:
    marks.append(int(item))

# Step 4: Calculate statistics using loops (manual calculation)
# Initialize tracking variables with the first element or starting counter
total_marks = 0
highest_mark = marks[0]
lowest_mark = marks[0]
passed_subjects = 0

# Loop through each mark in the list
for mark in marks:
    # Add mark to total
    total_marks = total_marks + mark

    # Update highest mark if current mark is greater
    if mark > highest_mark:
        highest_mark = mark

    # Update lowest mark if current mark is smaller
    if mark < lowest_mark:
        lowest_mark = mark

    # Count passed subjects (mark >= 40 is a pass)
    if mark >= 40:
        passed_subjects = passed_subjects + 1

# Step 5: Calculate average marks
average_marks = total_marks / len(marks)

# Step 6: Display the formatted result
print("\n----- STUDENT RESULT -----")
print(f"\nStudent: {student_name}")
print(f"Marks: {marks}")
print(f"\nTotal: {total_marks}")
print(f"Average: {average_marks}")
print(f"Highest: {highest_mark}")
print(f"Lowest: {lowest_mark}")
print(f"Passed subjects: {passed_subjects}")
print("\n--------------------------")
