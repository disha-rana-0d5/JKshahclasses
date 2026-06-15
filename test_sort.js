const parseSessionToScore = (session) => {
    if (!session) return 0;
    const matches = session.match(/\d{2,4}/g); // removed word boundaries just in case
    let year = 0;
    if (matches) {
        let num = parseInt(matches[matches.length - 1], 10);
        year = num < 100 ? (num < 50 ? 2000 + num : 1900 + num) : num;
    }
    const sLower = session.toLowerCase();
    let monthWeight = 0;
    if (sLower.includes('dec')) monthWeight = 12;
    else if (sLower.includes('nov')) monthWeight = 11;
    else if (sLower.includes('oct')) monthWeight = 10;
    else if (sLower.includes('sep')) monthWeight = 9;
    else if (sLower.includes('aug')) monthWeight = 8;
    else if (sLower.includes('jul')) monthWeight = 7;
    else if (sLower.includes('jun')) monthWeight = 6;
    else if (sLower.includes('may')) monthWeight = 5;
    else if (sLower.includes('apr')) monthWeight = 4;
    else if (sLower.includes('mar')) monthWeight = 3;
    else if (sLower.includes('feb')) monthWeight = 2;
    else if (sLower.includes('jan')) monthWeight = 1;
    
    return year * 100 + monthWeight;
};

const sessions = [
    "May-25",
    "Nov-23",
    "May-Nov 24",
    "May-22",
    "Dec 20 & Jan, July-Dec 21"
];

console.log(sessions.map(s => ({ session: s, score: parseSessionToScore(s) })).sort((a,b) => b.score - a.score));
