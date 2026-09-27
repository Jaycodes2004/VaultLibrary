import { Book, UserProfile, BookHighlight, BookNote, BookRequest } from './types';

// Helper to parse "Book Title - Author Name" format
export function parseBookEntry(rawString: string, index: number): Book {
  const parts = rawString.split('-');
  const title = parts[0]?.trim() || `Volume ${index + 1}`;
  const author = parts.slice(1).join('-').trim() || 'Unknown Scholar';

  const categories = [
    'System Architecture',
    'Computer Science',
    'Software Craftsmanship',
    'Distributed Systems',
    'Philosophy & Ethics',
    'Economics & Society',
    'Literature & Sci-Fi',
    'Mathematics & AI',
  ];

  const category = categories[index % categories.length];

  const gradients = [
    'from-stone-800 via-stone-900 to-neutral-950',
    'from-amber-800 via-stone-800 to-zinc-900',
    'from-slate-800 via-zinc-900 to-neutral-950',
    'from-emerald-900 via-stone-900 to-slate-950',
    'from-rose-900 via-stone-900 to-neutral-950',
    'from-blue-900 via-slate-900 to-stone-950',
  ];

  const coverGradient = gradients[index % gradients.length];
  const totalPages = title.toLowerCase().includes('500 lines') ? 495 : (150 + ((index * 37) % 450));
  const coverImage = title.toLowerCase().includes('500 lines') ? '/covers/500-lines-or-less.png' : undefined;

  // Authentic 12 chapters for "500 Lines Or Less"
  if (title.toLowerCase().includes('500 lines')) {
    return {
      id: `bk-${String(index + 1).padStart(3, '0')}`,
      title,
      author,
      category,
      coverGradient,
      coverImage,
      totalPages: 495,
      requiredTier: 'standard',
      description: 'An authoritative work on system architecture featuring 12 practical, production-grade architectures implemented in 500 lines of code or less.',
      chapters: [
        {
          id: 'ch-01',
          title: 'Chapter 1: Introduction & Architecture Principles',
          pageNumber: 1,
          subsections: [
            { title: '1.1 The Philosophy of 500-Line Prototypes', pageNumber: 3 },
            { title: '1.2 Architecture Trade-offs in Small Codebases', pageNumber: 12 },
            { title: '1.3 Code Readability vs Optimization', pageNumber: 18 }
          ],
          paragraphs: [
            'What are the smallest programs that can still illuminate great architectural ideas? In 500 Lines or Less, experienced open source software designers explain how they solved hard problems by writing concise implementations.',
            'Software design is often taught by dissection of massive legacy systems. Yet studying a 100,000-line codebase obscures the fundamental architecture beneath layers of optimization and edge-case handling.',
            'By constraining each author to approximately 500 lines of executable code, the architectural choices become starkly visible. Every design decision carries consequence.',
            'In this volume, you will trace how real programs are born—from event-driven web engines and compilers to distributed storage fabrics and 3D modeling engines.'
          ]
        },
        {
          id: 'ch-02',
          title: 'Chapter 2: A Continuous Integration System',
          pageNumber: 24,
          subsections: [
            { title: '2.1 The Dispatcher and Worker Nodes', pageNumber: 28 },
            { title: '2.2 Test Runners and IPC Protocols', pageNumber: 39 },
            { title: '2.3 Failure Recovery & Pipeline Resilience', pageNumber: 52 }
          ],
          paragraphs: [
            'Modern software teams rely on Continuous Integration (CI) to prevent integration hell. But what happens under the hood when a commit triggers automated tests across multiple machines?',
            'In this chapter, Malini Das builds a fault-tolerant distributed CI system using Python. The architecture divides responsibilities between a central repository observer, a job dispatcher, and autonomous worker nodes.',
            'Communication occurs over light socket protocols. When a worker fails midway through a test run, the dispatcher senses heartbeat timeouts and seamlessly reallocates the pipeline.',
            'Understanding this minimal CI engine demystifies enterprise pipelines like Jenkins, GitHub Actions, and Buildkite.'
          ]
        },
        {
          id: 'ch-03',
          title: 'Chapter 3: An Event-Driven Web Framework',
          pageNumber: 68,
          subsections: [
            { title: '3.1 The Reactor Pattern & Non-blocking I/O', pageNumber: 72 },
            { title: '3.2 Coroutines and Event Loops', pageNumber: 85 },
            { title: '3.3 Routing, Middleware, and HTTP Chunks', pageNumber: 98 }
          ],
          paragraphs: [
            'Traditional thread-per-request web servers hit scalability barriers known as the C10K problem. Event-driven architectures replace heavy operating system threads with single-threaded cooperative event loops.',
            'Here we implement a complete non-blocking asynchronous web framework. Using Python generators and socket polling (epoll/kqueue), the engine handles thousands of concurrent HTTP connections on modest hardware.',
            'We deconstruct request parsing, asynchronous middleware pipelines, and chunked HTTP response streaming in fewer than 480 lines.',
            'The elegance of cooperative scheduling reveals why platforms like Node.js, Nginx, and Tornado achieve superior I/O throughput.'
          ]
        },
        {
          id: 'ch-04',
          title: 'Chapter 4: A Template Engine in 500 Lines',
          pageNumber: 112,
          subsections: [
            { title: '4.1 Compiling Template Syntax to Python Code', pageNumber: 116 },
            { title: '4.2 Context Dictionaries & Expression Evaluation', pageNumber: 128 },
            { title: '4.3 Sandboxing and XSS Escaping', pageNumber: 139 }
          ],
          paragraphs: [
            'Web template engines like Jinja2, Django Templates, and Mustache translate markup filled with loops and variables into finished HTML. Many developers assume this requires complex parsing interpreters.',
            'Ned Batchelder demonstrates that compiling template syntax directly into native Python bytecode results in stunning speed and minuscule code volume.',
            'By converting template tags into Python expressions and leveraging Python eval/exec with restricted globals, the engine processes templates hundreds of times faster than recursive interpreters.',
            'We also address essential security concepts: automatic HTML escaping to prevent Cross-Site Scripting (XSS) and execution sandboxing.'
          ]
        },
        {
          id: 'ch-05',
          title: 'Chapter 5: A Flow Shop Job Scheduler',
          pageNumber: 156,
          subsections: [
            { title: '5.1 Combinatorial Optimization & Branch-and-Bound', pageNumber: 161 },
            { title: '5.2 Heuristic Approximations & Makespan Minimization', pageNumber: 174 }
          ],
          paragraphs: [
            'Scheduling jobs across multi-stage assembly lines is an NP-hard problem encountered everywhere from manufacturing plants to CPU pipeline dispatchers.',
            'This chapter explores how branch-and-bound algorithms paired with heuristic pruning solve the flow shop scheduling problem with provable efficiency.',
            'We visualize schedule matrices, compute idle times across machine queues, and demonstrate how intelligent bounding functions eliminate billions of suboptimal schedules.'
          ]
        },
        {
          id: 'ch-06',
          title: 'Chapter 6: A Bytecode Machine & Python Interpreter',
          pageNumber: 198,
          subsections: [
            { title: '6.1 The Virtual Machine Architecture', pageNumber: 204 },
            { title: '6.2 Stack Frames, Function Calls, and Scopes', pageNumber: 218 },
            { title: '6.3 Bytecode Instruction Dispatch Loop', pageNumber: 230 }
          ],
          paragraphs: [
            'How does Python execute your source code? Allison Kaptur takes us into the core of CPython by building Byterun—a pure Python implementation of the Python bytecode interpreter.',
            'A virtual machine simulates a physical CPU. It maintains an instruction pointer, evaluation stack, call stack frames, and block stack for exceptions.',
            'By understanding how opcodes like LOAD_FAST, BINARY_ADD, and RETURN_VALUE manipulate the evaluation stack, you gain profound insight into how all modern virtual machines (including the JVM and V8) function.'
          ]
        },
        {
          id: 'ch-07',
          title: 'Chapter 7: Same-Origin Policy & Web Security',
          pageNumber: 242,
          subsections: [
            { title: '7.1 The Browser Security Model', pageNumber: 248 },
            { title: '7.2 CORS Preflight and Header Handshakes', pageNumber: 260 }
          ],
          paragraphs: [
            'The browser is arguably the most hostile execution environment on earth. It runs untrusted JavaScript while safeguarding banking credentials and session cookies.',
            'This chapter constructs a miniature browser sandbox enforcing the Same-Origin Policy, demonstrating how origin checks protect against cross-site data theft while enabling controlled Cross-Origin Resource Sharing (CORS).'
          ]
        },
        {
          id: 'ch-08',
          title: 'Chapter 8: A 3D Modeler in Python',
          pageNumber: 288,
          subsections: [
            { title: '8.1 Scene Graphs and Geometric Transforms', pageNumber: 294 },
            { title: '8.2 Ray Casting and Polygon Picking', pageNumber: 310 }
          ],
          paragraphs: [
            'Creating interactive 3D graphics does not necessitate bloated software suites. In under 500 lines, Erick Dransch crafts a 3D modeler with OpenGL rendering, scene node hierarchies, and mouse-based ray casting for object picking.',
            'Matrix transformations (translation, rotation, scale) are applied hierarchically across scene graph nodes, proving that linear algebra is the beating heart of computer graphics.'
          ]
        },
        {
          id: 'ch-09',
          title: 'Chapter 9: A High-Performance Web Server',
          pageNumber: 334,
          subsections: [
            { title: '9.1 Socket Programming and TCP Buffering', pageNumber: 340 },
            { title: '9.2 HTTP 1.1 Keep-Alive and Pipelining', pageNumber: 355 }
          ],
          paragraphs: [
            'Web servers are the unsung conduits of modern civilization. In this chapter, we inspect the TCP handshake, persistent HTTP/1.1 connections, MIME type resolution, and static asset streaming.',
            'The minimal web server handles concurrent client streams cleanly while maintaining strict error handling and security against directory traversal attacks.'
          ]
        },
        {
          id: 'ch-10',
          title: 'Chapter 10: Optical Character Recognition (OCR)',
          pageNumber: 378,
          subsections: [
            { title: '10.1 Image Binarization & Noise Reduction', pageNumber: 384 },
            { title: '10.2 Feature Extraction & Neural Classification', pageNumber: 398 }
          ],
          paragraphs: [
            'Transforming pixel arrays into machine-readable text is a classic problem in machine vision. Marina Samuel builds an artificial neural network trained to recognize handwritten digits.',
            'From Gaussian smoothing and threshold binarization to feed-forward propagation and gradient descent backpropagation, the entire pipeline is transparently coded without external deep learning libraries.'
          ]
        },
        {
          id: 'ch-11',
          title: 'Chapter 11: P2P Distributed Storage Network',
          pageNumber: 420,
          subsections: [
            { title: '11.1 Distributed Hash Tables (DHT) & Kademlia', pageNumber: 426 },
            { title: '11.2 Cryptographic Content Addressing', pageNumber: 438 }
          ],
          paragraphs: [
            'Peer-to-peer systems allow decentralized networks to store and retrieve data without relying on central server authorities. Using XOR distance metric metrics inspired by Kademlia, we implement a resilient distributed hash table.',
            'Nodes publish chunks keyed by their SHA-256 digests, and routing tables locate target nodes in logarithmic hops.'
          ]
        },
        {
          id: 'ch-12',
          title: 'Chapter 12: Micro-Database Engine',
          pageNumber: 466,
          subsections: [
            { title: '12.1 B-Tree Indexing and Page Serialization', pageNumber: 472 },
            { title: '12.2 Write-Ahead Logging & ACID Guarantees', pageNumber: 485 }
          ],
          paragraphs: [
            'Relational databases look like black boxes until you build one. This concluding chapter constructs an in-memory B-Tree indexed storage engine with a write-ahead log (WAL) for crash recovery.',
            'We observe how disk page allocation, binary search over index nodes, and atomic commit semantics combine to uphold the ACID guarantees that modern enterprise depends upon.'
          ]
        }
      ]
    };
  }

  // Generic parsed books with 6 structured chapters and computed starting pages
  const chapterCount = 6;
  const pageStep = Math.max(15, Math.floor(totalPages / chapterCount));

  return {
    id: `bk-${String(index + 1).padStart(3, '0')}`,
    title,
    author,
    category,
    coverGradient,
    coverImage,
    totalPages,
    requiredTier: index % 7 === 0 ? 'full' : 'standard',
    description: `An authoritative work on ${category.toLowerCase()} exploring foundational paradigms, historical lessons, and practical architectures.`,
    chapters: Array.from({ length: chapterCount }).map((_, cIdx) => {
      const startPage = 1 + cIdx * pageStep;
      return {
        id: `ch-${String(cIdx + 1).padStart(2, '0')}`,
        title: `Chapter ${cIdx + 1}: ${
          cIdx === 0
            ? `The Foundations of ${title.split(' ')[0]}`
            : cIdx === 1
            ? 'Core Architectural Abstractions'
            : cIdx === 2
            ? 'Implementation Patterns & Edge Cases'
            : cIdx === 3
            ? 'Scalability & Performance Benchmarks'
            : cIdx === 4
            ? 'Resilience, Fault Tolerance & Security'
            : 'Synthesis, Real-world Case Studies & Future Horizon'
        }`,
        pageNumber: startPage,
        subsections: [
          { title: `${cIdx + 1}.1 Theoretical Baseline`, pageNumber: startPage + 2 },
          { title: `${cIdx + 1}.2 Architecture Trade-offs`, pageNumber: startPage + Math.floor(pageStep / 2) }
        ],
        paragraphs: [
          `In Chapter ${cIdx + 1}, ${author} investigates the primary tenets of ${category.toLowerCase()} with rigorous structural inquiry. What begins as a theoretical investigation gradually unfolds into a practical engineering framework.`,
          `Consider how design constraints shape internal abstractions. Simplicity is not the absence of complexity, but rather the triumph of coherent organization over incidental clutter.`,
          `When analyzing production architectures, boundaries must be rigorously defined and state transitions made explicit to minimize distributed failure modes.`,
          `By examining these case studies, the reader acquires durable mental models that outlive transient technologies and short-lived frameworks.`
        ]
      };
    })
  };
}

// 150 Curated Books using user's exact "Title - Author" format
const RAW_150_BOOKS = [
  "500 Lines Or Less - Michael DiBernardo",
  "The Architecture of Open Source Applications - Amy Brown & Greg Wilson",
  "Designing Data-Intensive Applications - Martin Kleppmann",
  "Structure and Interpretation of Computer Programs - Harold Abelson & Gerald Jay Sussman",
  "Clean Code - Robert C. Martin",
  "The Pragmatic Programmer - David Thomas & Andrew Hunt",
  "Refactoring - Martin Fowler",
  "Introduction to Algorithms - Thomas H. Cormen",
  "Operating Systems: Three Easy Pieces - Remzi H. Arpaci-Dusseau",
  "Computer Networking: A Top-Down Approach - James F. Kurose",
  "Site Reliability Engineering - Betsy Beyer",
  "Building Microservices - Sam Newman",
  "Database Internals - Alex Petrov",
  "Domain-Driven Design - Eric Evans",
  "Modern Operating Systems - Andrew S. Tanenbaum",
  "Design Patterns: Elements of Reusable Object-Oriented Software - Erich Gamma",
  "The Mythical Man-Month - Frederick P. Brooks Jr.",
  "Computer Systems: A Programmer's Perspective - Randal E. Bryant",
  "Algorithms - Robert Sedgewick & Kevin Wayne",
  "Types and Programming Languages - Benjamin C. Pierce",
  "Code Complete - Steve McConnell",
  "Working Effectively with Legacy Code - Michael Feathers",
  "Enterprise Integration Patterns - Gregor Hohpe",
  "Patterns of Enterprise Application Architecture - Martin Fowler",
  "High Performance Browser Networking - Ilya Grigorik",
  "C Programming Language - Brian W. Kernighan & Dennis M. Ritchie",
  "Programming Pearls - Jon Bentley",
  "The Art of Computer Programming: Fundamental Algorithms - Donald E. Knuth",
  "The Art of Computer Programming: Seminumerical Algorithms - Donald E. Knuth",
  "The Art of Computer Programming: Sorting and Searching - Donald E. Knuth",
  "Compilers: Principles, Techniques, and Tools - Alfred V. Aho",
  "Artificial Intelligence: A Modern Approach - Stuart Russell & Peter Norvig",
  "Deep Learning - Ian Goodfellow, Yoshua Bengio & Aaron Courville",
  "Reinforcement Learning: An Introduction - Richard S. Sutton",
  "Pattern Recognition and Machine Learning - Christopher M. Bishop",
  "Foundations of Statistical Natural Language Processing - Christopher D. Manning",
  "Speech and Language Processing - Daniel Jurafsky & James H. Martin",
  "Understanding Machine Learning: From Theory to Algorithms - Shai Shalev-Shwartz",
  "Data Science from Scratch - Joel Grus",
  "Python Cookbook - David Beazley & Brian K. Jones",
  "Fluent Python - Luciano Ramalho",
  "Effective Java - Joshua Bloch",
  "Java Concurrency in Practice - Brian Goetz",
  "The Rust Programming Language - Steve Klabnik & Carol Nichols",
  "Programming Rust - Jim Blandy & Jason Orendorff",
  "Programming in Lua - Roberto Ierusalimschy",
  "Real World Haskell - Bryan O'Sullivan",
  "Learn You a Haskell for Great Good! - Miran Lipovača",
  "Seven Languages in Seven Weeks - Bruce A. Tate",
  "Concepts, Techniques, and Models of Computer Programming - Peter Van Roy",
  "Purely Functional Data Structures - Chris Okasaki",
  "The Linux Programming Interface - Michael Kerrisk",
  "Advanced Programming in the UNIX Environment - W. Richard Stevens",
  "UNIX Network Programming - W. Richard Stevens",
  "TCP/IP Illustrated: The Protocols - W. Richard Stevens",
  "Linux Kernel Development - Robert Love",
  "Understanding the Linux Kernel - Daniel P. Bovet & Marco Cesati",
  "Computer Architecture: A Quantitative Approach - John L. Hennessy & David A. Patterson",
  "Computer Organization and Design - David A. Patterson & John L. Hennessy",
  "Digital Design and Computer Architecture - David Harris & Sarah Harris",
  "Cryptography Engineering - Niels Ferguson & Bruce Schneier",
  "Applied Cryptography - Bruce Schneier",
  "Practical Cryptography - Niels Ferguson & Bruce Schneier",
  "Security Engineering - Ross J. Anderson",
  "Hacking: The Art of Exploitation - Jon Erickson",
  "The Web Application Hacker's Handbook - Dafydd Stuttard & Marcus Pinto",
  "Network Security Essentials - William Stallings",
  "Information Theory, Inference, and Learning Algorithms - David J. C. MacKay",
  "Elements of Information Theory - Thomas M. Cover & Joy A. Thomas",
  "Calculus - Michael Spivak",
  "Linear Algebra Done Right - Sheldon Axler",
  "Abstract Algebra - David S. Dummit & Richard M. Foote",
  "Topology - James Munkres",
  "Principles of Mathematical Analysis - Walter Rudin",
  "Real and Complex Analysis - Walter Rudin",
  "Measure, Integration & Real Analysis - Sheldon Axler",
  "Concrete Mathematics - Ronald L. Graham, Donald E. Knuth & Oren Patashnik",
  "Introduction to Graph Theory - Douglas B. West",
  "Probabilistic Graphical Models - Daphne Koller & Nir Friedman",
  "Convex Optimization - Stephen Boyd & Lieven Vandenberghe",
  "Numerical Optimization - Jorge Nocedal & Stephen J. Wright",
  "Quantum Computation and Quantum Information - Michael A. Nielsen & Isaac L. Chuang",
  "The Feynman Lectures on Physics: Volume 1 - Richard P. Feynman",
  "The Feynman Lectures on Physics: Volume 2 - Richard P. Feynman",
  "The Feynman Lectures on Physics: Volume 3 - Richard P. Feynman",
  "Spacetime and Geometry - Sean M. Carroll",
  "Gravitation - Charles W. Misner, Kip S. Thorne & John Archibald Wheeler",
  "Cosmology - Steven Weinberg",
  "Quantum Field Theory for the Gifted Amateur - Tom Lancaster & Stephen J. Blundell",
  "The Road to Reality - Roger Penrose",
  "Gödel, Escher, Bach: An Eternal Golden Braid - Douglas R. Hofstadter",
  "I Am a Strange Loop - Douglas R. Hofstadter",
  "Thinking, Fast and Slow - Daniel Kahneman",
  "Nudge: Improving Decisions About Health, Wealth, and Happiness - Richard H. Thaler",
  "Misbehaving: The Making of Behavioral Economics - Richard H. Thaler",
  "The Black Swan - Nassim Nicholas Taleb",
  "Antifragile: Things That Gain from Disorder - Nassim Nicholas Taleb",
  "Fooled by Randomness - Nassim Nicholas Taleb",
  "Skin in the Game - Nassim Nicholas Taleb",
  "Superforecasting: The Art and Science of Prediction - Philip E. Tetlock",
  "Noise: A Flaw in Human Judgment - Daniel Kahneman, Olivier Sibony & Cass R. Sunstein",
  "Predictably Irrational - Dan Ariely",
  "Man's Search for Meaning - Viktor E. Frankl",
  "Meditations - Marcus Aurelius",
  "Letters from a Stoic - Seneca",
  "Discourses and Selected Writings - Epictetus",
  "Nicomachean Ethics - Aristotle",
  "The Republic - Plato",
  "Beyond Good and Evil - Friedrich Nietzsche",
  "Thus Spoke Zarathustra - Friedrich Nietzsche",
  "Critique of Pure Reason - Immanuel Kant",
  "Being and Time - Martin Heidegger",
  "Tractatus Logico-Philosophicus - Ludwig Wittgenstein",
  "Philosophical Investigations - Ludwig Wittgenstein",
  "The Structure of Scientific Revolutions - Thomas S. Kuhn",
  "The Selfish Gene - Richard Dawkins",
  "The Blind Watchmaker - Richard Dawkins",
  "Guns, Germs, and Steel - Jared Diamond",
  "Sapiens: A Brief History of Humankind - Yuval Noah Harari",
  "Homo Deus: A Brief History of Tomorrow - Yuval Noah Harari",
  "Dune - Frank Herbert",
  "Dune Messiah - Frank Herbert",
  "Children of Dune - Frank Herbert",
  "Foundation - Isaac Asimov",
  "Foundation and Empire - Isaac Asimov",
  "Second Foundation - Isaac Asimov",
  "Neuromancer - William Gibson",
  "Count Zero - William Gibson",
  "Mona Lisa Overdrive - William Gibson",
  "Snow Crash - Neal Stephenson",
  "The Diamond Age - Neal Stephenson",
  "Cryptonomicon - Neal Stephenson",
  "Anathem - Neal Stephenson",
  "Hyperion - Dan Simmons",
  "The Fall of Hyperion - Dan Simmons",
  "Solaris - Stanisław Lem",
  "The Cyberiad - Stanisław Lem",
  "Fiasco - Stanisław Lem",
  "Do Androids Dream of Electric Sheep? - Philip K. Dick",
  "Ubik - Philip K. Dick",
  "A Scanner Darkly - Philip K. Dick",
  "Brave New World - Aldous Huxley",
  "1984 - George Orwell",
  "Fahrenheit 451 - Ray Bradbury",
  "The Left Hand of Darkness - Ursula K. Le Guin",
  "The Dispossessed - Ursula K. Le Guin",
  "Earthsea: A Wizard of Earthsea - Ursula K. Le Guin",
  "Permutation City - Greg Egan",
  "Diaspora - Greg Egan",
  "Blindsight - Peter Watts"
];

// Generate 150 books
export const INITIAL_BOOKS: Book[] = RAW_150_BOOKS.map((raw, idx) => parseBookEntry(raw, idx));

export const INITIAL_USER: UserProfile = {
  userId: 'usr_8820491',
  name: 'Marcus Holloway',
  email: 'marcus.h@readvault.internal',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  accessTier: 'full',
  lastBookReadId: 'bk-001',
  lastReadTitle: '500 Lines Or Less',
  lastReadLocation: 'ch-01:p-1',
  lastReadProgress: 35,
  lastReadTimestamp: new Date().toISOString(),
  booksAccessed: [
    {
      bookId: 'bk-001',
      title: '500 Lines Or Less',
      coverUrl: '',
      lastAccessed: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      locationCfi: 'ch-01:p-1',
      chapterTitle: 'Chapter 1: The Foundations of 500 Lines',
      progressPercentage: 35,
    },
    {
      bookId: 'bk-002',
      title: 'The Architecture of Open Source Applications',
      coverUrl: '',
      lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      locationCfi: 'ch-01:p-0',
      chapterTitle: 'Chapter 1: The Foundations of Architecture',
      progressPercentage: 20,
    }
  ]
};

// Registered Users List for Admin Portal Management
export const INITIAL_USERS_LIST: UserProfile[] = [
  INITIAL_USER,
  {
    userId: 'usr_1049281',
    name: 'Eleanor Vance',
    email: 'eleanor.v@library.net',
    accessTier: 'standard',
    lastBookReadId: 'bk-003',
    lastReadTitle: 'Designing Data-Intensive Applications',
    lastReadLocation: 'ch-02:p-1',
    lastReadProgress: 52,
    lastReadTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    booksAccessed: [
      {
        bookId: 'bk-003',
        title: 'Designing Data-Intensive Applications',
        coverUrl: '',
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        locationCfi: 'ch-02:p-1',
        chapterTitle: 'Chapter 2: Structural Patterns',
        progressPercentage: 52,
      }
    ]
  },
  {
    userId: 'usr_2910482',
    name: 'Julian Thorne',
    email: 'j.thorne@cambridge.ac.uk',
    accessTier: 'restricted',
    lastBookReadId: 'bk-008',
    lastReadTitle: 'Introduction to Algorithms',
    lastReadLocation: 'ch-01:p-3',
    lastReadProgress: 14,
    lastReadTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    booksAccessed: []
  },
  {
    userId: 'usr_8391024',
    name: 'Clara Oswald',
    email: 'clara.o@archive.org',
    accessTier: 'suspended',
    lastBookReadId: undefined,
    lastReadTitle: undefined,
    lastReadLocation: undefined,
    lastReadProgress: 0,
    lastReadTimestamp: undefined,
    booksAccessed: []
  }
];

// Initial Book Requests for User Request Page & Admin Inspection
export const INITIAL_BOOK_REQUESTS: BookRequest[] = [
  {
    id: 'req-001',
    userId: 'usr_8820491',
    userName: 'Marcus Holloway',
    userEmail: 'marcus.h@readvault.internal',
    title: 'The Design of Web APIs',
    author: 'Arnaud Lauret',
    notes: 'Required for API security research in Q3.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'req-002',
    userId: 'usr_1049281',
    userName: 'Eleanor Vance',
    userEmail: 'eleanor.v@library.net',
    title: 'Distributed Systems: Principles and Paradigms',
    author: 'Andrew S. Tanenbaum',
    notes: 'Checking if this volume can be fetched into our catalog.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: 'req-003',
    userId: 'usr_8820491',
    userName: 'Marcus Holloway',
    userEmail: 'marcus.h@readvault.internal',
    title: 'Ancient Greek Philosophy: A Comprehensive Treatise',
    author: 'Theodore Zeller',
    notes: 'Classic archival text.',
    status: 'approved',
    adminFeedbackMessage: 'Volume located in storage path and approved for public library access.',
    evaluatedPath: 'D:\\Archive\\Storage\\Encrypted_Vault\\Ancient_Greek_Philosophy.epub.enc',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  }
];

// Admin Library Fetch Path & Files Catalog
export const DEFAULT_FETCH_STORAGE_PATH = 'D:\\Archive\\Storage\\Encrypted_Vault';

export interface StorageArchiveFile {
  fileName: string;
  bookTitle: string;
  author: string;
  isAllowedForUsers: boolean;
  fileSizeBytes: string;
}

export const PHYSICAL_STORAGE_FILES: StorageArchiveFile[] = [
  {
    fileName: '500_Lines_Or_Less.epub.enc',
    bookTitle: '500 Lines Or Less',
    author: 'Michael DiBernardo',
    isAllowedForUsers: true,
    fileSizeBytes: '4.2 MB',
  },
  {
    fileName: 'Distributed_Systems_Principles.epub.enc',
    bookTitle: 'Distributed Systems: Principles and Paradigms',
    author: 'Andrew S. Tanenbaum',
    isAllowedForUsers: false, // In path, but admin policy has NOT allowed users to access!
    fileSizeBytes: '12.8 MB',
  },
  {
    fileName: 'Designing_Data_Intensive_Apps.epub.enc',
    bookTitle: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isAllowedForUsers: true,
    fileSizeBytes: '8.4 MB',
  },
  {
    fileName: 'Advanced_Operating_Systems_Confidential.epub.enc',
    bookTitle: 'Advanced Kernel Internals (Internal Only)',
    author: 'Classified Research Group',
    isAllowedForUsers: false,
    fileSizeBytes: '15.1 MB',
  }
];

export const INITIAL_HIGHLIGHTS: BookHighlight[] = [
  {
    id: 'hl-1',
    bookId: 'bk-001',
    chapter: 'ch-01',
    paragraphIndex: 1,
    text: 'Simplicity is not the absence of complexity, but rather the triumph of coherent organization over incidental clutter.',
    color: 'amber',
    timestamp: new Date().toISOString(),
    note: 'Core thesis of architectural elegance in under 500 lines.'
  }
];

export const INITIAL_NOTES: BookNote[] = [
  {
    id: 'note-1',
    bookId: 'bk-001',
    chapter: 'ch-01',
    text: 'Note on 500 Lines Or Less: Every micro-system in this volume demonstrates an entire architectural idiom.',
    audioGenerated: true,
    timestamp: new Date().toISOString()
  }
];
