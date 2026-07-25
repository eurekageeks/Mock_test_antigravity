from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.core.config import settings
from app.models.models import User, Topic, MockTest, Question, QuestionOption, StudentProfile

def seed_data(db: Session):
    # 1. Seed Admin User
    admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin_user:
        admin_user = User(
            name="Platform Admin",
            email=settings.ADMIN_EMAIL,
            mobile="9876543210",
            password_hash=get_password_hash(settings.ADMIN_PASSWORD),
            role="admin",
            status="approved"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"Admin user seeded with email: {settings.ADMIN_EMAIL}")
    else:
        print("Admin user already exists. Skipping.")

    # 2. Seed Topics
    topics_list = [
        ("Python", "Python programming language basics, data structures, and advanced features."),
        ("Java", "Java core concepts, OOPs, multi-threading, and collections framework."),
        ("AWS", "Amazon Web Services cloud practitioner and solutions architect services."),
        ("Docker", "Containerization concepts, Dockerfiles, volumes, and networks."),
        ("Kubernetes", "Container orchestration, pods, services, deployments, and configmaps."),
        ("DevOps", "CI/CD methodologies, pipeline integrations, and automation infrastructure."),
        ("Linux", "Linux shell scripting, administration commands, file permissions, and processes."),
        ("Networking", "TCP/IP layers, routing, switching, subnets, and DNS basics.")
    ]

    seeded_topics = {}
    for name, desc in topics_list:
        topic = db.query(Topic).filter(Topic.name == name).first()
        if not topic:
            topic = Topic(name=name, description=desc)
            db.add(topic)
            db.commit()
            db.refresh(topic)
            print(f"Topic seeded: {name}")
        else:
            print(f"Topic '{name}' already exists. Skipping.")
        seeded_topics[name] = topic

    # 3. Seed Sample Mock Test (Python Basics)
    python_topic = seeded_topics.get("Python")
    if python_topic:
        sample_test = db.query(MockTest).filter(MockTest.title == "Python Basics Assessment").first()
        if not sample_test:
            sample_test = MockTest(
                topic_id=python_topic.id,
                title="Python Basics Assessment",
                description="Test your baseline knowledge of Python variables, ranges, functions, and string handling.",
                duration_minutes=10,
                passing_marks=5.0,
                total_marks=10.0,
                instructions="1. The test consists of 5 questions (3 MCQs and 2 Text questions).\n2. Total duration is 10 minutes.\n3. The backend timer is active; the test will submit automatically when time runs out.\n4. You must score 5.0 or higher to pass.",
                status="published"
            )
            db.add(sample_test)
            db.commit()
            db.refresh(sample_test)
            print("Sample Mock Test seeded: Python Basics Assessment")

            # Add Question 1 (MCQ)
            q1 = Question(
                mock_test_id=sample_test.id,
                type="mcq",
                question_text="Which of the following is NOT a valid variable name in Python?",
                correct_answer="C",
                marks=2.0,
                explanation="Variables in Python can contain letters, numbers, and underscores, but cannot contain hyphens.",
                order_index=0
            )
            db.add(q1)
            db.commit()
            db.refresh(q1)

            q1_opts = [
                ("A", "my_var"),
                ("B", "_var"),
                ("C", "my-var"),
                ("D", "var_2")
            ]
            for key, val in q1_opts:
                opt = QuestionOption(question_id=q1.id, option_key=key, option_text=val)
                db.add(opt)
            db.commit()

            # Add Question 2 (MCQ)
            q2 = Question(
                mock_test_id=sample_test.id,
                type="mcq",
                question_text="What does the range(5) function generate?",
                correct_answer="B",
                marks=2.0,
                explanation="range(5) returns a sequence of numbers from 0 to 4 (5 numbers total).",
                order_index=1
            )
            db.add(q2)
            db.commit()
            db.refresh(q2)

            q2_opts = [
                ("A", "Numbers from 1 to 5"),
                ("B", "Numbers from 0 to 4"),
                ("C", "Numbers from 0 to 5"),
                ("D", "Numbers from 1 to 4")
            ]
            for key, val in q2_opts:
                opt = QuestionOption(question_id=q2.id, option_key=key, option_text=val)
                db.add(opt)
            db.commit()

            # Add Question 3 (MCQ)
            q3 = Question(
                mock_test_id=sample_test.id,
                type="mcq",
                question_text="Which keyword is used to define a function in Python?",
                correct_answer="A",
                marks=2.0,
                explanation="The 'def' keyword is used to define functions in Python.",
                order_index=2
            )
            db.add(q3)
            db.commit()
            db.refresh(q3)

            q3_opts = [
                ("A", "def"),
                ("B", "func"),
                ("C", "function"),
                ("D", "define")
            ]
            for key, val in q3_opts:
                opt = QuestionOption(question_id=q3.id, option_key=key, option_text=val)
                db.add(opt)
            db.commit()

            # Add Question 4 (Text)
            q4 = Question(
                mock_test_id=sample_test.id,
                type="text",
                question_text="What is the output of len('Python')?",
                correct_answer="6",
                marks=2.0,
                explanation="'Python' contains 6 characters.",
                order_index=3
            )
            db.add(q4)
            db.commit()

            # Add Question 5 (Text)
            q5 = Question(
                mock_test_id=sample_test.id,
                type="text",
                question_text="Write the keyword used to handle exceptions inside a try block in Python.",
                correct_answer="except",
                marks=2.0,
                explanation="The 'except' block is paired with 'try' to catch and process exceptions.",
                order_index=4
            )
            db.add(q5)
            db.commit()
            print("Questions for Python Basics Assessment seeded successfully.")
        else:
            print("Sample Mock Test already exists. Skipping.")
            
    print("Database seeding completed successfully.")
