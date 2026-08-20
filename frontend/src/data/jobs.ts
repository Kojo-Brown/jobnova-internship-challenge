import type { Job } from '../types'

const sharedResponsibilities = [
  'Collaborate and work closely with product management, engineering, sales, and research from design concept to design solution, setting UX guidelines and driving cross-team collaboration and sharing, as well as establish best practices for interaction models and user interface designs throughout the team.',
  'Work in a start-up style environment, where iteration is encouraged and design acumen is demonstrated through design end-to-end product ownership.',
  'Communicate complex, interactive design concepts clearly and persuasively across different audiences and varying levels of the organization through excellent communication, presentation, interpersonal and analytical skills.',
  'Earn trust with product managers to develop shared vision and use research and data to identify opportunities and inform decisions.',
]

const sharedBenefits = [
  { emoji: '🏠', title: 'Remote Flexibility', detail: 'Work from wherever you’re most productive and happy.' },
  { emoji: '📈', title: 'Equity Options', detail: 'Become a shareholder through our stock options plan after 6 months.' },
  { emoji: '🍱', title: 'Meal Vouchers', detail: 'Enjoy an €8/day meal voucher to make your lunch break even better.' },
  { emoji: '🍝', title: 'Lunch at the Office', detail: 'If you’re in Bologna, we have lunch together at the office, and it is on us!' },
  { emoji: '⚕️', title: 'Health Coverage', detail: 'Comprehensive private health insurance for you and your family.' },
  { emoji: '🎂', title: 'Birthday Bliss', detail: 'Celebrate your birthday with a paid day off.' },
  { emoji: '🧠', title: 'Mental Wellness', detail: 'Free access to professional counselling and wellbeing support.' },
  { emoji: '🌍', title: 'International Environment', detail: 'Grow your language skills while working with a diverse and global team.' },
]

export const jobs: Job[] = [
  {
    id: 'web-application-developer',
    title: 'Web Application Developer',
    company: {
      name: 'Backd Business Funding',
      logo: 'B',
      founded: 'Founded in 2018',
      location: 'Austin, Texas, US',
      size: '51-200 employees',
      website: 'https://backd.com',
      about:
        'Backd Business Funding provides fast, flexible working-capital solutions that help small businesses grow. Our engineering team builds the platform that powers instant funding decisions for thousands of companies.',
    },
    location: 'Austin, Texas Metropolitan Area',
    workMode: 'On-site',
    country: 'United States',
    employmentType: 'Full time',
    experience: '0 of 3 skills match',
    level: 'Mid Level',
    salary: '$65K/yr - $70K/yr',
    matchScore: 64,
    skillsMatchLabel: '0 of 3 skills match',
    postedAgo: '1 hours ago',
    applicants: 25,
    description:
      'We are looking for a Web Application Developer to build and maintain customer-facing funding tools. You will work across the stack with a focus on responsive, accessible front-end experiences, collaborating with product and design to ship features that make business funding effortless.',
    qualificationTags: ['JavaScript', 'HTML & CSS', 'React', 'REST APIs', 'SQL', 'Git', 'Agile', 'Testing'],
    required: [
      '2+ years of experience building web applications',
      'Solid grasp of JavaScript, HTML and CSS fundamentals',
      'Experience with a modern front-end framework such as React or Vue',
      'Comfortable consuming and designing REST APIs',
    ],
    preferred: [
      'Experience in fintech or another regulated industry',
      'Familiarity with TypeScript and automated testing',
    ],
    responsibilities: sharedResponsibilities,
    benefits: sharedBenefits,
    fit: {
      criteria: [
        { label: 'Education', score: 72 },
        { label: 'Work Exp', score: 61 },
        { label: 'Skills', score: 58 },
        { label: 'Exp. Level', score: 66 },
      ],
      notes: [
        {
          title: 'Relevant Experience',
          status: 'warn',
          detail:
            'Your background is adjacent to this role: you have shipped web applications, but the posting emphasises skills that are not yet on your profile. Highlighting transferable projects would strengthen your application.',
        },
        {
          title: 'Seniority',
          status: 'ok',
          detail: 'Your years of experience meet the mid-level seniority requirement for this position.',
        },
        {
          title: 'Education',
          status: 'warn',
          detail:
            'The role prefers a degree in Computer Science or a related field; consider emphasising practical experience and certifications in your application.',
        },
      ],
    },
  },
  {
    id: 'software-engineer-network-infrastructure',
    title: 'Software Engineer, Network Infrastructure',
    company: {
      name: 'Cursor AI',
      logo: 'C',
      founded: 'Founded in 2022',
      location: 'San Francisco, California, US',
      size: '201-500 employees',
      website: 'https://cursor.com',
      about:
        'Cursor builds the AI code editor trusted by millions of developers. Our infrastructure team keeps a global, low-latency network humming so AI-assisted coding feels instant everywhere in the world.',
    },
    location: 'Sunnyvale, CA',
    workMode: 'On-site',
    country: 'United States',
    employmentType: 'Full time',
    experience: '5+ years exp',
    level: 'Mid Level',
    salary: '$161K/yr - $239K/yr',
    matchScore: 93,
    postedAgo: '2 hours ago',
    applicants: 25,
    description:
      'Join the team that designs, builds and operates the network backbone behind our AI products. You will develop automation for provisioning, telemetry and failure remediation across data centers and edge locations, and partner with software teams to keep latency low and reliability high.',
    qualificationTags: ['Networking (TCP/IP)', 'Python', 'Go', 'Linux', 'BGP', 'Automation', 'Terraform', 'Monitoring'],
    required: [
      '5+ years of experience in network or infrastructure engineering',
      'Strong programming skills in Python or Go',
      'Deep understanding of TCP/IP, BGP and data-center network design',
      'Experience automating infrastructure at scale',
    ],
    preferred: [
      'Experience operating networks for latency-sensitive products',
      'Familiarity with SRE practices and observability tooling',
    ],
    responsibilities: sharedResponsibilities,
    benefits: sharedBenefits,
    fit: {
      criteria: [
        { label: 'Education', score: 93 },
        { label: 'Work Exp', score: 80 },
        { label: 'Skills', score: 93 },
        { label: 'Exp. Level', score: 44 },
      ],
      notes: [
        {
          title: 'Relevant Experience',
          status: 'ok',
          detail:
            'You have substantial experience as an infrastructure-minded engineer. Your recent work aligns with building and automating reliable systems relevant to this role.',
        },
        {
          title: 'Seniority',
          status: 'ok',
          detail:
            'You have amassed over eight years of relevant experience, meeting the mid-level seniority requirement for the role.',
        },
        {
          title: 'Education',
          status: 'warn',
          detail:
            'While you hold a Master’s degree, it doesn’t strictly align with the specified fields of Computer Science, Computer Engineering, or Information Science and Technology required by the job.',
        },
      ],
    },
  },
  {
    id: 'full-stack-software-engineer-web-developer',
    title: 'Full-Stack Software Engineer (Web Developer)',
    company: {
      name: 'Simons Foundation',
      logo: 'S',
      founded: 'Founded in 1994',
      location: 'New York, New York, US',
      size: '201-500 employees',
      website: 'https://simonsfoundation.org',
      about:
        'The Simons Foundation’s mission is to advance the frontiers of research in mathematics and the basic sciences. Our internal engineering group builds the digital tools that support world-class scientific collaboration.',
    },
    location: 'New York , NY',
    workMode: 'On-site',
    country: 'United States',
    employmentType: 'Full time',
    experience: '5+ years exp',
    level: 'Mid Level',
    salary: '$125K/yr - $140K/yr',
    matchScore: 82,
    postedAgo: '2 hours ago',
    applicants: 25,
    description:
      'We are seeking a Full-Stack Software Engineer to build web applications supporting scientific research programs. You will own features end-to-end — from data models and APIs to polished, accessible interfaces used by researchers around the world.',
    qualificationTags: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL', 'CI/CD', 'Docker', 'Accessibility'],
    required: [
      '5+ years of professional software engineering experience',
      'Proficiency with a modern front-end framework and Node.js',
      'Experience designing relational data models',
      'A track record of shipping accessible, well-tested interfaces',
    ],
    preferred: [
      'Experience in a research or scientific environment',
      'Familiarity with GraphQL and containerised deployments',
    ],
    responsibilities: sharedResponsibilities,
    benefits: sharedBenefits,
    fit: {
      criteria: [
        { label: 'Education', score: 88 },
        { label: 'Work Exp', score: 84 },
        { label: 'Skills', score: 86 },
        { label: 'Exp. Level', score: 70 },
      ],
      notes: [
        {
          title: 'Relevant Experience',
          status: 'ok',
          detail:
            'Your full-stack project history maps directly onto this position’s TypeScript/React/Node stack, including database design and CI/CD ownership.',
        },
        {
          title: 'Seniority',
          status: 'ok',
          detail: 'Your experience satisfies the 5+ years requirement for this mid-level role.',
        },
        {
          title: 'Education',
          status: 'ok',
          detail: 'Your degree aligns with the fields preferred by this position.',
        },
      ],
    },
  },
  {
    id: 'ux-designer',
    title: 'UX Designer',
    company: {
      name: 'Google',
      logo: 'G',
      founded: 'Founded in 1998',
      location: 'Mountain View, California, US',
      size: '10,001+ employees',
      website: 'https://google.com',
      about:
        'Google’s mission is to organise the world’s information and make it universally accessible and useful. Our design teams craft products used by billions of people, pairing rigorous research with delightful, inclusive experiences.',
    },
    location: 'Ann Arbor, MI',
    workMode: 'Remote',
    country: 'United States',
    employmentType: 'Internship',
    experience: '5+ years exp',
    level: 'Mid Level',
    salary: '$90K/yr - $130K/yr',
    matchScore: 93,
    postedAgo: '3 days ago',
    applicants: 27,
    description:
      'As a UX Designer, you will shape intuitive experiences from early concept through launch. You will partner with research, product management and engineering to turn ambiguous problems into elegant, validated design solutions that serve a global audience.',
    qualificationTags: [
      'Accidental Death and Dismemberment (AD&D)',
      'Amazon Web Services (AWS)',
      'Analysis Skills',
      'DevOps',
      'Apache ActiveMQ',
      'Application Programming Interface (API)',
      'Call Center',
      'Change Control',
    ],
    required: [
      '3+ years of design experience',
      '3+ years of delivering design solutions as a UX designer or interaction designer experience',
      'Have an available online portfolio',
      'Experience prototyping (HTML, XHTML, JavaScript, CSS, Flash or Flash Catalyst, or Axure)',
    ],
    preferred: [
      '2+ years of mass-market consumer web / mobile products experience',
      'Experience working in a collaborative team and working directly with developers for implementation of designs',
    ],
    responsibilities: sharedResponsibilities,
    benefits: sharedBenefits,
    fit: {
      criteria: [
        { label: 'Education', score: 93 },
        { label: 'Work Exp', score: 80 },
        { label: 'Skills', score: 93 },
        { label: 'Exp. Level', score: 44 },
      ],
      notes: [
        {
          title: 'Relevant Experience',
          status: 'ok',
          detail:
            'You have substantial experience as a UI/UX Designer, Interaction Designer, and User Research Specialist. Your role at Sohu aligns with designing interaction elements relevant to user experience design for digital products.',
        },
        {
          title: 'Seniority',
          status: 'ok',
          detail:
            'You have amassed over eight years of relevant experience, meeting the mid-level seniority requirement for the role.',
        },
        {
          title: 'Education',
          status: 'warn',
          detail:
            'While you hold a Master’s degree from Politecnico di Milano in Digital and Interaction Design, it doesn’t strictly align with the specified fields of Computer Science, Computer Engineering, or Information Science and Technology required by the job.',
        },
      ],
    },
  },
]

export function getJob(id: string): Job | undefined {
  return jobs.find((j) => j.id === id)
}
