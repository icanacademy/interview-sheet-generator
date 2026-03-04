const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const os = require('os');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = 1120;

// Initialize SQLite database
const dbPath = path.join(__dirname, 'interviews.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name TEXT NOT NULL,
        student_id TEXT NOT NULL,
        interview_type TEXT NOT NULL,
        date TEXT NOT NULL,
        interviewer TEXT,
        grade TEXT,
        gender TEXT,
        age TEXT,
        questions TEXT,
        scores_text TEXT,
        pronunciation REAL,
        fluency REAL,
        comprehension REAL,
        insight REAL,
        vocab REAL,
        knowledge_level REAL,
        persuasion_text TEXT,
        report_text TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_name, student_id, interview_type, date)
    )
`);

// Career recommendations table
db.exec(`
    CREATE TABLE IF NOT EXISTS career_recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name TEXT NOT NULL,
        student_id TEXT NOT NULL,
        data_source TEXT NOT NULL,
        dimensions TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        ai_analysis TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_name, student_id)
    )
`);

console.log(`✓ Database initialized at: ${dbPath}`);

// ═══════════════════════════════════════════════════
// CAREER CATALOG & MATCHING ENGINE
// ═══════════════════════════════════════════════════

const CAREER_CATALOG = [
    // Language & Communication (4)
    {
        title: 'AI Linguistics Engineer',
        field: 'Language & Communication',
        emergingBy: '2028',
        skills: ['NLP', 'Multilingual AI', 'Semantic Analysis', 'Prompt Engineering'],
        idealDimensions: { CS: 90, AD: 70, LM: 95, PP: 50, CE: 60, CT: 75 },
        dimensionWeights: { CS: 3, AD: 2, LM: 3, PP: 1, CE: 1, CT: 2 },
        fitReasons: {
            CS: 'Clear communication essential for training language models',
            LM: 'Deep language mastery drives NLP system quality',
            CT: 'Critical evaluation of AI outputs requires analytical rigor'
        }
    },
    {
        title: 'Global Communications Strategist',
        field: 'Language & Communication',
        emergingBy: '2026',
        skills: ['Cross-cultural Communication', 'Media Strategy', 'Public Relations', 'Digital Storytelling'],
        idealDimensions: { CS: 95, AD: 60, LM: 85, PP: 90, CE: 75, CT: 65 },
        dimensionWeights: { CS: 3, AD: 1, LM: 2, PP: 3, CE: 2, CT: 1 },
        fitReasons: {
            CS: 'Exceptional communication skills drive global messaging',
            PP: 'Persuasive power essential for influencing diverse audiences',
            CE: 'Creative storytelling amplifies brand narratives'
        }
    },
    {
        title: 'Simultaneous AI Interpreter',
        field: 'Language & Communication',
        emergingBy: '2027',
        skills: ['Real-time Translation', 'Cultural Mediation', 'AI-Assisted Interpretation', 'Diplomatic Protocol'],
        idealDimensions: { CS: 90, AD: 75, LM: 95, PP: 60, CE: 50, CT: 70 },
        dimensionWeights: { CS: 3, AD: 2, LM: 3, PP: 1, CE: 1, CT: 2 },
        fitReasons: {
            CS: 'Flawless pronunciation and fluency enable real-time interpretation',
            LM: 'Mastery of multiple language registers is fundamental',
            AD: 'Quick comprehension of complex ideas under pressure'
        }
    },
    {
        title: 'Content Localization Director',
        field: 'Language & Communication',
        emergingBy: '2026',
        skills: ['Transcreation', 'Market Adaptation', 'Cultural Intelligence', 'Project Management'],
        idealDimensions: { CS: 80, AD: 65, LM: 90, PP: 70, CE: 85, CT: 60 },
        dimensionWeights: { CS: 2, AD: 1, LM: 3, PP: 2, CE: 3, CT: 1 },
        fitReasons: {
            LM: 'Language expertise ensures authentic localization',
            CE: 'Creative adaptation makes content resonate across cultures',
            PP: 'Persuasive writing maintains impact in translated content'
        }
    },
    // STEM & Technical (6)
    {
        title: 'Quantum Computing Researcher',
        field: 'STEM & Technical',
        emergingBy: '2030',
        skills: ['Quantum Algorithms', 'Linear Algebra', 'Physics Modeling', 'Technical Writing'],
        idealDimensions: { CS: 65, AD: 95, LM: 70, PP: 40, CE: 50, CT: 95 },
        dimensionWeights: { CS: 1, AD: 3, LM: 1, PP: 1, CE: 1, CT: 3 },
        fitReasons: {
            AD: 'Deep analytical thinking essential for quantum problem-solving',
            CT: 'Rigorous critical thinking drives research breakthroughs',
            CS: 'Ability to communicate complex findings to diverse audiences'
        }
    },
    {
        title: 'Biotech Data Scientist',
        field: 'STEM & Technical',
        emergingBy: '2027',
        skills: ['Bioinformatics', 'Machine Learning', 'Genomic Analysis', 'Statistical Modeling'],
        idealDimensions: { CS: 70, AD: 90, LM: 65, PP: 45, CE: 55, CT: 90 },
        dimensionWeights: { CS: 1, AD: 3, LM: 1, PP: 1, CE: 1, CT: 3 },
        fitReasons: {
            AD: 'Analytical depth critical for interpreting complex biological data',
            CT: 'Evidence-based reasoning drives reliable research conclusions',
            CS: 'Clear communication of findings to interdisciplinary teams'
        }
    },
    {
        title: 'Cybersecurity Architect',
        field: 'STEM & Technical',
        emergingBy: '2026',
        skills: ['Threat Modeling', 'Zero-Trust Architecture', 'Cryptography', 'Incident Response'],
        idealDimensions: { CS: 70, AD: 85, LM: 60, PP: 55, CE: 45, CT: 95 },
        dimensionWeights: { CS: 1, AD: 3, LM: 1, PP: 1, CE: 1, CT: 3 },
        fitReasons: {
            CT: 'Critical thinking essential for anticipating security threats',
            AD: 'Deep analysis required for vulnerability assessment',
            CS: 'Clear communication of risks to stakeholders'
        }
    },
    {
        title: 'Sustainable Energy Engineer',
        field: 'STEM & Technical',
        emergingBy: '2027',
        skills: ['Renewable Systems', 'Grid Optimization', 'Environmental Modeling', 'Project Engineering'],
        idealDimensions: { CS: 65, AD: 85, LM: 55, PP: 60, CE: 65, CT: 80 },
        dimensionWeights: { CS: 1, AD: 3, LM: 1, PP: 1, CE: 2, CT: 2 },
        fitReasons: {
            AD: 'Analytical skills for complex energy system optimization',
            CT: 'Evidence-based problem solving for sustainability challenges',
            CE: 'Creative approaches to novel engineering problems'
        }
    },
    {
        title: 'Robotics Integration Specialist',
        field: 'STEM & Technical',
        emergingBy: '2028',
        skills: ['Robot Programming', 'Human-Robot Interaction', 'Systems Integration', 'Sensor Fusion'],
        idealDimensions: { CS: 70, AD: 80, LM: 60, PP: 50, CE: 70, CT: 85 },
        dimensionWeights: { CS: 2, AD: 2, LM: 1, PP: 1, CE: 2, CT: 3 },
        fitReasons: {
            CT: 'Critical thinking for troubleshooting complex robotic systems',
            AD: 'Analytical approach to human-robot interaction design',
            CE: 'Creative solutions for novel integration challenges'
        }
    },
    {
        title: 'Space Systems Analyst',
        field: 'STEM & Technical',
        emergingBy: '2030',
        skills: ['Orbital Mechanics', 'Mission Planning', 'Remote Sensing', 'Data Analytics'],
        idealDimensions: { CS: 70, AD: 90, LM: 65, PP: 50, CE: 55, CT: 90 },
        dimensionWeights: { CS: 1, AD: 3, LM: 1, PP: 1, CE: 1, CT: 3 },
        fitReasons: {
            AD: 'Deep analytical thinking for complex space mission data',
            CT: 'Rigorous reasoning essential for mission-critical decisions',
            CS: 'Clear communication of technical findings to diverse teams'
        }
    },
    // Creative & Media (5)
    {
        title: 'Immersive Experience Designer',
        field: 'Creative & Media',
        emergingBy: '2027',
        skills: ['VR/AR Design', 'Spatial Computing', 'UX Research', 'Interactive Storytelling'],
        idealDimensions: { CS: 70, AD: 65, LM: 60, PP: 60, CE: 95, CT: 65 },
        dimensionWeights: { CS: 2, AD: 1, LM: 1, PP: 1, CE: 3, CT: 1 },
        fitReasons: {
            CE: 'Creative expression is the core of immersive design',
            CS: 'Communicating design vision to development teams',
            PP: 'Persuading stakeholders of design choices'
        }
    },
    {
        title: 'AI Creative Director',
        field: 'Creative & Media',
        emergingBy: '2027',
        skills: ['Generative AI', 'Brand Strategy', 'Visual Design', 'Creative Leadership'],
        idealDimensions: { CS: 80, AD: 65, LM: 70, PP: 80, CE: 95, CT: 60 },
        dimensionWeights: { CS: 2, AD: 1, LM: 1, PP: 2, CE: 3, CT: 1 },
        fitReasons: {
            CE: 'Creative vision essential for directing AI-generated content',
            PP: 'Persuasive presentations to clients and teams',
            CS: 'Articulating creative direction clearly'
        }
    },
    {
        title: 'Digital Narrative Architect',
        field: 'Creative & Media',
        emergingBy: '2028',
        skills: ['Transmedia Storytelling', 'World Building', 'Interactive Fiction', 'Audience Analytics'],
        idealDimensions: { CS: 80, AD: 60, LM: 85, PP: 70, CE: 95, CT: 55 },
        dimensionWeights: { CS: 2, AD: 1, LM: 2, PP: 2, CE: 3, CT: 1 },
        fitReasons: {
            CE: 'Creative storytelling across multiple platforms',
            LM: 'Language mastery enriches narrative quality',
            PP: 'Compelling narratives that engage audiences emotionally'
        }
    },
    {
        title: 'Metaverse Community Manager',
        field: 'Creative & Media',
        emergingBy: '2027',
        skills: ['Virtual Community Building', 'Event Curation', 'Social Dynamics', 'Platform Moderation'],
        idealDimensions: { CS: 90, AD: 55, LM: 70, PP: 80, CE: 75, CT: 55 },
        dimensionWeights: { CS: 3, AD: 1, LM: 2, PP: 2, CE: 2, CT: 1 },
        fitReasons: {
            CS: 'Strong communication skills for managing virtual communities',
            PP: 'Persuasive ability to engage and retain community members',
            CE: 'Creative approaches to community events and content'
        }
    },
    {
        title: 'Podcast & Audio Experience Producer',
        field: 'Creative & Media',
        emergingBy: '2026',
        skills: ['Audio Production', 'Interview Techniques', 'Sound Design', 'Audience Growth'],
        idealDimensions: { CS: 90, AD: 60, LM: 80, PP: 75, CE: 85, CT: 55 },
        dimensionWeights: { CS: 3, AD: 1, LM: 2, PP: 2, CE: 2, CT: 1 },
        fitReasons: {
            CS: 'Clear communication and voice skills are foundational',
            CE: 'Creative production elevates audio experiences',
            LM: 'Language mastery enhances scripting and interviews'
        }
    },
    // Business & Leadership (4)
    {
        title: 'Innovation Strategy Consultant',
        field: 'Business & Leadership',
        emergingBy: '2026',
        skills: ['Design Thinking', 'Market Analysis', 'Change Management', 'Business Modeling'],
        idealDimensions: { CS: 85, AD: 80, LM: 70, PP: 90, CE: 75, CT: 80 },
        dimensionWeights: { CS: 2, AD: 2, LM: 1, PP: 3, CE: 2, CT: 2 },
        fitReasons: {
            PP: 'Persuading executives to adopt innovative strategies',
            AD: 'Deep analysis of market opportunities and risks',
            CS: 'Communicating complex strategies clearly to stakeholders'
        }
    },
    {
        title: 'Social Impact Entrepreneur',
        field: 'Business & Leadership',
        emergingBy: '2026',
        skills: ['Social Enterprise', 'Impact Measurement', 'Fundraising', 'Community Engagement'],
        idealDimensions: { CS: 85, AD: 70, LM: 65, PP: 95, CE: 80, CT: 70 },
        dimensionWeights: { CS: 2, AD: 1, LM: 1, PP: 3, CE: 2, CT: 2 },
        fitReasons: {
            PP: 'Persuasive storytelling to attract investors and supporters',
            CS: 'Communicating mission and vision to diverse audiences',
            CE: 'Creative solutions to social challenges'
        }
    },
    {
        title: 'Cross-Cultural Business Negotiator',
        field: 'Business & Leadership',
        emergingBy: '2026',
        skills: ['International Negotiation', 'Cultural Intelligence', 'Contract Law', 'Relationship Building'],
        idealDimensions: { CS: 90, AD: 75, LM: 85, PP: 90, CE: 55, CT: 75 },
        dimensionWeights: { CS: 3, AD: 2, LM: 2, PP: 3, CE: 1, CT: 2 },
        fitReasons: {
            PP: 'Persuasive skills critical in high-stakes negotiations',
            CS: 'Clear communication across cultural and language barriers',
            LM: 'Language mastery enables nuanced cross-cultural dialogue'
        }
    },
    {
        title: 'EdTech Product Manager',
        field: 'Business & Leadership',
        emergingBy: '2026',
        skills: ['Learning Science', 'Product Strategy', 'User Research', 'Agile Management'],
        idealDimensions: { CS: 80, AD: 75, LM: 70, PP: 75, CE: 70, CT: 75 },
        dimensionWeights: { CS: 2, AD: 2, LM: 2, PP: 2, CE: 2, CT: 2 },
        fitReasons: {
            CS: 'Communicating product vision to engineering and education teams',
            AD: 'Analytical approach to user research and learning outcomes',
            CT: 'Critical evaluation of educational technology effectiveness'
        }
    },
    // Public Service & Policy (4)
    {
        title: 'Digital Policy Analyst',
        field: 'Public Service & Policy',
        emergingBy: '2026',
        skills: ['Tech Regulation', 'Policy Research', 'Data Governance', 'Stakeholder Engagement'],
        idealDimensions: { CS: 80, AD: 85, LM: 75, PP: 70, CE: 50, CT: 90 },
        dimensionWeights: { CS: 2, AD: 2, LM: 2, PP: 2, CE: 1, CT: 3 },
        fitReasons: {
            CT: 'Critical analysis of technology policy implications',
            AD: 'Deep research into regulatory frameworks',
            CS: 'Communicating policy recommendations to decision-makers'
        }
    },
    {
        title: 'International Development Coordinator',
        field: 'Public Service & Policy',
        emergingBy: '2026',
        skills: ['Program Management', 'Grant Writing', 'Impact Assessment', 'Cross-cultural Leadership'],
        idealDimensions: { CS: 85, AD: 70, LM: 80, PP: 80, CE: 65, CT: 70 },
        dimensionWeights: { CS: 2, AD: 2, LM: 2, PP: 2, CE: 1, CT: 2 },
        fitReasons: {
            CS: 'Communicating across diverse cultural contexts',
            PP: 'Persuasive grant writing and stakeholder engagement',
            LM: 'Language skills essential for international coordination'
        }
    },
    {
        title: 'Climate Action Policy Advisor',
        field: 'Public Service & Policy',
        emergingBy: '2027',
        skills: ['Environmental Policy', 'Data Visualization', 'Public Advocacy', 'Legislative Drafting'],
        idealDimensions: { CS: 80, AD: 80, LM: 75, PP: 85, CE: 60, CT: 85 },
        dimensionWeights: { CS: 2, AD: 2, LM: 1, PP: 3, CE: 1, CT: 3 },
        fitReasons: {
            PP: 'Persuasive advocacy for climate policy changes',
            CT: 'Critical analysis of environmental data and policy impact',
            AD: 'Deep understanding of complex environmental systems'
        }
    },
    {
        title: 'Human Rights Data Investigator',
        field: 'Public Service & Policy',
        emergingBy: '2027',
        skills: ['Open-Source Intelligence', 'Digital Forensics', 'Report Writing', 'Advocacy'],
        idealDimensions: { CS: 75, AD: 90, LM: 70, PP: 70, CE: 55, CT: 95 },
        dimensionWeights: { CS: 2, AD: 3, LM: 1, PP: 2, CE: 1, CT: 3 },
        fitReasons: {
            CT: 'Rigorous evidence evaluation for human rights cases',
            AD: 'Deep analytical investigation of complex situations',
            PP: 'Compelling presentation of findings to tribunals'
        }
    },
    // Healthcare & Science (4)
    {
        title: 'Precision Medicine Specialist',
        field: 'Healthcare & Science',
        emergingBy: '2028',
        skills: ['Genomic Medicine', 'Patient Communication', 'Data Interpretation', 'Clinical Research'],
        idealDimensions: { CS: 80, AD: 90, LM: 70, PP: 55, CE: 50, CT: 90 },
        dimensionWeights: { CS: 2, AD: 3, LM: 1, PP: 1, CE: 1, CT: 3 },
        fitReasons: {
            AD: 'Analytical depth essential for genomic data interpretation',
            CT: 'Critical thinking for evidence-based treatment decisions',
            CS: 'Communicating complex medical information to patients'
        }
    },
    {
        title: 'Mental Health Technology Designer',
        field: 'Healthcare & Science',
        emergingBy: '2027',
        skills: ['Therapeutic Design', 'Behavioral Science', 'UX for Wellbeing', 'AI Ethics'],
        idealDimensions: { CS: 85, AD: 70, LM: 65, PP: 65, CE: 85, CT: 70 },
        dimensionWeights: { CS: 2, AD: 2, LM: 1, PP: 1, CE: 3, CT: 2 },
        fitReasons: {
            CE: 'Creative design of therapeutic digital experiences',
            CS: 'Empathetic communication in mental health contexts',
            AD: 'Understanding behavioral science for effective interventions'
        }
    },
    {
        title: 'Neuroscience Research Communicator',
        field: 'Healthcare & Science',
        emergingBy: '2027',
        skills: ['Science Communication', 'Research Synthesis', 'Public Engagement', 'Data Storytelling'],
        idealDimensions: { CS: 90, AD: 80, LM: 85, PP: 75, CE: 70, CT: 75 },
        dimensionWeights: { CS: 3, AD: 2, LM: 2, PP: 2, CE: 2, CT: 2 },
        fitReasons: {
            CS: 'Translating complex neuroscience for public understanding',
            LM: 'Language mastery for precise scientific communication',
            AD: 'Analytical ability to synthesize research findings'
        }
    },
    {
        title: 'Global Health Epidemiologist',
        field: 'Healthcare & Science',
        emergingBy: '2027',
        skills: ['Disease Modeling', 'Statistical Analysis', 'Field Research', 'Policy Communication'],
        idealDimensions: { CS: 75, AD: 90, LM: 65, PP: 65, CE: 45, CT: 95 },
        dimensionWeights: { CS: 2, AD: 3, LM: 1, PP: 1, CE: 1, CT: 3 },
        fitReasons: {
            CT: 'Critical analysis of epidemiological data patterns',
            AD: 'Deep analytical investigation of disease dynamics',
            CS: 'Communicating health findings to policymakers'
        }
    },
    // Trades & Technical (3)
    {
        title: 'Smart Building Systems Technician',
        field: 'Trades & Technical',
        emergingBy: '2026',
        skills: ['IoT Systems', 'Energy Management', 'HVAC Automation', 'Troubleshooting'],
        idealDimensions: { CS: 65, AD: 75, LM: 50, PP: 45, CE: 60, CT: 80 },
        dimensionWeights: { CS: 1, AD: 2, LM: 1, PP: 1, CE: 2, CT: 3 },
        fitReasons: {
            CT: 'Critical thinking for diagnosing complex building systems',
            AD: 'Analytical approach to system optimization',
            CE: 'Creative problem-solving for integration challenges'
        }
    },
    {
        title: 'Drone Operations Specialist',
        field: 'Trades & Technical',
        emergingBy: '2026',
        skills: ['UAV Piloting', 'Aerial Surveying', 'Flight Planning', 'Regulatory Compliance'],
        idealDimensions: { CS: 65, AD: 75, LM: 55, PP: 45, CE: 60, CT: 75 },
        dimensionWeights: { CS: 1, AD: 2, LM: 1, PP: 1, CE: 2, CT: 3 },
        fitReasons: {
            CT: 'Critical decision-making during flight operations',
            AD: 'Analytical approach to survey data interpretation',
            CE: 'Creative solutions for complex aerial missions'
        }
    },
    {
        title: '3D Printing & Fabrication Engineer',
        field: 'Trades & Technical',
        emergingBy: '2027',
        skills: ['Additive Manufacturing', 'CAD Design', 'Materials Science', 'Quality Control'],
        idealDimensions: { CS: 60, AD: 80, LM: 50, PP: 45, CE: 80, CT: 75 },
        dimensionWeights: { CS: 1, AD: 2, LM: 1, PP: 1, CE: 3, CT: 2 },
        fitReasons: {
            CE: 'Creative design and fabrication of novel objects',
            AD: 'Analytical approach to materials and process optimization',
            CT: 'Critical quality control and troubleshooting'
        }
    }
];

// Map interview scores to 6 career dimensions (server-side)
function mapToCareerDimensions(scores) {
    const dims = {};
    // Communication Strength: (pronunciation + fluency) / 8 * 100
    dims.CS = ((scores.pronunciation + scores.fluency) / 8) * 100;
    // Analytical Depth: (comprehension + insight) / 8 * 100
    dims.AD = ((scores.comprehension + scores.insight) / 8) * 100;
    // Language Mastery: (vocab + knowledge) / 7 * 100
    dims.LM = ((scores.vocab + scores.knowledge) / 7) * 100;
    // Persuasive Power: persuasion / 20 * 100
    dims.PP = (scores.persuasion / 20) * 100;
    // Creative Expression: (narrative + descriptive) / 40 * 100
    dims.CE = ((scores.narrative + scores.descriptive) / 40) * 100;
    // Critical Thinking: (argumentative + persuasiveWriting) / 40 * 100
    dims.CT = ((scores.argumentative + scores.persuasiveWriting) / 40) * 100;

    // Clamp all to 0-100
    for (const key of Object.keys(dims)) {
        dims[key] = Math.max(0, Math.min(100, Math.round(dims[key] * 10) / 10));
    }
    return dims;
}

// Synergy rules (mirrors client-side)
const SYNERGY_RULES = [
    { dims: ['CS', 'PP'], threshold: 70, bonus: 8, fields: ['Business & Leadership', 'Language & Communication'], label: 'Communicator-Persuader' },
    { dims: ['AD', 'CT'], threshold: 70, bonus: 8, fields: ['STEM & Technical', 'Healthcare & Science', 'Public Service & Policy'], label: 'Analyst-Thinker' },
    { dims: ['CE', 'CS'], threshold: 65, bonus: 6, fields: ['Creative & Media', 'Language & Communication'], label: 'Creative-Communicator' },
    { dims: ['LM', 'CE'], threshold: 65, bonus: 5, fields: ['Creative & Media', 'Language & Communication'], label: 'Wordsmith' }
];

// Gaussian matching: 100 * exp(-d^2 / (2 * sigma^2))
function gaussianMatch(distance, sigma = 30) {
    return 100 * Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

// Detect active synergies
function detectSynergiesServer(studentDims) {
    const active = [];
    for (const rule of SYNERGY_RULES) {
        const allMeet = rule.dims.every(d => (studentDims[d] || 0) >= rule.threshold);
        if (allMeet) active.push(rule);
    }
    return active;
}

// Compute confidence score
function computeConfidenceServer(studentDims, hasBothInterviews) {
    const dimKeys = ['CS', 'AD', 'LM', 'PP', 'CE', 'CT'];
    const nonZero = dimKeys.filter(k => (studentDims[k] || 0) > 0).length;
    let score = (nonZero / 6) * 100;
    if (hasBothInterviews) score = Math.min(100, score + 10);
    return Math.round(score);
}

// Compute field affinities
function computeFieldAffinitiesServer(studentDims, activeSynergies) {
    const fieldTotals = {};
    const fieldCounts = {};
    for (const career of CAREER_CATALOG) {
        const { overallMatch } = calculateCareerMatchServer(studentDims, career, activeSynergies);
        if (!fieldTotals[career.field]) {
            fieldTotals[career.field] = 0;
            fieldCounts[career.field] = 0;
        }
        fieldTotals[career.field] += overallMatch;
        fieldCounts[career.field]++;
    }
    const affinities = [];
    for (const field of Object.keys(fieldTotals)) {
        affinities.push({
            field,
            avgMatch: Math.round((fieldTotals[field] / fieldCounts[field]) * 10) / 10
        });
    }
    affinities.sort((a, b) => b.avgMatch - a.avgMatch);
    return affinities;
}

// Calculate match between student dimensions and a career (Gaussian)
function calculateCareerMatchServer(studentDims, career, activeSynergies) {
    let weightedSum = 0;
    let totalWeight = 0;
    const strengths = [];
    const challenges = [];

    for (const dim of ['CS', 'AD', 'LM', 'PP', 'CE', 'CT']) {
        const studentScore = studentDims[dim] || 0;
        const idealScore = career.idealDimensions[dim] || 0;
        const weight = career.dimensionWeights[dim] || 1;
        const distance = Math.abs(studentScore - idealScore);
        const match = gaussianMatch(distance);
        weightedSum += match * weight;
        totalWeight += weight;

        if (distance <= 20 && career.fitReasons[dim]) {
            strengths.push({ dim, reason: career.fitReasons[dim], distance });
        } else if (distance >= 35 && career.fitReasons[dim]) {
            challenges.push({ dim, reason: career.fitReasons[dim], distance });
        }
    }

    let overallMatch = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Apply synergy bonuses
    if (activeSynergies) {
        for (const synergy of activeSynergies) {
            if (synergy.fields.includes(career.field)) {
                overallMatch += synergy.bonus;
            }
        }
    }

    overallMatch = Math.min(100, Math.round(overallMatch * 10) / 10);
    return { overallMatch, strengths, challenges };
}

// Get top N career matches
function getTopCareersServer(studentDims, activeSynergies, limit = 6) {
    const results = CAREER_CATALOG.map(career => {
        const { overallMatch, strengths, challenges } = calculateCareerMatchServer(studentDims, career, activeSynergies);
        return {
            title: career.title,
            field: career.field,
            emergingBy: career.emergingBy,
            skills: career.skills,
            matchPercentage: overallMatch,
            strengths,
            challenges
        };
    });
    results.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return results.slice(0, limit);
}

// Get local IP address
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Notion API configuration
const NOTION_API_KEY = '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';
const DATABASE_ID = '1abd37d666308071bfe1e37d1d155035';
const INTERVIEWS_DATABASE_ID = '1bcd37d666308081b585dcf642488201'; // Interview sheets database
const NOTION_VERSION = '2022-06-28';

// OpenAI API configuration
const OPENAI_API_KEY = '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';

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Route to fetch students from Notion
app.get('/api/students', async (req, res) => {
    try {
        console.log('Fetching students from Notion database...');

        let allResults = [];
        let hasMore = true;
        let startCursor = undefined;

        // Fetch all pages
        while (hasMore) {
            const requestBody = {
                page_size: 100
            };

            // Add cursor if we have one (for pagination)
            if (startCursor) {
                requestBody.start_cursor = startCursor;
            }

            const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${NOTION_API_KEY}`,
                    'Notion-Version': NOTION_VERSION,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Notion API Error:', errorText);
                return res.status(response.status).json({
                    error: 'Failed to fetch from Notion',
                    details: errorText
                });
            }

            const data = await response.json();
            allResults = allResults.concat(data.results);

            hasMore = data.has_more;
            startCursor = data.next_cursor;

            console.log(`Fetched ${data.results.length} students (total so far: ${allResults.length})`);
        }

        console.log(`Successfully fetched ${allResults.length} students in total`);

        // Return data in same format as Notion API
        res.json({
            object: 'list',
            results: allResults,
            has_more: false,
            next_cursor: null
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Route to generate AI analysis using OpenAI
app.post('/api/ai-analysis', async (req, res) => {
    try {
        console.log('Generating AI analysis...');

        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: 'Missing prompt',
                message: 'Request body must include a prompt field'
            });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional writing assistant that improves grammar, flow, and coherence while preserving all information. Always use the student\'s name and correct pronouns. Be direct and personalized. Never use generic phrases like "A comprehensive analysis reveals" - start directly with the student\'s name.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', errorText);
            return res.status(response.status).json({
                error: 'Failed to generate AI analysis',
                details: errorText
            });
        }

        const data = await response.json();
        console.log('AI analysis generated successfully');

        res.json(data);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Route to import interview data to Notion
app.post('/api/import-to-notion', async (req, res) => {
    try {
        console.log('Importing interview data to Notion...');

        const { interviewData } = req.body;

        if (!interviewData) {
            return res.status(400).json({
                error: 'Missing interview data',
                message: 'Request body must include interviewData field'
            });
        }

        // Check for duplicate entries (same Type, Name, Student ID, and Date)
        console.log('Checking for duplicate entries...');
        const duplicateCheckResponse = await fetch(`https://api.notion.com/v1/databases/${INTERVIEWS_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter: {
                    and: [
                        {
                            property: 'Type',
                            title: {
                                equals: interviewData.type
                            }
                        },
                        {
                            property: 'Name',
                            rich_text: {
                                equals: interviewData.name
                            }
                        },
                        {
                            property: 'Student ID',
                            rich_text: {
                                equals: interviewData.studentId
                            }
                        },
                        {
                            property: 'Date of Interview',
                            date: {
                                equals: interviewData.date
                            }
                        }
                    ]
                }
            })
        });

        if (duplicateCheckResponse.ok) {
            const duplicateData = await duplicateCheckResponse.json();
            if (duplicateData.results && duplicateData.results.length > 0) {
                console.log('Duplicate entry found!');
                return res.status(409).json({
                    error: 'Duplicate entry',
                    message: `This ${interviewData.type} Interview for ${interviewData.name} on ${interviewData.date} already exists in Notion.`,
                    isDuplicate: true
                });
            }
        }

        // Prepare the properties object for Notion page (matching database schema)
        const properties = {
            'Type': {
                title: [{ text: { content: interviewData.type } }]
            },
            'Name': {
                rich_text: [{ text: { content: interviewData.name } }]
            },
            'Student ID': {
                rich_text: [{ text: { content: interviewData.studentId } }]
            },
            'Level': {
                rich_text: [{ text: { content: interviewData.level } }]
            },
            'Date of Interview': {
                date: { start: interviewData.date }
            },
            'Questions': {
                rich_text: [{ text: { content: interviewData.questions } }]
            },
            'Pronunciation': {
                number: parseFloat(interviewData.pronunciation)
            },
            'Fluency': {
                number: parseFloat(interviewData.fluency)
            },
            'Comprehension': {
                number: parseFloat(interviewData.comprehension)
            },
            'Insight': {
                number: parseFloat(interviewData.insight)
            },
            'Vocab/Mechanics': {
                number: parseFloat(interviewData.vocab)
            },
            'Overall Score': {
                rich_text: [{ text: { content: `${interviewData.overallScore}/20` } }]
            },
            'Knowledge Level': {
                number: parseFloat(interviewData.knowledgeLevel)
            }
        };

        // Note: Interviewer field is type "people" which requires Notion user IDs
        // We'll skip it for now since we don't have user ID mapping

        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parent: { database_id: INTERVIEWS_DATABASE_ID },
                properties: properties
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Notion API Error:', errorText);
            return res.status(response.status).json({
                error: 'Failed to import to Notion',
                details: errorText
            });
        }

        const data = await response.json();
        console.log('Interview data imported successfully to Notion');

        res.json({
            success: true,
            message: 'Interview data imported to Notion',
            pageId: data.id
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Route to get database schema
app.get('/api/database-schema', async (req, res) => {
    try {
        console.log('Fetching database schema...');

        const response = await fetch(`https://api.notion.com/v1/databases/${INTERVIEWS_DATABASE_ID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': NOTION_VERSION,
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Notion API Error:', errorText);
            return res.status(response.status).json({
                error: 'Failed to fetch database schema',
                details: errorText
            });
        }

        const data = await response.json();
        console.log('Database schema fetched successfully');

        res.json(data);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Save interview data to database
app.post('/api/save-interview', async (req, res) => {
    try {
        console.log('Saving interview data to database...');
        const data = req.body;

        const stmt = db.prepare(`
            INSERT INTO interviews (
                student_name, student_id, interview_type, date, interviewer,
                grade, gender, age, questions, scores_text, pronunciation, fluency,
                comprehension, insight, vocab, knowledge_level,
                persuasion_text, report_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(student_name, student_id, interview_type, date)
            DO UPDATE SET
                interviewer = excluded.interviewer,
                grade = excluded.grade,
                gender = excluded.gender,
                age = excluded.age,
                questions = excluded.questions,
                scores_text = excluded.scores_text,
                pronunciation = excluded.pronunciation,
                fluency = excluded.fluency,
                comprehension = excluded.comprehension,
                insight = excluded.insight,
                vocab = excluded.vocab,
                knowledge_level = excluded.knowledge_level,
                persuasion_text = excluded.persuasion_text,
                report_text = excluded.report_text,
                timestamp = CURRENT_TIMESTAMP
        `);

        stmt.run(
            data.studentName,
            data.studentID,
            data.type,
            data.date,
            data.interviewer || '',
            data.grade || '',
            data.gender || '',
            data.age || '',
            data.questions || '',
            data.scoresText || '',
            data.pronunciation || 0,
            data.fluency || 0,
            data.comprehension || 0,
            data.insight || 0,
            data.vocab || 0,
            data.knowledgeLevel || 0,
            data.persuasionText || '',
            data.reportText || ''
        );

        console.log('Interview data saved successfully');
        res.json({ success: true, message: 'Interview saved successfully' });

    } catch (error) {
        console.error('Error saving interview:', error);
        res.status(500).json({
            error: 'Failed to save interview',
            message: error.message
        });
    }
});

// Load interview data from database
app.get('/api/load-interview', async (req, res) => {
    try {
        const { studentName, studentID, type, date } = req.query;

        console.log(`Loading interview: ${studentName} (${studentID}), ${type}, ${date}`);

        const stmt = db.prepare(`
            SELECT * FROM interviews
            WHERE student_name = ? AND student_id = ? AND interview_type = ? AND date = ?
            ORDER BY timestamp DESC
            LIMIT 1
        `);

        const interview = stmt.get(studentName, studentID, type, date);

        if (interview) {
            console.log('Interview found');
            res.json({ success: true, data: interview });
        } else {
            console.log('No interview found');
            res.json({ success: false, message: 'No interview found' });
        }

    } catch (error) {
        console.error('Error loading interview:', error);
        res.status(500).json({
            error: 'Failed to load interview',
            message: error.message
        });
    }
});

// Get all interviews for a student
app.get('/api/student-interviews', async (req, res) => {
    try {
        const { studentName, type } = req.query;

        console.log(`Getting all ${type} interviews for: ${studentName}`);

        const stmt = db.prepare(`
            SELECT date, timestamp FROM interviews
            WHERE student_name = ? AND interview_type = ?
            ORDER BY date DESC
        `);

        const interviews = stmt.all(studentName, type);

        res.json({ success: true, dates: interviews.map(i => i.date) });

    } catch (error) {
        console.error('Error getting student interviews:', error);
        res.status(500).json({
            error: 'Failed to get student interviews',
            message: error.message
        });
    }
});

// Check if interview exists in Notion
app.post('/api/check-notion-status', async (req, res) => {
    try {
        const { type, name, studentId, date } = req.body;

        if (!type || !name || !studentId || !date) {
            return res.json({ exists: false, reason: 'missing_data' });
        }

        const response = await fetch(`https://api.notion.com/v1/databases/${INTERVIEWS_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter: {
                    and: [
                        { property: 'Type', title: { equals: type } },
                        { property: 'Name', rich_text: { equals: name } },
                        { property: 'Student ID', rich_text: { equals: studentId } },
                        { property: 'Date of Interview', date: { equals: date } }
                    ]
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            const exists = data.results && data.results.length > 0;
            res.json({ exists, reason: exists ? 'found' : 'not_found' });
        } else {
            res.json({ exists: false, reason: 'api_error' });
        }
    } catch (error) {
        console.error('Error checking Notion status:', error);
        res.json({ exists: false, reason: 'error' });
    }
});

// ═══════════════════════════════════════════════════
// CAREER RECOMMENDATIONS API ENDPOINTS
// ═══════════════════════════════════════════════════

// Save career recommendations (upsert by student)
app.post('/api/save-career-recommendations', (req, res) => {
    try {
        const { studentName, studentId, dataSource, dimensions, recommendations, aiAnalysis } = req.body;

        if (!studentName || !studentId || !dimensions || !recommendations) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const stmt = db.prepare(`
            INSERT INTO career_recommendations (student_name, student_id, data_source, dimensions, recommendations, ai_analysis)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(student_name, student_id)
            DO UPDATE SET
                data_source = excluded.data_source,
                dimensions = excluded.dimensions,
                recommendations = excluded.recommendations,
                ai_analysis = COALESCE(excluded.ai_analysis, career_recommendations.ai_analysis),
                timestamp = CURRENT_TIMESTAMP
        `);

        stmt.run(
            studentName,
            studentId,
            dataSource || 'initial',
            JSON.stringify(dimensions),
            JSON.stringify(recommendations),
            aiAnalysis || null
        );

        console.log(`Career recommendations saved for ${studentName}`);
        res.json({ success: true, message: 'Career recommendations saved' });
    } catch (error) {
        console.error('Error saving career recommendations:', error);
        res.status(500).json({ error: 'Failed to save', message: error.message });
    }
});

// Retrieve saved career recommendations
app.get('/api/career-recommendations', (req, res) => {
    try {
        const { studentName, studentId } = req.query;

        let stmt, result;
        if (studentName && studentId) {
            stmt = db.prepare('SELECT * FROM career_recommendations WHERE student_name = ? AND student_id = ?');
            result = stmt.get(studentName, studentId);
        } else if (studentName) {
            stmt = db.prepare('SELECT * FROM career_recommendations WHERE student_name = ?');
            result = stmt.get(studentName);
        } else {
            return res.status(400).json({ error: 'studentName query parameter required' });
        }

        if (result) {
            result.dimensions = JSON.parse(result.dimensions);
            result.recommendations = JSON.parse(result.recommendations);
            res.json({ success: true, data: result });
        } else {
            res.json({ success: false, message: 'No career recommendations found' });
        }
    } catch (error) {
        console.error('Error loading career recommendations:', error);
        res.status(500).json({ error: 'Failed to load', message: error.message });
    }
});

// Compute career recommendations from raw scores (stateless)
app.post('/api/career-recommendations/compute', (req, res) => {
    try {
        const { scores, limit, hasBothInterviews } = req.body;

        if (!scores) {
            return res.status(400).json({ error: 'Missing scores object' });
        }

        const dimensions = mapToCareerDimensions(scores);
        const activeSynergies = detectSynergiesServer(dimensions);
        const confidence = computeConfidenceServer(dimensions, !!hasBothInterviews);
        const recommendations = getTopCareersServer(dimensions, activeSynergies, limit || 6);
        const fieldAffinities = computeFieldAffinitiesServer(dimensions, activeSynergies);

        res.json({
            success: true,
            dimensions,
            recommendations,
            confidence,
            activeSynergies: activeSynergies.map(s => ({ label: s.label, bonus: s.bonus, fields: s.fields })),
            fieldAffinities
        });
    } catch (error) {
        console.error('Error computing career recommendations:', error);
        res.status(500).json({ error: 'Failed to compute', message: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIPAddress();
    console.log(`\n✓ Notion Proxy Server running on:`);
    console.log(`  - Local:   http://localhost:${PORT}`);
    console.log(`  - Network: http://${localIP}:${PORT}`);
    console.log(`\n✓ Available endpoints:`);
    console.log(`  - Health check: http://${localIP}:${PORT}/health`);
    console.log(`  - Students API: http://${localIP}:${PORT}/api/students`);
    console.log(`  - AI Analysis API: http://${localIP}:${PORT}/api/ai-analysis`);
    console.log(`  - Import to Notion API: http://${localIP}:${PORT}/api/import-to-notion`);
    console.log(`  - Career Recommendations: http://${localIP}:${PORT}/api/career-recommendations\n`);
});
