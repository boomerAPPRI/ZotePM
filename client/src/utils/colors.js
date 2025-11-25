export const getOutcomeColor = (index, name) => {
    const lowerName = name.toLowerCase();
    if (lowerName === 'yes') return 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200';
    if (lowerName === 'no') return 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200';

    const colors = [
        'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
        'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
        'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
        'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200',
        'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200',
        'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200',
        'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
        'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
    ];

    return colors[index % colors.length];
};

export const getOutcomeStroke = (index, name) => {
    const lowerName = name.toLowerCase();
    if (lowerName === 'yes') return '#16a34a'; // green-600
    if (lowerName === 'no') return '#dc2626'; // red-600

    const strokes = [
        '#2563eb', // blue-600
        '#9333ea', // purple-600
        '#ea580c', // orange-600
        '#0d9488', // teal-600
        '#db2777', // pink-600
        '#0891b2', // cyan-600
        '#d97706', // amber-600
        '#4f46e5', // indigo-600
    ];

    return strokes[index % strokes.length];
};
